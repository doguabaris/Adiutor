/* <nowiki> */

/**
 * @file Adiutor-SUM.js
 * @description Edit summary module providing predefined common summaries for quick editing.
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
	 * @typedef {Object} SumConfiguration
	 * @property {{ article: string[], nonArticle: string[], general: string[], talkPage: string[] }} summaryCategories
	 */

	/** @type {SumConfiguration} */
	const sumConfiguration = require('./Adiutor-SUM.json');

	if (!sumConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-SUM.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}

	const summaryCategories = sumConfiguration.summaryCategories;
	// Select the summary box and summary textarea
	let $summaryBox, $summaryTextarea = $('#wpSummary');
	// Assuming adiutorUserOptions.myCustomSummaries is an array of custom summaries
	summaryCategories.general = summaryCategories.general.concat(adiutorUserOptions.myCustomSummaries);

	// Function to add options to a dropdown menu
	function addOptionsToDropdown(dropdown, optionTexts) {
		optionTexts.forEach((optionText) => {
			dropdown.menu.addItems([new OO.ui.MenuOptionWidget({
				label: optionText
			})]);
		});
	}

	// Function to handle selection of a summary option
	function onSummarySelect(option) {
		const originalSummary = $summaryTextarea.val();
		const cannedSummary = option.getLabel();
		let newSummary = originalSummary;

		// Append a space if the original summary doesn't end with one.
		if (newSummary.length !== 0 && newSummary.charAt(newSummary.length - 1) !== ' ') {
			newSummary += ' ';
		}

		// Append the canned summary to the new summary
		newSummary += cannedSummary;
		$summaryTextarea.val(newSummary).trigger('change');
	}

	// Function to insert summary options into the editing interface
	function insertSummaryOptions($insertBeforeElement) {
		const namespace = mw.config.get('wgNamespaceNumber'),
			$optionsContainer = $('<div>').css('display', 'flex');
		// Dropdown for article-related edits
		const dropdown = new OO.ui.DropdownWidget({
			label: mw.msg('namespace-edit-summaries')
		});
		dropdown.menu.on('select', onSummarySelect);
		addOptionsToDropdown(dropdown, namespace === 0 ? summaryCategories.article : summaryCategories.nonArticle);
		$optionsContainer.append(dropdown.$element);
		// Dropdown for general edits
		const generalDropdown = new OO.ui.DropdownWidget({
			label: mw.msg('common-edit-summaries')
		});
		generalDropdown.menu.on('select', onSummarySelect);
		addOptionsToDropdown(generalDropdown, summaryCategories.general);
		$optionsContainer.append(generalDropdown.$element);
		// Dropdown for talk page edits (if applicable)
		if (namespace !== 0 && (namespace % 2 !== 0 && namespace !== 3)) {
			const talkDropdown = new OO.ui.DropdownWidget({
				label: mw.msg('ccommon-discussion-edit-summaries')
			});
			talkDropdown.menu.on('select', onSummarySelect);
			addOptionsToDropdown(talkDropdown, summaryCategories.talkPage);
			$optionsContainer.append(talkDropdown.$element);
		}
		$optionsContainer.css('margin-bottom', '10px'); // Add bottom margin
		$insertBeforeElement.before($optionsContainer);
	}

	// Hook into the save dialog state change event
	mw.hook('ve.saveDialog.stateChanged').add(() => {
		let $saveOptions;
		if ($('body').data('wppresent')) {
			return;
		}
		$('body').data('wppresent', 'true');
		const target = ve.init.target;
		// eslint-disable-next-line prefer-const
		$saveOptions = target.saveDialog.$saveOptions;
		$summaryTextarea = target.saveDialog.editSummaryInput.$input;
		if (!$saveOptions.length) {
			return;
		}
		insertSummaryOptions($saveOptions);
	});
	// Wait for necessary libraries to load before adding options
	$.when(mw.loader.using('oojs-ui-core'), $.ready).then(() => {
		const $editCheckboxes = $('.editCheckboxes');
		if (!$editCheckboxes.length) {
			return;
		}
		insertSummaryOptions($editCheckboxes, '50%');
	});
}

module.exports = {
	callBack: callBack
};
/* </nowiki> */
