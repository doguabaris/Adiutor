/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
<nowiki> */

var api = new mw.Api();
var wikiOptions = 'userjs-adiutor-' + mw.config.get('wgWikiID');

// Function to update user options
// This function sends updated options to the server via the API.
function updateOptions(options) {
    api.postWithEditToken({
        action: 'globalpreferences',
        format: 'json',
        optionname: wikiOptions,
        optionvalue: JSON.stringify(options),
        formatversion: 2,
    }).fail(function(err) {
        console.error('Failed to update options:', err);
    });
}

// Function to update translations
// This function handles updating translations by reading from a JSON file.
function updateTranslations() {
    var jsonData = require('./Adiutor-i18.json');
    if (typeof jsonData === 'object') {
        for (var langCode in jsonData) {
            if (jsonData.hasOwnProperty(langCode) && langCode !== '@metadata') {
                processTranslation(langCode, jsonData[langCode]);
            }
        }
    } else {
        console.error('JSON content is not an object:', jsonData);
    }
}

// Processes individual translations and updates them via the API.
function processTranslation(langCode, translationData) {
    var optionValue = JSON.stringify(translationData);
    api.postWithEditToken({
        action: 'globalpreferences',
        format: 'json',
        optionname: 'userjs-adiutor-i18-' + langCode,
        optionvalue: optionValue,
        formatversion: 2
    }).done(function(response) {
        console.log('Updated translation for langCode:', langCode);
    }).fail(function(err) {
        console.error('Failed to update translation for langCode:', langCode, err);
    });
}

// Define default user options for the Adiutor gadget
// These are the predefined settings that will be used if the user has no saved settings.
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
// This retrieves the current settings for the user from the server.
var adiutorUserOptions = JSON.parse(mw.user.options.get(wikiOptions) || null);

// Check if user options are not present or empty
// If the settings are not found or are empty, the defaults are set.
if (!adiutorUserOptions || Object.keys(adiutorUserOptions).length === 0) {
    updateOptions(adiutorUserOptionsDefault);
    updateTranslations();
} else {
    var hasNewOptions = false;
    // Loop through default settings and add any missing settings to the user's current options.
    for (var key in adiutorUserOptionsDefault) {
        if (adiutorUserOptionsDefault.hasOwnProperty(key) && !adiutorUserOptions.hasOwnProperty(key)) {
            hasNewOptions = true;
            adiutorUserOptions[key] = adiutorUserOptionsDefault[key];
        }
    }
    // Update the user's settings if new options were added.
    if (hasNewOptions) {
        updateOptions(adiutorUserOptions);
        updateTranslations();
    }
}

// Error handling and setting up translations
try {
    var userLanguage = mw.config.get('wgUserLanguage');
    var adiutorUserInterfaceTranslations = mw.user.options.get('userjs-adiutor-i18-' + userLanguage);

    // Use English as a fallback if no translation is available for the user's language.
    if (!adiutorUserInterfaceTranslations) {
        adiutorUserInterfaceTranslations = mw.user.options.get('userjs-adiutor-i18-en');
    }

    // Parse and set the translations for the interface.
    var messages = JSON.parse(adiutorUserInterfaceTranslations || '{}');
    if (typeof messages !== 'object' || !messages || Object.keys(messages).length === 0) {
        throw new Error('Invalid or empty translations');
    }

    mw.messages.set(messages);

    // Load the Adiutor Interface Launcher
    const AIL = require('./Adiutor-AIL.js');
    AIL.callBack();
} catch (error) {
    console.error('Error fetching and processing translations:', error);
}

/* </nowiki> */
