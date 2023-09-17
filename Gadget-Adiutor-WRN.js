/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Module: User Warning
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
<nowiki> */
function callBack() {
	var api = new mw.Api();
	var mwConfig = mw.config.get(["wgPageName", "wgNamespaceNumber"]);
	var wikiId = mw.config.get('wgWikiID');
	var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
	var wrnConfiguration = require('./Adiutor-WRN.json');
	var requestRationale, warningData;
	if(!wrnConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-WRN.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}
	var userWarnings = wrnConfiguration.userWarnings;
	var apiPostSummary = wrnConfiguration.apiPostSummary;
	var warningMessageTitle = wrnConfiguration.warningMessageTitle;
	var userPagePrefix = wrnConfiguration.userPagePrefix;
	var userTalkPagePrefix = wrnConfiguration.userTalkPagePrefix;
	var specialContibutions = wrnConfiguration.specialContibutions;
	var userWarned = userTalkPagePrefix + mwConfig.wgPageName.replace(/_/g, " ").replace(userPagePrefix, '').replace(specialContibutions, '').replace(userTalkPagePrefix, '');

	function userWarningDialog(config) {
		userWarningDialog.super.call(this, config);
	}
	OO.inheritClass(userWarningDialog, OO.ui.ProcessDialog);
	userWarningDialog.static.name = 'userWarningDialog';
	userWarningDialog.static.title = new OO.ui.deferMsg('wrn-module-title');
	userWarningDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('warn'),
		flags: ['primary', 'progressive'],
		id: 'warn-button'
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	userWarningDialog.prototype.initialize = function() {
		userWarningDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('wrn-dialog-description')
		});
		headerTitle.$element.css('margin-top', '20px');
		var rationaleSelector = new OO.ui.DropdownWidget({
			menu: {
				items: userWarnings.map(function(warning) {
					return new OO.ui.MenuOptionWidget({
						data: warning,
						label: warning.label
					});
				})
			},
			label: new OO.ui.deferMsg('warning-type'),
		});
		rationaleSelector.getMenu().on('choose', function(menuOption) {
			warningData = menuOption.getData();
			console.log(warningData);
		});
		rationaleSelector.$element.css('margin-top', '20px');
		relatedPageField = new OO.ui.FieldLayout(relatedPage = new OO.ui.TextInputWidget({
			value: '',
			required: true
		}), {
			label: new OO.ui.deferMsg('related-page'),
			help: new OO.ui.deferMsg('wrn-related-page-help')
		});
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		warningLevel = new OO.ui.RadioSelectInputWidget({
			options: [{
				data: 1,
				label: new OO.ui.deferMsg('wrn-user-mildly'),
			}, {
				data: 2,
				label: new OO.ui.deferMsg('wrn-user-seriously'),
			}, {
				data: 3,
				label: new OO.ui.deferMsg('wrn-user-sternly'),
			}, ]
		});
		relatedPageField.$element.css({
			'margin-top': '20px',
			'margin-bottom': '20px'
		});
		this.content.$element.append(headerTitle.$element, rationaleSelector.$element, relatedPageField.$element, warningLevel.$element);
		this.$body.append(this.content.$element);
	};
	userWarningDialog.prototype.getActionProcess = function(action) {
		if(action === 'save') {
			if(relatedPage.value === '' || !warningData) {
				// If the related page is empty or warning data is missing, show an error notification.
				if(!relatedPage.value) {
					mw.notify(mw.message('related-page-required').text(), {
						title: mw.msg('operation-failed'),
						type: 'error'
					});
				} else {
					mw.notify(mw.message('warning-required').text(), {
						title: mw.msg('operation-failed'),
						type: 'error'
					});
				}
			} else {
				// If the action is 'save', proceed to warn the user and close the dialog.
				return new OO.ui.Process(function() {
					warnUser(warningData);
					dialog.close({
						action: action
					});
				});
			}
		}
		return userWarningDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new userWarningDialog();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);

	function warnUser(warningData) {
		api.postWithEditToken({
			action: 'edit',
			title: userWarned,
			section: 'new',
			sectiontitle: warningMessageTitle,
			text: '{{subst:ADT-WT|' + warningLevel.getValue() + '|' + warningData.title + '|' + replaceParameter(warningData.body, '1', relatedPage.value) + '|~~~~}}',
			summary: apiPostSummary,
			tags: 'Adiutor',
			watchlist: 'unwatch',
			format: 'json'
		}).done(function() {
			window.location = '/wiki/' + userTalkPagePrefix + mwConfig.wgPageName.replace(/_/g, " ").replace(userPagePrefix, '').replace(specialContibutions, '').replace(userTalkPagePrefix, '');
			adiutorUserOptions.stats.userWarnings++;
			api.postWithEditToken({
				action: 'globalpreferences',
				format: 'json',
				optionname: 'userjs-adiutor-' + mw.config.get('wgWikiID'),
				optionvalue: JSON.stringify(adiutorUserOptions),
				formatversion: 2,
			}, function() {});
		});
	}

	function replaceParameter(input, parameterName, newValue) {
		const regex = new RegExp('\\$' + parameterName, 'g');
		if(input.includes('$' + parameterName)) {
			return input.replace(regex, newValue);
		} else {
			return input;
		}
	}
}
module.exports = {
	callBack: callBack
};
/* </nowiki> */