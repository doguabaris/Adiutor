/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Article for deletion
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
	var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber"]);
	var api = new mw.Api();
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
	ArticleForDeletionDialog.static.title = 'Adiutor (Beta) - Silme Tartışması (SAS)';
	ArticleForDeletionDialog.static.actions = [{
		action: 'save',
		label: 'Devam',
		flags: ['primary', 'progressive']
	}, {
		label: 'İptal',
		flags: 'safe'
	}];
	ArticleForDeletionDialog.prototype.initialize = function() {
		ArticleForDeletionDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.HtmlSnippet('<strong>Silme tartışması</strong><br><small>Maddenin hızlı silme için gerekli olan daha sıkı ve zorlu kriterleri karşılayamamakla birlikte sayfanın silinmesi için bir tartışma başlatmaktır.</small>')
		});
		AfDOptions = new OO.ui.FieldsetLayout({});
		AfDOptions.addItems([
			rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: 'Bu sayfayı neden silinmeye aday gösteriyorsunuz?',
				indicator: 'required',
				value: '',
			}), {
				label: 'Gerekçe',
				align: 'inline',
			}),
			new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
				value: afdSendMessageToCreator,
				data: 'informCreator'
			}), {
				label: 'Oluşturan kullanıcı bilgilendirilsin',
				align: 'top',
				help: 'Seçilirse sayfayı oluşturan kullanıcının mesaj sayfasına bir bildirim şablonu yerleştirilecektir.',
			}),
		]);
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false,
			isDraggable: true
		});
		this.content.$element.append(headerTitle.$element, '<br>', AfDOptions.$element);
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
