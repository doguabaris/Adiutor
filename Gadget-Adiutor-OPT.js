/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Sample container
 */
// Wait for required libraries and DOM to be ready
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]), $.ready).then(function() {
	// Get essential configuration from MediaWiki
	var mwConfig = mw.config.get(["skin", "wgAction", "wgRevisionId", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgRelevantUserName", "wgCanonicalNamespace"]);
	var api = new mw.Api();
	var adiutorUserOptions;
	// Fetch user-specific Adiutor options
	api.get({
		action: "query",
		format: "json",
		prop: "revisions",
		titles: "User:" + mwConfig.wgUserName + "/Adiutor-options.json",
		rvprop: "content"
	}).done(function(data) {
		var pageId = Object.keys(data.query.pages)[0];
		if(pageId !== "-1") {
			var jsonContent = data.query.pages[pageId].revisions[0]["*"];
			try {
				adiutorUserOptions = JSON.parse(jsonContent);
				// Fetch gadget messages for UI language
				api.get({
					action: 'query',
					prop: 'revisions',
					titles: 'MediaWiki:Gadget-Adiutor-i18.json',
					rvprop: 'content',
					formatversion: 2
				}).done(function(data) {
					var messages = JSON.parse(data.query.pages[0].revisions[0].content);
					var lang = mw.config.get('wgUserLanguage') || 'en';
					mw.messages.set(messages[lang] || messages.en);
					// Continue actions here
					function AdiutorOptionsDialog(config) {
						AdiutorOptionsDialog.super.call(this, config);
					}
					OO.inheritClass(AdiutorOptionsDialog, OO.ui.ProcessDialog);
					AdiutorOptionsDialog.static.name = 'AdiutorOptionsDialog';
					AdiutorOptionsDialog.static.title = new OO.ui.deferMsg('opt-module-title');
					AdiutorOptionsDialog.static.actions = [{
						action: 'save',
						label: new OO.ui.deferMsg('update'),
						flags: ['primary', 'progressive']
					}, {
						label: new OO.ui.deferMsg('cancel'),
						flags: 'safe'
					}];
					AdiutorOptionsDialog.prototype.initialize = function() {
						AdiutorOptionsDialog.super.prototype.initialize.apply(this, arguments);
						this.content = new OO.ui.PanelLayout({
							padded: true,
							expanded: false
						});
						AdiutorSettings = new OO.ui.FieldsetLayout({
							label: new OO.ui.deferMsg('options')
						});
						AdiutorSettings.addItems([
							csdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: adiutorUserOptions.speedyDeletion.csdSendMessageToCreator
							}), {
								align: 'inline',
								label: new OO.ui.deferMsg('csd-send-message-to-creator'),
								help: new OO.ui.deferMsg('description')
							}),
							afdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: adiutorUserOptions.articlesForDeletion.afdSendMessageToCreator
							}), {
								align: 'inline',
								label: new OO.ui.deferMsg('afd-send-message-to-creator'),
								help: new OO.ui.deferMsg('description')
							}),
							prdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: adiutorUserOptions.proposedDeletion.prdSendMessageToCreator
							}), {
								align: 'inline',
								label: new OO.ui.deferMsg('prd-send-message-to-creator'),
								help: new OO.ui.deferMsg('description')
							}),
							csdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: adiutorUserOptions.speedyDeletion.csdLogNominatedPages
							}), {
								align: 'inline',
								label: new OO.ui.deferMsg('csd-log-nominated-pages'),
								help: new OO.ui.deferMsg('description')
							}),
							csdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
								value: adiutorUserOptions.speedyDeletion.csdLogPageName
							}), {
								label: new OO.ui.deferMsg('csd-log-page-name'),
								help: new OO.ui.deferMsg('description')
							}),
							afdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: adiutorUserOptions.articlesForDeletion.afdLogNominatedPages
							}), {
								align: 'inline',
								label: new OO.ui.deferMsg('afd-log-nominated-pages'),
								help: new OO.ui.deferMsg('description')
							}),
							afdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
								value: adiutorUserOptions.articlesForDeletion.afdLogPageName
							}), {
								label: new OO.ui.deferMsg('afd-log-page-name'),
								help: new OO.ui.deferMsg('description')
							}),
							prdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: adiutorUserOptions.proposedDeletion.prdLogNominatedPages
							}), {
								align: 'inline',
								label: new OO.ui.deferMsg('prd-log-nominated-pages'),
								help: new OO.ui.deferMsg('description')
							}),
							prdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
								value: adiutorUserOptions.proposedDeletion.prdLogPageName
							}), {
								label: new OO.ui.deferMsg('prd-log-page-name'),
								help: new OO.ui.deferMsg('description')
							}),
							afdNominateOpinionsLog = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: adiutorUserOptions.articlesForDeletion.afdNominateOpinionsLog
							}), {
								align: 'inline',
								label: new OO.ui.deferMsg('afd-nominate-opinions-log'),
								help: new OO.ui.deferMsg('description')
							}),
							afdOpinionLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
								value: adiutorUserOptions.articlesForDeletion.afdOpinionLogPageName
							}), {
								label: new OO.ui.deferMsg('afd-opinion-log-page-name'),
								help: new OO.ui.deferMsg('description')
							}),
							showMyStatus = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: adiutorUserOptions.status.showMyStatus
							}), {
								align: 'inline',
								label: new OO.ui.deferMsg('show-my-status'),
								help: new OO.ui.deferMsg('show-status-description')
							}),
						]);
						this.content.$element.append(AdiutorSettings.$element);
						this.$body.append(this.content.$element);
					};
					AdiutorOptionsDialog.prototype.getActionProcess = function(action) {
						var dialog = this;
						if(action) {
							return new OO.ui.Process(function() {
								UpdatedOptions = {
									"myWorks": adiutorUserOptions.myWorks,
									"speedyDeletion": {
										"csdSendMessageToCreator": csdSendMessageToCreator.fieldWidget.selected,
										"csdLogNominatedPages": csdLogNominatedPages.fieldWidget.selected,
										"csdLogPageName": csdLogPageName.fieldWidget.value
									},
									"articlesForDeletion": {
										"afdSendMessageToCreator": afdSendMessageToCreator.fieldWidget.selected,
										"afdLogNominatedPages": afdLogNominatedPages.fieldWidget.selected,
										"afdLogPageName": afdLogPageName.fieldWidget.value,
										"afdNominateOpinionsLog": afdNominateOpinionsLog.fieldWidget.selected,
										"afdOpinionLogPageName": afdOpinionLogPageName.fieldWidget.value
									},
									"proposedDeletion": {
										"prdSendMessageToCreator": prdSendMessageToCreator.fieldWidget.selected,
										"prdLogNominatedPages": prdLogNominatedPages.fieldWidget.selected,
										"prdLogPageName": prdLogPageName.fieldWidget.value
									},
									"status": {
										"showMyStatus": showMyStatus.fieldWidget.selected,
										"myStatus": "active"
									},
								};
								updateOptions(UpdatedOptions);
								dialog.close({
									action: action
								});
							});
						}
						return AdiutorOptionsDialog.super.prototype.getActionProcess.call(this, action);
					};
					var windowManager = new OO.ui.WindowManager();
					$(document.body).append(windowManager.$element);
					var dialog = new AdiutorOptionsDialog();
					windowManager.addWindows([dialog]);
					windowManager.openWindow(dialog);
				});
			} catch(error) {
				// Handle JSON parsing error if needed
			}
		}
	}).fail(function(error) {
		// Handle API request failure if needed
	});
	// Define functions below as needed
	function updateOptions(updatedOptions) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: "Kullanıcı:" + mwConfig.wgUserName + "/Adiutor-options.json",
			text: JSON.stringify(updatedOptions),
			tags: 'Adiutor',
			summary: '[[VP:Adiutor|Adiutor]] ayarları güncellendi'
		}).done(function() {});
	}
});
/* </nowiki> */