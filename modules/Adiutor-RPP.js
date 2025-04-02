/* <nowiki> */

/**
 * @file Adiutor-PRO.js
 * @description Page protection request module for reporting pages needing protection via Adiutor.
 * @license CC BY-SA 4.0
 * @see https://meta.wikimedia.org/wiki/Adiutor
 * @author Doğu Abaris <abaris@null.net>
 */

function callBack() {
	const api = new mw.Api();
	let apiParams = {};
	const rppConfiguration = require('./Adiutor-RPP.json');
	let protectionType, protectionDuration;
	if (!rppConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-RPP.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}
	const noticeBoardTitle = rppConfiguration.noticeBoardTitle;
	const noticeBoardLink = noticeBoardTitle.replace(/ /g, '_');
	const protectionDurations = rppConfiguration.protectionDurations;
	const protectionTypes = rppConfiguration.protectionTypes;
	const addNewSection = rppConfiguration.addNewSection;
	const appendText = rppConfiguration.appendText;
	const prependText = rppConfiguration.prependText;
	const sectionId = rppConfiguration.sectionId;
	const contentPattern = rppConfiguration.contentPattern;
	const apiPostSummary = rppConfiguration.apiPostSummary;
	const sectionTitle = rppConfiguration.sectionTitle;
	const pageTitle = mw.config.get('wgPageName').replace(/_/g, ' ');

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
		const headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('rpp-header-title')
		});
		const headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('rpp-header-description')
		});
		headerTitleDescription.$element.css({
			'margin-top': '10px',
			'margin-left': '30px',
			'margin-bottom': '20px'
		});
		typeOfAction = new OO.ui.FieldsetLayout({
			label: new OO.ui.deferMsg('protection-type')
		});
		typeOfAction.addItems([
			durationOfProtection = new OO.ui.DropdownWidget({
				menu: {
					items: protectionDurations.map((duration) => new OO.ui.MenuOptionWidget({
							data: duration.data,
							label: duration.label
						}))
				},
				label: mw.message('choose-duration').text()
			}),
			typeOfProtection = new OO.ui.DropdownWidget({
				menu: {
					items: protectionTypes.map((type) => new OO.ui.MenuOptionWidget({
							data: type.data,
							label: type.label
						}))
				},
				label: new OO.ui.deferMsg('select-protection-type'),
				classes: ['adiutor-rpp-botton-select']
			}),
			rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: new OO.ui.deferMsg('rpp-rationale-placeholder'),
				indicator: 'required',
				value: ''
			}), {
				label: new OO.ui.deferMsg('rationale'),
				align: 'inline'
			})
		]);
		rationaleInput.on('change', () => {
			InputFilled = rationaleInput.value === '';
		});
		typeOfProtection.getMenu().on('choose', (menuOption) => {
			protectionType = menuOption.getData();
		});
		durationOfProtection.getMenu().on('choose', (duration) => {
			protectionDuration = duration.getData();
		});
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, typeOfAction.$element);
		this.$body.append(this.content.$element);
	};
	PageProtectionDialog.prototype.getActionProcess = function(action) {
		const dialog = this;
		if (action) {
			return new OO.ui.Process(() => {
				const placeholders = {
					$1: pageTitle,
					$2: protectionDuration,
					$3: protectionType,
					$4: rationaleInput.value
				};
				const preparedContent = replacePlaceholders(contentPattern, placeholders);
				if (addNewSection) {
					apiParams = {
						action: 'edit',
						title: noticeBoardTitle,
						section: 'new',
						sectiontitle: replaceParameter(sectionTitle, '1', pageTitle),
						text: preparedContent,
						summary: replaceParameter(apiPostSummary, '1', pageTitle),
						tags: 'Adiutor',
						format: 'json'
					};
					api.postWithToken('csrf', apiParams).done(() => {
						window.location = '/wiki/' + noticeBoardLink;
					});
				} else {
					if (sectionId) {
						apiParams = {
							action: 'edit',
							title: noticeBoardTitle,
							section: sectionId,
							summary: replaceParameter(apiPostSummary, '1', pageTitle),
							tags: 'Adiutor',
							format: 'json'
						};
						if (appendText) {
							apiParams.appendtext = preparedContent + '\n';
						} else if (prependText) {
							apiParams.prependtext = preparedContent + '\n';
						}
						api.postWithToken('csrf', apiParams).done(() => {
							window.location = '/wiki/' + noticeBoardLink;
						});
					} else {
						apiParams = {
							action: 'edit',
							title: noticeBoardTitle,
							summary: replaceParameter(apiPostSummary, '1', pageTitle),
							tags: 'Adiutor',
							format: 'json'
						};
						if (appendText) {
							apiParams.appendtext = preparedContent + '\n';
						} else if (prependText) {
							apiParams.prependtext = preparedContent + '\n';
						}
						api.postWithToken('csrf', apiParams).done(() => {
							window.location = '/wiki/' + noticeBoardLink;
						});
					}
				}
				dialog.close({
					action: action
				});
			});
		}
		return PageProtectionDialog.super.prototype.getActionProcess.call(this, action);
	};
	const windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	const dialog = new PageProtectionDialog();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);

	function replacePlaceholders(input, replacements) {
		return input.replace(/\$(\d+)/g, (match, group) => {
			const replacement = replacements['$' + group];
			return replacement !== undefined ? replacement : match;
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
