/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
<nowiki> */
var api = new mw.Api();
var wikiOptions = 'userjs-adiutor-' + mw.config.get('wgWikiID');
// Function to update user options
function updateOptions(options) {
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: wikiOptions,
		optionvalue: JSON.stringify(options),
		formatversion: 2,
	}, function() {});
}
// Function to update translations
function updateTranslations() {
	var jsonData = require('./Adiutor-i18.json');
	if(typeof jsonData === 'object') {
		for(var langCode in jsonData) {
			if(jsonData.hasOwnProperty(langCode) && langCode !== '@metadata') {
				// Pass necessary data as arguments to the function
				processTranslation(langCode, jsonData[langCode]);
			}
		}
	} else {
		console.error('JSON content is not an object:', jsonData);
	}
}

function processTranslation(langCode, translationData) {
	var optionValue = JSON.stringify(translationData);
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: 'userjs-adiutor-i18-' + langCode,
		optionvalue: optionValue,
		formatversion: 2
	}).done(function(response) {
		console.log('Updated translation for langCode: ' + langCode);
	}).fail(function(err) {
		console.error('Failed to update translation for langCode: ' + langCode, err);
	});
}
// Define default user options for the Adiutor gadget
var adiutorUserOptionsDefault = {
	"myWorks": [],
	"myCustomSummaries": [],
	"speedyDeletion": {
		"csdSendMessageToCreator": true,
		"csdLogNominatedPages": true,
		"csdLogPageName": "CSD log",
	},
	"articlesForDeletion": {
		"afdSendMessageToCreator": true,
		"afdLogNominatedPages": true,
		"afdLogPageName": "AFD log",
		"afdNominateOpinionsLog": true,
		"afdOpinionLogPageName": "AFD opinion log"
	},
	"proposedDeletion": {
		"prdSendMessageToCreator": true,
		"prdLogNominatedPages": true,
		"prdLogPageName": "PROD log"
	},
	"status": {
		"showMyStatus": true,
		"myStatus": "active"
	},
	"stats": {
		"csdRequests": 0,
		"afdRequests": 0,
		"prodRequests": 0,
		"blockRequests": 0,
		"userWarnings": 0,
		"pageTags": 0
	},
	"inlinePageInfo": true,
	"showEditSummaries": true,
	"modules": {
		"afd": true,
		"aiv": true,
		"bdm": true,
		"cmr": true,
		"cov": true,
		"csd": true,
		"das": true,
		"del": true,
		"inf": true,
		"pmr": true,
		"prd": true,
		"rdr": true,
		"sum": true,
		"tag": true,
		"ubm": true,
		"upw": true,
		"wrn": true
	},
	"adiutorVersion": "v2.0.0"
};
// Get user options related to the Adiutor gadget
var adiutorUserOptions = JSON.parse(mw.user.options.get(wikiOptions));
// Check if user options are not present or empty
if(!adiutorUserOptions || Object.keys(adiutorUserOptions).length === 0) {
	// Send default user options to the server using API
	updateOptions(adiutorUserOptionsDefault);
	// Retrieve default translation data
	updateTranslations();
} else {
	var hasNewOptions = false; // Flag to check if there are new options
	// Loop through the properties in adiutorUserOptionsDefault
	for(var key in adiutorUserOptionsDefault) {
		if(adiutorUserOptionsDefault.hasOwnProperty(key)) {
			// Check if the property exists in adiutorUserOptions
			if(!adiutorUserOptions.hasOwnProperty(key)) {
				// New setting found, set the flag
				hasNewOptions = true;
				adiutorUserOptions[key] = adiutorUserOptionsDefault[key]; // Add the new option
			}
		}
	}
	// Update user options if new settings are found
	if(hasNewOptions) {
		updateOptions(adiutorUserOptions);
		updateTranslations();
	}
}
try {
	var userLanguage = mw.config.get('wgUserLanguage'); // Get user's language
	var adiutorUserInterfaceTranslations = mw.user.options.get('userjs-adiutor-i18-' + userLanguage); // Get translation for user's language
	// If there is no translation, use English as a fallback.
	if(!adiutorUserInterfaceTranslations) {
		adiutorUserInterfaceTranslations = mw.user.options.get('userjs-adiutor-i18-en');
	}
	// Ensure messages is an object with valid translations.
	var messages = JSON.parse(adiutorUserInterfaceTranslations);
	if(typeof messages !== 'object' || Object.keys(messages).length === 0) {
		throw new Error('Invalid or empty translations');
	}
	// If so, work with the messages object.
	mw.messages.set(messages);
	// Load the Adiutor interface launcher
	const AIL = require('./Adiutor-AIL.js');
	AIL.callBack();
} catch(error) {
	console.error('Error fetching and processing translations:', error);
}
/* </nowiki> */