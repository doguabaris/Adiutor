/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Speedy Deletion
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
api.get({
	action: 'query',
	list: 'logevents',
	leaction: 'delete/delete',
	letprop: 'delete',
	letitle: mwConfig.wgPageName
}).done(function(data) {
	if(data.query.logevents) {
		revDelCount = data.query.logevents.length;
	} else {
		revDelCount = 0;
	}
	api.get({
		action: 'query',
		prop: 'revisions',
		titles: 'MediaWiki:Gadget-Adiutor.json',
		rvprop: 'content',
		formatversion: 2
	}).done(function(data) {
		var content = data.query.pages[0].revisions[0].content;
		var jsonData = JSON.parse(content);
		var speedyDeletionReasons = jsonData[1].adiutorSpeedyDeletionReasons;

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
				NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
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
					NameSpaceDeletionReasons.addItems([fieldLayout]);
				}
			} else {
				switch(mwConfig.wgNamespaceNumber) {
					case 0:
					case 6:
					case 14:
					case 2:
					case 3:
					case 10:
					case 100:
						selectedNamespace;
						if(mwConfig.wgNamespaceNumber === 2 || mwConfig.wgNamespaceNumber === 3) {
							selectedNamespace = speedyDeletionReasons.find(reason => reason.namespace === 2);
						} else {
							selectedNamespace = speedyDeletionReasons.find(reason => reason.namespace === mwConfig.wgNamespaceNumber);
						}
						if(selectedNamespace) {
							NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
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
								NameSpaceDeletionReasons.addItems([fieldLayout]);
							}
						} else {
							NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({});
							NameSpaceDeletionReasons.addItems([
								new OO.ui.FieldLayout(new OO.ui.MessageWidget({
									type: 'warning',
									inline: true,
									label: new OO.ui.HtmlSnippet(mw.msg('no-namespace-reason-for-csd'))
								})),
							]);
						}
						break;
					default:
						NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({});
						NameSpaceDeletionReasons.addItems([
							new OO.ui.FieldLayout(new OO.ui.MessageWidget({
								type: 'warning',
								inline: true,
								label: new OO.ui.HtmlSnippet(mw.msg('no-namespace-reason-for-csd'))
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
			GeneralReasons = new OO.ui.FieldsetLayout({
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
				GeneralReasons.addItems([fieldLayout]);
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
			OtherReasons = new OO.ui.FieldsetLayout({
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
				OtherReasons.addItems([fieldLayout]);
			}
			GeneralReasons.$element.on('click', function(item) {
				if(item.target.value === 'G9') {
					copyVioInput.$element.show();
				}
			});
			DeletionOptions = new OO.ui.FieldsetLayout({
				label: mw.msg('other-options'),
			});
			DeletionOptions.addItems([
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
				$content: [NameSpaceDeletionReasons.$element, DeletionOptions.$element],
				classes: ['one'],
				scrollable: false,
			});
			var right_panel = new OO.ui.PanelLayout({
				$content: GeneralReasons.$element,
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
				var HeaderBarRevDel = new OO.ui.MessageWidget({
					type: 'warning',
					label: new OO.ui.HtmlSnippet(deletionMessageWithLink)
				});
				this.panel1.$element.append(headerTitle.$element, headerTitleDescription.$element, HeaderBarRevDel.$element, stack.$element);
			} else {
				this.panel1.$element.append(headerTitle.$element, headerTitleDescription.$element, stack.$element);
			}
			this.stackLayout = new OO.ui.StackLayout({
				items: [this.panel1]
			});
			this.$body.append(this.stackLayout.$element);
		};
		var CSDReasons = [];
		// Set up the initial mode of the window ('edit', in this example.)  
		ProcessDialog.prototype.getSetupProcess = function(data) {
			return ProcessDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
				this.actions.setMode('edit');
			}, this);
		};
		// Use the getActionProcess() method to set the modes and displayed item.
		ProcessDialog.prototype.getActionProcess = function(action) {
			if(action === 'policy') {
				window.open('/wiki/Vikipedi:Hızlı_silme', '_blank');
			} else if(action === 'back') {
				// Set the mode to edit.
				this.actions.setMode('edit');
				// Show the edit panel.
				this.stackLayout.setItem(this.panel1);
			} else if(action === 'continue') {
				var dialog = this;
				return new OO.ui.Process(function() {
					var CSDReason;
					var CSDSummary;
					var CSDOptions = [];
					NameSpaceDeletionReasons.items.forEach(function(Reason) {
						if(Reason.fieldWidget.selected) {
							CSDReasons.push({
								value: Reason.fieldWidget.value,
								data: Reason.fieldWidget.data,
								selected: Reason.fieldWidget.selected
							});
						}
					});
					GeneralReasons.items.forEach(function(Reason) {
						if(Reason.fieldWidget.selected) {
							CSDReasons.push({
								value: Reason.fieldWidget.value,
								data: Reason.fieldWidget.data,
								selected: Reason.fieldWidget.selected
							});
						}
					});
					if(CSDReasons.length > 0) {
						var SaltCSDSummary = '';
						if(copyVioInput.value != "") {
							CopVioURL = '|url=' + copyVioInput.value;
						} else {
							CopVioURL = "";
						}
						if(CSDReasons.length > 1) {
							var SaltCSDReason = '{{sil|';
							var i = 0;
							var keys = Object.keys(CSDReasons);
							for(i = 0; i < keys.length; i++) {
								if(i > 0) SaltCSDReason += (i < keys.length - 1) ? ', ' : ' ve ';
								SaltCSDReason += '[[VP:HS#' + CSDReasons[keys[i]].value + ']]';
							}
							for(i = 0; i < keys.length; i++) {
								if(i > 0) SaltCSDSummary += (i < keys.length - 1) ? ', ' : ' ve ';
								SaltCSDSummary += '[[VP:HS#' + CSDReasons[keys[i]].value + ']]';
							}
							CSDReason = SaltCSDReason + CopVioURL + '}}';
							CSDSummary = SaltCSDSummary + ' gerekçeleriyle sayfanın hızlı silinmesi talep ediliyor.';
						} else {
							CSDReason = '{{sil|' + CSDReasons[0].data + CopVioURL + '}}';
							CSDSummary = CSDReasons[0].data + ' gerekçesiyle sayfanın hızlı silinmesi talep ediliyor.';
							SaltCSDSummary = CSDReasons[0].data;
						}
						//Şablon ekleme fonksyionu çağır
						DeletionOptions.items.forEach(function(Option) {
							if(Option.fieldWidget.selected) {
								CSDOptions.push({
									value: Option.fieldWidget.value,
									selected: Option.fieldWidget.selected
								});
							}
						});
						CSDOptions.forEach(function(Option) {
							if(Option.value === "recreationProrection") {
								CSDReason = CSDReason + "\n" + '{{Salt}}';
							}
							if(Option.value === "informCreator") {
								getCreator().then(function(data) {
									var Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
									if(!mw.util.isIPAddress(Author)) {
										var message = '{{subst:HS-Bildirim|1=' + mwConfig.wgPageName.replace(/_/g, " ") + '|2=' + SaltCSDSummary + '}}';
										sendMessageToAuthor(Author, message);
									}
								});
							}
						});
						putCSDTemplate(CSDReason, CSDSummary);
						logCsdRequest(SaltCSDSummary, adiutorUserOptions);
						showProgress();
						dialog.close();
					} else {
						var messageDialog = new OO.ui.MessageDialog();
						var windowManager = new OO.ui.WindowManager();
						$(document.body).append(windowManager.$element);
						windowManager.addWindows([messageDialog]);
						windowManager.openWindow(messageDialog, {
							title: mw.msg('warning'),
							message: mw.msg('select-speedy-deletion-reason')
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
	});
});
// Define functions below as needed
function putCSDTemplate(CSDReason, CSDSummary) {
	api.postWithToken('csrf', {
		action: 'edit',
		title: mwConfig.wgPageName,
		prependtext: CSDReason + "\n",
		summary: CSDSummary,
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

function logCsdRequest(CSDSummary, adiutorUserOptions) {
	if(adiutorUserOptions.speedyDeletion.csdLogNominatedPages === true) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: 'Kullanıcı:'.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.csdLogPageName + '').split(' ').join('_'),
			appendtext: "\n" + "# '''[[" + mwConfig.wgPageName.replace(/_/g, " ") + "|" + mwConfig.wgPageName.replace(/_/g, " ") + "]]''' " + CSDSummary + " ~~~~~",
			summary: '[[' + mwConfig.wgPageName.replace(/_/g, " ") + ']] sayfasının hızlı silme adaylığının günlük kaydı tutuluyor.',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {});
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

function sendMessageToAuthor(Author, message) {
	api.postWithToken('csrf', {
		action: 'edit',
		title: 'Kullanıcı_mesaj:' + Author,
		appendtext: '\n' + message,
		summary: '[[' + mwConfig.wgPageName.replace(/_/g, " ") + ']]' + ' sayfası için hızlı silinme talep edildi',
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
/* </nowiki> */