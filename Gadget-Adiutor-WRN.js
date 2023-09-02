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
	headerTitle.$element.css('margin-top', '20px');
	var RationaleSelector = new OO.ui.DropdownWidget({
		menu: {
			items: [
				//data = template name and label = the message which shown on the menu.
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Vandalizm',
					label: 'Vandalizm'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-İşleyiş',
					label: 'İşleyiş Aksatıcı Değişiklik'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Deneme',
					label: 'Deneme Amaçlı Değişiklik'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Silme',
					label: 'İçeriğin Kaldırılması (silme)'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Şaka',
					label: 'Şaka Amaçlı Değişiklik'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Özgün',
					label: 'Özgün Araştırma Bilgi Eklemesi'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Reklam',
					label: 'Reklam Amaçlı Değişiklik'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Çıkar',
					label: 'Çıkar Çatışması'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Telif',
					label: 'Telif Hakkı İhlali'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Otobiyografi',
					label: 'Otobiyografi Oluşturma'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Ansiklopedik',
					label: 'Ansiklopedik Olmayan Bilgi Eklemesi'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Hz',
					label: 'Hz. vb İfadeleri Ekleme'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Makine',
					label: 'Makine Çevirisi Ekleme'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Yorum',
					label: 'Yorum İçeren Katkı'
				}),
				new OO.ui.MenuOptionWidget({
					data: 'ADT-Nezaket',
					label: 'Nezaket İhlali'
				}),
			]
		},
		label: new OO.ui.deferMsg('warning-type'),
	});
	RationaleSelector.getMenu().on('choose', function(menuOption) {
		warningTemplate = menuOption.getData();
	});
	RationaleSelector.$element.css('margin-top', '20px');
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
	relatedPageField.$element.css({
		'margin-top': '20px',
		'margin-bottom': '20px'
	});
	this.content.$element.append(headerTitle.$element, RationaleSelector.$element, relatedPageField.$element, warningLevel.$element);
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