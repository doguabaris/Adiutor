/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Adiutor options
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));

function AdiutorOptionsDialog(config) {
	AdiutorOptionsDialog.super.call(this, config);
}
OO.inheritClass(AdiutorOptionsDialog, OO.ui.ProcessDialog);
AdiutorOptionsDialog.static.name = 'AdiutorOptionsDialog';
AdiutorOptionsDialog.static.title = new OO.ui.deferMsg('opt-module-title');
AdiutorOptionsDialog.static.actions = [{
	action: 'save',
	label: new OO.ui.deferMsg('update'),
	flags: ['primary', 'progressive']
}, {
	label: new OO.ui.deferMsg('cancel'),
	flags: 'safe'
}];
AdiutorOptionsDialog.prototype.initialize = function() {
	AdiutorOptionsDialog.super.prototype.initialize.apply(this, arguments);
	this.content = new OO.ui.PanelLayout({
		padded: true,
		expanded: false
	});
	AdiutorSettings = new OO.ui.FieldsetLayout({
		label: new OO.ui.deferMsg('options')
	});
	AdiutorSettings.addItems([
		csdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: adiutorUserOptions.speedyDeletion.csdSendMessageToCreator
		}), {
			align: 'inline',
			label: new OO.ui.deferMsg('csd-send-message-to-creator'),
			help: new OO.ui.deferMsg('description')
		}),
		afdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: adiutorUserOptions.articlesForDeletion.afdSendMessageToCreator
		}), {
			align: 'inline',
			label: new OO.ui.deferMsg('afd-send-message-to-creator'),
			help: new OO.ui.deferMsg('description')
		}),
		prdSendMessageToCreator = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: adiutorUserOptions.proposedDeletion.prdSendMessageToCreator
		}), {
			align: 'inline',
			label: new OO.ui.deferMsg('prd-send-message-to-creator'),
			help: new OO.ui.deferMsg('description')
		}),
		csdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: adiutorUserOptions.speedyDeletion.csdLogNominatedPages
		}), {
			align: 'inline',
			label: new OO.ui.deferMsg('csd-log-nominated-pages'),
			help: new OO.ui.deferMsg('description')
		}),
		csdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
			value: adiutorUserOptions.speedyDeletion.csdLogPageName
		}), {
			label: new OO.ui.deferMsg('csd-log-page-name'),
			help: new OO.ui.deferMsg('description')
		}),
		afdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: adiutorUserOptions.articlesForDeletion.afdLogNominatedPages
		}), {
			align: 'inline',
			label: new OO.ui.deferMsg('afd-log-nominated-pages'),
			help: new OO.ui.deferMsg('description')
		}),
		afdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
			value: adiutorUserOptions.articlesForDeletion.afdLogPageName
		}), {
			label: new OO.ui.deferMsg('afd-log-page-name'),
			help: new OO.ui.deferMsg('description')
		}),
		prdLogNominatedPages = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: adiutorUserOptions.proposedDeletion.prdLogNominatedPages
		}), {
			align: 'inline',
			label: new OO.ui.deferMsg('prd-log-nominated-pages'),
			help: new OO.ui.deferMsg('description')
		}),
		prdLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
			value: adiutorUserOptions.proposedDeletion.prdLogPageName
		}), {
			label: new OO.ui.deferMsg('prd-log-page-name'),
			help: new OO.ui.deferMsg('description')
		}),
		afdNominateOpinionsLog = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: adiutorUserOptions.articlesForDeletion.afdNominateOpinionsLog
		}), {
			align: 'inline',
			label: new OO.ui.deferMsg('afd-nominate-opinions-log'),
			help: new OO.ui.deferMsg('description')
		}),
		afdOpinionLogPageName = new OO.ui.FieldLayout(new OO.ui.TextInputWidget({
			value: adiutorUserOptions.articlesForDeletion.afdOpinionLogPageName
		}), {
			label: new OO.ui.deferMsg('afd-opinion-log-page-name'),
			help: new OO.ui.deferMsg('description')
		}),
		showMyStatus = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: adiutorUserOptions.status.showMyStatus
		}), {
			align: 'inline',
			label: new OO.ui.deferMsg('show-my-status'),
			help: new OO.ui.deferMsg('show-status-description')
		}),
		inlinePageInfo = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: adiutorUserOptions.inlinePageInfo
		}), {
			align: 'inline',
			label: new OO.ui.deferMsg('show-inline-page-info'),
			help: new OO.ui.deferMsg('show-inline-page-info-description')
		}),
	]);
	this.content.$element.append(AdiutorSettings.$element);
	this.$body.append(this.content.$element);
};
AdiutorOptionsDialog.prototype.getActionProcess = function(action) {
	var dialog = this;
	if(action) {
		return new OO.ui.Process(function() {
			UpdatedOptions = {
				"myWorks": adiutorUserOptions.myWorks,
				"speedyDeletion": {
					"csdSendMessageToCreator": csdSendMessageToCreator.fieldWidget.selected,
					"csdLogNominatedPages": csdLogNominatedPages.fieldWidget.selected,
					"csdLogPageName": csdLogPageName.fieldWidget.value
				},
				"articlesForDeletion": {
					"afdSendMessageToCreator": afdSendMessageToCreator.fieldWidget.selected,
					"afdLogNominatedPages": afdLogNominatedPages.fieldWidget.selected,
					"afdLogPageName": afdLogPageName.fieldWidget.value,
					"afdNominateOpinionsLog": afdNominateOpinionsLog.fieldWidget.selected,
					"afdOpinionLogPageName": afdOpinionLogPageName.fieldWidget.value
				},
				"proposedDeletion": {
					"prdSendMessageToCreator": prdSendMessageToCreator.fieldWidget.selected,
					"prdLogNominatedPages": prdLogNominatedPages.fieldWidget.selected,
					"prdLogPageName": prdLogPageName.fieldWidget.value
				},
				"status": {
					"showMyStatus": showMyStatus.fieldWidget.selected,
					"myStatus": "active"
				},
				"inlinePageInfo": inlinePageInfo.fieldWidget.selected
			};
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
// Define functions below as needed
function updateOptions(updatedOptions) {
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: 'userjs-adiutor',
		optionvalue: JSON.stringify(updatedOptions),
		formatversion: 2,
	}).done(function() {});
}
/* </nowiki> */