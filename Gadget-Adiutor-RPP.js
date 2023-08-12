/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Requests for page protection
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
					var RPPText, RPPSummary, RPPData, RPPDuration;

					function PageProtectionDialog(config) {
						PageProtectionDialog.super.call(this, config);
					}
					OO.inheritClass(PageProtectionDialog, OO.ui.ProcessDialog);
					PageProtectionDialog.static.name = 'PageProtectionDialog';
					PageProtectionDialog.static.title = new OO.ui.deferMsg('rpp-module-title');
					PageProtectionDialog.static.actions = [{
						action: 'save',
						label: new OO.ui.deferMsg('create-request'),
						flags: ['primary', 'progressive']
					}, {
						label: new OO.ui.deferMsg('cancel'),
						flags: 'safe'
					}];
					PageProtectionDialog.prototype.initialize = function() {
						PageProtectionDialog.super.prototype.initialize.apply(this, arguments);
						var headerTitle = new OO.ui.MessageWidget({
							type: 'notice',
							inline: true,
							label: new OO.ui.deferMsg('rpp-header-title')
						});
						var headerTitleDescription = new OO.ui.LabelWidget({
							label: new OO.ui.deferMsg('rpp-header-description')
						});
						TypeOfAction = new OO.ui.FieldsetLayout({
							label: new OO.ui.deferMsg('protection-type')
						});
						TypeOfAction.addItems([
							DurationOfProtection = new OO.ui.DropdownWidget({
								menu: {
									items: [
										new OO.ui.MenuOptionWidget({
											data: mw.message('temporary').text(),
											label: new OO.ui.deferMsg('temporary')
										}),
										new OO.ui.MenuOptionWidget({
											data: mw.message('indefinite').text(),
											label: new OO.ui.deferMsg('indefinite')
										}),
									]
								},
								label: new OO.ui.deferMsg('duration')
							}),
							TypeOfProtection = new OO.ui.DropdownWidget({
								menu: {
									items: [
										new OO.ui.MenuOptionWidget({
											data: "tam koruma",
											label: 'Tam koruma'
										}),
										new OO.ui.MenuOptionWidget({
											data: "yarı koruma",
											label: 'Yarı koruma'
										}),
									]
								},
								label: new OO.ui.deferMsg('select-protection-type'),
								classes: ['adiutor-rpp-botton-select'],
							}),
							rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
								placeholder: new OO.ui.deferMsg('rpp-rationale-placeholder'),
								indicator: 'required',
								value: '',
							}), {
								label: new OO.ui.deferMsg('rationale'),
								align: 'inline',
							}),
						]);
						rationaleInput.on('change', function() {
							if(rationaleInput.value != "") {
								InputFilled = false;
							} else {
								InputFilled = true;
							}
						});
						TypeOfProtection.getMenu().on('choose', function(menuOption) {
							RPPData = menuOption.getData();
						});
						DurationOfProtection.getMenu().on('choose', function(duration) {
							RPPDuration = duration.getData();
						});
						this.content = new OO.ui.PanelLayout({
							padded: true,
							expanded: false
						});
						this.content.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<br><hr><br>', TypeOfAction.$element);
						this.$body.append(this.content.$element);
					};
					PageProtectionDialog.prototype.getActionProcess = function(action) {
						var dialog = this;
						if(action) {
							return new OO.ui.Process(function() {
								RPPText = '\n\==== {{lmad|' + mwConfig.wgPageName.replace(/_/g, " ") + '}} ====' + '\n\n' + '{{SKT|tür= ' + RPPDuration + ' ' + RPPData + '|gerekçe= ' + rationaleInput.value + '~~~~' + '|yorum=|karar=}}';
								RPPSummary = '[[' + mwConfig.wgPageName.replace(/_/g, " ") + ']] için koruma talep edildi';
								console.log(RPPText);
								addProtectionRequests(RPPText);
								dialog.close({
									action: action
								});
							});
						}
						return PageProtectionDialog.super.prototype.getActionProcess.call(this, action);
					};
					var windowManager = new OO.ui.WindowManager();
					$(document.body).append(windowManager.$element);
					var dialog = new PageProtectionDialog();
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
	function addProtectionRequests(RPPText) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: 'Vikipedi:Sayfa koruma talepleri',
			section: 1,
			appendtext: RPPText + "\n",
			summary: RPPSummary,
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			window.location = '/wiki/Vikipedi:Sayfa koruma talepleri';
		});
	}
});
/* </nowiki> */