/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Proposed deletion
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
					function ProposedDeletionDialog(config) {
						ProposedDeletionDialog.super.call(this, config);
					}
					OO.inheritClass(ProposedDeletionDialog, OO.ui.ProcessDialog);
					ProposedDeletionDialog.static.name = 'ProposedDeletionDialog';
					ProposedDeletionDialog.static.title = new OO.ui.deferMsg('rpp-module-title');
					ProposedDeletionDialog.static.actions = [{
						action: 'save',
						label: new OO.ui.deferMsg('propose'),
						flags: ['primary', 'progressive']
					}, {
						label: new OO.ui.deferMsg('cancel'),
						flags: 'safe'
					}];
					ProposedDeletionDialog.prototype.initialize = function() {
						ProposedDeletionDialog.super.prototype.initialize.apply(this, arguments);
						var headerTitle = new OO.ui.MessageWidget({
							type: 'notice',
							inline: true,
							label: new OO.ui.deferMsg('prd-header-title')
						});
						var headerTitleDescription = new OO.ui.LabelWidget({
							label: new OO.ui.deferMsg('prd-header-description')
						});
						ProposeOptions = new OO.ui.FieldsetLayout({
							label: new OO.ui.deferMsg('prd-deletion-type')
						});
						ProposeOptions.addItems([
							new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: false,
								value: 'standardPropose'
							}), {
								label: new OO.ui.deferMsg('prd-deletion-type-1'),
								help: new OO.ui.deferMsg('prd-deletion-type-1-help'),
								align: 'inline'
							}),
							new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: false,
								value: 'LivingPersonPropose'
							}), {
								label: new OO.ui.deferMsg('prd-deletion-type-2'),
								help: new OO.ui.deferMsg('prd-deletion-type-2-help'),
								align: 'inline'
							}), rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
								placeholder: new OO.ui.deferMsg('prd-deletion-rationale'),
								indicator: 'required',
								value: '',
							}), {
								label: new OO.ui.deferMsg('rationale'),
								align: 'inline',
							}),
							new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
								value: adiutorUserOptions.proposedDeletion.prdSendMessageToCreator,
								data: 'informCreator'
							}), {
								label: new OO.ui.deferMsg('afd-inform-creator'),
								align: 'top',
								help: new OO.ui.deferMsg('afd-inform-creator-help'),
							})
						]);
						rationaleInput.on('change', function() {
							if(rationaleInput.value != "") {
								InputFilled = false;
							} else {
								InputFilled = true;
							}
						});
						this.content = new OO.ui.PanelLayout({
							padded: true,
							expanded: false
						});
						this.content.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<br><hr><br>', ProposeOptions.$element);
						this.$body.append(this.content.$element);
					};
					ProposedDeletionDialog.prototype.getActionProcess = function(action) {
						var dialog = this;
						if(action) {
							return new OO.ui.Process(function() {
								var date = new Date();
								var Months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
								var PRDText;
								var PRDoptions = [];
								ProposeOptions.items.forEach(function(Option) {
									if(Option.fieldWidget.selected) {
										PRDoptions.push({
											value: Option.fieldWidget.value,
											selected: Option.fieldWidget.selected
										});
									}
									if(Option.fieldWidget.value === true) {
										PRDoptions.push({
											value: Option.fieldWidget.value,
											data: Option.fieldWidget.data
										});
									}
								});
								PRDoptions.forEach(function(Option) {
									if(Option.value === "standardPropose") {
										PRDText = '{{Bekletmeli sil-tarih |sorun = ' + rationaleInput.value + ' |gün = ' + date.getDate() + ' |ay = ' + Months[date.getUTCMonth()] + ' |yıl = ' + date.getUTCFullYear() + ' |isteyen = ' + mwConfig.wgUserName + ' }}';
									}
									if(Option.value === "LivingPersonPropose") {
										PRDText = '{{yk:bekletmeli sil|Hiçbir kaynak içermeyen [[VP:YİB|yaşayan insan biyografisi]]|yardım=kapalı}}';
									}
									if(Option.data === "informCreator") {
										getCreator().then(function(data) {
											var Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
											if(!mw.util.isIPAddress(Author)) {
												var message = '{{subst:Bs bildirim|' + mwConfig.wgPageName.replace(/_/g, " ") + '}}';
												sendMessageToAuthor(Author, message);
											}
										});
									}
								});
								putPRDTemplate(PRDText);
								logRequest(rationaleInput.value,adiutorUserOptions);
								dialog.close({
									action: action
								});
							});
						}
						return ProposedDeletionDialog.super.prototype.getActionProcess.call(this, action);
					};
					var windowManager = new OO.ui.WindowManager();
					$(document.body).append(windowManager.$element);
					var dialog = new ProposedDeletionDialog();
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
	function putPRDTemplate(PRDText) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: mwConfig.wgPageName,
			prependtext: PRDText + "\n",
			summary: '[[VP:SÖ]] uyarınca sayfanın sililinmesi önerildi',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			location.reload();
		});
	}

	function logRequest(rationaleInput, adiutorUserOptions) {
		if(adiutorUserOptions.proposedDeletion.prdLogNominatedPages === true) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: 'Kullanıcı:'.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.proposedDeletion.prdLogNominatedPages + '').split(' ').join('_'),
				appendtext: "\n" + "# '''[[" + mwConfig.wgPageName.replace(/_/g, " ") + "|" + mwConfig.wgPageName.replace(/_/g, " ") + "]]''' " + rationaleInput + " ~~~~~",
				summary: '[[' + mwConfig.wgPageName.replace(/_/g, " ") + ']] sayfasının bekletmeli silme adaylığının günlük kaydı tutuluyor.',
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
			summary: '[[VP:SÖ]] uyarınca  [[' + mwConfig.wgPageName.replace(/_/g, " ") + ']]' + ' sayfasının silinmesi önerildi',
			tags: 'Adiutor',
			format: 'json'
		});
	}
});
/* </nowiki> */