/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: [[VP:Adiutor#Lisanslama ve atıf]]
 * Module: Page move requests
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
    var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber"]);
    api = new mw.Api();

    function PageMoveRequestDialog(config) {
        PageMoveRequestDialog.super.call(this, config);
    }
    OO.inheritClass(PageMoveRequestDialog, OO.ui.ProcessDialog);
    PageMoveRequestDialog.static.name = 'PageMoveRequestDialog';
    PageMoveRequestDialog.static.title = 'Adiutor (Beta) - Sayfa Taşıma Talebi (STT)';
    PageMoveRequestDialog.static.actions = [{
        action: 'save',
        label: 'Oluştur',
        flags: ['primary', 'progressive']
    }, {
        label: 'İptal',
        flags: 'safe'
    }];
    PageMoveRequestDialog.prototype.initialize = function() {
        PageMoveRequestDialog.super.prototype.initialize.apply(this, arguments);
        var headerTitle = new OO.ui.MessageWidget({
            type: 'notice',
            inline: true,
            label: new OO.ui.HtmlSnippet('<strong>Sayfa Taşıma Talebi (STT)</strong><br><small>Bu araç sayfaların başka bir sayfaya taşınmasına yönelik talepler için kullanılmaktadır. Normal durumlarda otomatik onaylanmış kullanıcıların sayfalarda yer alan [taşı] sekmesini kullanarak sayfa taşıma işlemlerini gerçekleştirmesi mümkündür.</small>')
        });
        var RequestRationale = new OO.ui.FieldsetLayout({
            label: 'Talep Gerekçesi',
        });
        RequestRationale.addItems([
            new OO.ui.FieldLayout(NewPageName = new OO.ui.TextInputWidget({
                value: '',
                indicator: 'required',
            }), {
                label: 'Yeni Ad',
                help: 'Sayfanın taşınmasını istediğiniz yeni adlandırması'
            }),
            new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
                placeholder: 'Sayfa taşıma talebi ile ilgili gerekçeniz.',
                value: '',
                indicator: 'required',
            }), {
                label: 'Gerekçe',
                align: 'inline',
            }),
        ]);
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });
        this.content.$element.append(headerTitle.$element, '<br><hr><br>', RequestRationale.$element, '<br>', rationaleInput.$element);
        this.$body.append(this.content.$element);
    };
    PageMoveRequestDialog.prototype.getActionProcess = function(action) {
        var dialog = this;
        if (action) {
            return new OO.ui.Process(function() {
                createRequest(NewPageName, rationaleInput);
                dialog.close({
                    action: action
                });
            });
        }
        return PageMoveRequestDialog.super.prototype.getActionProcess.call(this, action);
    };
    var windowManager = new OO.ui.WindowManager();
    $(document.body).append(windowManager.$element);
    var dialog = new PageMoveRequestDialog();
    windowManager.addWindows([dialog]);
    windowManager.openWindow(dialog);

    function createRequest(NewPageName, rationaleInput) {
        api.postWithToken('csrf', {
            action: 'edit',
            title: 'Vikipedi:Sayfa taşıma talepleri',
            appendtext: "\n" + '{{kopyala:Vikipedi:Sayfa taşıma talepleri/Önyükleme-şablon |1= ' + mwConfig.wgPageName.replace(/_/g, " ") + ' |2= ' + NewPageName.value + '|3= ' + rationaleInput.value + ' }}' + "\n",
            summary: '[[VP:STT|Sayfa taşıma talebi]] oluşturuldu',
            tags: 'Adiutor',
            format: 'json'
        }).done(function() {
            window.location = '/wiki/Vikipedi:Sayfa taşıma talepleri';
        });
    }
});
/* </nowiki> */