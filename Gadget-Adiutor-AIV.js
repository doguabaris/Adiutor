/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: [[VP:Adiutor#Lisanslama ve atıf]]
 * Module: Administrator intervention against vandalism
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
    var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber"]);
    api = new mw.Api();
    var RDRRationale, VandalizedPageInput, revId;
    var VandalizedPage = {};
    var RequestRationale = false;
    VandalizedPage.value = null;
    var revisionID = {};
    revisionID.value = null;

    function RevisionDeleteRequestDialog(config) {
        RevisionDeleteRequestDialog.super.call(this, config);
    }
    OO.inheritClass(RevisionDeleteRequestDialog, OO.ui.ProcessDialog);
    RevisionDeleteRequestDialog.static.name = 'RevisionDeleteRequestDialog';
    RevisionDeleteRequestDialog.static.title = 'Adiutor (Beta) - Kullanıcı Raporlama';
    RevisionDeleteRequestDialog.static.actions = [{
        action: 'save',
        label: 'Raporla',
        flags: ['primary', 'progressive']
    }, {
        label: 'İptal',
        flags: 'safe'
    }];
    RevisionDeleteRequestDialog.prototype.initialize = function() {
        RevisionDeleteRequestDialog.super.prototype.initialize.apply(this, arguments);
        var RationaleSelector = new OO.ui.DropdownWidget({
            menu: {
                items: [
                    new OO.ui.MenuOptionWidget({
                        data: 1,
                        label: 'Vandalizm'
                    }),
                    new OO.ui.MenuOptionWidget({
                        data: 2,
                        label: 'Kullanıcı Adı İhlali'
                    }),
                ]
            },
            label: "Raporlama Türü"
        });
        var headerTitle = new OO.ui.MessageWidget({
            type: 'notice',
            inline: true,
            label: new OO.ui.HtmlSnippet('<strong>Kullanıcı Engelleme Talebi (KET)</strong><br><small>Bu araç Vikipedi\'ye zarar veren kullanıcıların engellenmesine yönelik talepler için kullanılmaktadır. Bu araç vasıtası ile talepte bulunmadan önce kullanıcının Vikipedi kuralları ve engelleme politikası hakkında bilgilendirilmesi gerekmektedir.</small>')
        });
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });
        var RequestRationaleContainer = new OO.ui.FieldsetLayout({
            classes: ['adiutor-report-window-rationale-window']
        });
        RationaleSelector.getMenu().on('choose', function(menuOption) {
            switch (menuOption.getData()) {
                case 1:
                    RequestRationale = new OO.ui.FieldsetLayout({
                        label: 'Talep Gerekçesi'
                    });
                    RequestRationale.addItems([
                        new OO.ui.FieldLayout(VandalizedPage = new OO.ui.TextInputWidget({
                            value: ''
                        }), {
                            label: 'İlgili Sayfa',
                            help: 'Raporda herhangi bir sayfaya bağlantı vermemek için boş bırakın'
                        }),
                        new OO.ui.FieldLayout(revisionID = new OO.ui.TextInputWidget({
                            value: ''
                        }), {
                            label: 'Revizyon ID',
                            help: 'Revizyon ID\'si eklememek için boş bırakın '
                        }),
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Birden çok kez uyarılmasına rağmen yapılan vandalizm',
                        }), {
                            label: 'Birden çok kez uyarılmasına rağmen yapılan vandalizm',
                            align: 'inline'
                        }),
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Engeli bittikten sonra (1 gün içinde) yapılan vandalizm',
                        }), {
                            label: 'Engeli bittikten sonra (1 gün içinde) yapılan vandalizm',
                            align: 'inline'
                        }),
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Sadece vandalizm amaçlı hesap',
                        }), {
                            label: 'Sadece vandalizm amaçlı hesap',
                            align: 'inline'
                        }),
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Yalnızca reklam amaçlı hesap',
                        }), {
                            label: 'Yalnızca reklam amaçlı hesap',
                            align: 'inline'
                        }),
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Spambot veya şifresi ele geçirilmiş hesap',
                        }), {
                            label: 'Spambot veya şifresi ele geçirilmiş hesap',
                            align: 'inline'
                        }),
                    ]);
                    break;
                case 2:
                    RequestRationale = new OO.ui.FieldsetLayout({
                        label: 'Talep Gerekçesi'
                    });
                    RequestRationale.addItems([
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Şaşırtıcı, yanlış yönlendirici, problem yaratıcı kullanıcı adı',
                        }), {
                            label: 'Şaşırtıcı, yanlış yönlendirici, problem yaratıcı kullanıcı adı',
                            align: 'inline'
                        }),
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Ticari marka içeren kullanıcı adı',
                        }), {
                            label: 'Ticari marka içeren kullanıcı adı',
                            align: 'inline'
                        }),
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Halen yaşayan ya da yeni ölmüş tanınmış kişi adı',
                        }), {
                            label: 'Halen yaşayan ya da yeni ölmüş tanınmış kişi adı',
                            align: 'inline'
                        }),
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Taciz edici veya karalayıcı kullanıcı adı',
                        }), {
                            label: 'Taciz edici veya karalayıcı kullanıcı adı',
                            align: 'inline'
                        }),
                        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                            selected: false,
                            data: 'Spam amaçlı veya reklam içeren kullanıcı adı',
                        }), {
                            label: 'Spam amaçlı veya reklam içeren kullanıcı adı',
                            align: 'inline'
                        }),
                    ]);
                    break;
            }
            RequestRationaleContainer.$element.html(RequestRationale.$element);
        });
        this.content.$element.append(headerTitle.$element, '<hr><br>', RationaleSelector.$element, '<br><br>', RequestRationaleContainer.$element);
        RevisionDeleteRequestDialog.prototype.getBodyHeight = function() {
            return Math.max(this.content.$element.outerHeight(false), 450);
        };
        this.$body.append(this.content.$element);
    };
    RevisionDeleteRequestDialog.prototype.getActionProcess = function(action) {
        var dialog = this;
        if (action) {
            if (RequestRationale) {
                RequestRationale.items.forEach(function(Rationale) {
                    if (Rationale.fieldWidget.selected) {
                        RDRRationale = Rationale.fieldWidget.data;
                    }
                });
            }
            if (RDRRationale) {
                return new OO.ui.Process(function() {
                    if (VandalizedPage.value) {
                        VandalizedPageInput = '[[' + VandalizedPage.value + ']] sayfası üzerinde ';
                    } else {
                        VandalizedPageInput = '';
                    }
                    if (revisionID.value) {
                        revId = '([[Özel:Fark/' + revisionID.value + '|fark]]) ';
                    } else {
                        revId = '';
                    }
                    PreparedText = '{{kopyala:Vikipedi:Kullanıcı engelleme talepleri/Önyükleme-şablon |1= ' + mwConfig.wgPageName.replace(/_/g, " ").replace('Kullanıcı:', '').replace('Özel:Katkılar/', '') + ' |2='.concat(VandalizedPageInput, revId, RDRRationale) + '}}';
                    addReport(PreparedText);
                    console.log(PreparedText);
                    dialog.close({
                        action: action
                    });
                });
            } else {
                OO.ui.alert('Lütfen bir gerekçe seçiniz').done(function() {});
            }
        }
        return RevisionDeleteRequestDialog.super.prototype.getActionProcess.call(this, action);
    };
    var windowManager = new OO.ui.WindowManager();
    $(document.body).append(windowManager.$element);
    var dialog = new RevisionDeleteRequestDialog();
    windowManager.addWindows([dialog]);
    windowManager.openWindow(dialog);

    function addReport(PreparedText) {
        api.postWithToken('csrf', {
            action: 'edit',
            title: 'Vikipedi:Kullanıcı engelleme talepleri',
            appendtext: "\n" + PreparedText + "\n",
            summary: '[[Kullanıcı:' + mwConfig.wgPageName.replace(/_/g, " ").replace('Kullanıcı:', '').replace('Özel:Katkılar/', '') + ']] raporlandı.',
            tags: 'Adiutor',
            format: 'json'
        }).done(function() {
            window.location = '/wiki/Vikipedi:Kullanıcı engelleme talepleri';
        });
    }
});
/* </nowiki> */