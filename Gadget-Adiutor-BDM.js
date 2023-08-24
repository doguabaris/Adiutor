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
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
var batchDeletionList = [];
var selectedOptions;
var selectedReason;
api.get({
	action: 'query',
	list: 'categorymembers',
	cmtitle: 'Kategori:Hızlı_silinmeye_aday_sayfalar',
	cmsort: 'timestamp',
	cmdir: 'desc',
	format: 'json'
}).done(function(data) {
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
	var multiselectInput = new OO.ui.CheckboxMultiselectWidget({
		items: batchDeletionList,
	});
	multiselectInput.$element.css({
		'margin-top': '10px'
	});
	// "Hepsini Seç" butonunu oluşturun
	var selectAllButton = new OO.ui.ButtonWidget({
		label: mw.msg('select-all'),
		flags: ['progressive']
	});
	var clearSelectionButton = new OO.ui.ButtonWidget({
		label: mw.msg('uncheck-selected')
	});
	selectAllButton.on('click', function() {
		batchDeletionList.forEach(function(option) {
			option.setSelected(true);
		});
		printSelectedOptions();
	});
	clearSelectionButton.on('click', function() {
		batchDeletionList.forEach(function(option) {
			option.setSelected(false);
		});
		printSelectedOptions();
	});
	// Checkbox change event handler
	batchDeletionList.forEach(function(option) {
		option.on('change', function() {
			printSelectedOptions();
		});
	});

	function printSelectedOptions() {
		selectedOptions = batchDeletionList.filter(function(option) {
			return option.isSelected();
		}).map(function(option) {
			return option.data;
		});
		console.clear(); // Konsolu temizle
		console.log('Seçili olanlar:', selectedOptions);
	}
	api.get({
		action: 'query',
		prop: 'revisions',
		titles: 'MediaWiki:Gadget-Adiutor.json',
		rvprop: 'content',
		formatversion: 2
	}).done(function(data) {
		var content = data.query.pages[0].revisions[0].content;
		var jsonData = JSON.parse(content);
		var speedyDeletionReasons = jsonData[1].adiutorSpeedyDeletionReasons;

		function BatchDeletionDialog(config) {
			BatchDeletionDialog.super.call(this, config);
		}
		OO.inheritClass(BatchDeletionDialog, OO.ui.ProcessDialog);
		BatchDeletionDialog.static.name = 'BatchDeletionDialog';
		BatchDeletionDialog.static.title = mw.msg('batch-deletion');
		BatchDeletionDialog.static.actions = [{
			action: 'save',
			label: new OO.ui.deferMsg('confirm-action'),
			flags: ['primary', 'destructive']
		}, {
			label: new OO.ui.deferMsg('cancel'),
			flags: 'safe'
		}];
		BatchDeletionDialog.prototype.initialize = function() {
			BatchDeletionDialog.super.prototype.initialize.apply(this, arguments);
			var headerTitle = new OO.ui.MessageWidget({
				type: 'notice',
				inline: true,
				label: mw.msg('batch-deletion-warning')
			});
			headerTitle.$element.css({
				'margin-bottom': '20px',
				'font-weight': '300'
			});
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
			console.log(dropdownOptions);
			var reasonDropdown = new OO.ui.DropdownInputWidget({
				options: dropdownOptions,
				icon: 'dropdown',
				value: null // Set the initial selected value to null
			});
			reasonDropdown.on('change', function(value) {
				selectedReason = value;
				console.log(selectedReason);
			});
			reasonDropdown.$element.css({
				'margin-top': '20px',
				'margin-bottom': '10px'
			});
			otherRationaleInput = new OO.ui.TextInputWidget({
				placeholder: mw.msg('other-reason'),
				value: '',
			});
			otherRationaleInput.$element.css({
				'margin-bottom': '20px',
			});
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
			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
			this.content.$element.append(headerTitle.$element, reasonDropdown.$element, otherRationaleInput.$element, secondHeader.$element, multiselectInput.$element);
			this.$body.append(this.content.$element);
		};
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
					console.log("Summary:", deletionSummary);
					console.log("Selected Options:", selectedOptions);
					dialog.close({
						action: action
					});
				});
			}
			return BatchDeletionDialog.super.prototype.getActionProcess.call(this, action);
		};
		var windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		var dialog = new BatchDeletionDialog();
		windowManager.addWindows([dialog]);
		windowManager.openWindow(dialog);
	});
});
/* </nowiki> */