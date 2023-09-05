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
// Function to update user options
var wikiId = mw.config.get('wgWikiID'); // Declare 'var' before 'wikiId' to make it a local variable.
function updateOptions(options) {
	var aditutorOptions = {}; // Declare 'aditutorOptions' here to create an empty object.
	aditutorOptions[wikiId] = options; // Correct the way to set options for a specific wikiId.
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: 'userjs-adiutor',
		optionvalue: JSON.stringify(aditutorOptions),
		formatversion: 2,
	}).done(function() {});
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
		var defaultTranslationData = data.query.pages[0].revisions[0].content;
		// Send default translation data to the server using API
		api.postWithEditToken({
			action: 'globalpreferences',
			format: 'json',
			optionname: 'userjs-adiutor-i18-translations',
			optionvalue: defaultTranslationData,
			formatversion: 2,
		}).done(function() {});
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
	"adiutorVersion": "v1.2.5"
};
// Get user options related to the Adiutor gadget
var wikiAdiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor') || '{}'); // Provide a default empty object if no options are set.
var adiutorUserOptions = wikiAdiutorUserOptions[wikiId];
console.log(wikiAdiutorUserOptions);
var hasNewOptions = false;
// Check if user options are not present or empty
if(!adiutorUserOptions || Object.keys(adiutorUserOptions).length === 0) {
	// Send default user options to the server using API
	updateOptions(adiutorUserOptionsDefault);
	// Retrieve default translation data
	updateTranslations();
} else if(adiutorUserOptions.adiutorVersion !== adiutorUserOptionsDefault.adiutorVersion) {
	hasNewOptions = true; // Flag to check if there are new options
	// Loop to check for new settings
	for(var key in adiutorUserOptionsDefault) {
		if(adiutorUserOptionsDefault.hasOwnProperty(key) && !adiutorUserOptions.hasOwnProperty(key)) {
			// New setting found, set the flag
			hasNewOptions = true;
			adiutorUserOptions[key] = adiutorUserOptionsDefault[key]; // Add the new option
		}
	}
	// Update user options if new settings are found
	if(hasNewOptions) {
		updateOptions(adiutorUserOptions); // Remove '|| hasNewVersion' which is undefined.
		updateTranslations();
	}
}
// Get user interface translations for the Adiutor gadget
var adiutorUserInterfaceTranslations = mw.user.options.get('userjs-adiutor-i18-translations');
if(adiutorUserInterfaceTranslations) {
	// Parse JSON translations into an object
	var messages = JSON.parse(adiutorUserInterfaceTranslations);
	// Get user's preferred language or default to 'en'
	var lang = mw.config.get('wgUserLanguage') || 'en';
	// Set messages for the user interface based on the user's language
	mw.messages.set(messages[lang] || messages.en);
	// Load the Gadget-Adiutor-Loader.js file
	mw.loader.load(mw.util.getUrl('MediaWiki:Gadget-Adiutor-Loader.js', { action: 'raw' }) + '&ctype=text/javascript', 'text/javascript');
}
/* </nowiki> */