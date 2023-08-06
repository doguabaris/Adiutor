/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: User Warning
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
    var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber", "wgRevisionId"]);
    var api = new mw.Api();
    var RequestRationale, warningTemplate;

    function UserWarningDialog(config) {
        UserWarningDialog.super.call(this, config);
    }
    OO.inheritClass(UserWarningDialog, OO.ui.ProcessDialog);
    UserWarningDialog.static.name = 'UserWarningDialog';
    UserWarningDialog.static.title = 'Adiutor (Beta) - Kullanıcı Uyarı Modülü';
    UserWarningDialog.static.actions = [{
        action: 'save',
        label: 'Uyar',
        flags: ['primary', 'progressive']
    }, {
        label: 'İptal',
        flags: 'safe'
    }];
    UserWarningDialog.prototype.initialize = function() {
        UserWarningDialog.super.prototype.initialize.apply(this, arguments);
        var headerTitle = new OO.ui.MessageWidget({
            type: 'notice',
            inline: true,
            label: new OO.ui.HtmlSnippet('<strong>Şu anda bu kullanıcıyı uyarmaktasınız, bu uyarı kullanıcının mesaj sayfasında görünecektir.</small>')
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
            label: "Uyarı Türü"
        });
        relatedPageField = new OO.ui.FieldLayout(relatedPage = new OO.ui.TextInputWidget({
                value: ''
            }), {
                label: 'İlgili sayfa',
                help: 'Uyarıya sebep olan sayfa'
            }),
            this.content = new OO.ui.PanelLayout({
                padded: true,
                expanded: false
            });
        warningLevel = new OO.ui.RadioSelectInputWidget({
            options: [{
                data: 1,
                label: 'Bu kullanıcıyı hafif şekilde uyar.'
            }, {
                data: 2,
                label: 'Bu kullanıcıyı ciddi şekilde uyar.'
            }, {
                data: 3,
                label: 'Bu kullanıcıyı sert şekilde uyar.'
            }, ]
        });
        RationaleSelector.getMenu().on('choose', function(menuOption) {
            switch (menuOption.getData()) {
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
        if (action) {
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
        });
    }
});
/* </nowiki> */