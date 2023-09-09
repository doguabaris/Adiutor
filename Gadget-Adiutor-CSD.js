/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Speedy Deletion
 */
/* <nowiki> */
var api = new mw.Api();
var mwConfig = mw.config.get(["wgArticleId", "wgPageName", "wgNamespaceNumber", "wgUserName"]);
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
var casdReason, csdSummary, notificationMessage, articleAuthor;
var csdOptions = [];
var casdReasons = [];
var saltCsdSummary = '';
var pageTitle = mw.config.get("wgPageName").replace(/_/g, " ");

function fetchApiData(callback) {
	var api = new mw.Api();
	api.get({
		action: "query",
		prop: "revisions",
		titles: "MediaWiki:Gadget-Adiutor-CSD.json",
		rvprop: "content",
		formatversion: 2
	}).done(function(data) {
		var content = data.query.pages[0].revisions[0].content;
		try {
			var jsonData = JSON.parse(content);
			callback(jsonData);
		} catch(error) {
			// Handle JSON parsing error
			mw.notify('Failed to parse JSON data from API.', {
				title: mw.msg('operation-failed'),
				type: 'error'
			});
		}
	}).fail(function() {
		// Handle API request failure
		mw.notify('Failed to fetch data from the API.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		// You may choose to stop code execution here
	});
}
fetchApiData(function(jsonData) {
	if(!jsonData) {
		// Handle a case where jsonData is empty or undefined
		mw.notify('MediaWiki:Gadget-Adiutor-UBM.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		// You may choose to stop code execution here
		return;
	}
	api.get({
		action: 'query',
		list: 'logevents',
		leaction: 'delete/delete',
		letprop: 'delete',
		letitle: pageTitle
	}).done(function(data) {
		if(data.query.logevents) {
			revDelCount = data.query.logevents.length;
		} else {
			revDelCount = 0;
		}
		var speedyDeletionReasons = jsonData.speedyDeletionReasons;
		var csdTemplateStart = jsonData.csdTemplateStart;
		var csdTemplateEnd = jsonData.csdTemplateEnd;
		var reasonAndSeperator = jsonData.reasonAndSeperator;
		var speedyDeletionPolicyLink = jsonData.speedyDeletionPolicyLink;
		var speedyDeletionPolicyPageShorcut = jsonData.speedyDeletionPolicyPageShorcut;
		var apiPostSummaryforLog = jsonData.apiPostSummaryforLog;
		var apiPostSummary = jsonData.apiPostSummary;
		var csdNotificationTemplate = jsonData.csdNotificationTemplate;
		var userPagePrefix = jsonData.userPagePrefix;
		var userTalkPagePrefix = jsonData.userTalkPagePrefix;
		var localLangCode = jsonData.localLangCode;
		var singleReasonSummary = jsonData.singleReasonSummary;
		var multipleReasonSummary = jsonData.multipleReasonSummary;

		function ProcessDialog(config) {
			ProcessDialog.super.call(this, config);
		}
		OO.inheritClass(ProcessDialog, OO.ui.ProcessDialog);
		// Specify a name for .addWindows()
		ProcessDialog.static.name = 'myDialog';
		// Specify a title and an action set that uses modes ('edit' and 'help' mode, in this example).
		ProcessDialog.static.title = new OO.ui.deferMsg('csd-module-title');
		ProcessDialog.static.actions = [{
			action: 'continue',
			modes: 'edit',
			label: new OO.ui.deferMsg('tag-page'),
			flags: ['primary', 'progressive']
		}, {
			action: 'policy',
			modes: 'edit',
			label: mw.msg('speedy-deletion-policy'),
			framed: false,
		}, {
			modes: 'edit',
			label: new OO.ui.deferMsg('cancel'),
			flags: ['safe', 'close']
		}, {
			action: 'back',
			modes: 'help',
			label: new OO.ui.deferMsg('back'),
			flags: ['safe', 'back']
		}];
		// Customize the initialize() method to add content and set up event handlers. 
		// This example uses a stack layout with two panels: one displayed for 
		// edit mode and one for help mode.
		ProcessDialog.prototype.initialize = function() {
			ProcessDialog.super.prototype.initialize.apply(this, arguments);
			var i, reason, checkboxWidget, fieldLayout;
			var selectedNamespace = null;
			if(mw.config.get('wgIsRedirect')) {
				selectedNamespace = speedyDeletionReasons.find(reason => reason.namespace === 'redirect');
				nameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
					label: selectedNamespace.name
				});
				for(i = 0; i < selectedNamespace.reasons.length; i++) {
					reason = selectedNamespace.reasons[i];
					checkboxWidget = new OO.ui.CheckboxInputWidget({
						value: reason.value,
						data: reason.data,
						selected: false
					});
					fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
						label: reason.label,
						align: 'inline',
						help: reason.help
					});
					nameSpaceDeletionReasons.addItems([fieldLayout]);
				}
			} else {
				var NS_MAIN = 0,
					NS_USER = 2,
					NS_USER_TALK = 3,
					NS_FILE = 6,
					NS_TEMPLATE = 10,
					NS_CATEGORY = 14;
				switch(mwConfig.wgNamespaceNumber) {
					case NS_MAIN:
					case NS_FILE:
					case NS_CATEGORY:
					case NS_USER:
					case NS_USER_TALK:
					case NS_TEMPLATE:
						selectedNamespace;
						if(mwConfig.wgNamespaceNumber === NS_USER || mwConfig.wgNamespaceNumber === NS_USER_TALK) {
							selectedNamespace = speedyDeletionReasons.find(reason => reason.namespace === NS_USER);
						} else {
							selectedNamespace = speedyDeletionReasons.find(reason => reason.namespace === mwConfig.wgNamespaceNumber);
						}
						if(selectedNamespace) {
							nameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
								label: selectedNamespace.name
							});
							for(i = 0; i < selectedNamespace.reasons.length; i++) {
								reason = selectedNamespace.reasons[i];
								checkboxWidget = new OO.ui.CheckboxInputWidget({
									value: reason.value,
									data: reason.data,
									selected: false
								});
								fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
									label: reason.label,
									align: 'inline',
									help: reason.help
								});
								nameSpaceDeletionReasons.addItems([fieldLayout]);
							}
						} else {
							nameSpaceDeletionReasons = new OO.ui.FieldsetLayout({});
							nameSpaceDeletionReasons.addItems([
								new OO.ui.FieldLayout(new OO.ui.MessageWidget({
									type: 'warning',
									inline: true,
									label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('no-namespace-reason-for-csd-title') + '</strong><br><small>' + mw.msg('no-namespace-reason-for-csd') + '</small>')
								})),
							]);
						}
						break;
					default:
						nameSpaceDeletionReasons = new OO.ui.FieldsetLayout({});
						nameSpaceDeletionReasons.addItems([
							new OO.ui.FieldLayout(new OO.ui.MessageWidget({
								type: 'warning',
								inline: true,
								label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('no-namespace-reason-for-csd-title') + '</strong><br><small>' + mw.msg('no-namespace-reason-for-csd') + '</small>')
							})),
						]);
						break;
				}
			}
			selectedNamespaceForGeneral = null;
			for(i = 0; i < speedyDeletionReasons.length; i++) {
				if(speedyDeletionReasons[i].namespace === 'general') {
					selectedNamespaceForGeneral = {
						name: speedyDeletionReasons[i].name,
						reasons: speedyDeletionReasons[i].reasons
					};
					break;
				}
			}
			copyVioInput = new OO.ui.TextInputWidget({
				placeholder: mw.msg('copyright-infringing-page'),
				value: '',
				icon: 'link',
				data: 'COV',
				classes: ['adiutor-copvio-input'],
			});
			copyVioInput.$element.css({
				'margin-top': '10px',
				'margin-bottom': '10px'
			});
			copyVioInput.$element.hide();
			isCopyVio = false;
			generalReasons = new OO.ui.FieldsetLayout({
				label: selectedNamespaceForGeneral.name
			});
			for(i = 0; i < selectedNamespaceForGeneral.reasons.length; i++) {
				reason = selectedNamespaceForGeneral.reasons[i];
				checkboxWidget = new OO.ui.CheckboxInputWidget({
					value: reason.value,
					data: reason.data,
					selected: false
				});
				if(reason.value === 'G9') {
					fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
						label: reason.label,
						align: 'inline',
						help: reason.help
					});
					fieldLayout.$element.append(copyVioInput.$element);
					copyVioInput.$element.hide(); // Hide it initially
				} else {
					fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
						label: reason.label,
						align: 'inline',
						help: reason.help
					});
				}
				generalReasons.addItems([fieldLayout]);
			}
			selectedNamespaceForOthers = null;
			for(i = 0; i < speedyDeletionReasons.length; i++) {
				if(speedyDeletionReasons[i].namespace === 'other') {
					selectedNamespaceForOthers = {
						name: speedyDeletionReasons[i].name,
						reasons: speedyDeletionReasons[i].reasons
					};
					break;
				}
			}
			otherReasons = new OO.ui.FieldsetLayout({
				label: selectedNamespaceForOthers.name
			});
			for(i = 0; i < selectedNamespaceForOthers.reasons.length; i++) {
				reason = selectedNamespaceForOthers.reasons[i];
				checkboxWidget = new OO.ui.CheckboxInputWidget({
					value: reason.value,
					data: reason.data,
					selected: false
				});
				fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
					label: reason.label,
					align: 'inline',
					help: reason.help
				});
				otherReasons.addItems([fieldLayout]);
			}
			generalReasons.$element.on('click', function(item) {
				if(item.target.value === 'G9') {
					copyVioInput.$element.show();
				}
			});
			deletionOptions = new OO.ui.FieldsetLayout({
				label: mw.msg('other-options'),
			});
			deletionOptions.addItems([
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: false,
					value: 'recreationProrection'
				}), {
					label: new OO.ui.deferMsg('protect-against-rebuilding'),
					help: new OO.ui.deferMsg('protect-against-rebuilding-help'),
					align: 'inline'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: adiutorUserOptions.speedyDeletion.csdSendMessageToCreator,
					value: 'informCreator'
				}), {
					label: new OO.ui.deferMsg('afd-inform-creator'),
					help: new OO.ui.deferMsg('afd-inform-creator-help'),
					align: 'inline'
				})
			]);
			var headerTitle = new OO.ui.MessageWidget({
				type: 'notice',
				inline: true,
				label: new OO.ui.deferMsg('csd-header-title')
			});
			var headerTitleDescription = new OO.ui.LabelWidget({
				label: new OO.ui.deferMsg('csd-header-description')
			});
			headerTitleDescription.$element.css({
				'margin-top': '10px',
				'padding-left': '30px',
				'margin-bottom': '10px'
			});
			var left_panel = new OO.ui.PanelLayout({
				$content: [nameSpaceDeletionReasons.$element, deletionOptions.$element],
				classes: ['one'],
				scrollable: false,
			});
			var right_panel = new OO.ui.PanelLayout({
				$content: generalReasons.$element,
				classes: ['two'],
				scrollable: false,
			});
			var stack = new OO.ui.StackLayout({
				items: [left_panel, right_panel],
				continuous: true,
				classes: ['adiutor-csd-modal-container']
			});
			stack.$element.css({
				'margin-top': '20px',
			});
			this.panel1 = new OO.ui.PanelLayout({
				padded: true,
				expanded: false,
				classes: ['adiutor-csd-modal-container-panel-1']
			});
			if(revDelCount >= "1") {
				var deletionMessage = mw.msg('page-deletion-count-warning', revDelCount);
				var deletionMessageWithLink = deletionMessage.replace(/\$2/g, '<a href="/wiki/Special:Log?type=delete&user=&page=' + mwConfig.wgPageName + '">' + mw.msg('log') + '</a>');
				var headerBarRevDel = new OO.ui.MessageWidget({
					type: 'warning',
					label: new OO.ui.HtmlSnippet(deletionMessageWithLink)
				});
				this.panel1.$element.append(headerTitle.$element, headerTitleDescription.$element, headerBarRevDel.$element, stack.$element);
			} else {
				this.panel1.$element.append(headerTitle.$element, headerTitleDescription.$element, stack.$element);
			}
			this.stackLayout = new OO.ui.StackLayout({
				items: [this.panel1]
			});
			this.$body.append(this.stackLayout.$element);
		};
		// Set up the initial mode of the window ('edit', in this example.)  
		ProcessDialog.prototype.getSetupProcess = function(data) {
			return ProcessDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
				this.actions.setMode('edit');
			}, this);
		};
		// Use the getActionProcess() method to set the modes and displayed item.
		ProcessDialog.prototype.getActionProcess = function(action) {
			if(action === 'policy') {
				window.open('/wiki/' + speedyDeletionPolicyLink + '', '_blank');
			} else if(action === 'back') {
				// Set the mode to edit.
				this.actions.setMode('edit');
				// Show the edit panel.
				this.stackLayout.setItem(this.panel1);
			} else if(action === 'continue') {
				var dialog = this;
				return new OO.ui.Process(function() {
					nameSpaceDeletionReasons.items.forEach(function(Reason) {
						if(Reason.fieldWidget.selected) {
							casdReasons.push({
								value: Reason.fieldWidget.value,
								data: Reason.fieldWidget.data,
								selected: Reason.fieldWidget.selected
							});
						}
					});
					generalReasons.items.forEach(function(Reason) {
						if(Reason.fieldWidget.selected) {
							casdReasons.push({
								value: Reason.fieldWidget.value,
								data: Reason.fieldWidget.data,
								selected: Reason.fieldWidget.selected
							});
						}
					});
					if(casdReasons.length > 0) {
						if(copyVioInput.value != "") {
							CopVioURL = '|url=' + copyVioInput.value;
						} else {
							CopVioURL = "";
						}
						if(casdReasons.length > 1) {
							var SaltCSDReason = csdTemplateStart;
							var i = 0;
							var keys = Object.keys(casdReasons);
							for(i = 0; i < keys.length; i++) {
								if(i > 0) SaltCSDReason += (i < keys.length - 1) ? ', ' : ' ' + reasonAndSeperator + ' ';
								SaltCSDReason += '[[' + speedyDeletionPolicyPageShorcut + '#' + casdReasons[keys[i]].value + ']]';
							}
							for(i = 0; i < keys.length; i++) {
								if(i > 0) saltCsdSummary += (i < keys.length - 1) ? ', ' : ' ' + reasonAndSeperator + ' ';
								saltCsdSummary += '[[' + speedyDeletionPolicyPageShorcut + '#' + casdReasons[keys[i]].value + ']]';
							}
							casdReason = SaltCSDReason + CopVioURL + csdTemplateEnd;
							csdSummary = replaceParameter(multipleReasonSummary, '2', saltCsdSummary);
						} else {
							casdReason = csdTemplateStart + casdReasons[0].data + CopVioURL + csdTemplateEnd;
							csdSummary = replaceParameter(singleReasonSummary, '2', casdReasons[0].data);
							saltCsdSummary = replaceParameter(singleReasonSummary, '2', casdReasons[0].data);
						}
						//Şablon ekleme fonksyionu çağır
						deletionOptions.items.forEach(function(Option) {
							if(Option.fieldWidget.selected) {
								csdOptions.push({
									value: Option.fieldWidget.value,
									selected: Option.fieldWidget.selected
								});
							}
						});
						csdOptions.forEach(function(Option) {
							if(Option.value === "recreationProrection") {
								casdReason = casdReason + "\n" + '{{Salt}}';
							}
							if(Option.value === "informCreator") {
								getCreator().then(function(data) {
									articleAuthor = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
									if(!mw.util.isIPAddress(articleAuthor)) {
										var placeholders = {
											$1: pageTitle,
											$2: saltCsdSummary,
										};
										notificationMessage = replacePlaceholders(csdNotificationTemplate, placeholders);
										sendMessageToAuthor(articleAuthor, notificationMessage);
									}
								});
							}
						});
						putCSDTemplate();
						logCsdRequest();
						showProgress();
						dialog.close();
					} else {
						mw.notify(mw.notificationMessage('select-speedy-deletion-reason').text(), {
							title: mw.msg('warning'),
							type: 'error'
						});
					}
				});
			}
			return ProcessDialog.super.prototype.getActionProcess.call(this, action);
		};
		// Create and append the window manager.
		var windowManager = new OO.ui.WindowManager({
			classes: ['adiutor-csd-modal-dialog-container-sub']
		});
		$(document.body).append(windowManager.$element);
		// Create a new dialog window.
		var processDialog = new ProcessDialog({
			size: 'larger',
			classes: ['adiutor-csd-modal-dialog-container']
		});
		// Add windows to window manager using the addWindows() method.
		windowManager.addWindows([processDialog]);
		// Open the window.
		windowManager.openWindow(processDialog);
		// Define functions below as needed
		function putCSDTemplate(casdReason, csdSummary) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: mwConfig.wgPageName,
				prependtext: casdReason + "\n",
				summary: csdSummary,
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {
				adiutorUserOptions.stats.csdRequests++;
				api.postWithEditToken({
					action: 'globalpreferences',
					format: 'json',
					optionname: 'userjs-adiutor',
					optionvalue: JSON.stringify(adiutorUserOptions),
					formatversion: 2,
				}).done(function() {});
				location.reload();
			});
		}

		function logCsdRequest() {
			if(adiutorUserOptions.speedyDeletion.csdLogNominatedPages === true) {
				// Get the current date and format it as "Month Year"
				var currentDate = new Date();
				var currentMonthYear = currentDate.toLocaleString(localLangCode, {
					month: 'long',
					year: 'numeric'
				});
				// Define the section title using the current month and year
				var sectionTitle = "== " + currentMonthYear + " ==";
				var newContent; // Define newContent here in a higher scope
				// Fetch the content of the page
				api.get({
					action: 'parse',
					page: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.csdLogPageName + '').split(' ').join('_'),
					format: 'json',
					prop: 'wikitext'
				}).then(function(data) {
					var pageContent = data.parse.wikitext['*'];
					// Check if the section title exists in the page content
					if(pageContent.includes(sectionTitle)) {
						// Append the log entry just below the section
						newContent = pageContent.replace(sectionTitle, sectionTitle + "\n" + "# '''[[:" + pageTitle + "|" + pageTitle + "]]''' " + csdSummary + " ~~~~~");
					} else {
						// Create the section and append the log entry
						newContent = pageContent + "\n\n" + sectionTitle + "\n" + "# '''[[:" + pageTitle + "|" + pageTitle + "]]''' " + csdSummary + " ~~~~~";
					}
					// Perform the edit to update the page content
					return api.postWithToken('csrf', {
						action: 'edit',
						title: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.csdLogPageName + '').split(' ').join('_'),
						text: newContent,
						summary: replaceParameter(apiPostSummaryforLog, '1', pageTitle),
						tags: 'Adiutor',
						format: 'json'
					});
				}).catch(function(error) {
					// Handle the error here
					console.error('Error:', error);
					// If you want to retry the edit in the catch block, you can do so
					api.postWithToken('csrf', {
						action: 'edit',
						title: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.csdLogPageName + '').split(' ').join('_'),
						section: 'new',
						sectiontitle: sectionTitle,
						text: "# '''[[:" + pageTitle + "]]''' " + csdSummary + " ~~~~~",
						summary: replaceParameter(apiPostSummaryforLog, '1', pageTitle),
						format: 'json',
					}).done(function() {});
				});
			}
		}

		function getCreator() {
			return api.get({
				action: 'query',
				prop: 'revisions',
				rvlimit: 1,
				rvprop: ['user'],
				rvdir: 'newer',
				titles: mwConfig.wgPageName
			});
		}

		function sendMessageToAuthor(articleAuthor, notificationMessage) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: userTalkPagePrefix + articleAuthor,
				appendtext: '\n' + notificationMessage,
				summary: replaceParameter(apiPostSummary, '1', pageTitle),
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {});
		}

		function showProgress() {
			var processStartedDialog = new OO.ui.MessageDialog();
			var progressBar = new OO.ui.ProgressBarWidget();
			var windowManager = new OO.ui.WindowManager();
			$(document.body).append(windowManager.$element);
			windowManager.addWindows([processStartedDialog]);
			windowManager.openWindow(processStartedDialog, {
				title: mw.msg('processing'),
				notificationMessage: progressBar.$element
			});
		}

		function replacePlaceholders(input, replacements) {
			return input.replace(/\$(\d+)/g, function(match, group) {
				var replacement = replacements['$' + group];
				return replacement !== undefined ? replacement : match;
			});
		}

		function replaceParameter(input, parameterName, newValue) {
			const regex = new RegExp('\\$' + parameterName, 'g');
			if(input.includes('$' + parameterName)) {
				return input.replace(regex, newValue);
			} else {
				return input;
			}
		}
	});
});
/* </nowiki> */