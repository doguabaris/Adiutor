/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Page move requests
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
					function PageMoveRequestDialog(config) {
						PageMoveRequestDialog.super.call(this, config);
					}
					OO.inheritClass(PageMoveRequestDialog, OO.ui.ProcessDialog);
					PageMoveRequestDialog.static.name = 'PageMoveRequestDialog';
					PageMoveRequestDialog.static.title = new OO.ui.deferMsg('pmr-module-title');
					PageMoveRequestDialog.static.actions = [{
						action: 'save',
						label: new OO.ui.deferMsg('create'),
						flags: ['primary', 'progressive']
					}, {
						label: new OO.ui.deferMsg('cancel'),
						flags: 'safe'
					}];
					PageMoveRequestDialog.prototype.initialize = function() {
						PageMoveRequestDialog.super.prototype.initialize.apply(this, arguments);
						var headerTitle = new OO.ui.MessageWidget({
							type: 'notice',
							inline: true,
							label: new OO.ui.deferMsg('pmr-header-title')
						});
						var headerTitleDescription = new OO.ui.LabelWidget({
							label: new OO.ui.deferMsg('pmr-header-description')
						});
						var RequestRationale = new OO.ui.FieldsetLayout({
							label: new OO.ui.deferMsg('rationale'),
						});
						RequestRationale.addItems([
							new OO.ui.FieldLayout(NewPageName = new OO.ui.TextInputWidget({
								value: '',
								indicator: 'required',
							}), {
								label: new OO.ui.deferMsg('new-name'),
								help: new OO.ui.deferMsg('pmr-new-page-name-description')
							}),
							new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
								placeholder: new OO.ui.deferMsg('pmr-rationale-placeholder'),
								value: '',
								indicator: 'required',
							}), {
								label: new OO.ui.deferMsg('rationale'),
								align: 'inline',
							}),
						]);
						this.content = new OO.ui.PanelLayout({
							padded: true,
							expanded: false
						});
						this.content.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<br><br>', RequestRationale.$element, '<br>', rationaleInput.$element);
						this.$body.append(this.content.$element);
					};
					PageMoveRequestDialog.prototype.getActionProcess = function(action) {
						var dialog = this;
						if(action) {
							return new OO.ui.Process(function() {
								createRequest(NewPageName, rationaleInput);
								dialog.close({
									action: action
								});
							});
						}
						return PageMoveRequestDialog.super.prototype.getActionProcess.call(this, action);
					};
					var windowManager = new OO.ui.WindowManager();
					$(document.body).append(windowManager.$element);
					var dialog = new PageMoveRequestDialog();
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
	function createRequest(NewPageName, rationaleInput) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: 'Vikipedi:Sayfa taşıma talepleri',
			appendtext: "\n" + '{{kopyala:Vikipedi:Sayfa taşıma talepleri/Önyükleme-şablon |1= ' + mwConfig.wgPageName.replace(/_/g, " ") + ' |2= ' + NewPageName.value + '|3= ' + rationaleInput.value + ' }}' + "\n",
			summary: '[[VP:STT|Sayfa taşıma talebi]] oluşturuldu',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			window.location = '/wiki/Vikipedi:Sayfa taşıma talepleri';
		});
	}
});
/* </nowiki> */