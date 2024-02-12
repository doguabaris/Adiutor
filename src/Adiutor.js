/*
 * Description: Adiutor enables users to perform various tasks on Wikimedia wikis more efficiently.
 * Author: Doğu Abaris
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 */

/* <nowiki> */

const api = new mw.Api();
const wikiOptions = `userjs-adiutor-${mw.config.get('wgWikiID')}`;

// Function to update user options
// This function sends updated options to the server via the API.
function updateOptions(options) {
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: wikiOptions,
		optionvalue: JSON.stringify(options),
		formatversion: 2,
	}).fail((err) => {
		mw.notify(`Failed to update Adiutor user options: ${err}`);
	});
}

// Function to update translations
// This function handles updating translations by reading from a JSON file.
function updateTranslations() {
	const jsonData = require('./Adiutor-i18.json');
	if (typeof jsonData === 'object') {
		for (const langCode in jsonData) {
			// eslint-disable-next-line no-prototype-builtins
			if (jsonData.hasOwnProperty(langCode) && langCode !== '@metadata') {
				processTranslation(langCode, jsonData[langCode]);
			}
		}
	} else {
		mw.notify('Failed to update Adiutor translations: Invalid JSON data');
	}
}

// Processes individual translations and updates them via the API.
function processTranslation(langCode, translationData) {
	const optionValue = JSON.stringify(translationData);
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: `userjs-adiutor-i18-${langCode}`,
		optionvalue: optionValue,
		formatversion: 2,
	}).done((response) => {
		if (response) {
			mw.notify(`Failed to update translation for langCode: ${langCode} - ${response.warnings[0].message}`);
		}
	}).fail((err) => {
		mw.notify(`Failed to update translation for langCode: ${langCode} - ${err}`);
	});
}

// Define default user options for the Adiutor gadget
// These are the predefined settings that will be used if the user has no saved settings.
const adiutorUserOptionsDefault = {
	myWorks: [],
	myCustomSummaries: [],
	speedyDeletion: {
		csdSendMessageToCreator: true,
		csdLogNominatedPages: true,
		csdLogPageName: 'CSD log',
	},
	articlesForDeletion: {
		afdSendMessageToCreator: true,
		afdLogNominatedPages: true,
		afdLogPageName: 'AFD log',
		afdNominateOpinionsLog: true,
		afdOpinionLogPageName: 'AFD opinion log',
	},
	proposedDeletion: {
		prdSendMessageToCreator: true,
		prdLogNominatedPages: true,
		prdLogPageName: 'PROD log',
	},
	status: {
		showMyStatus: true,
		myStatus: 'active',
	},
	stats: {
		csdRequests: 0,
		afdRequests: 0,
		prodRequests: 0,
		blockRequests: 0,
		userWarnings: 0,
		pageTags: 0,
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
		wrn: true,
	},
	adiutorVersion: 'v2.0.0',
};

// Get the user's saved settings for the Adiutor gadget
// These are the user's saved settings for the Adiutor gadget.
const adiutorUserOptions = JSON.parse(mw.user.options.get(wikiOptions) || null);

// Check if the user's options are empty or not found
// If the user's options are empty or not found, update the user's options with the default settings.
if (!adiutorUserOptions || Object.keys(adiutorUserOptions).length === 0) {
	updateOptions(adiutorUserOptionsDefault);
	updateTranslations();
} else {
	let hasNewOptions = false;
	// Check if new settings were added to the default options
	for (const key in adiutorUserOptionsDefault) {
		// eslint-disable-next-line no-prototype-builtins
		if (adiutorUserOptionsDefault.hasOwnProperty(key) && !adiutorUserOptions.hasOwnProperty(key)) {
			hasNewOptions = true;
			adiutorUserOptions[key] = adiutorUserOptionsDefault[key];
		}
	}
	// Update the user's options if new settings were added.
	if (hasNewOptions) {
		updateOptions(adiutorUserOptions);
		updateTranslations();
	}
}

// Error handling and setting up translations
try {
	const userLanguage = mw.config.get('wgUserLanguage');
	let adiutorUserInterfaceTranslations = mw.user.options.get(`userjs-adiutor-i18-${userLanguage}`);

	// Use English as a fallback if no translation is available for the user's language.
	if (!adiutorUserInterfaceTranslations) {
		adiutorUserInterfaceTranslations = mw.user.options.get('userjs-adiutor-i18-en');
	}

	// Set the translations for the Adiutor gadget
	const messages = JSON.parse(adiutorUserInterfaceTranslations || '{}');
	if (typeof messages === 'object') {
		for (const key in messages) {
			// eslint-disable-next-line no-prototype-builtins
			if (messages.hasOwnProperty(key)) {
				messages[key] = messages[key].replace(/\$1/g, '{{1}}');
			}
		}
	}

	mw.messages.set(messages);

	// Load the Adiutor-AIL.js module
	const AIL = require('./Adiutor-AIL.js');
	AIL.callBack();
} catch (error) {
	mw.notify(`Failed to load Adiutor: ${error}`);
}

/* </nowiki> */
