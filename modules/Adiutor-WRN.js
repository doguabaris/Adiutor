/* <nowiki> */

/**
 * @file Adiutor-WRN.js
 * @description User warning module for issuing standard warning messages via Adiutor.
 * @license CC BY-SA 4.0
 * @see https://meta.wikimedia.org/wiki/Adiutor
 * @author Doğu Abaris <abaris@null.net>
 */

function callBack() {
	const api = new mw.Api();
	const mwConfig = mw.config.get(['wgPageName', 'wgNamespaceNumber']);
	const wikiId = mw.config.get('wgWikiID');
	const adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
	const wrnConfiguration = require('./Adiutor-WRN.json');
	let requestRationale, warningData;
	if (!wrnConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-WRN.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}
	const userWarnings = wrnConfiguration.userWarnings;
	const apiPostSummary = wrnConfiguration.apiPostSummary;
	const warningMessageTitle = wrnConfiguration.warningMessageTitle;
	const userPagePrefix = wrnConfiguration.userPagePrefix;
	const userTalkPagePrefix = wrnConfiguration.userTalkPagePrefix;
	const specialContibutions = wrnConfiguration.specialContibutions;
	const userWarned = userTalkPagePrefix + mwConfig.wgPageName.replace(/_/g, ' ').replace(userPagePrefix, '').replace(specialContibutions, '').replace(userTalkPagePrefix, '');

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
		const headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('wrn-dialog-description')
		});
		headerTitle.$element.css('margin-top', '20px');
		const rationaleSelector = new OO.ui.DropdownWidget({
			menu: {
				items: userWarnings.map((warning) => new OO.ui.MenuOptionWidget({
						data: warning,
						label: warning.label
					}))
			},
			label: new OO.ui.deferMsg('warning-type')
		});
		rationaleSelector.getMenu().on('choose', (menuOption) => {
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
				label: new OO.ui.deferMsg('wrn-user-mildly')
			}, {
				data: 2,
				label: new OO.ui.deferMsg('wrn-user-seriously')
			}, {
				data: 3,
				label: new OO.ui.deferMsg('wrn-user-sternly')
			} ]
		});
		relatedPageField.$element.css({
			'margin-top': '20px',
			'margin-bottom': '20px'
		});
		this.content.$element.append(headerTitle.$element, rationaleSelector.$element, relatedPageField.$element, warningLevel.$element);
		this.$body.append(this.content.$element);
	};
	userWarningDialog.prototype.getActionProcess = function(action) {
		if (action === 'save') {
			if (relatedPage.value === '' || !warningData) {
				// If the related page is empty or warning data is missing, show an error notification.
				if (!relatedPage.value) {
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
				return new OO.ui.Process(() => {
					warnUser(warningData);
					dialog.close({
						action: action
					});
				});
			}
		}
		return userWarningDialog.super.prototype.getActionProcess.call(this, action);
	};
	const windowManager = new OO.ui.WindowManager();
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
		}).done(() => {
			window.location = '/wiki/' + userTalkPagePrefix + mwConfig.wgPageName.replace(/_/g, ' ').replace(userPagePrefix, '').replace(specialContibutions, '').replace(userTalkPagePrefix, '');
			adiutorUserOptions.stats.userWarnings++;
			api.postWithEditToken({
				action: 'globalpreferences',
				format: 'json',
				optionname: 'userjs-adiutor-' + mw.config.get('wgWikiID'),
				optionvalue: JSON.stringify(adiutorUserOptions),
				formatversion: 2
			}, () => {});
		});
	}

	function replaceParameter(input, parameterName, newValue) {
		const regex = new RegExp('\\$' + parameterName, 'g');
		if (input.includes('$' + parameterName)) {
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
