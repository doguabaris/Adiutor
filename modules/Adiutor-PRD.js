/* <nowiki> */

/**
 * @file Adiutor-PRD.js
 * @description Proposed deletion module for tagging pages with PROD templates via Adiutor.
 * @license CC BY-SA 4.0
 * @see https://meta.wikimedia.org/wiki/Adiutor
 * @author Doğu Abaris <abaris@null.net>
 */

function callBack() {
	const api = new mw.Api();
	const mwConfig = mw.config.get(['wgArticleId', 'wgPageName', 'wgUserGroups', 'wgUserName', 'wgWikiID']);
	const adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + mwConfig.wgWikiID));
	const prdConfiguration = require('./Adiutor-PRD.json');
	if (!prdConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-PRD.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}
	let rationaleInput;
	const standardProposeTemplate = prdConfiguration.standardProposeTemplate;
	const livingPersonProposeTemplate = prdConfiguration.livingPersonProposeTemplate;
	const apiPostSummary = prdConfiguration.apiPostSummary;
	const apiPostSummaryforCreator = prdConfiguration.apiPostSummaryforCreator;
	const apiPostSummaryforLog = prdConfiguration.apiPostSummaryforLog;
	const localMonthsNames = prdConfiguration.localMonthsNames;
	const userPagePrefix = prdConfiguration.userPagePrefix;
	const userTalkPagePrefix = prdConfiguration.userTalkPagePrefix;
	const prodNotificationTemplate = prdConfiguration.prodNotificationTemplate;
	const pageTitle = mw.config.get('wgPageName').replace(/_/g, ' ');

	function proposedDeletionDialog(config) {
		proposedDeletionDialog.super.call(this, config);
	}
	OO.inheritClass(proposedDeletionDialog, OO.ui.ProcessDialog);
	proposedDeletionDialog.static.name = 'proposedDeletionDialog';
	proposedDeletionDialog.static.title = new OO.ui.deferMsg('rpp-module-title');
	proposedDeletionDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('propose'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	proposedDeletionDialog.prototype.initialize = function() {
		proposedDeletionDialog.super.prototype.initialize.apply(this, arguments);
		const headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('prd-header-title')
		});
		const headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('prd-header-description')
		});
		headerTitleDescription.$element.css({
			'margin-top': '10px',
			'margin-left': '30px',
			'margin-bottom': '20px'
		});
		proposeOptions = new OO.ui.FieldsetLayout({
			label: new OO.ui.deferMsg('prd-deletion-type')
		});
		proposeOptions.addItems([
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				value: 'standardPropose'
			}), {
				label: new OO.ui.deferMsg('prd-deletion-type-1'),
				help: new OO.ui.deferMsg('prd-deletion-type-1-help'),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				value: 'LivingPersonPropose'
			}), {
				label: new OO.ui.deferMsg('prd-deletion-type-2'),
				help: new OO.ui.deferMsg('prd-deletion-type-2-help'),
				align: 'inline'
			}), rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: new OO.ui.deferMsg('prd-deletion-rationale'),
				indicator: 'required',
				value: ''
			}), {
				label: new OO.ui.deferMsg('rationale'),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
				value: adiutorUserOptions.proposedDeletion.prdSendMessageToCreator,
				data: 'informCreator'
			}), {
				label: new OO.ui.deferMsg('afd-inform-creator'),
				align: 'top',
				help: new OO.ui.deferMsg('afd-inform-creator-help')
			})
		]);
		rationaleInput.on('change', () => {
			InputFilled = rationaleInput.value === '';
		});
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, proposeOptions.$element);
		this.$body.append(this.content.$element);
	};
	proposedDeletionDialog.prototype.getActionProcess = function(action) {
		const dialog = this;
		if (action) {
			return new OO.ui.Process(() => {
				const date = new Date();
				const Months = localMonthsNames;
				let PRDText;
				const PRDoptions = [];
				proposeOptions.items.forEach((Option) => {
					if (Option.fieldWidget.selected) {
						PRDoptions.push({
							value: Option.fieldWidget.value,
							selected: Option.fieldWidget.selected
						});
					}
					if (Option.fieldWidget.value === true) {
						PRDoptions.push({
							value: Option.fieldWidget.value,
							data: Option.fieldWidget.data
						});
					}
				});
				PRDoptions.forEach((Option) => {
					if (Option.value === 'standardPropose') {
						const placeholders = {
							$1: pageTitle,
							$2: rationaleInput.value,
							$3: date.getDate(),
							$4: Months[date.getUTCMonth()],
							$5: date.getUTCFullYear(),
							$6: mwConfig.wgUserName
						};
						const preparedContent = replacePlaceholders(standardProposeTemplate, placeholders);
						PRDText = preparedContent;
					}
					if (Option.value === 'LivingPersonPropose') {
						PRDText = livingPersonProposeTemplate;
					}
					if (Option.data === 'informCreator') {
						getCreator().then((data) => {
							const Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
							if (!mw.util.isIPAddress(Author)) {
								const message = replaceParameter(prodNotificationTemplate, '1', pageTitle);
								sendMessageToAuthor(Author, message);
							}
						});
					}
				});
				putPRDTemplate(PRDText);
				logRequest(rationaleInput.value, adiutorUserOptions);
				dialog.close({
					action: action
				});
			});
		}
		return proposedDeletionDialog.super.prototype.getActionProcess.call(this, action);
	};
	const windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	const dialog = new proposedDeletionDialog();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);

	function putPRDTemplate(PRDText) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: mwConfig.wgPageName,
			prependtext: PRDText + '\n',
			summary: replaceParameter(apiPostSummary, '1', pageTitle),
			tags: 'Adiutor',
			format: 'json'
		}).done(() => {
			adiutorUserOptions.stats.prodRequests++;
			api.postWithEditToken({
				action: 'globalpreferences',
				format: 'json',
				optionname: 'userjs-adiutor-' + mw.config.get('wgWikiID'),
				optionvalue: JSON.stringify(adiutorUserOptions),
				formatversion: 2
			}, () => {});
			location.reload();
		});
	}

	function logRequest(rationaleInput, adiutorUserOptions) {
		if (adiutorUserOptions.proposedDeletion.prdLogNominatedPages === true) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: userPagePrefix.concat(mwConfig.wgUserName, String('/' + adiutorUserOptions.proposedDeletion.prdLogNominatedPages)).split(' ').join('_'),
				appendtext: `
# '''[[${pageTitle}|${pageTitle}]]''' ${rationaleInput} ~~~~~`,
				summary: replaceParameter(apiPostSummaryforLog, '1', pageTitle),
				tags: 'Adiutor',
				format: 'json'
			}).done(() => {});
		}
	}

	function getCreator() {
		return api.get({
			action: 'query',
			prop: 'revisions',
			rvlimit: 1,
			rvprop: ['user'],
			rvdir: 'newer',
			titles: mwConfig.wgPageName
		});
	}

	function sendMessageToAuthor(Author, message) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: userTalkPagePrefix + Author,
			appendtext: '\n' + message,
			summary: replaceParameter(apiPostSummaryforCreator, '1', pageTitle),
			tags: 'Adiutor',
			format: 'json'
		});
	}

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
