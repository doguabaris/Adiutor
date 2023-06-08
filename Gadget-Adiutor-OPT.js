/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: [[VP:Adiutor#Lisanslama ve atıf]]
 * Module: Adiutor options
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
    var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber"]);
    var api = new mw.Api();
    var prdSendMessageToCreator = localStorage.getItem("prdSendMessageToCreator") == "true";

    function AdiutorOptionsDialog(config) {
        AdiutorOptionsDialog.super.call(this, config);
    }
    OO.inheritClass(AdiutorOptionsDialog, OO.ui.ProcessDialog);
    AdiutorOptionsDialog.static.name = 'AdiutorOptionsDialog';
    AdiutorOptionsDialog.static.title = 'Adiutor - Tercihler';
    AdiutorOptionsDialog.static.actions = [{
        action: 'save',
        label: 'Güncelle',
        flags: ['primary', 'progressive']
    }, {
        label: 'İptal',
        flags: 'safe'
    }];
    AdiutorOptionsDialog.prototype.initialize = function() {
        AdiutorOptionsDialog.super.prototype.initialize.apply(this, arguments);
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });
        AdiutorSettings = new OO.ui.FieldsetLayout({
            label: 'Ayarlar',
        });
        AdiutorSettings.addItems([
            csdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: localStorage.getItem("csdSendMessageToCreator") == "true"
            }), {
                align: 'inline',
                label: 'Hızlı silme talebi sırasında sayfayı oluşturan kullanıcıyı bilgilendir.',
                help: 'Açıklama'
            }),
            afdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: localStorage.getItem("afdSendMessageToCreator") == "true"
            }), {
                align: 'inline',
                label: 'Silmeye aday gösterme sırasında sayfayı oluşturan kullanıcıyı bilgilendir.',
                help: 'Açıklama'
            }),
            prdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: localStorage.getItem("prdSendMessageToCreator") == "true"
            }), {
                align: 'inline',
                label: 'Bekletmeli silme talebi sırasında sayfayı oluşturan kullanıcıyı bilgilendir.',
                help: 'Açıklama'
            }),
            csdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: localStorage.getItem("csdLogNominatedPages") == "true"
            }), {
                align: 'inline',
                label: 'Hızlı silme taleplerinin günlüğünü tut',
                help: 'Açıklama'
            }),
            csdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
                value: localStorage.getItem("csdLogPageName"),
            }), {
                label: 'HS Günlük Adı',
                help: 'Açıklama'
            }),
            afdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: localStorage.getItem("afdLogNominatedPages") == "true"
            }), {
                align: 'inline',
                label: 'Silmeye aday gösterdiğim sayfaların günlüğünü tut',
                help: 'Açıklama'
            }),
            afdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
                value: localStorage.getItem("afdLogPageName")
            }), {
                label: 'SAS Günlük Adı',
                help: 'Açıklama'
            }),
            prdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: localStorage.getItem("prdLogNominatedPages") == "true"
            }), {
                align: 'inline',
                label: 'Bekletmeli silinmesini önerdiğim sayfaların günlüğünü tut',
                help: 'Açıklama'
            }),
            prdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
                value: localStorage.getItem("prdLogPageName"),
            }), {
                label: 'BS Günlük Adı',
                help: 'Açıklama'
            }),
            afdNominateOpinionsLog = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: localStorage.getItem("afdNominateOpinionsLog") == "true"
            }), {
                align: 'inline',
                label: 'SAS görüşlerimin günlüğünü tut',
                help: 'Açıklama'
            }),
            afdOpinionLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
                value: localStorage.getItem("afdOpinionLogPageName"),
            }), {
                label: 'SAS Görüş Günlük Adı',
                help: 'Açıklama'
            }),
            showMyStatus = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: localStorage.getItem("showMyStatus") == "true"
            }), {
                align: 'inline',
                label: 'Kullanıcıların etkinliğini göster',
                help: 'Bu seçenek aktif edildiğinde kullanıcı sayfalarında etkinlik durumlarını görebilirsiniz.'
            }),
        ]);
        this.content.$element.append(AdiutorSettings.$element);
        this.$body.append(this.content.$element);
    };
    AdiutorOptionsDialog.prototype.getActionProcess = function(action) {
        var dialog = this;
        if (action) {
            return new OO.ui.Process(function() {
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

    function updateOptions(UpdatedOptions) {
        api.postWithToken('csrf', {
            action: 'edit',
            title: 'Kullanıcı:' + mwConfig.wgUserName + '/Adiutor-options.js',
            text: UpdatedOptions,
            tags: 'Adiutor',
            summary: '[[VP:Adiutor|Adiutor]] ayarları güncellendi',
            format: 'json'
        }).done(function() {
            var Notification = new OO.ui.MessageWidget({
                type: 'success',
                label: 'Adiutor ayarlarınız başarıyla güncellendi',
                classes: ['afd-helper-notification'],
                showClose: true
            });
            $('.mw-page-container-inner').append(Notification.$element);
            setTimeout(function() {
                $(".afd-helper-notification").hide('blind', {}, 500);
            }, 5000);
        });
    }
});
/* </nowiki> */