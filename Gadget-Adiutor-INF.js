/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * About: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Article Info
 */
// Wait for required libraries and DOM to be ready
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]), $.ready).then(function() {
	// Get essential configuration from MediaWiki
	var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgRelevantUserName", "wgCanonicalNamespace"]);
	var api = new mw.Api();
	var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
	var newArticleToWorkOnIt = {
		"id": mwConfig.wgArticleId,
		"name": mwConfig.wgPageName
	};
	const wikiUrl = "https://xtools.wmcloud.org/api/page/articleinfo/tr.wikipedia.org/" + mwConfig.wgPageName + "?format=json";
	const xhr = new XMLHttpRequest();
	xhr.open("GET", wikiUrl, true);
	xhr.onreadystatechange = function() {
		if(xhr.readyState === 4 && xhr.status === 200) {
			const response = JSON.parse(xhr.responseText);
			// Check if article already in list or not
			var isAlreadyAdded = adiutorUserOptions.myWorks.some(function(article) {
				return article.id === newArticleToWorkOnIt.id;
			});
			// Define details to buttons
			var addButtonInfo = {
				icon: isAlreadyAdded ? 'unFlag' : 'flag',
				label: isAlreadyAdded ? mw.msg('unpin-from-works') : mw.msg('pin-to-works')
			};
			var infoButton = new OO.ui.ButtonWidget({
				icon: 'info'
			});
			var AboutArticleActionButtons = new OO.ui.ButtonGroupWidget({
				items: [
					new OO.ui.ButtonWidget(Object.assign({}, addButtonInfo)),
					infoButton
				],
				classes: ['adiutor-aricle-detail-box-button-group']
			});
			infoButton.on('click', function() {
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
					// Clean up the content by removing unnecessary elements
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
					var words = text.match(/\b\w+\b/g);
					var wordCount = words ? words.length : 0;
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
							label: new OO.ui.HtmlSnippet(mw.msg('page-more-info-tip-author', response.author)),
							classes: ['adiutor-page-more-info-tip-author']
						});
						var articleDate = new OO.ui.MessageWidget({
							type: 'notice',
							icon: 'edit',
							inline: false,
							label: new OO.ui.HtmlSnippet(mw.msg('page-more-info-tip-date', response.created_at)),
							classes: ['adiutor-page-more-info-tip-date']
						});
						var wordCountLabel = new OO.ui.MessageWidget({
							type: 'notice',
							icon: 'article',
							inline: false,
							label: new OO.ui.HtmlSnippet(mw.msg('page-more-info-tip-keyword', wordCount)),
							classes: ['adiutor-page-more-info-tip-keyword']
						});
						this.$body.append(articleCreator.$element, articleDate.$element, wordCountLabel.$element);
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
			});
			var AboutArticleContent = $('<div>').append(mw.msg('page-info-tip', response.created_at, response.author, response.author_editcount, response.revisions, response.editors, response.pageviews, response.pageviews_offset)).append(AboutArticleActionButtons.$element);
			var AboutArticle = new OO.ui.MessageWidget({
				type: 'notice',
				icon: 'article',
				showClose: true,
				label: new OO.ui.HtmlSnippet(AboutArticleContent),
				classes: ['adiutor-aricle-detail-box']
			});
			AboutArticleActionButtons.items[0].on('click', function() {
				if(isAlreadyAdded) {
					var indexToRemove = adiutorUserOptions.myWorks.findIndex(function(article) {
						return article.id === newArticleToWorkOnIt.id;
					});
					adiutorUserOptions.myWorks.splice(indexToRemove, 1);
				} else {
					adiutorUserOptions.myWorks.push(newArticleToWorkOnIt);
					console.log(newArticleToWorkOnIt);
				}
				// Update the button's text and icon
				var addButtonInfo = {
					icon: isAlreadyAdded ? 'flag' : 'unFlag', // Reverse the icon based on isAlreadyAdded
					label: isAlreadyAdded ? mw.msg('pin-to-works') : mw.msg('unpin-from-works') // Reverse the label based on isAlreadyAdded
				};
				AboutArticleActionButtons.items[0].setIcon(addButtonInfo.icon);
				AboutArticleActionButtons.items[0].setLabel(addButtonInfo.label);
				console.log(adiutorUserOptions);
				updateOptions(adiutorUserOptions);
			});
			if(adiutorUserOptions.inlinePageInfo === true) {
				$('.vector-body-before-content').prepend(AboutArticle.$element);
			}
		}
	};
	xhr.send();
	// Define functions below as needed
	function updateOptions(updatedOptions) {
		api.postWithEditToken({
			action: 'globalpreferences',
			format: 'json',
			optionname: 'userjs-adiutor',
			optionvalue: JSON.stringify(updatedOptions),
			formatversion: 2,
		}).done(function() {});
	}
});
/* </nowiki> */