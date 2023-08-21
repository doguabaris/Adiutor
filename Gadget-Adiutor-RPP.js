/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Requests for page protection
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
var RPPText, RPPSummary, RPPData, RPPDuration;

function PageProtectionDialog(config) {
	PageProtectionDialog.super.call(this, config);
}
OO.inheritClass(PageProtectionDialog, OO.ui.ProcessDialog);
PageProtectionDialog.static.name = 'PageProtectionDialog';
PageProtectionDialog.static.title = new OO.ui.deferMsg('rpp-module-title');
PageProtectionDialog.static.actions = [{
	action: 'save',
	label: new OO.ui.deferMsg('create-request'),
	flags: ['primary', 'progressive']
}, {
	label: new OO.ui.deferMsg('cancel'),
	flags: 'safe'
}];
PageProtectionDialog.prototype.initialize = function() {
	PageProtectionDialog.super.prototype.initialize.apply(this, arguments);
	var headerTitle = new OO.ui.MessageWidget({
		type: 'notice',
		inline: true,
		label: new OO.ui.deferMsg('rpp-header-title')
	});
	var headerTitleDescription = new OO.ui.LabelWidget({
		label: new OO.ui.deferMsg('rpp-header-description')
	});
	TypeOfAction = new OO.ui.FieldsetLayout({
		label: new OO.ui.deferMsg('protection-type')
	});
	TypeOfAction.addItems([
		DurationOfProtection = new OO.ui.DropdownWidget({
			menu: {
				items: [
					new OO.ui.MenuOptionWidget({
						data: mw.message('temporary').text(),
						label: new OO.ui.deferMsg('temporary')
					}),
					new OO.ui.MenuOptionWidget({
						data: mw.message('indefinite').text(),
						label: new OO.ui.deferMsg('indefinite')
					}),
				]
			},
			label: new OO.ui.deferMsg('duration')
		}),
		TypeOfProtection = new OO.ui.DropdownWidget({
			menu: {
				items: [
					new OO.ui.MenuOptionWidget({
						data: "tam koruma",
						label: mw.msg('full-protection')
					}),
					new OO.ui.MenuOptionWidget({
						data: "yarı koruma",
						label: mw.msg('semi-protection')
					}),
				]
			},
			label: new OO.ui.deferMsg('select-protection-type'),
			classes: ['adiutor-rpp-botton-select'],
		}),
		rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
			placeholder: new OO.ui.deferMsg('rpp-rationale-placeholder'),
			indicator: 'required',
			value: '',
		}), {
			label: new OO.ui.deferMsg('rationale'),
			align: 'inline',
		}),
	]);
	rationaleInput.on('change', function() {
		if(rationaleInput.value != "") {
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
	this.content.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<br><hr><br>', TypeOfAction.$element);
	this.$body.append(this.content.$element);
};
PageProtectionDialog.prototype.getActionProcess = function(action) {
	var dialog = this;
	if(action) {
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
/* </nowiki> */