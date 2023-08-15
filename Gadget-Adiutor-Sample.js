/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * About: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Sample container
 */
// Wait for required libraries and DOM to be ready
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]), $.ready).then(function() {
	// Get essential configuration from MediaWiki
	var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
	var api = new mw.Api();
	var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));

});
/* </nowiki> */