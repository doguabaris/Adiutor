/* <nowiki> */

/**
 * @file Adiutor-INF.js
 * @description Inline article info module for displaying page metadata within the article view.
 * @license CC BY-SA 4.0
 * @see https://meta.wikimedia.org/wiki/Adiutor
 * @author Doğu Abaris <abaris@null.net>
 */

function callBack() {
	/**
	 * A reference to MediaWiki’s core API.
	 *
	 * @type {mw.Api}
	 */
	const api = new mw.Api();

	/**
	 * The wiki ID (e.g., "enwiki") as used for user preferences.
	 *
	 * @type {string}
	 */
	const wikiId = /** @type {string} */ (mw.config.get('wgWikiID'));

	/**
	 * Adiutor user options. These are read from the user’s preferences (global or local).
	 *
	 * @type {Object}
	 */
	const adiutorUserOptions = JSON.parse(
		mw.user.options.get('userjs-adiutor-' + wikiId) || '{}'
	);

	/**
	 * MediaWiki config variables.
	 *
	 * @typedef {Object} MwConfig
	 * @property {number} wgArticleId
	 * @property {string} wgPageName
	 *
	 * @type {MwConfig}
	 */
	const mwConfig = {
		wgArticleId: /** @type {number} */ (mw.config.get('wgArticleId')),
		wgPageName: /** @type {string} */ (mw.config.get('wgPageName'))
	};

	const newArticleToWorkOnIt = {
		id: mwConfig.wgArticleId,
		name: mwConfig.wgPageName
	};
	const apiUrl = 'https://xtools.wmcloud.org/api/page/articleinfo/' + mw.config.get('wgServerName') + '/' + encodeURIComponent(mwConfig.wgPageName) + '?format=json';
	// AJAX isteği
	$.ajax({
		url: apiUrl,
		method: 'GET',
		dataType: 'json',
		success: function (response) {
			const isAlreadyAdded = adiutorUserOptions.myWorks.some((article) => article.id === newArticleToWorkOnIt.id);
			// Define details to buttons
			const addButtonInfo = {
				icon: isAlreadyAdded ? 'unFlag' : 'flag',
				label: isAlreadyAdded ? mw.msg('unpin-from-works') : mw.msg('pin-to-works')
			};
			const infoButton = new OO.ui.ButtonWidget({
				icon: 'info'
			});
			const aboutArticleActionButtons = new OO.ui.ButtonGroupWidget({
				items: [
					new OO.ui.ButtonWidget(Object.assign({}, addButtonInfo)),
					infoButton
				],
				classes: ['adiutor-aricle-detail-box-button-group']
			});
			infoButton.on('click', () => {
				api.get({
					action: 'query',
					prop: 'revisions',
					titles: mw.config.get('wgPageName'),
					rvprop: 'user|content|timestamp', // Fetch user, content, and timestamp from revision history
					rvlimit: 1, // Only retrieve the latest revision
					formatversion: 2
				}).then((data) => {
					// Extract relevant information from the API response
					const revision = data.query.pages[0].revisions[0];
					// Clean up the content by removing unnecessary elements
					// Clean up the content by removing unnecessary elements
					let text = revision.content;
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

					/**
					 * The main OOUI dialog for the article info process.
					 * Inherits from `OO.ui.ProcessDialog`.
					 *
					 * @constructor
					 * @extends OO.ui.ProcessDialog
					 * @param {Object} config - The configuration object for the dialog.
					 * @param {string} config.size - The dialog size (e.g., “large”).
					 * @param {string[]} config.classes - Additional CSS classes for the dialog.
					 * @param {boolean} config.isDraggable - Whether the dialog is draggable.
					 * @return {void}
					 */
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
						framed: false
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
					ArticleInfoDialog.prototype.initialize = function () {
						ArticleInfoDialog.super.prototype.initialize.apply(this, arguments);
						// Create elements to display information
						const authorMessage = mw.msg('page-more-info-tip-author');
						const authorMessageWithStrong = authorMessage.replace(/\$1/g, '<strong><a href="/wiki/User:' + response.author + '">' + response.author + '</a></strong>');
						const articleCreator = new OO.ui.MessageWidget({
							type: 'warning',
							icon: 'infoFilled',
							inline: false,
							label: new OO.ui.HtmlSnippet(mw.msg('page-more-info-tip-author-title') + '<br>' + authorMessageWithStrong),
							classes: ['adiutor-page-more-info-tip-author']
						});
						const articleDate = new OO.ui.MessageWidget({
							type: 'notice',
							icon: 'edit',
							inline: false,
							label: new OO.ui.HtmlSnippet(mw.msg('page-more-info-tip-date-title') + '<br>' + mw.msg('page-more-info-tip-date', response.created_at)),
							classes: ['adiutor-page-more-info-tip-date']
						});
						const wordCountLabel = new OO.ui.MessageWidget({
							type: 'notice',
							icon: 'article',
							inline: false,
							label: new OO.ui.HtmlSnippet(mw.msg('page-more-info-tip-keyword-title') + '<br>' + mw.msg('page-more-info-tip-keyword', wordCount)),
							classes: ['adiutor-page-more-info-tip-keyword']
						});
						this.$body.append(articleCreator.$element, articleDate.$element, wordCountLabel.$element);
					};
					// Set up the dialog's initial state
					ArticleInfoDialog.prototype.getSetupProcess = function (data) {
						return ArticleInfoDialog.super.prototype.getSetupProcess.call(this, data).next(function () {
							this.actions.setMode('edit');
						}, this);
					};
					// Handle actions performed in the dialog
					ArticleInfoDialog.prototype.getActionProcess = function (action) {
						if (action === 'continue') {
							const dialog = this;
							return new OO.ui.Process(() => {
								dialog.close();
							});
						}
						return ArticleInfoDialog.super.prototype.getActionProcess.call(this, action);
					};
					// Create a window manager and open the dialog
					const windowManager = new OO.ui.WindowManager();
					$(document.body).append(windowManager.$element);
					const dialog = new ArticleInfoDialog({
						size: 'medium'
					});
					windowManager.addWindows([dialog]);
					windowManager.openWindow(dialog);
				});
			});
			const translationKey = 'page-info-tip';
			const translation = mw.msg(translationKey);
			const translatedText = translation.replace(/\$1/g, '<strong>' + response.created_at + '</strong>').replace(/\$2/g, "<strong><a href='/wiki/User:" + response.author + "'>" + response.author + '</a></strong>').replace(/\$3/g, response.author_editcount).replace(/\$4/g, response.revisions).replace(/\$5/g, response.editors).replace(/\$6/g, '<strong>' + response.pageviews + '</strong>').replace(/\$7/g, response.pageviews_offset);
			const aboutArticleContent = $('<div>').html(translatedText).append(aboutArticleActionButtons.$element);
			const aboutArticle = new OO.ui.MessageWidget({
				type: 'notice',
				icon: 'article',
				showClose: true,
				label: new OO.ui.HtmlSnippet(aboutArticleContent),
				classes: ['adiutor-aricle-detail-box']
			});
			aboutArticleActionButtons.items[0].on('click', () => {
				if (isAlreadyAdded) {
					const indexToRemove = adiutorUserOptions.myWorks.findIndex((article) => article.id === newArticleToWorkOnIt.id);
					adiutorUserOptions.myWorks.splice(indexToRemove, 1);
				} else {
					adiutorUserOptions.myWorks.push(newArticleToWorkOnIt);
					console.log(newArticleToWorkOnIt);
				}
				// Update the button's text and icon
				const addButtonInfo = {
					icon: isAlreadyAdded ? 'flag' : 'unFlag', // Reverse the icon based on isAlreadyAdded
					label: isAlreadyAdded ? mw.msg('pin-to-works') : mw.msg('unpin-from-works') // Reverse the label based on isAlreadyAdded
				};
				aboutArticleActionButtons.items[0].setIcon(addButtonInfo.icon);
				aboutArticleActionButtons.items[0].setLabel(addButtonInfo.label);
				console.log(adiutorUserOptions);
				updateOptions(adiutorUserOptions);
			});
			$('.vector-body-before-content').prepend(aboutArticle.$element);
		},
		error: function (xhr, status, error) {
			console.error('AJAX error:', error);
		}
	});

	function updateOptions(updatedOptions) {
		api.postWithEditToken({
			action: 'globalpreferences',
			format: 'json',
			optionname: 'userjs-adiutor-' + mw.config.get('wgWikiID'),
			optionvalue: JSON.stringify(updatedOptions),
			formatversion: 2
		}, () => {
		});
	}
}

module.exports = {
	callBack: callBack
};
/* </nowiki> */
