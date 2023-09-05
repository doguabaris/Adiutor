/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Batch deletion module
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
// Create an instance of the MediaWiki API
var api = new mw.Api();
// Retrieve user options for Adiutor from JSON and initialize variables
var wikiId = mw.config.get('wgWikiID');
var wikiAdiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor') || '{}'); // Provide a default empty object if no options are set.
var adiutorUserOptions = wikiAdiutorUserOptions[wikiId];
var batchDeletionList = [];
var selectedOptions;
var selectedReason;
// Fetch list of pages to be considered for batch deletion from a specific category
api.get({
	action: 'query',
	list: 'categorymembers',
	cmtitle: 'Kategori:Hızlı silinmeye aday sayfalar',
	cmsort: 'timestamp',
	cmdir: 'desc',
	format: 'json'
}).done(function(data) {
	// Process the retrieved pages and create CheckboxMultioptionWidgets for each
	var members = data.query.categorymembers;
	members.sort(function(a, b) {
		return a.title.localeCompare(b.title);
	});
	members.forEach(function(page) {
		batchDeletionList.push(new OO.ui.CheckboxMultioptionWidget({
			data: page.title,
			selected: false,
			label: new OO.ui.HtmlSnippet(page.title + '<a style="margin-left:10px" target="_blank" href="' + page.title + '">→ ' + mw.msg('see') + '</a>')
		}));
	});
	// Create a CheckboxMultiselectWidget to display the list of pages
	var multiselectInput = new OO.ui.CheckboxMultiselectWidget({
		items: batchDeletionList,
	});
	multiselectInput.$element.css({
		'margin-top': '10px'
	});
	// Create a "Select All" button to select all checkboxes at once
	var selectAllButton = new OO.ui.ButtonWidget({
		label: mw.msg('select-all'),
		flags: ['progressive']
	});
	// Create a "Clear Selection" button to clear all checkboxes at once
	var clearSelectionButton = new OO.ui.ButtonWidget({
		label: mw.msg('uncheck-selected')
	});
	// Event handler for the "Select All" button
	selectAllButton.on('click', function() {
		batchDeletionList.forEach(function(option) {
			option.setSelected(true);
		});
		printSelectedOptions();
	});
	// Event handler for the "Clear Selection" button
	clearSelectionButton.on('click', function() {
		batchDeletionList.forEach(function(option) {
			option.setSelected(false);
		});
		printSelectedOptions();
	});
	// Event handler for checkbox changes
	batchDeletionList.forEach(function(option) {
		option.on('change', function() {
			printSelectedOptions();
		});
	});
	// Function to update the selectedOptions array and clear console
	function printSelectedOptions() {
		selectedOptions = batchDeletionList.filter(function(option) {
			return option.isSelected();
		}).map(function(option) {
			return option.data;
		});
		console.clear();
	}
	// Fetch JSON data containing speedy deletion reasons
	api.get({
		action: 'query',
		prop: 'revisions',
		titles: 'MediaWiki:Gadget-Adiutor.json',
		rvprop: 'content',
		formatversion: 2
	}).done(function(data) {
		// Extract speedy deletion reasons from the retrieved JSON data
		var content = data.query.pages[0].revisions[0].content;
		var jsonData = JSON.parse(content);
		var speedyDeletionReasons = jsonData[1].adiutorSpeedyDeletionReasons;
		// Define a class for the Batch Deletion Dialog
		function BatchDeletionDialog(config) {
			BatchDeletionDialog.super.call(this, config);
		}
		// Inherit from the ProcessDialog class
		OO.inheritClass(BatchDeletionDialog, OO.ui.ProcessDialog);
		// Set the dialog's name and title
		BatchDeletionDialog.static.name = 'BatchDeletionDialog';
		BatchDeletionDialog.static.title = mw.msg('batch-deletion');
		// Define the dialog's actions (Save and Cancel)
		BatchDeletionDialog.static.actions = [{
			action: 'save',
			label: new OO.ui.deferMsg('confirm-action'),
			flags: ['primary', 'destructive']
		}, {
			label: new OO.ui.deferMsg('cancel'),
			flags: 'safe'
		}];
		// Initialize the dialog
		BatchDeletionDialog.prototype.initialize = function() {
			BatchDeletionDialog.super.prototype.initialize.apply(this, arguments);
			// Create a notice message for header
			var headerTitle = new OO.ui.MessageWidget({
				type: 'notice',
				inline: true,
				label: mw.msg('batch-deletion-warning')
			});
			headerTitle.$element.css({
				'margin-bottom': '20px',
				'font-weight': '300'
			});
			// Construct options for the speedy deletion reasons dropdown
			var dropdownOptions = [];
			speedyDeletionReasons.forEach(function(reasonGroup) {
				dropdownOptions.push({
					"optgroup": reasonGroup.name
				});
				reasonGroup.reasons.forEach(function(reason) {
					dropdownOptions.push({
						"data": reason.data,
						"label": reason.label
					});
				});
			});
			// Create a dropdown input for selecting deletion reasons
			var reasonDropdown = new OO.ui.DropdownInputWidget({
				options: dropdownOptions,
				icon: 'dropdown',
				value: null // Set the initial selected value to null
			});
			reasonDropdown.on('change', function(value) {
				selectedReason = value;
			});
			reasonDropdown.$element.css({
				'margin-top': '20px',
				'margin-bottom': '10px'
			});
			// Create an input field for additional rationale
			otherRationaleInput = new OO.ui.TextInputWidget({
				placeholder: mw.msg('other-reason'),
				value: '',
			});
			otherRationaleInput.$element.css({
				'margin-bottom': '20px',
			});
			// Create a layout for the "Select All" and "Clear Selection" buttons
			var buttonsLayout = new OO.ui.HorizontalLayout({
				items: [selectAllButton, clearSelectionButton]
			});
			var secondHeader = new OO.ui.FieldsetLayout({
				label: mw.msg('pages-to-be-deleted'),
				items: [buttonsLayout]
			});
			buttonsLayout.$element.css({
				'display': 'contents',
			});
			secondHeader.$element.css({
				'margin-bottom': '10px',
			});
			// Create the content layout for the dialog
			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
			this.content.$element.append(headerTitle.$element, reasonDropdown.$element, otherRationaleInput.$element, secondHeader.$element, multiselectInput.$element);
			this.$body.append(this.content.$element);
		};
		// Define the action process for the dialog
		BatchDeletionDialog.prototype.getActionProcess = function(action) {
			var dialog = this;
			if(action) {
				return new OO.ui.Process(function() {
					var deletionSummary = '';
					if(selectedReason) {
						deletionSummary = selectedReason;
						if(otherRationaleInput.value) {
							deletionSummary += ' | ';
						}
					}
					if(otherRationaleInput.value) {
						deletionSummary += otherRationaleInput.value;
					}
					selectedOptions.forEach(function(pageTitle) {
						// Perform batch deletion for selected pages
						api.postWithToken('csrf', {
							action: 'delete',
							title: pageTitle,
							reason: deletionSummary,
							tags: 'Adiutor',
							format: 'json'
						}).done(function() {
							// Delete corresponding talk pages
							api.postWithToken('csrf', {
								action: 'delete',
								title: "Tartışma:" + pageTitle,
								reason: '[[VP:HS#G7]]: Silinen sayfanın tartışma sayfası',
								tags: 'Adiutor',
								format: 'json'
							}).done(function() {});
							// Close the dialog and display success notification
							dialog.close({
								action: action
							});
							mw.notify(mw.msg('batch-deletion-success'), {
								title: mw.msg('operation-completed'),
								type: 'success'
							});
						});
					});
				});
			}
			return BatchDeletionDialog.super.prototype.getActionProcess.call(this, action);
		};
		// Create an instance of WindowManager to manage dialog windows
		var windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		// Create and open the Batch Deletion Dialog
		var dialog = new BatchDeletionDialog();
		windowManager.addWindows([dialog]);
		windowManager.openWindow(dialog);
	});
});
/* </nowiki> */