/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
  * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]
 * Module: Revision deletion requests
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
    var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber", "wgRevisionId"]);
    var api = new mw.Api();
    var RDRRationale, RequestRationale;

    function RevisionDeleteRequestDialog(config) {
        RevisionDeleteRequestDialog.super.call(this, config);
    }
    OO.inheritClass(RevisionDeleteRequestDialog, OO.ui.ProcessDialog);
    RevisionDeleteRequestDialog.static.name = 'RevisionDeleteRequestDialog';
    RevisionDeleteRequestDialog.static.title = 'Adiutor (Beta) - Sürüm Gizleme  Talebi';
    RevisionDeleteRequestDialog.static.actions = [{
        action: 'save',
        label: 'Oluştur',
        flags: ['primary', 'progressive']
    }, {
        label: 'İptal',
        flags: 'safe'
    }];
    RevisionDeleteRequestDialog.prototype.initialize = function() {
        RevisionDeleteRequestDialog.super.prototype.initialize.apply(this, arguments);
        var headerTitle = new OO.ui.MessageWidget({
            type: 'notice',
            inline: true,
            label: new OO.ui.HtmlSnippet('<strong>Sürüm Gizleme Talebi (SGT)</strong><br><small>Bu araç ile talepte bulunmadan önce kullanıcının Vikipedi kuralları hakkında bilgilendirilmesi gerekmektedir. Küfürlü değişiklik ve tehdit söz konusu olduğunda bilgilendirme prosedürüne gerek kalmadan talepte bulunulabilir.</small>')
        });
        RequestRationale = new OO.ui.FieldsetLayout({
            label: 'Talep Gerekçesi'
        });
        RequestRationale.addItems([
            new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: false,
                data: 'Aleni kılınmamış kişisel bilginin çıkarılması',
            }), {
                label: 'Aleni kılınmamış kişisel bilginin çıkarılması',
                align: 'inline'
            }),
            new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: false,
                data: 'Küfür ve hakaret içeren içerik',
            }), {
                label: 'Küfür ve hakaret içeren içerik',
                align: 'inline'
            }),
            new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: false,
                data: 'Potansiyel olarak iftira niteliği taşıyabilecek bilginin çıkarılması',
            }), {
                label: 'Potansiyel olarak iftira niteliği taşıyabilecek bilginin çıkarılması',
                align: 'inline'
            }), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: false,
                data: 'Madde ile ilgisiz, topluluğu kışkırtmaya yönelik içerik',
            }), {
                label: 'Madde ile ilgisiz, topluluğu kışkırtmaya yönelik içerik',
                align: 'inline'
            }), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
                selected: false,
                data: 'Telif hakkı ihlâlinin çıkarılması',
            }), {
                label: 'Telif hakkı ihlâlinin çıkarılması',
                align: 'inline'
            }),
            rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
                placeholder: 'Sürüm gizleme talebi yorumu',
                value: '',
            }), {
                label: 'Yorum',
                align: 'inline',
            }),
        ]);
        var revNum = mwConfig.wgRevisionId;
        revisionField = new OO.ui.FieldLayout(revisionNumber = new OO.ui.TextInputWidget({
                value: revNum
            }), {
                label: 'Revizyon Kimliği',
                help: 'Gizlenmesi gereken revizyonun kimliği'
            }),
            this.content = new OO.ui.PanelLayout({
                padded: true,
                expanded: false
            });
        this.content.$element.append(headerTitle.$element, '<br><hr><br>', RequestRationale.$element, '<br>', rationaleInput.$element, '<br>', revisionField.$element);
        this.$body.append(this.content.$element);
    };
    RevisionDeleteRequestDialog.prototype.getActionProcess = function(action) {
        var dialog = this;
        if (action) {
            return new OO.ui.Process(function() {
                RequestRationale.items.forEach(function(Rationale) {
                    if (Rationale.fieldWidget.selected) {
                        RDRRationale = Rationale.fieldWidget.data;
                    }
                });
                createRequest(RDRRationale, revisionNumber, rationaleInput);
                dialog.close({
                    action: action
                });
            });
        }
        return RevisionDeleteRequestDialog.super.prototype.getActionProcess.call(this, action);
    };
    var windowManager = new OO.ui.WindowManager();
    $(document.body).append(windowManager.$element);
    var dialog = new RevisionDeleteRequestDialog();
    windowManager.addWindows([dialog]);
    windowManager.openWindow(dialog);

    function createRequest(RDRRationale, revisionNumber, rationaleInput) {
        api.postWithToken('csrf', {
            action: 'edit',
            title: 'Vikipedi:Sürüm gizleme talepleri',
            appendtext: "\n" + '{{kopyala:Vikipedi:Sürüm gizleme talepleri/Önyükleme-şablon |1= [[Özel:Fark/' + revisionNumber.value + ']] |2= ' + RDRRationale + ' ' + rationaleInput.value + '}}' + "\n",
            summary: '[[VP:SGT|Sürüm gizleme talebi]] oluşturuldu',
            tags: 'Adiutor',
            format: 'json'
        }).done(function() {
            window.location = '/wiki/Vikipedi:Sürüm gizleme talepleri';
        });
    }
});
/* </nowiki> */