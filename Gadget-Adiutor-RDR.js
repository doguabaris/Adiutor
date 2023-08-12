/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Revision deletion requests
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
					var RDRRationale, RequestRationale;

					function RevisionDeleteRequestDialog(config) {
						RevisionDeleteRequestDialog.super.call(this, config);
					}
					OO.inheritClass(RevisionDeleteRequestDialog, OO.ui.ProcessDialog);
					RevisionDeleteRequestDialog.static.name = 'RevisionDeleteRequestDialog';
					RevisionDeleteRequestDialog.static.title = new OO.ui.deferMsg('rdr-module-title');
					RevisionDeleteRequestDialog.static.actions = [{
						action: 'save',
						label: new OO.ui.deferMsg('create'),
						flags: ['primary', 'progressive']
					}, {
						label: new OO.ui.deferMsg('cancel'),
						flags: 'safe'
					}];
					RevisionDeleteRequestDialog.prototype.initialize = function() {
						RevisionDeleteRequestDialog.super.prototype.initialize.apply(this, arguments);
						var headerTitle = new OO.ui.MessageWidget({
							type: 'notice',
							inline: true,
							label: new OO.ui.deferMsg('rdr-header-title')
						});
						var headerTitleDescription = new OO.ui.LabelWidget({
							label: new OO.ui.deferMsg('rdr-header-description')
						});
						RequestRationale = new OO.ui.FieldsetLayout({
							label: new OO.ui.deferMsg('rationale'),
						});
						RequestRationale.addItems([
							new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: false,
								data: mw.message('rdr-rationale-1').text(),
							}), {
								label: mw.message('rdr-rationale-1').text(),
								align: 'inline'
							}),
							new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: false,
								data: mw.message('rdr-rationale-2').text(),
							}), {
								label: mw.message('rdr-rationale-2').text(),
								align: 'inline'
							}),
							new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: false,
								data: mw.message('rdr-rationale-3').text(),
							}), {
								label: mw.message('rdr-rationale-3').text(),
								align: 'inline'
							}), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: false,
								data: mw.message('rdr-rationale-4').text(),
							}), {
								label: mw.message('rdr-rationale-4').text(),
								align: 'inline'
							}), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: false,
								data: mw.message('rdr-rationale-5').text(),
							}), {
								label: mw.message('rdr-rationale-5').text(),
								align: 'inline'
							}),
							rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
								placeholder: mw.message('rdr-comment-placeholder').text(),
								value: '',
							}), {
								label: mw.message('comment').text(),
								align: 'inline',
							}),
						]);
						var revNum = mwConfig.wgRevisionId;
						revisionField = new OO.ui.FieldLayout(revisionNumber = new OO.ui.TextInputWidget({
								value: revNum
							}), {
								label: mw.message('revision-id').text(),
								help: mw.message('rdr-revision-id-help').text(),
							}),
							this.content = new OO.ui.PanelLayout({
								padded: true,
								expanded: false
							});
						this.content.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<br><hr><br>', RequestRationale.$element, '<br>', rationaleInput.$element, '<br>', revisionField.$element);
						this.$body.append(this.content.$element);
					};
					RevisionDeleteRequestDialog.prototype.getActionProcess = function(action) {
						var dialog = this;
						if(action) {
							return new OO.ui.Process(function() {
								RequestRationale.items.forEach(function(Rationale) {
									if(Rationale.fieldWidget.selected) {
										RDRRationale = Rationale.fieldWidget.data;
									}
								});
								createRequest(RDRRationale, revisionNumber, rationaleInput);
								dialog.close({
									action: action
								});
							});
						}
						return RevisionDeleteRequestDialog.super.prototype.getActionProcess.call(this, action);
					};
					var windowManager = new OO.ui.WindowManager();
					$(document.body).append(windowManager.$element);
					var dialog = new RevisionDeleteRequestDialog();
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
	function createRequest(RDRRationale, revisionNumber, rationaleInput) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: 'Vikipedi:Sürüm gizleme talepleri',
			appendtext: "\n" + '{{kopyala:Vikipedi:Sürüm gizleme talepleri/Önyükleme-şablon |1= [[Özel:Fark/' + revisionNumber.value + ']] |2= ' + RDRRationale + ' ' + rationaleInput.value + '}}' + "\n",
			summary: '[[VP:SGT|Sürüm gizleme talebi]] oluşturuldu',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			window.location = '/wiki/Vikipedi:Sürüm gizleme talepleri';
		});
	}
});
/* </nowiki> */