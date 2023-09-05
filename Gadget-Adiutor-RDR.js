/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Revision deletion requests
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var wikiAdiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor') || '{}'); // Provide a default empty object if no options are set.
var adiutorUserOptions = wikiAdiutorUserOptions[wikiId];
var RDRRationale, RequestRationale;

function RevisionDeleteRequestDialog(config) {
	RevisionDeleteRequestDialog.super.call(this, config);
}
OO.inheritClass(RevisionDeleteRequestDialog, OO.ui.ProcessDialog);
RevisionDeleteRequestDialog.static.name = 'RevisionDeleteRequestDialog';
RevisionDeleteRequestDialog.static.title = new OO.ui.deferMsg('rdr-module-title');
RevisionDeleteRequestDialog.static.actions = [{
	action: 'save',
	label: new OO.ui.deferMsg('create'),
	flags: ['primary', 'progressive']
}, {
	label: new OO.ui.deferMsg('cancel'),
	flags: 'safe'
}];
RevisionDeleteRequestDialog.prototype.initialize = function() {
	RevisionDeleteRequestDialog.super.prototype.initialize.apply(this, arguments);
	var headerTitle = new OO.ui.MessageWidget({
		type: 'notice',
		inline: true,
		label: new OO.ui.deferMsg('rdr-header-title')
	});
	var headerTitleDescription = new OO.ui.LabelWidget({
		label: new OO.ui.deferMsg('rdr-header-description')
	});
	RequestRationale = new OO.ui.FieldsetLayout({
		label: new OO.ui.deferMsg('rationale'),
	});
	RequestRationale.addItems([
		new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: false,
			data: mw.message('rdr-rationale-1').text(),
		}), {
			label: mw.message('rdr-rationale-1').text(),
			align: 'inline'
		}),
		new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: false,
			data: mw.message('rdr-rationale-2').text(),
		}), {
			label: mw.message('rdr-rationale-2').text(),
			align: 'inline'
		}),
		new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: false,
			data: mw.message('rdr-rationale-3').text(),
		}), {
			label: mw.message('rdr-rationale-3').text(),
			align: 'inline'
		}), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: false,
			data: mw.message('rdr-rationale-4').text(),
		}), {
			label: mw.message('rdr-rationale-4').text(),
			align: 'inline'
		}), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: false,
			data: mw.message('rdr-rationale-5').text(),
		}), {
			label: mw.message('rdr-rationale-5').text(),
			align: 'inline'
		}),
		rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
			placeholder: mw.message('rdr-comment-placeholder').text(),
			value: '',
		}), {
			label: mw.message('comment').text(),
			align: 'inline',
		}),
	]);
	var revNum = mwConfig.wgRevisionId;
	revisionField = new OO.ui.FieldLayout(revisionNumber = new OO.ui.TextInputWidget({
			value: revNum
		}), {
			label: mw.message('revision-id').text(),
			help: mw.message('rdr-revision-id-help').text(),
		}),
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
	this.content.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<br><hr><br>', RequestRationale.$element, '<br>', rationaleInput.$element, '<br>', revisionField.$element);
	this.$body.append(this.content.$element);
};
RevisionDeleteRequestDialog.prototype.getActionProcess = function(action) {
	var dialog = this;
	if(action) {
		return new OO.ui.Process(function() {
			RequestRationale.items.forEach(function(Rationale) {
				if(Rationale.fieldWidget.selected) {
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
/* </nowiki> */