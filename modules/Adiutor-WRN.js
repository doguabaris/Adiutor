/* <nowiki> */

/**
 * @file Adiutor-WRN.js
 * @description User warning module for issuing standard warning messages via Adiutor.
 * @license CC BY-SA 4.0
 * @see https://meta.wikimedia.org/wiki/Adiutor
 * @author Doğu Abaris <abaris@null.net>
 */

function callBack() {
	/**
	 * A reference to MediaWiki’s core API.
	 *
	 * @type {mw.Api}
	 */
	const api = new mw.Api();

	/**
	 * The wiki ID (e.g., "enwiki") as used for user preferences.
	 *
	 * @type {string}
	 */
	const wikiId = /** @type {string} */ (mw.config.get('wgWikiID'));

	/**
	 * Adiutor user options. These are read from the user’s preferences (global or local).
	 *
	 * @type {Object}
	 */
	const adiutorUserOptions = JSON.parse(
		mw.user.options.get('userjs-adiutor-' + wikiId) || '{}'
	);

	/**
	 * MediaWiki config variables.
	 *
	 * @typedef {Object} MwConfig
	 * @property {string} wgPageName
	 * @property {number} wgNamespaceNumber
	 *
	 * @type {MwConfig}
	 */
	const mwConfig = {
		wgPageName: /** @type {string} */ (mw.config.get('wgPageName')),
		wgNamespaceNumber: /** @type {number} */ (mw.config.get('wgNamespaceNumber'))
	};

	/**
	 * @typedef {Object} WrnConfiguration
	 * @property {{ title: string, label: string, body: string }[]} userWarnings
	 * @property {string} apiPostSummary
	 * @property {string} warningMessageTitle
	 * @property {string} userPagePrefix
	 * @property {string} userTalkPagePrefix
	 * @property {string} specialContibutions
	 */

	/** @type {WrnConfiguration} */
	const wrnConfiguration = require('./Adiutor-WRN.json');

	if (!wrnConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-WRN.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}

	let warningData;
	const userWarnings = wrnConfiguration.userWarnings;
	const apiPostSummary = wrnConfiguration.apiPostSummary;
	const warningMessageTitle = wrnConfiguration.warningMessageTitle;
	const userPagePrefix = wrnConfiguration.userPagePrefix;
	const userTalkPagePrefix = wrnConfiguration.userTalkPagePrefix;
	const specialContibutions = wrnConfiguration.specialContibutions;
	const userWarned = userTalkPagePrefix + mwConfig.wgPageName.replace(/_/g, ' ').replace(userPagePrefix, '').replace(specialContibutions, '').replace(userTalkPagePrefix, '');

	/**
	 * The main OOUI dialog for the user warning process.
	 * Inherits from `OO.ui.ProcessDialog`.
	 *
	 * @constructor
	 * @extends OO.ui.ProcessDialog
	 * @param {Object} config - The configuration object for the dialog.
	 * @param {string} config.size - The dialog size (e.g., “large”).
	 * @param {string[]} config.classes - Additional CSS classes for the dialog.
	 * @param {boolean} config.isDraggable - Whether the dialog is draggable.
	 * @return {void}
	 */
	function UserWarningDialog(config) {
		UserWarningDialog.super.call(this, config);
	}

	OO.inheritClass(UserWarningDialog, OO.ui.ProcessDialog);
	UserWarningDialog.static.name = 'UserWarningDialog';
	UserWarningDialog.static.title = new OO.ui.deferMsg('wrn-module-title');
	UserWarningDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('warn'),
		flags: ['primary', 'progressive'],
		id: 'warn-button'
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	UserWarningDialog.prototype.initialize = function () {
		UserWarningDialog.super.prototype.initialize.apply(this, arguments);
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
			}]
		});
		relatedPageField.$element.css({
			'margin-top': '20px',
			'margin-bottom': '20px'
		});
		this.content.$element.append(headerTitle.$element, rationaleSelector.$element, relatedPageField.$element, warningLevel.$element);
		this.$body.append(this.content.$element);
	};
	UserWarningDialog.prototype.getActionProcess = function (action) {
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
		return UserWarningDialog.super.prototype.getActionProcess.call(this, action);
	};
	const windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new UserWarningDialog();
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
			}, () => {
			});
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
