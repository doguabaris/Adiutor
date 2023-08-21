/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Inıtial loader
 */
/* <nowiki> */
// Wait for required modules and document ready state
$.when(mw.loader.using(["mediawiki.user", "mediawiki.storage", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-toolbars", "oojs-ui-windows", "oojs-ui.styles.icons-movement", "oojs-ui.styles.icons-editing-core", "oojs-ui.styles.icons-interactions", "oojs-ui.styles.icons-moderation", "oojs-ui.styles.icons-content", "oojs-ui.styles.icons-layout", "oojs-ui.styles.icons-user", "oojs-ui.styles.icons-editing-advanced"]), $.ready).then(function() {
	// Initialize the MediaWiki API
	var api = new mw.Api();
	// Get user options related to the adiutor gadget
	var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
	// Get user interface translations for the adiutor gadget
	var adiutorUserInterfaceTranslations = mw.user.options.get('userjs-adiutor-i18-translations');
	if(adiutorUserInterfaceTranslations) {
		// Parse JSON translations into an object
		var messages = JSON.parse(adiutorUserInterfaceTranslations);
		// Get user's preferred language or default to 'en'
		var lang = mw.config.get('wgUserLanguage') || 'en';
		// Set messages for the user interface based on the user's language
		mw.messages.set(messages[lang] || messages.en);
	}
	// Check if user options and translations are not present
	if(!adiutorUserOptions) {
		// Define default user options for the adiutor gadget
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
			"showEditSummaries": true
		};
		// Send default user options to the server using API
		api.postWithEditToken({
			action: 'globalpreferences',
			format: 'json',
			optionname: 'userjs-adiutor',
			optionvalue: JSON.stringify(adiutorUserOptionsDefault),
			formatversion: 2,
		}).done(function() {});
		// Retrieve default translation data from a MediaWiki page
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
	mw.loader.load(mw.util.getUrl('MediaWiki:Gadget-Adiutor-Loader.js', {action:'raw'}) + '&ctype=text/javascript', 'text/javascript');
});
/* </nowiki> */