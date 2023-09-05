/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Page move requests
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-'+wikiId));

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
	headerTitleDescription.$element.css({
		'margin-top': '20px',
		'margin-bottom': '20px'
	});
	var RequestRationale = new OO.ui.FieldsetLayout({});
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
	RequestRationale.$element.css('font-weight', '900');

	this.content = new OO.ui.PanelLayout({
		padded: true,
		expanded: false
	});
	this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, RequestRationale.$element, rationaleInput.$element);
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
/* </nowiki> */