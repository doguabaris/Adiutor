/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Proposed deletion
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
	var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber"]);
	var api = new mw.Api();
	var prdSendMessageToCreator = localStorage.getItem("prdSendMessageToCreator") == "true";

	function ProposedDeletionDialog(config) {
		ProposedDeletionDialog.super.call(this, config);
	}
	OO.inheritClass(ProposedDeletionDialog, OO.ui.ProcessDialog);
	ProposedDeletionDialog.static.name = 'ProposedDeletionDialog';
	ProposedDeletionDialog.static.title = 'Adiutor (Beta) - Bekletmeli Silme (BS)';
	ProposedDeletionDialog.static.actions = [{
		action: 'save',
		label: 'Öner',
		flags: ['primary', 'progressive']
	}, {
		label: 'İptal',
		flags: 'safe'
	}];
	ProposedDeletionDialog.prototype.initialize = function() {
		ProposedDeletionDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.HtmlSnippet('<strong>Bekletmeli Silme (BS)</strong><br><small>Maddenin hızlı silme için gerekli olan daha sıkı ve zorlu kriterleri karşılayamamakla birlikte tartışmasız bir biçimde silinebileceğini önermektir.</small>')
		});
		ProposeOptions = new OO.ui.FieldsetLayout({
			label: 'Bekletmeli Silme Türü'
		});
		ProposeOptions.addItems([
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				value: 'standardPropose'
			}), {
				label: 'BS (bekletmeli silme)',
				help: 'VP:SÖ uyarınca normal silme önerisi',
				align: 'inline'
			}),
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				value: 'LivingPersonPropose'
			}), {
				label: 'YİB BS (kaynaksız YİB\'lerin bekletmeli silinmesi)',
				help: '[[VP:YİBBS]] uyarınca yeni ve tamamen kaynaksız yaşayan insan biyografilerinin bekletmeli silinmesi',
				align: 'inline'
			}), rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: 'Bekletmeli silme gerekçesi',
				indicator: 'required',
				value: '',
			}), {
				label: 'Gerekçe',
				align: 'inline',
			}),
			new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
				value: prdSendMessageToCreator,
				data: 'informCreator'
			}), {
				label: 'Oluşturan kullanıcı bilgilendirilsin',
				align: 'top',
				help: 'Seçilirse sayfayı oluşturan kullanıcının mesaj sayfasına bir bildirim şablonu yerleştirilecektir.',
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
		this.content.$element.append(headerTitle.$element, '<br><hr><br>', ProposeOptions.$element);
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
