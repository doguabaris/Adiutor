/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Page move requests
 */
/* <nowiki> */
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));

function fetchApiData(callback) {
	var api = new mw.Api();
	api.get({
		action: "query",
		prop: "revisions",
		titles: "MediaWiki:Gadget-Adiutor-PMR.json",
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
	var addNewSection = jsonData.addNewSection;
	var appendText = jsonData.appendText;
	var prependText = jsonData.prependText;
	var sectionID = jsonData.sectionID;
	var contentPattern = jsonData.contentPattern;
	var apiPostSummary = jsonData.apiPostSummary;
	var sectionTitle = jsonData.sectionTitle;
	var pageTitle = mw.config.get("wgPageName").replace(/_/g, " ");

	function PageMoveRequestDialog(config) {
		PageMoveRequestDialog.super.call(this, config);
	}
	OO.inheritClass(PageMoveRequestDialog, OO.ui.ProcessDialog);
	PageMoveRequestDialog.static.name = 'PageMoveRequestDialog';
	PageMoveRequestDialog.static.title = new OO.ui.deferMsg('pmr-module-title');
	PageMoveRequestDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('create'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	PageMoveRequestDialog.prototype.initialize = function() {
		PageMoveRequestDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('pmr-header-title')
		});
		var headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('pmr-header-description')
		});
		headerTitleDescription.$element.css({
			'margin-top': '20px',
			'margin-bottom': '20px'
		});
		var requestRationale = new OO.ui.FieldsetLayout({});
		requestRationale.addItems([
			new OO.ui.FieldLayout(newPageName = new OO.ui.TextInputWidget({
				value: '',
				indicator: 'required',
			}), {
				label: new OO.ui.deferMsg('new-name'),
				help: new OO.ui.deferMsg('pmr-new-page-name-description')
			}),
			new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: new OO.ui.deferMsg('pmr-rationale-placeholder'),
				value: '',
				indicator: 'required',
			}), {
				label: new OO.ui.deferMsg('rationale'),
				align: 'inline',
			}),
		]);
		requestRationale.$element.css('font-weight', '900');
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, requestRationale.$element, rationaleInput.$element);
		this.$body.append(this.content.$element);
	};
	PageMoveRequestDialog.prototype.getActionProcess = function(action) {
		var dialog = this;
		if(action) {
			return new OO.ui.Process(function() {
				var placeholders = {
					$1: pageTitle,
					$2: newPageName.value,
					$3: rationaleInput.value,
				};
				var preparedContent = replacePlaceholders(contentPattern, placeholders);
				var apiParams = {
					action: 'edit',
					title: noticeBoardTitle,
					summary: replaceParameter(apiPostSummary, '1', pageTitle),
					tags: 'Adiutor',
					format: 'json'
				};
				if(addNewSection) {
					apiParams.section = 'new';
					apiParams.sectiontitle = replaceParameter(sectionTitle, '1', sectionTitle);
					apiParams.text = preparedContent;
				} else {
					if(sectionID) {
						apiParams.section = sectionID;
					}
					apiParams[appendText ? 'appendtext' : prependText ? 'prependtext' : 'text'] = preparedContent + '\n';
				}
				api.postWithToken('csrf', apiParams).done(function() {
					window.location = '/wiki/' + noticeBoardLink;
				});
				dialog.close({
					action: action
				});
			});
		}
		return PageMoveRequestDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new PageMoveRequestDialog();
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