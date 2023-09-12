/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
<nowiki> */
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
var nominatedPreviously;
var nextNominationNumber = 0;

function fetchApiData(callback) {
	var api = new mw.Api();
	api.get({
		action: "query",
		prop: "revisions",
		titles: "MediaWiki:Gadget-Adiutor-AFD.json",
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
	var afdNotificationTemplate = jsonData.afdNotificationTemplate;
	var pageTitle = mw.config.get("wgPageName").replace(/_/g, " ");
	function articleForDeletionDialog(config) {
		articleForDeletionDialog.super.call(this, config);
	}
	OO.inheritClass(articleForDeletionDialog, OO.ui.ProcessDialog);
	articleForDeletionDialog.static.name = 'articleForDeletionDialog';
	articleForDeletionDialog.static.title = new OO.ui.deferMsg('afd-module-title');
	articleForDeletionDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('continue'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	articleForDeletionDialog.prototype.initialize = function() {
		articleForDeletionDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('afd-header-title')
		});
		var headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('afd-header-description')
		});
		headerTitleDescription.$element.css({
			'margin-top': '20px',
			'margin-bottom': '20px'
		});
		afdOptions = new OO.ui.FieldsetLayout({});
		afdOptions.addItems([
			rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: new OO.ui.deferMsg('afd-rationale-placeholder'),
				indicator: 'required',
				value: '',
			}), {
				label: new OO.ui.deferMsg('rationale'),
				align: 'inline',
			}),
			new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
				value: adiutorUserOptions.articlesForDeletion.afdSendMessageToCreator,
				data: 'informCreator'
			}), {
				label: new OO.ui.deferMsg('afd-inform-creator'),
				align: 'top',
				help: new OO.ui.deferMsg('afd-inform-creator-help'),
			}),
		]);
		rationaleField.$element.css('font-weight', '900');
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false,
			isDraggable: true
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, afdOptions.$element);
		this.$body.append(this.content.$element);
	};
	articleForDeletionDialog.prototype.getActionProcess = function(action) {
		var dialog = this;
		if(action) {
			return new OO.ui.Process(function() {
				var afdTempalte;
				var actionOptions = [];
				afdOptions.items.forEach(function(Option) {
					if(Option.fieldWidget.selected) {
						actionOptions.push({
							value: Option.fieldWidget.value,
							selected: Option.fieldWidget.selected
						});
					}
					if(Option.fieldWidget.value === true) {
						actionOptions.push({
							value: Option.fieldWidget.value,
							data: Option.fieldWidget.data
						});
					}
				});
				actionOptions.forEach(function(Option) {
					if(Option.data === "informCreator") {
						console.log(Option.data);
						getCreator().then(function(data) {
							var Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
							if(!mw.util.isIPAddress(Author)) {
								var message = replaceParameter(afdNotificationTemplate, '1', pageTitle);
								sendMessageToAuthor(Author, message);
							}
						});
					}
				});
				checkPreviousNominations(afdPage+"/" + mwConfig.wgPageName).then(function(data) {
					if(data.query.pages["-1"]) {
						var nomCount = 0;
						console.log(nomCount);
						nominatedPreviously = false;
						afdTempalte = '{{sas|yardım=hayır}}';
						putAfDTemplate(afdTempalte, nextNominationNumber);
					} else {
						Rec(2);
					}
				});

				function Rec(nomCount) {
					checkPreviousNominations(afdPage+"/" + mwConfig.wgPageName + ' ' + '(' + nomCount + '._aday_gösterme)').then(function(data) {
						if(!data.query.pages["-1"]) {
							Rec(nomCount + 1);
						} else {
							nextNominationNumber = nomCount++;
							console.log(nextNominationNumber);
							if(nextNominationNumber > 1) {
								afdTempalte = afdTemplate;
							} else {
								afdTempalte = afdTemplate;
							}
							console.log(afdTempalte);
							putAfDTemplate(afdTempalte, nextNominationNumber);
						}
					});
				}
				dialog.close({
					action: action
				});
				showProgress();
			});
		}
		return articleForDeletionDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new articleForDeletionDialog({
		size: 'large',
		classes: ['afd-helper-window'],
		isDraggable: true
	});
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);

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
	
	function putAfDTemplate(afdTempalte, nextNominationNumber) {
		var nominatedPageTitle;
		if(nextNominationNumber > 1) {
			var placeholders = {
				$1: pageTitle,
				$2: nextNominationNumber,
			};
			var nominatedPageTitle = replacePlaceholders(afdPageTitleForMultipleNomination, placeholders);
		} else {
			nominatedPageTitle = mwConfig.wgPageName;
		}
		api.postWithToken('csrf', {
			action: 'edit',
			title: mwConfig.wgPageName,
			prependtext: afdTempalte + "\n",
			summary: apiPostSummary,
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			createNominationPage(nominatedPageTitle);
			logNomination(nominatedPageTitle, adiutorUserOptions);
		});
	}

	function checkPreviousNominations(title) {
		return api.get({
			action: 'query',
			prop: 'revisions',
			rvlimit: 1,
			rvprop: ['user'],
			rvdir: 'newer',
			titles: title,
		});
	}

	function createNominationPage(nominatedPageTitle) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: afdPage + nominatedPageTitle,
			appendtext: '{{yk:sas2 |sa = ' + mwConfig.wgPageName.replace(/_/g, " ") + '|metin= ' + rationaleInput.value + ' ~~~~ }}' + "\n",
			summary: apiPostSummary,
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			addNominationToAfdPage(nominatedPageTitle);
		});
	}

	function addNominationToAfdPage(nominatedPageTitle) {
		var pageContent;
		api.get({
			action: 'parse',
			page: afdPage,
			prop: 'wikitext',
			format: "json"
		}).done(function(data) {
			pageContent = data.parse.wikitext['*'];
			var NominatedBefore = pageContent.includes("{{"+afdPage+"/" + nominatedPageTitle.replace(/_/g, " ") + "}}");
			if(!NominatedBefore) {
				api.postWithToken('csrf', {
					action: 'edit',
					title: afdPage,
					appendtext: "\n" + "{{"+afdPage+"/" + nominatedPageTitle.replace(/_/g, " ") + "}}",
					summary: apiPostSummaryforAfdPage,
					tags: 'Adiutor',
					format: 'json'
				}).done(function() {
					addNominationToAfdLogPage(nominatedPageTitle);
					adiutorUserOptions.stats.afdRequests++;
					api.postWithEditToken({
						action: 'globalpreferences',
						format: 'json',
						optionname: 'userjs-adiutor',
						optionvalue: JSON.stringify(adiutorUserOptions),
						formatversion: 2,
					}).done(function() {});
				});
			}
		});
	}

	if(logNominations){
		function addNominationToAfdLogPage(nominatedPageTitle) {
			var date = new Date();
			var date_year = date.getUTCFullYear();
			var month_name = localMonthsNames[date.getUTCMonth()];
			var pageContent;
			api.get({
				action: 'parse',
				page: afdLogPage + date_year + "_" + month_name,
				prop: 'wikitext',
				format: "json"
			}).done(function(data) {
				pageContent = data.parse.wikitext['*'];
				var NominatedBefore = pageContent.includes("{{"+afdPage+"/" + nominatedPageTitle.replace(/_/g, " ") + "}}");
				if(!NominatedBefore) {
					api.postWithToken('csrf', {
						action: 'edit',
						title: afdLogPage + date_year + "_" + month_name,
						appendtext: "\n" + "{{"+afdPage+"/" + nominatedPageTitle.replace(/_/g, " ") + "}}",
						summary: "Adaylık [["+afdLogPage+"" + date_year + " " + month_name + "|mevcut ayın]] kayıtlarına eklendi.",
						tags: 'Adiutor',
						format: 'json'
					}).done(function() {
						window.location = '/wiki/'+afdPage+'/' + nominatedPageTitle.replace(/_/g, " ");
					});
				} else {
					window.location = '/wiki/'+afdPage+'/' + nominatedPageTitle.replace(/_/g, " ");
				}
			});
		}
	}

	function logNomination() {
		if(adiutorUserOptions.speedyDeletion.afdLogNominatedPages === true) {
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
				page: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.afdLogPageName + '').split(' ').join('_'),
				format: 'json',
				prop: 'wikitext'
			}).then(function(data) {
				var pageContent = data.parse.wikitext['*'];
				// Check if the section title exists in the page content
				if(pageContent.includes(sectionTitle)) {
					// Append the log entry just below the section
					newContent = pageContent.replace(sectionTitle, sectionTitle + "\n" + replaceParameter(userLogText, '1', pageTitle));
				} else {
					// Create the section and append the log entry
					newContent = pageContent + "\n\n" + sectionTitle + "\n" + replaceParameter(userLogText, '1', pageTitle);
				}
				// Perform the edit to update the page content
				return api.postWithToken('csrf', {
					action: 'edit',
					title: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.csdLogPageName + '').split(' ').join('_'),
					text: newContent,
					summary: replaceParameter(apiPostSummaryforUserLog, '1', pageTitle),
					tags: 'Adiutor',
					format: 'json'
				});
			}).catch(function(error) {
				// Handle the error here
				console.error('Error:', error);
				// If you want to retry the edit in the catch block, you can do so
				api.postWithToken('csrf', {
					action: 'edit',
					title: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.afdLogPageName + '').split(' ').join('_'),
					section: 'new',
					sectiontitle: sectionTitle,
					text: replaceParameter(userLogText, '1', pageTitle),
					summary: replaceParameter(apiPostSummaryforUserLog, '1', pageTitle),
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
			titles: mwConfig.wgPageName.replace(/_/g, " ")
		});
	}

	function sendMessageToAuthor(Author, message) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: userTalkPagePrefix + Author,
			appendtext: '\n' + message,
			summary:  replaceParameter(apiPostSummaryforCreator, '1', pageTitle),
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
			message: progressBar.$element
		});
	}
});
/* </nowiki> */