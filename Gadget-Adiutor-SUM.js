/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
<nowiki> */
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
api.get({
	action: "query",
	prop: "revisions",
	titles: "MediaWiki:Gadget-Adiutor-SUM.json",
	rvprop: "content",
	formatversion: 2
}).done(function(data) {
	var content = data.query.pages[0].revisions[0].content;
	var jsonData = JSON.parse(content);
	var summaryCategories = jsonData.summaryCategories;
	// Select the summary box and summary textarea
	var $summaryBox, $summaryTextarea = $('#wpSummary');
	// Assuming adiutorUserOptions.myCustomSummaries is an array of custom summaries
	summaryCategories.general = summaryCategories.general.concat(adiutorUserOptions.myCustomSummaries);
	// Function to add options to a dropdown menu
	function addOptionsToDropdown(dropdown, optionTexts) {
		optionTexts.forEach(function(optionText) {
			dropdown.menu.addItems([new OO.ui.MenuOptionWidget({
				label: optionText
			})]);
		});
	}
	// Function to handle selection of a summary option
	function onSummarySelect(option) {
		var originalSummary = $summaryTextarea.val(),
			cannedSummary = option.getLabel(),
			newSummary = originalSummary;
		if(newSummary.length !== 0 && newSummary.charAt(newSummary.length - 1) !== ' ') {
			newSummary += ' ';
		}
		newSummary += cannedSummary;
		$summaryTextarea.val(newSummary).trigger('change');
	}
	// Function to insert summary options into the editing interface
	function insertSummaryOptions($insertBeforeElement) {
		var namespace = mw.config.get('wgNamespaceNumber'),
			$optionsContainer = $('<div>').css('display', 'flex');
		// Dropdown for article-related edits
		var dropdown = new OO.ui.DropdownWidget({
			label: mw.msg('namespace-edit-summaries')
		});
		dropdown.menu.on('select', onSummarySelect);
		addOptionsToDropdown(dropdown, namespace === 0 ? summaryCategories.article : summaryCategories.nonArticle);
		$optionsContainer.append(dropdown.$element);
		// Dropdown for general edits
		var generalDropdown = new OO.ui.DropdownWidget({
			label: mw.msg('common-edit-summaries')
		});
		generalDropdown.menu.on('select', onSummarySelect);
		addOptionsToDropdown(generalDropdown, summaryCategories.general);
		$optionsContainer.append(generalDropdown.$element);
		// Dropdown for talk page edits (if applicable)
		if(namespace !== 0 && (namespace % 2 !== 0 && namespace !== 3)) {
			var talkDropdown = new OO.ui.DropdownWidget({
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
	mw.hook('ve.saveDialog.stateChanged').add(function() {
		var target, $saveOptions;
		if($('body').data('wppresent')) {
			return;
		}
		$('body').data('wppresent', 'true');
		target = ve.init.target;
		$saveOptions = target.saveDialog.$saveOptions;
		$summaryTextarea = target.saveDialog.editSummaryInput.$input;
		if(!$saveOptions.length) {
			return;
		}
		insertSummaryOptions($saveOptions);
	});
	// Wait for necessary libraries to load before adding options
	$.when(mw.loader.using('oojs-ui-core'), $.ready).then(function() {
		var $editCheckboxes = $('.editCheckboxes');
		if(!$editCheckboxes.length) {
			return;
		}
		insertSummaryOptions($editCheckboxes, '50%');
	});
});
/* </nowiki> */