/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Page move requests
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
	var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber"]);
	api = new mw.Api();
    api.get({
        action: 'query',
        prop: 'revisions',
        titles: 'MediaWiki:Gadget-Adiutor-i18.json',
        rvprop: 'content',
        formatversion: 2
    }).done(function(data) {
        var content = data.query.pages[0].revisions[0].content;
        var messages = JSON.parse(content);
        var lang = mw.config.get('wgUserLanguage') || 'en';
        mw.messages.set(messages[lang] || messages['en']);
        function PageMoveRequestDialog(config) {
            PageMoveRequestDialog.super.call(this, config);
        }
        OO.inheritClass(PageMoveRequestDialog, OO.ui.ProcessDialog);
        PageMoveRequestDialog.static.name = 'PageMoveRequestDialog';
        PageMoveRequestDialog.static.title = new OO.ui.deferMsg('pmr-module-title');
        PageMoveRequestDialog.static.actions = [{
            action: 'save',
            label: new OO.ui.deferMsg('create'),
            flags: ['primary', 'progressive']
        }, {
            label: new OO.ui.deferMsg('cancel'),
            flags: 'safe'
        }];
        PageMoveRequestDialog.prototype.initialize = function() {
            PageMoveRequestDialog.super.prototype.initialize.apply(this, arguments);
            var headerTitle = new OO.ui.MessageWidget({
                type: 'notice',
                inline: true,
                label: new OO.ui.deferMsg('pmr-header-title')
            });
            var headerTitleDescription = new OO.ui.LabelWidget({
                label: new OO.ui.deferMsg('pmr-header-description')
            });
            var RequestRationale = new OO.ui.FieldsetLayout({
                label: new OO.ui.deferMsg('rationale'),
            });
            RequestRationale.addItems([
                new OO.ui.FieldLayout(NewPageName = new OO.ui.TextInputWidget({
                    value: '',
                    indicator: 'required',
                }), {
                    label: new OO.ui.deferMsg('new-name'),
                    help: new OO.ui.deferMsg('pmr-new-page-name-description')
                }),
                new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
                    placeholder: new OO.ui.deferMsg('pmr-rationale-placeholder'),
                    value: '',
                    indicator: 'required',
                }), {
                    label: new OO.ui.deferMsg('rationale'),
                    align: 'inline',
                }),
            ]);
            this.content = new OO.ui.PanelLayout({
                padded: true,
                expanded: false
            });
            this.content.$element.append(headerTitle.$element,'<br>', headerTitleDescription.$element, '<br><hr><br>', RequestRationale.$element, '<br>', rationaleInput.$element);
            this.$body.append(this.content.$element);
        };
        PageMoveRequestDialog.prototype.getActionProcess = function(action) {
            var dialog = this;
            if(action) {
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
    });
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
