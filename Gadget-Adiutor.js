/*
 * Adiutor: Provides versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Initial loader
 */
/* <nowiki> */
// Initialize the MediaWiki API
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var wikiOptions = 'userjs-adiutor-' + wikiId;
// Function to update user options
function updateOptions(options) {
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: 'userjs-adiutor-' + wikiId,
		optionvalue: JSON.stringify(options),
		formatversion: 2,
	}, function() {});
}
// Function to update translations
function updateTranslations() {
	api.get({
		action: 'query',
		prop: 'revisions',
		titles: 'MediaWiki:Gadget-Adiutor-i18.json',
		rvprop: 'content',
		formatversion: 2
	}).done(function(data) {
		var page = data.query.pages[0];
		if(page && page.revisions && page.revisions[0]) {
			var jsonData = JSON.parse(page.revisions[0].content);
			// Check if jsonData is an object
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
		} else {
			console.error('No valid revision data found in the response.');
		}
	}).fail(function(err) {
		console.error('Failed to fetch translation data:', err);
	});
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
		"csdLogPageName": "HS günlüğü",
	},
	"articlesForDeletion": {
		"afdSendMessageToCreator": true,
		"afdLogNominatedPages": true,
		"afdLogPageName": "SAS günlüğü",
		"afdNominateOpinionsLog": true,
		"afdOpinionLogPageName": "SAS görüş günlüğü"
	},
	"proposedDeletion": {
		"prdSendMessageToCreator": true,
		"prdLogNominatedPages": true,
		"prdLogPageName": "BS günlüğü"
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
		"pageTags": 0,
	},
	"inlinePageInfo": true,
	"showEditSummaries": true,
	"adiutorVersion": "v1.2.6"
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
	// Load the Gadget-Adiutor-Loader.js file
	mw.loader.load(mw.util.getUrl('MediaWiki:Gadget-Adiutor-Loader.js', {
		action: 'raw'
	}) + '&ctype=text/javascript', 'text/javascript');
} catch(error) {
	console.error('Error fetching and processing translations:', error);
}
/* </nowiki> */