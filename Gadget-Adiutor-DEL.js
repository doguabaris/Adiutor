/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Admin delete page module
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
// Create an API instance
var api = new mw.Api();
// Get user options from Adiutor configuration
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
var params = {};
// Sayfa mevcudiyetini kontrol et
api.get({
	action: "query",
	format: "json",
	titles: mwConfig.wgPageName
}).done(function(data) {
	var pages = data.query.pages;
	var pageId = Object.keys(pages)[0];
	if(pageId !== "-1") {
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

				function csdAdminProcessDialog(config) {
					csdAdminProcessDialog.super.call(this, config);
				}
				OO.inheritClass(csdAdminProcessDialog, OO.ui.ProcessDialog);
				csdAdminProcessDialog.static.title = mwConfig.wgPageName;
				csdAdminProcessDialog.static.name = 'csdAdminProcessDialog';
				// An action set that uses modes ('edit' and 'help' mode, in this example).
				csdAdminProcessDialog.static.actions = [{
					action: 'continue',
					modes: 'edit',
					label: mw.msg('confirm-action'),
					flags: ['primary', 'destructive']
				}, {
					action: 'help',
					modes: 'edit',
					label: mw.msg('help')
				}, {
					modes: 'edit',
					label: mw.msg('cancel'),
					flags: 'safe'
				}];
				csdAdminProcessDialog.prototype.initialize = function() {
					csdAdminProcessDialog.super.prototype.initialize.apply(this, arguments);
					var i, reason, checkboxWidget, fieldLayout;
					var selectedNamespace = null;
					switch(mwConfig.wgNamespaceNumber) {
						case 0:
						case 6:
						case 14:
						case 2:
						case 3:
						case 10:
						case 100:
							for(i = 0; i < speedyDeletionReasons.length; i++) {
								if(speedyDeletionReasons[i].namespace === mwConfig.wgNamespaceNumber) {
									selectedNamespace = {
										name: speedyDeletionReasons[i].name,
										reasons: speedyDeletionReasons[i].reasons
									};
									break;
								}
							}
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
							break;
						default:
							NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({});
							NameSpaceDeletionReasons.addItems([
								new OO.ui.FieldLayout(new OO.ui.MessageWidget({
									type: 'warning',
									inline: true,
									label: new OO.ui.HtmlSnippet('<strong>Bu ad alanı için hızlı silme gerekçesi bulunmamakta.</strong><br><small>lütfen sağ taraftaki genel nedenlerden birini seçiniz.</small><br><hr><br>')
								})),
							]);
							break;
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
						fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
							label: reason.label,
							align: 'inline',
							help: reason.help
						});
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
					copyVioInput = new OO.ui.TextInputWidget({
						placeholder: 'Telif hakkı ihlali yaratan sayfa',
						value: '',
						data: 'COV',
						classes: ['adiutor-copvio-input'],
					});
					copyVioInput.$element.hide();
					isCopyVio = false;
					GeneralReasons.$element.on('click', function(item) {
						if(item.target.value === 'G9') {
							copyVioInput.$element.show();
						}
					});
					var left_panel = new OO.ui.PanelLayout({
						$content: [NameSpaceDeletionReasons.$element],
						classes: ['one'],
						scrollable: false,
					});
					var right_panel = new OO.ui.PanelLayout({
						$content: [GeneralReasons.$element, OtherReasons.$element, copyVioInput.$element],
						classes: ['two'],
						scrollable: false,
					});
					var stack = new OO.ui.StackLayout({
						items: [left_panel, right_panel],
						continuous: true,
						classes: ['adiutor-csd-modal-container']
					});
					this.panel1 = new OO.ui.PanelLayout({
						padded: true,
						expanded: false,
						classes: ['adiutor-csd-modal-container-panel-1']
					});
					if(revDelCount >= "1") {
						HeaderBarRevDel = new OO.ui.MessageWidget({
							type: 'warning',
							label: new OO.ui.HtmlSnippet(mw.msg('page-deletion-count-warning', revDelCount, mwConfig.wgPageName))
						});
						HeaderBarRevDel.$element.css({
							'margin-bottom': '20px',
						});
						this.panel1.$element.append(HeaderBarRevDel.$element, stack.$element);
					} else {
						this.panel1.$element.append(stack.$element);
					}
					this.stackLayout = new OO.ui.StackLayout({
						items: [this.panel1],
						classes: ['adiutor-csd-modal-container-user-panel']
					});
					this.$body.append(this.stackLayout.$element);
				};
				csdAdminProcessDialog.prototype.getSetupProcess = function(data) {
					return csdAdminProcessDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
						this.actions.setMode('edit');
					}, this);
				};
				csdAdminProcessDialog.prototype.getActionProcess = function(action) {
					if(action === 'help') {
						this.actions.setMode('help');
						window.open('https://meta.wikimedia.org/wiki/Adiutor', '_blank');
					} else if(action === 'back') {
						this.actions.setMode('edit');
						this.stackLayout.setItem(this.panel1);
					} else if(action === 'continue') {
						var dialog = this;
						return new OO.ui.Process(function() {
							var CSDReason;
							var CSDSummary;
							var CSDReasons = [];
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
							var SaltCSDSummary = '';
							if(copyVioInput.value !== "") {
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
								CSDSummary = SaltCSDSummary;
							} else {
								CSDSummary = CSDReasons[0].data;
								SaltCSDSummary = CSDReasons[0].data;
							}
							api.postWithToken('csrf', {
								action: 'delete',
								title: mwConfig.wgPageName,
								reason: CSDSummary,
								tags: 'Adiutor',
								format: 'json'
							}).done(function() {
								api.postWithToken('csrf', {
									action: 'delete',
									title: "Tartışma:" + mwConfig.wgPageName,
									reason: '[[VP:HS#G7]]: Silinen sayfanın tartışma sayfası',
									tags: 'Adiutor',
									format: 'json'
								}).done(function() {});
								dialog.close();
								location.reload();
							});
						});
					}
					return csdAdminProcessDialog.super.prototype.getActionProcess.call(this, action);
				};
				var CsdWindowManager = new OO.ui.WindowManager();
				$(document.body).append(CsdWindowManager.$element);
				var dialog = new csdAdminProcessDialog({
					size: 'larger',
					classes: 'adiutor-user-dashboard-admin-csd-reason-dialog'
				});
				CsdWindowManager.addWindows([dialog]);
				CsdWindowManager.openWindow(dialog);
			});
		});
	} else {
		// Sayfa mevcut değilse, hata mesajı göster
		alert(mw.msg('page-not-found'));
	}
}).catch(error => {
	console.error("API hatası:", error);
});
/* </nowiki> */