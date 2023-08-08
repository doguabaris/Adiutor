/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Adiutor options
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows",]), $.ready).then(function () {
	var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber"]);
	var api = new mw.Api();
	api.get({
		action: 'query',
		prop: 'revisions',
		titles: 'MediaWiki:Gadget-Adiutor-i18.json',
		rvprop: 'content',
		formatversion: 2
	}).done(function (data) {
		var content = data.query.pages[0].revisions[0].content;
		var messages = JSON.parse(content);
		var lang = mw.config.get('wgUserLanguage') || 'en';
		mw.messages.set(messages[lang] || messages['en']);
		var prdSendMessageToCreator = localStorage.getItem("prdSendMessageToCreator") == "true";

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
		AdiutorOptionsDialog.prototype.initialize = function () {
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
					selected: localStorage.getItem("csdSendMessageToCreator") == "true"
				}), {
					align: 'inline',
					label: new OO.ui.deferMsg('csd-send-message-to-creator'),
					help: new OO.ui.deferMsg('description')
				}),
				afdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: localStorage.getItem("afdSendMessageToCreator") == "true"
				}), {
					align: 'inline',
					label: new OO.ui.deferMsg('afd-send-message-to-creator'),
					help: new OO.ui.deferMsg('description')
				}),
				prdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: localStorage.getItem("prdSendMessageToCreator") == "true"
				}), {
					align: 'inline',
					label: new OO.ui.deferMsg('prd-send-message-to-creator'),
					help: new OO.ui.deferMsg('description')
				}),
				csdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: localStorage.getItem("csdLogNominatedPages") == "true"
				}), {
					align: 'inline',
					label: new OO.ui.deferMsg('csd-log-nominated-pages'),
					help: new OO.ui.deferMsg('description')
				}),
				csdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
					value: localStorage.getItem("csdLogPageName"),
				}), {
					label: new OO.ui.deferMsg('csd-log-page-name'),
					help: new OO.ui.deferMsg('description')
				}),
				afdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: localStorage.getItem("afdLogNominatedPages") == "true"
				}), {
					align: 'inline',
					label: new OO.ui.deferMsg('afd-log-nominated-pages'),
					help: new OO.ui.deferMsg('description')
				}),
				afdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
					value: localStorage.getItem("afdLogPageName")
				}), {
					label: new OO.ui.deferMsg('afd-log-page-name'),
					help: new OO.ui.deferMsg('description')
				}),
				prdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: localStorage.getItem("prdLogNominatedPages") == "true"
				}), {
					align: 'inline',
					label: new OO.ui.deferMsg('prd-log-nominated-pages'),
					help: new OO.ui.deferMsg('description')
				}),
				prdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
					value: localStorage.getItem("prdLogPageName"),
				}), {
					label: new OO.ui.deferMsg('prd-log-page-name'),
					help: new OO.ui.deferMsg('description')
				}),
				afdNominateOpinionsLog = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: localStorage.getItem("afdNominateOpinionsLog") == "true"
				}), {
					align: 'inline',
					label: new OO.ui.deferMsg('afd-nominate-opinions-log'),
					help: new OO.ui.deferMsg('description')
				}),
				afdOpinionLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
					value: localStorage.getItem("afdOpinionLogPageName"),
				}), {
					label: new OO.ui.deferMsg('afd-opinion-log-page-name'),
					help: new OO.ui.deferMsg('description')
				}),
				showMyStatus = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: localStorage.getItem("showMyStatus") == "true"
				}), {
					align: 'inline',
					label: new OO.ui.deferMsg('show-my-status'),
					help: new OO.ui.deferMsg('show-status-description')
				}),
			]);
			this.content.$element.append(AdiutorSettings.$element);
			this.$body.append(this.content.$element);
		};
		AdiutorOptionsDialog.prototype.getActionProcess = function (action) {
			var dialog = this;
			if (action) {
				return new OO.ui.Process(function () {
					UpdatedOptions = JSON.stringify([{
						"name": "csdSendMessageToCreator",
						"value": csdSendMessageToCreator.fieldWidget.selected
					}, {
						"name": "csdLogNominatedPages",
						"value": csdLogNominatedPages.fieldWidget.selected
					}, {
						"name": "csdLogPageName",
						"value": csdLogPageName.fieldWidget.value
					}, {
						"name": "afdSendMessageToCreator",
						"value": afdSendMessageToCreator.fieldWidget.selected
					}, {
						"name": "afdLogNominatedPages",
						"value": afdLogNominatedPages.fieldWidget.selected
					}, {
						"name": "afdLogPageName",
						"value": afdLogPageName.fieldWidget.value
					}, {
						"name": "prdSendMessageToCreator",
						"value": prdSendMessageToCreator.fieldWidget.selected
					}, {
						"name": "prdLogNominatedPages",
						"value": prdLogNominatedPages.fieldWidget.selected
					}, {
						"name": "prdLogPageName",
						"value": prdLogPageName.fieldWidget.value
					}, {
						"name": "afdNominateOpinionsLog",
						"value": afdNominateOpinionsLog.fieldWidget.selected
					}, {
						"name": "afdOpinionLogPageName",
						"value": afdOpinionLogPageName.fieldWidget.value
					}, {
						"name": "showMyStatus",
						"value": showMyStatus.fieldWidget.selected
					}, {
						"name": "MyStatus",
						"value": "active"
					}]);
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
	function updateOptions(UpdatedOptions) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: 'Kullanıcı:' + mwConfig.wgUserName + '/Adiutor-options.js',
			text: UpdatedOptions,
			tags: 'Adiutor',
			summary: '[[VP:Adiutor|Adiutor]] ayarları güncellendi',
			format: 'json'
		}).done(function () {
			var Notification = new OO.ui.MessageWidget({
				type: 'success',
				label: 'Adiutor ayarlarınız başarıyla güncellendi',
				classes: ['afd-helper-notification'],
				showClose: true
			});
			$('.mw-page-container-inner').append(Notification.$element);
			setTimeout(function () {
				$(".afd-helper-notification").hide('blind', {}, 500);
			}, 5000);
		});
	}
});
/* </nowiki> */
