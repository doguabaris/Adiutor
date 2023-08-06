/* 
 * Adiutor: A gadget to assist various user actions
 * Author: User:Vikipolimer
  * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]
 * Module: Requests for page protection
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
    var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber"]);
    var RPPText, RPPSummary, RPPData, RPPDuration;

    function PageProtectionDialog(config) {
        PageProtectionDialog.super.call(this, config);
    }
    OO.inheritClass(PageProtectionDialog, OO.ui.ProcessDialog);
    PageProtectionDialog.static.name = 'PageProtectionDialog';
    PageProtectionDialog.static.title = 'Adiutor (Beta) - SKT';
    PageProtectionDialog.static.actions = [{
        action: 'save',
        label: 'Talep Oluştur',
        flags: ['primary', 'progressive']
    }, {
        label: 'İptal',
        flags: 'safe'
    }];
    PageProtectionDialog.prototype.initialize = function() {
        PageProtectionDialog.super.prototype.initialize.apply(this, arguments);
        var headerTitle = new OO.ui.MessageWidget({
            type: 'notice',
            inline: true,
            label: new OO.ui.HtmlSnippet('<strong>Sayfa koruma talebi</strong><br><small>Bu araç, tam koruma ve yarı koruma için kullanılmaktadır. Lütfen Vikipedi:Koruma politikası sayfasını okuyun.</small>')
        });
        TypeOfAction = new OO.ui.FieldsetLayout({
            label: 'Koruma Seçenekleri'
        });
        TypeOfAction.addItems([
            DurationOfProtection = new OO.ui.DropdownWidget({
                menu: {
                    items: [
                        new OO.ui.MenuOptionWidget({
                            data: 'Geçici',
                            label: 'Geçici'
                        }),
                        new OO.ui.MenuOptionWidget({
                            data: 'Süresiz',
                            label: 'Süresiz'
                        }),
                    ]
                },
                label: "Süre"
            }),
            TypeOfProtection = new OO.ui.DropdownWidget({
                menu: {
                    items: [
                        new OO.ui.MenuOptionWidget({
                            data: "tam koruma",
                            label: 'Tam koruma'
                        }),
                        new OO.ui.MenuOptionWidget({
                            data: "yarı koruma",
                            label: 'Yarı koruma'
                        }),
                    ]
                },
                label: "Koruma türü seçiniz",
                classes: ['adiutor-rpp-botton-select'],
            }),
            rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
                placeholder: 'Lütfen bir koruma gerekçesi yazınız',
                indicator: 'required',
                value: '',
            }), {
                label: 'Gerekçe',
                align: 'inline',
            }),
        ]);
        rationaleInput.on('change', function() {
            if (rationaleInput.value != "") {
                InputFilled = false;
            } else {
                InputFilled = true;
            }
        });
        TypeOfProtection.getMenu().on('choose', function(menuOption) {
            RPPData = menuOption.getData();
        });
        DurationOfProtection.getMenu().on('choose', function(duration) {
            RPPDuration = duration.getData();
        });
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });
        this.content.$element.append(headerTitle.$element, '<br><hr><br>', TypeOfAction.$element);
        this.$body.append(this.content.$element);
    };
    PageProtectionDialog.prototype.getActionProcess = function(action) {
        var dialog = this;
        if (action) {
            return new OO.ui.Process(function() {
                RPPText = '\n\==== {{lmad|' + mwConfig.wgPageName.replace(/_/g, " ") + '}} ====' + '\n\n' + '{{SKT|tür= ' + RPPDuration + ' ' + RPPData + '|gerekçe= ' + rationaleInput.value + '~~~~' + '|yorum=|karar=}}';
                RPPSummary = '[[' + mwConfig.wgPageName.replace(/_/g, " ") + ']] için koruma talep edildi';
                console.log(RPPText);
                addProtectionRequests(RPPText);
                dialog.close({
                    action: action
                });
            });
        }
        return PageProtectionDialog.super.prototype.getActionProcess.call(this, action);
    };
    var windowManager = new OO.ui.WindowManager();
    $(document.body).append(windowManager.$element);
    var dialog = new PageProtectionDialog();
    windowManager.addWindows([dialog]);
    windowManager.openWindow(dialog);

    function addProtectionRequests(RPPText) {
        api.postWithToken('csrf', {
            action: 'edit',
            title: 'Vikipedi:Sayfa koruma talepleri',
            section: 1,
            appendtext: RPPText + "\n",
            summary: RPPSummary,
            tags: 'Adiutor',
            format: 'json'
        }).done(function() {
            window.location = '/wiki/Vikipedi:Sayfa koruma talepleri';
        });
    }
});
/* </nowiki> */