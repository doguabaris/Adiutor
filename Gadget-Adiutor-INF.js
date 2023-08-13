/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Article Info
 */
// Wait for required libraries and DOM to be ready
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]), $.ready).then(function() {
	// Get essential configuration from MediaWiki
	var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgRelevantUserName", "wgCanonicalNamespace"]);
	var api = new mw.Api();
	var adiutorUserOptions;
	// Fetch user-specific Adiutor options
	api.get({
		action: "query",
		format: "json",
		prop: "revisions",
		titles: "User:" + mwConfig.wgUserName + "/Adiutor-options.json",
		rvprop: "content"
	}).done(function(data) {
		var pageId = Object.keys(data.query.pages)[0];
		if(pageId !== "-1") {
			var jsonContent = data.query.pages[pageId].revisions[0]["*"];
			try {
				adiutorUserOptions = JSON.parse(jsonContent);
				// Fetch gadget messages for UI language
				api.get({
					action: 'query',
					prop: 'revisions',
					titles: 'MediaWiki:Gadget-Adiutor-i18.json',
					rvprop: 'content',
					formatversion: 2
				}).done(function(data) {
					var content = data.query.pages[0].revisions[0].content;
					var messages = JSON.parse(content);
					var lang = mw.config.get('wgUserLanguage') || 'en';
					mw.messages.set(messages[lang] || messages.en);
					const wikiUrl = "https://xtools.wmcloud.org/api/page/articleinfo/tr.wikipedia.org/" + mwConfig.wgPageName + "?format=json";
					const xhr = new XMLHttpRequest();
					xhr.open("GET", wikiUrl, true);
					xhr.onreadystatechange = function() {
						if(xhr.readyState === 4 && xhr.status === 200) {
							const response = JSON.parse(xhr.responseText);
							console.log(response);
							api.get({
								action: 'query',
								prop: 'revisions',
								titles: mw.config.get('wgPageName'),
								rvprop: 'user|content|timestamp', // Fetch user, content, and timestamp from revision history
								rvlimit: 1, // Only retrieve the latest revision
								formatversion: 2
							}).then(function(data) {
								// Extract relevant information from the API response
								var revision = data.query.pages[0].revisions[0];
								var creationTimestamp = revision.timestamp;
								var formattedCreationDate = new Date(creationTimestamp).toLocaleDateString();
								var articleCreatorUser = revision.user;
								// Clean up the content by removing unnecessary elements
								var text = revision.content;
								text = text.replace(/{{[^}]+}}/g, '');
								// Categories
								text = text.replace(/\[\[Kategori:[^\]]+\]\]/g, '');
								// Referances
								text = text.replace(/==[ ]*Kaynakça[ ]*==[\s\S]*/g, '');
								// External links
								text = text.replace(/==[ ]*Dış bağlantılar[ ]*==[\s\S]*/g, '');
								text = text.replace(/^\*.*$/gm, '');
								text = text.replace(/{\|[^}]+}\|/g, '');
								const words = text.match(/\b\w+\b/g);
								const wordCount = words ? words.length : 0;
								// Define the ArticleInfoDialog class
								function ArticleInfoDialog(config) {
									ArticleInfoDialog.super.call(this, config);
								}
								// Inherit ArticleInfoDialog from OO.ui.ProcessDialog
								OO.inheritClass(ArticleInfoDialog, OO.ui.ProcessDialog);
								ArticleInfoDialog.static.title = mw.config.get('wgPageName');
								ArticleInfoDialog.static.name = 'ArticleInfoDialog';
								// Define the actions for the dialog
								ArticleInfoDialog.static.actions = [{
									action: 'continue',
									modes: 'edit',
									label: new OO.ui.deferMsg('okay'),
									flags: ['primary', 'progressive']
								}, {
									action: 'policy',
									modes: 'edit',
									label: mw.msg('more-about-this-page'),
									framed: false,
								}, {
									modes: 'edit',
									label: new OO.ui.deferMsg('cancel'),
									flags: ['safe', 'close']
								}, {
									action: 'back',
									modes: 'help',
									label: new OO.ui.deferMsg('back'),
									flags: ['safe', 'back']
								}];
								// Initialize the dialog with its elements
								ArticleInfoDialog.prototype.initialize = function() {
									ArticleInfoDialog.super.prototype.initialize.apply(this, arguments);
									// Create elements to display information
									var articleCreator = new OO.ui.MessageWidget({
										type: 'warning',
										icon: 'infoFilled',
										inline: false,
										label: new OO.ui.HtmlSnippet(mw.msg('page-more-info-tip-author',response.author)),
										classes: ['adiutor-page-more-info-tip-author']
									});
									var articleDate = new OO.ui.MessageWidget({
										type: 'notice',
										icon: 'edit',
										inline: false,
										label: new OO.ui.HtmlSnippet(mw.msg('page-more-info-tip-date', formattedCreationDate)),
										classes: ['adiutor-page-more-info-tip-date']
									});
									var wordCountLabel = new OO.ui.MessageWidget({
										type: 'notice',
										icon: 'article',
										inline: false,
										label: new OO.ui.HtmlSnippet(mw.msg('page-more-info-tip-keyword',wordCount)),
										classes: ['adiutor-page-more-info-tip-keyword']
									});
									this.$body.append(articleCreator.$element,articleDate.$element, wordCountLabel.$element);
								};
								// Set up the dialog's initial state
								ArticleInfoDialog.prototype.getSetupProcess = function(data) {
									return ArticleInfoDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
										this.actions.setMode('edit');
									}, this);
								};
								// Handle actions performed in the dialog
								ArticleInfoDialog.prototype.getActionProcess = function(action) {
									if(action === 'continue') {
										var dialog = this;
										return new OO.ui.Process(function() {
											dialog.close();
										});
									}
									return ArticleInfoDialog.super.prototype.getActionProcess.call(this, action);
								};
								// Create a window manager and open the dialog
								var windowManager = new OO.ui.WindowManager();
								$(document.body).append(windowManager.$element);
								var dialog = new ArticleInfoDialog({
									size: 'medium'
								});
								windowManager.addWindows([dialog]);
								windowManager.openWindow(dialog);
							});
						}
					};
					xhr.send();
				});
			} catch(error) {
				// Handle JSON parsing error if needed
			}
		}
	}).fail(function(error) {
		// Handle API request failure if needed
	});
	// Define functions below as needed
});
/* </nowiki> */