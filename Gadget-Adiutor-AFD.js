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
					var NominatedPreviously;
					var nextNominationNumber = 0;
					var afdSendMessageToCreator = localStorage.getItem("afdSendMessageToCreator") == "true";
					var afdLogNominatedPages = localStorage.getItem("afdLogNominatedPages") == "true";
					console.log(afdLogNominatedPages);

					function ArticleForDeletionDialog(config) {
						ArticleForDeletionDialog.super.call(this, config);
					}
					OO.inheritClass(ArticleForDeletionDialog, OO.ui.ProcessDialog);
					ArticleForDeletionDialog.static.name = 'ArticleForDeletionDialog';
					ArticleForDeletionDialog.static.title = new OO.ui.deferMsg('afd-module-title');
					ArticleForDeletionDialog.static.actions = [{
						action: 'save',
						label: new OO.ui.deferMsg('continue'),
						flags: ['primary', 'progressive']
					}, {
						label: new OO.ui.deferMsg('cancel'),
						flags: 'safe'
					}];
					ArticleForDeletionDialog.prototype.initialize = function() {
						ArticleForDeletionDialog.super.prototype.initialize.apply(this, arguments);
						var headerTitle = new OO.ui.MessageWidget({
							type: 'notice',
							inline: true,
							label: new OO.ui.deferMsg('afd-header-title')
						});
						var headerTitleDescription = new OO.ui.LabelWidget({
							label: new OO.ui.deferMsg('afd-header-description')
						});
						AfDOptions = new OO.ui.FieldsetLayout({});
						AfDOptions.addItems([
							rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
								placeholder: new OO.ui.deferMsg('afd-rationale-placeholder'),
								indicator: 'required',
								value: '',
							}), {
								label: new OO.ui.deferMsg('rationale'),
								align: 'inline',
							}),
							new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
								value: afdSendMessageToCreator,
								data: 'informCreator'
							}), {
								label: new OO.ui.deferMsg('afd-inform-creator'),
								align: 'top',
								help: new OO.ui.deferMsg('afd-inform-creator-help'),
							}),
						]);
						this.content = new OO.ui.PanelLayout({
							padded: true,
							expanded: false,
							isDraggable: true
						});
						this.content.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<br>', AfDOptions.$element);
						this.$body.append(this.content.$element);
					};
					ArticleForDeletionDialog.prototype.getActionProcess = function(action) {
						var dialog = this;
						if(action) {
							return new OO.ui.Process(function() {
								var AFDTempalte;
								var ActionOptions = [];
								AfDOptions.items.forEach(function(Option) {
									if(Option.fieldWidget.selected) {
										ActionOptions.push({
											value: Option.fieldWidget.value,
											selected: Option.fieldWidget.selected
										});
									}
									if(Option.fieldWidget.value === true) {
										ActionOptions.push({
											value: Option.fieldWidget.value,
											data: Option.fieldWidget.data
										});
									}
								});
								ActionOptions.forEach(function(Option) {
									if(Option.data === "informCreator") {
										console.log(Option.data);
										getCreator().then(function(data) {
											var Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
											if(!mw.util.isIPAddress(Author)) {
												var message = '{{kopyala:sas bildirim|' + mwConfig.wgPageName.replace(/_/g, " ") + '}}';
												sendMessageToAuthor(Author, message);
											}
										});
									}
								});
								checkPreviousNominations("Vikipedi:Silinmeye aday sayfalar/" + mwConfig.wgPageName).then(function(data) {
									if(data.query.pages["-1"]) {
										var nomCount = 0;
										console.log(nomCount);
										NominatedPreviously = false;
										AFDTempalte = '{{sas|yardım=hayır}}';
										putAfDTemplate(AFDTempalte, nextNominationNumber);
									} else {
										Rec(2);
									}
								});

								function Rec(nomCount) {
									checkPreviousNominations("Vikipedi:Silinmeye aday sayfalar/" + mwConfig.wgPageName + ' ' + '(' + nomCount + '._aday_gösterme)').then(function(data) {
										if(!data.query.pages["-1"]) {
											Rec(nomCount + 1);
										} else {
											nextNominationNumber = nomCount++;
											console.log(nextNominationNumber);
											if(nextNominationNumber > 1) {
												AFDTempalte = '{{sas|' + nextNominationNumber + '|' + mwConfig.wgPageName.replace(/_/g, " ") + '|yardım=hayır}}';
											} else {
												AFDTempalte = '{{sas|yardım=hayır}}';
											}
											console.log(AFDTempalte);
											putAfDTemplate(AFDTempalte, nextNominationNumber);
										}
									});
								}
								dialog.close({
									action: action
								});
								showProgress();
							});
						}
						return ArticleForDeletionDialog.super.prototype.getActionProcess.call(this, action);
					};
					var windowManager = new OO.ui.WindowManager();
					$(document.body).append(windowManager.$element);
					var dialog = new ArticleForDeletionDialog({
						size: 'large',
						classes: ['afd-helper-window'],
						isDraggable: true
					});
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
	function putAfDTemplate(AFDTempalte, nextNominationNumber) {
		var PageAFDX;
		if(nextNominationNumber > 1) {
			PageAFDX = mwConfig.wgPageName + ' (' + nextNominationNumber + '._aday_gösterme)';
		} else {
			PageAFDX = mwConfig.wgPageName;
		}
		api.postWithToken('csrf', {
			action: 'edit',
			title: mwConfig.wgPageName,
			prependtext: AFDTempalte + "\n",
			summary: 'Sayfa [[VP:SAS|silinmeye aday]] gösterildi',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			createNominationPage(PageAFDX);
			logNomination(PageAFDX);
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

	function createNominationPage(PageAFDX) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: 'Vikipedi:Silinmeye_aday_sayfalar/' + PageAFDX,
			appendtext: '{{yk:sas2 |sa = ' + mwConfig.wgPageName.replace(/_/g, " ") + '|metin= ' + rationaleInput.value + ' ~~~~ }}' + "\n",
			summary: 'Sayfa [[VP:SAS|silinmeye aday]] gösterildi',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			addNominationToAfdPage(PageAFDX);
		});
	}

	function addNominationToAfdPage(PageAFDX) {
		var pageContent;
		api.get({
			action: 'parse',
			page: "Vikipedi:Silinmeye_aday_sayfalar",
			prop: 'wikitext',
			format: "json"
		}).done(function(data) {
			pageContent = data.parse.wikitext['*'];
			var NominatedBefore = pageContent.includes("{{Vikipedi:Silinmeye aday sayfalar/" + PageAFDX.replace(/_/g, " ") + "}}");
			if(!NominatedBefore) {
				api.postWithToken('csrf', {
					action: 'edit',
					title: "Vikipedi:Silinmeye_aday_sayfalar",
					appendtext: "\n" + "{{Vikipedi:Silinmeye aday sayfalar/" + PageAFDX.replace(/_/g, " ") + "}}",
					summary: "Adaylık [[Vikipedi:Silinmeye aday sayfalar|sas]] listesine eklendi.",
					tags: 'Adiutor',
					format: 'json'
				}).done(function() {
					addNominationToAfdLogPage(PageAFDX);
				});
			}
		});
	}

	function addNominationToAfdLogPage(PageAFDX) {
		var date = new Date();
		var date_months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
		var date_year = date.getUTCFullYear();
		var month_name = date_months[date.getUTCMonth()];
		var pageContent;
		api.get({
			action: 'parse',
			page: "Vikipedi:Silinmeye_aday_sayfalar/Kayıt/" + date_year + "_" + month_name,
			prop: 'wikitext',
			format: "json"
		}).done(function(data) {
			pageContent = data.parse.wikitext['*'];
			var NominatedBefore = pageContent.includes("{{Vikipedi:Silinmeye aday sayfalar/" + PageAFDX.replace(/_/g, " ") + "}}");
			//Eğer daha önce aday gösterilmişe
			if(!NominatedBefore) {
				api.postWithToken('csrf', {
					action: 'edit',
					title: "Vikipedi:Silinmeye_aday_sayfalar/Kayıt/" + date_year + "_" + month_name,
					appendtext: "\n" + "{{Vikipedi:Silinmeye aday sayfalar/" + PageAFDX.replace(/_/g, " ") + "}}",
					summary: "Adaylık [[Vikipedi:Silinmeye aday sayfalar/Kayıt/" + date_year + " " + month_name + "|mevcut ayın]] kayıtlarına eklendi.",
					tags: 'Adiutor',
					format: 'json'
				}).done(function() {
					window.location = '/wiki/Vikipedi:Silinmeye aday sayfalar/' + PageAFDX.replace(/_/g, " ");
				});
			} else {
				window.location = '/wiki/Vikipedi:Silinmeye aday sayfalar/' + PageAFDX.replace(/_/g, " ");
			}
		});
	}

	function logNomination(PageAFDX) {
		if(afdLogNominatedPages) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: 'Kullanıcı:'.concat(mwConfig.wgUserName, '/' + localStorage.getItem("afdLogPageName") + '').split(' ').join('_'),
				appendtext: "\n" + "# '''[[Vikipedi:Silinmeye aday sayfalar/" + PageAFDX.replace(/_/g, " ") + "|" + mwConfig.wgPageName.replace(/_/g, " ") + "]]''' sayfasını silinmeye aday gösterdi ~~~~~",
				summary: 'Silinmeye aday gösterilen sayfanın günlük kaydı tutuluyor.',
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
			titles: mwConfig.wgPageName.replace(/_/g, " ")
		});
	}

	function sendMessageToAuthor(Author, message) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: 'Kullanıcı_mesaj:' + Author,
			appendtext: '\n' + message,
			summary: '[[' + mwConfig.wgPageName.replace(/_/g, " ") + ']]' + ' silinmeye aday gösterildi',
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
			title: 'İşlem gerçekleştiriliyor',
			message: progressBar.$element
		});
	}
});
/* </nowiki> */