/* <nowiki> */

/**
 * @file Adiutor-AFD.js
 * @description Article for Deletion (AFD) module for the Adiutor gadget. It provides an OOUI-based workflow for nominating pages for deletion, informing creators, logging nominations, etc.
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
	 * @property {number} wgArticleId
	 * @property {string} wgPageName
	 * @property {string|null} wgUserName
	 *
	 * @type {MwConfig}
	 */
	const mwConfig = {
		wgArticleId: /** @type {number} */ (mw.config.get('wgArticleId')),
		wgPageName: /** @type {string} */ (mw.config.get('wgPageName')),
		wgUserName: /** @type {string|null} */ (mw.config.get('wgUserName'))
	};

	/**
	 * @typedef {Object} AfdConfiguration
	 * @property {string} afdTemplate
	 * @property {string} afdPageTitleForMultipleNomination
	 * @property {string} apiPostSummary
	 * @property {string} apiPostSummaryforCreator
	 * @property {string} apiPostSummaryforUserLog
	 * @property {string} apiPostSummaryforAfdPage
	 * @property {string} apiPostSummaryforAfdLog
	 * @property {boolean} addNominationToNoticeboard
	 * @property {string} contentPattern
	 * @property {string} noticeBoardTitle
	 * @property {boolean} logNominations
	 * @property {string} afdLogPage
	 * @property {string} afdNotificationTemplate
	 * @property {string} userLogText
	 * @property {string} userPagePrefix
	 * @property {string} userTalkPagePrefix
	 * @property {string[]} localMonthsNames
	 * @property {boolean} addNominationToNoticeboardByFindLast
	 * @property {boolean} addNewSection
	 * @property {string} sectionTitle
	 * @property {boolean} appendText
	 * @property {boolean} prependText
	 * @property {string|undefined} sectionId
	 */

	/** @type {AfdConfiguration} */
	const afdConfiguration = require('./Adiutor-AFD.json');

	if (!afdConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-AFD.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}

	let afdOptions;
	let rationaleField;
	let rationaleInput;
	let nominatedPreviously;
	let nextNominationNumber = 0;
	const afdTemplate = afdConfiguration.afdTemplate;
	const afdPageTitleForMultipleNomination = afdConfiguration.afdPageTitleForMultipleNomination;
	const apiPostSummary = afdConfiguration.apiPostSummary;
	const apiPostSummaryforCreator = afdConfiguration.apiPostSummaryforCreator;
	const apiPostSummaryforUserLog = afdConfiguration.apiPostSummaryforUserLog;
	const apiPostSummaryforAfdPage = afdConfiguration.apiPostSummaryforAfdPage;
	const apiPostSummaryforAfdLog = afdConfiguration.apiPostSummaryforAfdLog;
	const addNominationToNoticeboard = afdConfiguration.addNominationToNoticeboard;
	const contentPattern = afdConfiguration.contentPattern;
	const noticeBoardTitle = afdConfiguration.noticeBoardTitle;
	const noticeBoardLink = noticeBoardTitle.replace(/ /g, '_');
	const logNominations = afdConfiguration.logNominations;
	const afdLogPage = afdConfiguration.afdLogPage;
	const afdNotificationTemplate = afdConfiguration.afdNotificationTemplate;
	const userLogText = afdConfiguration.userLogText;
	const userPagePrefix = afdConfiguration.userPagePrefix;
	const userTalkPagePrefix = afdConfiguration.userTalkPagePrefix;
	const localMonthsNames = afdConfiguration.localMonthsNames;
	const addNominationToNoticeboardByFindLast = afdConfiguration.addNominationToNoticeboardByFindLast;
	const addNewSection = afdConfiguration.addNewSection;
	const sectionTitle = afdConfiguration.sectionTitle;
	const appendText = afdConfiguration.appendText;
	const prependText = afdConfiguration.prependText;
	const sectionId = afdConfiguration.sectionId;
	let pageTitle = mw.config.get('wgPageName').replace(/_/g, ' ');

	/**
	 * The main OOUI dialog for the AFD process.
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
	function ArticleForDeletionDialog(config) {
		ArticleForDeletionDialog.super.call(this, config);
	}

	OO.inheritClass(ArticleForDeletionDialog, OO.ui.ProcessDialog);
	ArticleForDeletionDialog.static.name = 'ArticleForDeletionDialog';
	ArticleForDeletionDialog.static.title = new OO.ui.deferMsg('afd-module-title');
	ArticleForDeletionDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('continue'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	ArticleForDeletionDialog.prototype.initialize = function () {
		ArticleForDeletionDialog.super.prototype.initialize.apply(this, arguments);
		const headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('afd-header-title')
		});
		const headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('afd-header-description')
		});
		headerTitleDescription.$element.css({
			'margin-top': '20px',
			'margin-bottom': '20px'
		});
		afdOptions = new OO.ui.FieldsetLayout({});
		afdOptions.addItems([
			rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: new OO.ui.deferMsg('afd-rationale-placeholder'),
				indicator: 'required',
				value: ''
			}), {
				label: new OO.ui.deferMsg('rationale'),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
				value: adiutorUserOptions.articlesForDeletion.afdSendMessageToCreator,
				data: 'informCreator'
			}), {
				label: new OO.ui.deferMsg('afd-inform-creator'),
				align: 'top',
				help: new OO.ui.deferMsg('afd-inform-creator-help')
			})
		]);
		rationaleField.$element.css('font-weight', '900');
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false,
			isDraggable: true
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, afdOptions.$element);
		this.$body.append(this.content.$element);
	};
	ArticleForDeletionDialog.prototype.getActionProcess = function (action) {
		const dialog = this;
		if (action) {
			return new OO.ui.Process(() => {
				let afdTempalte;
				const ActionOptions = [];
				afdOptions.items.forEach((Option) => {
					if (Option.fieldWidget.selected) {
						ActionOptions.push({
							value: Option.fieldWidget.value,
							selected: Option.fieldWidget.selected
						});
					}
					if (Option.fieldWidget.value === true) {
						ActionOptions.push({
							value: Option.fieldWidget.value,
							data: Option.fieldWidget.data
						});
					}
				});
				ActionOptions.forEach((Option) => {
					if (Option.data === 'informCreator') {
						console.log(Option.data);
						getCreator().then((data) => {
							const Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
							if (!mw.util.isIPAddress(Author)) {
								const message = replaceParameter(afdNotificationTemplate, '1', pageTitle);
								sendMessageToAuthor(Author, message);
							}
						});
					}
				});
				checkPreviousNominations(noticeBoardTitle + '/' + mwConfig.wgPageName).then((data) => {
					if (data.query.pages['-1']) {
						const nomCount = 0;
						console.log(nomCount);
						nominatedPreviously = false;
						putAfDTemplate(afdTemplate, nextNominationNumber);
					} else {
						Rec(2);
					}
				});

				function Rec(nomCount) {
					const placeholders = {
						$1: pageTitle,
						$2: nomCount
					};
					const newNominationTitle = replacePlaceholders(afdPageTitleForMultipleNomination, placeholders);
					checkPreviousNominations(noticeBoardTitle + '/' + newNominationTitle).then((data) => {
						if (!data.query.pages['-1']) {
							Rec(nomCount + 1);
						} else {
							nextNominationNumber = nomCount++;
							console.log(nextNominationNumber);
							if (nextNominationNumber > 1) {
								afdTempalte = afdTemplate;
							} else {
								afdTempalte = afdTemplate;
							}
							console.log(afdTempalte);
							putAfDTemplate(afdTempalte, nextNominationNumber);
						}
					});
				}

				dialog.close({
					action: action
				});
				showProgress();
			});
		}
		return ArticleForDeletionDialog.super.prototype.getActionProcess.call(this, action);
	};
	const windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	const dialog = new ArticleForDeletionDialog({
		size: 'large',
		classes: ['afd-helper-window'],
		isDraggable: true
	});
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

	function putAfDTemplate(afdTempalte, nextNominationNumber) {
		if (nextNominationNumber > 1) {
			const placeholders = {
				$1: pageTitle,
				$2: nextNominationNumber
			};
			pageTitle = replacePlaceholders(afdPageTitleForMultipleNomination, placeholders);
		} else {
			pageTitle = mwConfig.wgPageName;
		}
		api.postWithToken('csrf', {
			action: 'edit',
			title: mwConfig.wgPageName,
			prependtext: afdTempalte + '\n',
			summary: apiPostSummary,
			tags: 'Adiutor',
			format: 'json'
		}).done(() => {
			createNominationPage(pageTitle);
			logNomination(pageTitle, adiutorUserOptions);
		});
	}

	function checkPreviousNominations(title) {
		return api.get({
			action: 'query',
			prop: 'revisions',
			rvlimit: 1,
			rvprop: ['user'],
			rvdir: 'newer',
			titles: title
		});
	}

	function createNominationPage(pageTitle) {
		const placeholders = {
			$1: pageTitle,
			$2: nomCount,
			$3: rationaleInput.value
		};
		const preparedContent = replacePlaceholders(contentPattern, placeholders);
		api.postWithToken('csrf', {
			action: 'edit',
			title: noticeBoardTitle + pageTitle,
			appendtext: preparedContent,
			summary: apiPostSummary,
			tags: 'Adiutor',
			format: 'json'
		}).done(() => {
			addNominationToAfdPage(pageTitle);
		});
	}

	if (addNominationToNoticeboard) {
		const placeholders = {
			$1: pageTitle,
			$2: newPageName.value,
			$3: rationaleInput.value
		};
		const preparedContent = replacePlaceholders(contentPattern, placeholders);
		const apiParams = {
			action: 'edit',
			title: noticeBoardTitle,
			summary: replaceParameter(apiPostSummary, '1', pageTitle),
			tags: 'Adiutor',
			format: 'json'
		};
		if (addNewSection) {
			apiParams.section = 'new';
			apiParams.sectiontitle = replaceParameter(sectionTitle, '1', pageTitle);
			apiParams.text = preparedContent;
		} else {
			if (sectionId) {
				apiParams.section = sectionId;
			}
			apiParams[appendText ? 'appendtext' : prependText ? 'prependtext' : 'text'] = preparedContent + '\n';
		}
		api.postWithToken('csrf', apiParams).done(() => {
			window.location = '/wiki/' + noticeBoardLink;
		});
	}
	if (addNominationToNoticeboardByFindLast) {
		let pageContent;
		api.get({
			action: 'parse',
			page: noticeBoardTitle,
			prop: 'wikitext',
			format: 'json'
		}).done((data) => {
			pageContent = data.parse.wikitext['*'];
			const NominatedBefore = pageContent.includes('{{' + noticeBoardTitle + '/' + pageTitle.replace(/_/g, ' ') + '}}');
			if (!NominatedBefore) {
				api.postWithToken('csrf', {
					action: 'edit',
					title: noticeBoardTitle,
					appendtext: `{{${noticeBoardTitle}/${pageTitle.replace(/_/g, ' ')}}}`,
					summary: apiPostSummaryforAfdPage,
					tags: 'Adiutor',
					format: 'json'
				}).done(() => {
					if (logNominations) {
						addNominationToAfdLogPage(pageTitle);
					}
					adiutorUserOptions.stats.afdRequests++;
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
		});
	} else {
		if (logNominations) {
			addNominationToAfdLogPage(pageTitle);
		}
	}

	function addNominationToAfdLogPage(pageTitle) {
		const date = new Date();
		const date_year = date.getUTCFullYear();
		const month_name = localMonthsNames[date.getUTCMonth()];
		const day = date.getUTCDate();
		let pageContent;
		api.get({
			action: 'parse',
			page: afdLogPage + date_year + '_' + month_name + '_' + day,
			prop: 'wikitext',
			format: 'json'
		}).done((data) => {
			pageContent = data.parse.wikitext['*'];
			const NominatedBefore = pageContent.includes('{{' + noticeBoardTitle + '/' + pageTitle.replace(/_/g, ' ') + '}}');
			if (!NominatedBefore) {
				api.postWithToken('csrf', {
					action: 'edit',
					title: afdLogPage + date_year + '_' + month_name + '_' + day,
					appendtext: `{{${noticeBoardTitle}/${pageTitle.replace(/_/g, ' ')}}}`,
					summary: apiPostSummaryforAfdLog,
					tags: 'Adiutor',
					format: 'json'
				}).done(() => {
					window.location = '/wiki/' + noticeBoardTitle + '/' + pageTitle.replace(/_/g, ' ');
				});
			} else {
				window.location = '/wiki/' + noticeBoardTitle + '/' + pageTitle.replace(/_/g, ' ');
			}
		});
	}

	function logNomination() {
		if (adiutorUserOptions.speedyDeletion.afdLogNominatedPages === true) {
			const currentDate = new Date();
			const currentMonthYear = currentDate.toLocaleString(localLangCode, {
				month: 'long',
				year: 'numeric'
			});
			const sectionTitle = '== ' + currentMonthYear + ' ==';
			let newContent;
			api.get({
				action: 'parse',
				page: userPagePrefix.concat(mwConfig.wgUserName, String('/' + adiutorUserOptions.speedyDeletion.afdLogPageName)).split(' ').join('_'),
				format: 'json',
				prop: 'wikitext'
			}).then((data) => {
				const pageContent = data.parse.wikitext['*'];
				if (pageContent.includes(sectionTitle)) {
					newContent = pageContent.replace(sectionTitle, sectionTitle + '\n' + replaceParameter(userLogText, '1', pageTitle));
				} else {
					newContent = pageContent + '\n\n' + sectionTitle + '\n' + replaceParameter(userLogText, '1', pageTitle);
				}
				return api.postWithToken('csrf', {
					action: 'edit',
					title: userPagePrefix.concat(mwConfig.wgUserName, String('/' + adiutorUserOptions.speedyDeletion.csdLogPageName)).split(' ').join('_'),
					text: newContent,
					summary: replaceParameter(apiPostSummaryforUserLog, '1', pageTitle),
					tags: 'Adiutor',
					format: 'json'
				});
			}).catch((error) => {
				console.error('Error:', error);
				api.postWithToken('csrf', {
					action: 'edit',
					title: userPagePrefix.concat(mwConfig.wgUserName, String('/' + adiutorUserOptions.speedyDeletion.afdLogPageName)).split(' ').join('_'),
					section: 'new',
					sectiontitle: sectionTitle,
					text: replaceParameter(userLogText, '1', pageTitle),
					summary: replaceParameter(apiPostSummaryforUserLog, '1', pageTitle),
					format: 'json'
				}).done(() => {
				});
			});
		}
	}

	function getCreator() {
		return api.get({
			action: 'query',
			prop: 'revisions',
			rvlimit: 1,
			rvprop: ['user'],
			rvdir: 'newer',
			titles: mwConfig.wgPageName.replace(/_/g, ' ')
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
		}).done(() => {
		});
	}

	function showProgress() {
		const processStartedDialog = new OO.ui.MessageDialog();
		const progressBar = new OO.ui.ProgressBarWidget();
		const windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		windowManager.addWindows([processStartedDialog]);
		windowManager.openWindow(processStartedDialog, {
			title: mw.msg('processing'),
			message: progressBar.$element
		});
	}
}

module.exports = {
	callBack: callBack
};
