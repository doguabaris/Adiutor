/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Requests for page protection
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var api = new mw.Api();
var apiParams = {};
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
var protectionType, protectionDuration;

function fetchApiData(callback) {
	var api = new mw.Api();
	api.get({
		action: "query",
		prop: "revisions",
		titles: "MediaWiki:Gadget-Adiutor-RPP.json",
		rvprop: "content",
		formatversion: 2
	}).done(function(data) {
		var content = data.query.pages[0].revisions[0].content;
		try {
			var jsonData = JSON.parse(content);
			callback(jsonData);
		} catch(error) {
			// Handle JSON parsing error
			mw.notify('Failed to parse JSON data from API.', {
				title: mw.msg('operation-failed'),
				type: 'error'
			});
		}
	}).fail(function() {
		// Handle API request failure
		mw.notify('Failed to fetch data from the API.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		// You may choose to stop code execution here
	});
}
fetchApiData(function(jsonData) {
	if(!jsonData) {
		// Handle a case where jsonData is empty or undefined
		mw.notify('MediaWiki:Gadget-Adiutor-UBM.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		// You may choose to stop code execution here
		return;
	}
	var noticeBoardTitle = jsonData.noticeBoardTitle;
	var noticeBoardLink = noticeBoardTitle.replace(/ /g, '_');
	var protectionDurations = jsonData.protectionDurations;
	var protectionTypes = jsonData.protectionTypes;
	var addNewSection = jsonData.addNewSection;
	var appendText = jsonData.appendText;
	var prependText = jsonData.prependText;
	var sectionID = jsonData.sectionID;
	var contentPattern = jsonData.contentPattern;
	var apiPostSummary = jsonData.apiPostSummary;
	var sectionTitle = jsonData.sectionTitle;
	var pageTitle = mw.config.get("wgPageName").replace(/_/g, " ");

	function PageProtectionDialog(config) {
		PageProtectionDialog.super.call(this, config);
	}
	OO.inheritClass(PageProtectionDialog, OO.ui.ProcessDialog);
	PageProtectionDialog.static.name = 'PageProtectionDialog';
	PageProtectionDialog.static.title = new OO.ui.deferMsg('rpp-module-title');
	PageProtectionDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('create-request'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	PageProtectionDialog.prototype.initialize = function() {
		PageProtectionDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('rpp-header-title')
		});
		var headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('rpp-header-description')
		});
		headerTitleDescription.$element.css({
			"margin-top": "10px",
			"margin-left": "30px",
			"margin-bottom": "20px",
		});
		TypeOfAction = new OO.ui.FieldsetLayout({
			label: new OO.ui.deferMsg('protection-type')
		});
		TypeOfAction.addItems([
			DurationOfProtection = new OO.ui.DropdownWidget({
				menu: {
					items: protectionDurations.map(function(duration) {
						return new OO.ui.MenuOptionWidget({
							data: duration.data,
							label: duration.label
						});
					})
				},
				label: mw.message('choose-duration').text(),
			}),
			TypeOfProtection = new OO.ui.DropdownWidget({
				menu: {
					items: protectionTypes.map(function(type) {
						return new OO.ui.MenuOptionWidget({
							data: type.data,
							label: type.label
						});
					})
				},
				label: new OO.ui.deferMsg('select-protection-type'),
				classes: ['adiutor-rpp-botton-select'],
			}),
			rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: new OO.ui.deferMsg('rpp-rationale-placeholder'),
				indicator: 'required',
				value: '',
			}), {
				label: new OO.ui.deferMsg('rationale'),
				align: 'inline',
			}),
		]);
		rationaleInput.on('change', function() {
			if(rationaleInput.value != "") {
				InputFilled = false;
			} else {
				InputFilled = true;
			}
		});
		TypeOfProtection.getMenu().on('choose', function(menuOption) {
			protectionType = menuOption.getData();
		});
		DurationOfProtection.getMenu().on('choose', function(duration) {
			protectionDuration = duration.getData();
		});
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, TypeOfAction.$element);
		this.$body.append(this.content.$element);
	};
	PageProtectionDialog.prototype.getActionProcess = function(action) {
		var dialog = this;
		if(action) {
			return new OO.ui.Process(function() {
				var placeholders = {
					$1: pageTitle,
					$2: protectionDuration,
					$3: protectionType,
					$4: rationaleInput.value,
				};
				var preparedContent = replacePlaceholders(contentPattern, placeholders);
				if(addNewSection) {
					apiParams = {
						action: "edit",
						title: noticeBoardTitle,
						section: 'new',
						sectiontitle: replaceParameter(sectionTitle, '1', pageTitle),
						text: preparedContent,
						summary: replaceParameter(apiPostSummary, '1', pageTitle),
						tags: "Adiutor",
						format: "json"
					};
					api.postWithToken('csrf', apiParams).done(function() {
						window.location = '/wiki/' + noticeBoardLink;
					});
				} else {
					if(sectionID) {
						apiParams = {
							action: 'edit',
							title: noticeBoardTitle,
							section: sectionID,
							summary: replaceParameter(apiPostSummary, '1', pageTitle),
							tags: 'Adiutor',
							format: 'json'
						};
						if(appendText) {
							apiParams.appendtext = preparedContent + "\n";
						} else if(prependText) {
							apiParams.prependtext = preparedContent + "\n";
						}
						api.postWithToken('csrf', apiParams).done(function() {
							window.location = '/wiki/' + noticeBoardLink;
						});
					} else {
						apiParams = {
							action: 'edit',
							title: noticeBoardTitle,
							summary: replaceParameter(apiPostSummary, '1', pageTitle),
							tags: 'Adiutor',
							format: 'json'
						};
						if(appendText) {
							apiParams.appendtext = preparedContent + "\n";
						} else if(prependText) {
							apiParams.prependtext = preparedContent + "\n";
						}
						api.postWithToken('csrf', apiParams).done(function() {
							window.location = '/wiki/' + noticeBoardLink;
						});
					}
				}
				dialog.close({
					action: action
				});
			});
		}
		return PageProtectionDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new PageProtectionDialog();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);

	function replacePlaceholders(input, replacements) {
		return input.replace(/\$(\d+)/g, function(match, group) {
			var replacement = replacements['$' + group];
			return replacement !== undefined ? replacement : match;
		});
	}

	function replaceParameter(input, parameterName, newValue) {
		const regex = new RegExp('\\$' + parameterName, 'g');
		if(input.includes('$' + parameterName)) {
			return input.replace(regex, newValue);
		} else {
			return input;
		}
	}
});
/* </nowiki> */