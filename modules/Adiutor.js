/* <nowiki> */

/**
 * @file Adiutor.js
 * @description Adiutor is a gadget that gives Wikipedia a quick way of performing common maintenance tasks.
 * @license CC BY-SA 4.0
 * @see https://meta.wikimedia.org/wiki/Adiutor
 * @author Doğu Abaris <abaris@null.net>
 */

/**
 * @property {Function} get - mw.config.get()
 *
 * @typedef {Object} MwUser
 * @property {Object} options
 * @property {Function} options.get - Get user options
 *
 * @typedef {Object} MwMessages
 * @property {Function} set - Set i18n messages
 *
 * @typedef {Object} MwApiInstance
 * @property {Function} postWithEditToken - Post with edit token
 * @property {Function} done - Promise resolution
 * @property {Function} fail - Promise rejection
 *
 * @typedef {Object} Mw
 * @property {MwUser} user
 * @property {MwMessages} messages
 * @property {Function} Api - Constructor for the mw.Api class
 */

const api = new mw.Api();
const wikiOptions = 'userjs-adiutor-' + mw.config.get('wgWikiID');

/**
 * Update user options by sending them to the server via the MediaWiki API.
 *
 * @param {Object} options - The options to update.
 */
function updateOptions(options) {
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: wikiOptions,
		optionvalue: JSON.stringify(options),
		formatversion: 2
	}).fail((err) => {
		throw new Error('Failed to update options: ' + err);
	});
}

/**
 * Update translations from a local JSON file.
 * This uses Nodes require() to fetch ’./Adiutor-i18.json'.
 * If you’re in a pure on-wiki environment, you’d need to replace this
 * with a ResourceLoader mechanism or store JSON on-wiki.
 */
function updateTranslations() {
	const jsonData = require('./Adiutor-i18.json');
	if (typeof jsonData === 'object') {
		for (const langCode in jsonData) {
			if (Object.prototype.hasOwnProperty.call(jsonData, langCode) && langCode !== '@metadata') {
				processTranslation(langCode, jsonData[langCode]);
			}
		}
	} else {
		throw new Error('JSON content is not an object: ' + jsonData);
	}
}

/**
 * Process individual translations and update them via the API.
 *
 * @param {string} langCode - The language code (e.g., “en”, “fr”, etc.)
 * @param {Object} translationData - Key-value pairs for i18n messages.
 */
function processTranslation(langCode, translationData) {
	const optionValue = JSON.stringify(translationData);
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: 'userjs-adiutor-i18-' + langCode,
		optionvalue: optionValue,
		formatversion: 2
	}).done(() => {
		// Translation updated successfully
	}).fail((err) => {
		throw new Error('Failed to update translation for langCode ' + langCode + ': ' + err);
	});
}

/**
 * Default user options for the Adiutor gadget.
 * If the user does not have any saved settings, these will be used.
 */
const adiutorUserOptionsDefault = {
	myWorks: [],
	myCustomSummaries: [],
	speedyDeletion: {
		csdSendMessageToCreator: true,
		csdLogNominatedPages: true,
		csdLogPageName: 'CSD log'
	},
	articlesForDeletion: {
		afdSendMessageToCreator: true,
		afdLogNominatedPages: true,
		afdLogPageName: 'AFD log',
		afdNominateOpinionsLog: true,
		afdOpinionLogPageName: 'AFD opinion log'
	},
	proposedDeletion: {
		prdSendMessageToCreator: true,
		prdLogNominatedPages: true,
		prdLogPageName: 'PROD log'
	},
	status: {
		showMyStatus: true,
		myStatus: 'active'
	},
	stats: {
		csdRequests: 0,
		afdRequests: 0,
		prodRequests: 0,
		blockRequests: 0,
		userWarnings: 0,
		pageTags: 0
	},
	inlinePageInfo: true,
	showEditSummaries: true,
	modules: {
		afd: true,
		aiv: true,
		bdm: true,
		cmr: true,
		cov: true,
		csd: true,
		das: true,
		del: true,
		inf: true,
		pmr: true,
		prd: true,
		rdr: true,
		sum: true,
		tag: true,
		ubm: true,
		upw: true,
		wrn: true
	},
	adiutorVersion: 'v2.0.0'
};

const adiutorUserOptions = JSON.parse(mw.user.options.get(wikiOptions) || null);

if (!adiutorUserOptions || Object.keys(adiutorUserOptions).length === 0) {
	updateOptions(adiutorUserOptionsDefault);
	updateTranslations();
} else {
	let hasNewOptions = false;
	for (const key in adiutorUserOptionsDefault) {
		if (
			Object.prototype.hasOwnProperty.call(adiutorUserOptionsDefault, key) &&
			!Object.prototype.hasOwnProperty.call(adiutorUserOptions, key)
		) {
			hasNewOptions = true;
			adiutorUserOptions[key] = adiutorUserOptionsDefault[key];
		}
	}
	if (hasNewOptions) {
		updateOptions(adiutorUserOptions);
		updateTranslations();
	}
}

try {
	const userLanguage = mw.config.get('wgUserLanguage');
	let adiutorUserInterfaceTranslations = mw.user.options.get('userjs-adiutor-i18-' + userLanguage);

	if (!adiutorUserInterfaceTranslations) {
		adiutorUserInterfaceTranslations = mw.user.options.get('userjs-adiutor-i18-en');
	}
	const messages = JSON.parse(adiutorUserInterfaceTranslations || '{}');

	mw.messages.set(messages);

	const AIL = require('./Adiutor-AIL.js');
	AIL.callBack();
} catch (error) {
	throw new Error('Error fetching and processing translations: ' + error);
}

/* </nowiki> */
