/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: User warning
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
var RequestRationale, warningTemplate;

function UserWarningDialog(config) {
	UserWarningDialog.super.call(this, config);
}
OO.inheritClass(UserWarningDialog, OO.ui.ProcessDialog);
UserWarningDialog.static.name = 'UserWarningDialog';
UserWarningDialog.static.title = new OO.ui.deferMsg('wrn-module-title');
UserWarningDialog.static.actions = [{
	action: 'save',
	label: new OO.ui.deferMsg('warn'),
	flags: ['primary', 'progressive']
}, {
	label: new OO.ui.deferMsg('cancel'),
	flags: 'safe'
}];
UserWarningDialog.prototype.initialize = function() {
	UserWarningDialog.super.prototype.initialize.apply(this, arguments);
	var headerTitle = new OO.ui.MessageWidget({
		type: 'notice',
		inline: true,
		label: new OO.ui.deferMsg('wrn-dialog-description')
	});
	var RationaleSelector = new OO.ui.DropdownWidget({
		menu: {
			items: [
				new OO.ui.MenuOptionWidget({
					data: 1,
					label: 'Vandalizm'
				}),
				new OO.ui.MenuOptionWidget({
					data: 2,
					label: 'İşleyiş Aksatıcı Değişiklik'
				}),
				new OO.ui.MenuOptionWidget({
					data: 3,
					label: 'Deneme Amaçlı Değişiklik'
				}),
				new OO.ui.MenuOptionWidget({
					data: 4,
					label: 'İçeriğin Kaldırılması (silme)'
				}),
				new OO.ui.MenuOptionWidget({
					data: 5,
					label: 'Şaka Amaçlı Değişiklik'
				}),
				new OO.ui.MenuOptionWidget({
					data: 6,
					label: 'Özgün Araştırma Bilgi Eklemesi'
				}),
				new OO.ui.MenuOptionWidget({
					data: 7,
					label: 'Reklam Amaçlı Değişiklik'
				}),
				new OO.ui.MenuOptionWidget({
					data: 8,
					label: 'Çıkar Çatışması'
				}),
				new OO.ui.MenuOptionWidget({
					data: 9,
					label: 'Telif Hakkı İhlali'
				}),
				new OO.ui.MenuOptionWidget({
					data: 10,
					label: 'Otobiyografi Oluşturma'
				}),
				new OO.ui.MenuOptionWidget({
					data: 11,
					label: 'Ansiklopedik Olmayan Bilgi Eklemesi'
				}),
				new OO.ui.MenuOptionWidget({
					data: 12,
					label: 'Hz. vb İfadeleri Ekleme'
				}),
				new OO.ui.MenuOptionWidget({
					data: 13,
					label: 'Makine Çevirisi Ekleme'
				}),
				new OO.ui.MenuOptionWidget({
					data: 14,
					label: 'Yorum İçeren Katkı'
				}),
				new OO.ui.MenuOptionWidget({
					data: 15,
					label: 'Nezaket İhlali'
				}),
			]
		},
		label: new OO.ui.deferMsg('warning-type'),
	});
	relatedPageField = new OO.ui.FieldLayout(relatedPage = new OO.ui.TextInputWidget({
			value: ''
		}), {
			label: new OO.ui.deferMsg('related-page'),
			help: new OO.ui.deferMsg('wrn-related-page-help')
		}),
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
	warningLevel = new OO.ui.RadioSelectInputWidget({
		options: [{
			data: 1,
			label: new OO.ui.deferMsg('wrn-user-mildly'),
		}, {
			data: 2,
			label: new OO.ui.deferMsg('wrn-user-seriously'),
		}, {
			data: 3,
			label: new OO.ui.deferMsg('wrn-user-sternly'),
		}, ]
	});
	RationaleSelector.getMenu().on('choose', function(menuOption) {
		switch(menuOption.getData()) {
			case 1:
				warningTemplate = "ADT-Vandalizm";
				break;
			case 2:
				warningTemplate = "ADT-İşleyiş";
				break;
			case 3:
				warningTemplate = "ADT-Deneme";
				break;
			case 4:
				warningTemplate = "ADT-Silme";
				break;
			case 5:
				warningTemplate = "ADT-Şaka";
				break;
			case 6:
				warningTemplate = "ADT-Özgün";
				break;
			case 7:
				warningTemplate = "ADT-Reklam";
				break;
			case 8:
				warningTemplate = "ADT-Çıkar";
				break;
			case 9:
				warningTemplate = "ADT-Telif";
				break;
			case 10:
				warningTemplate = "ADT-Otobiyografi";
				break;
			case 11:
				warningTemplate = "ADT-Ansiklopedik";
				break;
			case 12:
				warningTemplate = "ADT-Hz";
				break;
			case 13:
				warningTemplate = "ADT-Makine";
				break;
			case 14:
				warningTemplate = "ADT-Yorum";
				break;
			case 15:
				warningTemplate = "ADT-Nezaket";
				break;
		}
	});
	this.content.$element.append(headerTitle.$element, '<br><hr><br>', RationaleSelector.$element, '<br>', relatedPageField.$element, '<br><hr><br>', warningLevel.$element);
	this.$body.append(this.content.$element);
};
UserWarningDialog.prototype.getActionProcess = function(action) {
	var dialog = this;
	if(action) {
		return new OO.ui.Process(function() {
			warnUser(warningTemplate);
			dialog.close({
				action: action
			});
		});
	}
	return UserWarningDialog.super.prototype.getActionProcess.call(this, action);
};
var windowManager = new OO.ui.WindowManager();
$(document.body).append(windowManager.$element);
var dialog = new UserWarningDialog();
windowManager.addWindows([dialog]);
windowManager.openWindow(dialog);

function warnUser(warningTemplate) {
	api.postWithEditToken({
		action: 'edit',
		title: 'Kullanıcı mesaj:' + mwConfig.wgPageName.replace(/_/g, " ").replace('Kullanıcı:', '').replace('Özel:Katkılar/', '').replace('Kullanıcı mesaj:', ''),
		appendtext: "\n" + "== Uyarı! ==" + "\n" + "{{yk:" + warningTemplate + "|" + relatedPage.value + "|" + warningLevel.getValue() + "|~~~~}}" + "\n",
		summary: 'Kullanıcı uyarıldı',
		tags: 'Adiutor',
		watchlist: 'unwatch',
		format: 'json'
	}).done(function() {
		window.location = '/wiki/' + 'Kullanıcı mesaj:' + mwConfig.wgPageName.replace(/_/g, " ").replace('Kullanıcı:', '').replace('Özel:Katkılar/', '').replace('Kullanıcı mesaj:', '');
		adiutorUserOptions.stats.userWarnings++;
		api.postWithEditToken({
			action: 'globalpreferences',
			format: 'json',
			optionname: 'userjs-adiutor',
			optionvalue: JSON.stringify(adiutorUserOptions),
			formatversion: 2,
		}).done(function() {});
	});
}
/* </nowiki> */