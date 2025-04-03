/* <nowiki> */

/**
 * @file Adiutor-BDM.js
 * @description Batch deletion module for processing multiple page deletions via Adiutor.
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
	 * @typedef {Object} CsdConfiguration
	 * @property {Array<{
	 *   name: string,
	 *   reasons: Array<{ data: string, label: string }>
	 * }>} speedyDeletionReasons
	 * @property {string} csdCategoryForBatchDeletion
	 * @property {string} apiPostSummaryforTalkPage
	 */

	/** @type {CsdConfiguration} */
	const csdConfiguration = require('./Adiutor-CSD.json');

	if (!csdConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-CSD.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}

	const batchDeletionList = [];
	let selectedOptions;
	let selectedReason;
	const speedyDeletionReasons = csdConfiguration.speedyDeletionReasons;
	const csdCategoryForBatchDeletion = csdConfiguration.csdCategoryForBatchDeletion;
	const apiPostSummaryforTalkPage = csdConfiguration.apiPostSummaryforTalkPage;
	// Fetch list of pages to be considered for batch deletion from a specific category
	api.get({
		action: 'query',
		list: 'categorymembers',
		cmtitle: csdCategoryForBatchDeletion,
		cmsort: 'timestamp',
		cmdir: 'desc',
		format: 'json'
	}).done((data) => {
		// Process the retrieved pages and create CheckboxMultioptionWidgets for each
		const members = data.query.categorymembers;
		members.sort((a, b) => a.title.localeCompare(b.title));
		members.forEach((page) => {
			batchDeletionList.push(new OO.ui.CheckboxMultioptionWidget({
				data: page.title,
				selected: false,
				label: new OO.ui.HtmlSnippet(page.title + '<a style="margin-left:10px" target="_blank" href="' + page.title + '">→ ' + mw.msg('see') + '</a>')
			}));
		});
		// Create a CheckboxMultiselectWidget to display the list of pages
		const multiselectInput = new OO.ui.CheckboxMultiselectWidget({
			items: batchDeletionList
		});
		multiselectInput.$element.css({
			'margin-top': '10px'
		});
		// Create a "Select All" button to select all checkboxes at once
		const selectAllButton = new OO.ui.ButtonWidget({
			label: mw.msg('select-all'),
			flags: ['progressive']
		});
		// Create a "Clear Selection" button to clear all checkboxes at once
		const clearSelectionButton = new OO.ui.ButtonWidget({
			label: mw.msg('uncheck-selected')
		});
		// Event handler for the "Select All" button
		selectAllButton.on('click', () => {
			batchDeletionList.forEach((option) => {
				option.setSelected(true);
			});
			printSelectedOptions();
		});
		// Event handler for the "Clear Selection" button
		clearSelectionButton.on('click', () => {
			batchDeletionList.forEach((option) => {
				option.setSelected(false);
			});
			printSelectedOptions();
		});
		// Event handler for checkbox changes
		batchDeletionList.forEach((option) => {
			option.on('change', () => {
				printSelectedOptions();
			});
		});

		// Function to update the selectedOptions array and clear console
		function printSelectedOptions() {
			selectedOptions = batchDeletionList.filter((option) => option.isSelected()).map((option) => option.data);
			console.clear();
		}

		/**
		 * The main OOUI dialog for the batch deletion process.
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
		BatchDeletionDialog.prototype.initialize = function () {
			BatchDeletionDialog.super.prototype.initialize.apply(this, arguments);
			// Create a notice message for header
			const headerTitle = new OO.ui.MessageWidget({
				type: 'notice',
				inline: true,
				label: mw.msg('batch-deletion-warning')
			});
			headerTitle.$element.css({
				'margin-bottom': '20px',
				'font-weight': '300'
			});
			// Construct options for the speedy deletion reasons dropdown
			const dropdownOptions = [];
			speedyDeletionReasons.forEach((reasonGroup) => {
				dropdownOptions.push({
					optgroup: reasonGroup.name
				});
				reasonGroup.reasons.forEach((reason) => {
					dropdownOptions.push({
						data: reason.data,
						label: reason.label
					});
				});
			});
			// Create a dropdown input for selecting deletion reasons
			const reasonDropdown = new OO.ui.DropdownInputWidget({
				options: dropdownOptions,
				icon: 'dropdown',
				value: null // Set the initial selected value to null
			});
			reasonDropdown.on('change', (value) => {
				selectedReason = value;
			});
			reasonDropdown.$element.css({
				'margin-top': '20px',
				'margin-bottom': '10px'
			});
			// Create an input field for additional rationale
			otherRationaleInput = new OO.ui.TextInputWidget({
				placeholder: mw.msg('other-reason'),
				value: ''
			});
			otherRationaleInput.$element.css({
				'margin-bottom': '20px'
			});
			// Create a layout for the "Select All" and "Clear Selection" buttons
			const buttonsLayout = new OO.ui.HorizontalLayout({
				items: [selectAllButton, clearSelectionButton]
			});
			const secondHeader = new OO.ui.FieldsetLayout({
				label: mw.msg('pages-to-be-deleted'),
				items: [buttonsLayout]
			});
			buttonsLayout.$element.css({
				display: 'contents'
			});
			secondHeader.$element.css({
				'margin-bottom': '10px'
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
		BatchDeletionDialog.prototype.getActionProcess = function (action) {
			const dialog = this;
			if (action) {
				return new OO.ui.Process(() => {
					let deletionSummary = '';
					if (selectedReason) {
						deletionSummary = selectedReason;
						if (otherRationaleInput.value) {
							deletionSummary += ' | ';
						}
					}
					if (otherRationaleInput.value) {
						deletionSummary += otherRationaleInput.value;
					}
					selectedOptions.forEach((pageTitle) => {
						// Perform batch deletion for selected pages
						api.postWithToken('csrf', {
							action: 'delete',
							title: pageTitle,
							reason: deletionSummary,
							tags: 'Adiutor',
							format: 'json'
						}).done(() => {
							// Delete corresponding talk pages
							api.postWithToken('csrf', {
								action: 'delete',
								title: 'Tartışma:' + pageTitle,
								reason: apiPostSummaryforTalkPage,
								tags: 'Adiutor',
								format: 'json'
							}).done(() => {
							});
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
		const windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		// Create and open the Batch Deletion Dialog
		const dialog = new BatchDeletionDialog();
		windowManager.addWindows([dialog]);
		windowManager.openWindow(dialog);
	});
}

module.exports = {
	callBack: callBack
};
/* </nowiki> */
