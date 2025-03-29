/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
<nowiki> */
const api = new mw.Api();
const wikiOptions = 'userjs-adiutor-' + mw.config.get( 'wgWikiID' );
// Function to update user options
// This function sends updated options to the server via the API.
function updateOptions( options ) {
	api.postWithEditToken( {
		action: 'globalpreferences',
		format: 'json',
		optionname: wikiOptions,
		optionvalue: JSON.stringify( options ),
		formatversion: 2
	} ).fail( ( err ) => {
		throw new Error( 'Failed to update options: ' + err );
	} );
}

// Function to update translations
// This function handles updating translations by reading from a JSON file.
function updateTranslations() {
	const jsonData = require( './Adiutor-i18.json' );
	if (typeof jsonData === 'object') {
		for (const langCode in jsonData) {
			if (Object.prototype.hasOwnProperty.call( jsonData, langCode ) && langCode !== '@metadata') {
				processTranslation( langCode, jsonData[langCode] );
			}
		}
	} else {
		throw new Error( 'JSON content is not an object: ' + jsonData );
	}
}

// Processes individual translations and updates them via the API.
function processTranslation( langCode, translationData ) {
	const optionValue = JSON.stringify( translationData );
	api.postWithEditToken( {
		action: 'globalpreferences',
		format: 'json',
		optionname: 'userjs-adiutor-i18-' + langCode,
		optionvalue: optionValue,
		formatversion: 2
	} ).done( () => {
	} ).fail( ( err ) => {
		throw new Error( 'Failed to update translation for langCode ' + langCode + ': ' + err );
	} );
}

// Define default user options for the Adiutor gadget
// These are the predefined settings that will be used if the user has no saved settings.
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
// Get user options related to the Adiutor gadget
// This retrieves the current settings for the user from the server.
const adiutorUserOptions = JSON.parse( mw.user.options.get( wikiOptions ) || null );
// Check if user options are not present or empty
// If the settings are not found or are empty, the defaults are set.
if (!adiutorUserOptions || Object.keys( adiutorUserOptions ).length === 0) {
	updateOptions( adiutorUserOptionsDefault );
	updateTranslations();
} else {
	let hasNewOptions = false;
	// Loop through default settings and add any missing settings to the user's current options.
	for (const key in adiutorUserOptionsDefault) {
		if (Object.prototype.hasOwnProperty.call( adiutorUserOptionsDefault, key ) && !Object.prototype.hasOwnProperty.call( adiutorUserOptions, key )) {
			hasNewOptions = true;
			adiutorUserOptions[key] = adiutorUserOptionsDefault[key];
		}
	}
	// Update the user's settings if new options were added.
	if (hasNewOptions) {
		updateOptions( adiutorUserOptions );
		updateTranslations();
	}
}
// Error handling and setting up translations
try {
	const userLanguage = mw.config.get( 'wgUserLanguage' );
	let adiutorUserInterfaceTranslations = mw.user.options.get( 'userjs-adiutor-i18-' + userLanguage );
	// Use English as a fallback if no translation is available for the user's language.
	if (!adiutorUserInterfaceTranslations) {
		adiutorUserInterfaceTranslations = mw.user.options.get( 'userjs-adiutor-i18-en' );
	}
	const messages = JSON.parse( adiutorUserInterfaceTranslations || '{}' );
	mw.messages.set( messages );
	// Load the Adiutor Interface Launcher
	const AIL = require( './Adiutor-AIL.js' );
	AIL.callBack();
} catch (error) {
	throw new Error( 'Error fetching and processing translations: ' + error );
}
/* </nowiki> */
