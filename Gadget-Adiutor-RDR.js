/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Revision deletion requests
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
var deletionRationale, requestRationale;

function fetchApiData(callback) {
	var api = new mw.Api();
	api.get({
		action: "query",
		prop: "revisions",
		titles: "MediaWiki:Gadget-Adiutor-RDR.json",
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

	function revisionDeletionRequest(config) {
		revisionDeletionRequest.super.call(this, config);
	}
	OO.inheritClass(revisionDeletionRequest, OO.ui.ProcessDialog);
	revisionDeletionRequest.static.name = 'revisionDeletionRequest';
	revisionDeletionRequest.static.title = new OO.ui.deferMsg('rdr-module-title');
	revisionDeletionRequest.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('create'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	revisionDeletionRequest.prototype.initialize = function() {
		revisionDeletionRequest.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('rdr-header-title')
		});
		var headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('rdr-header-description')
		});
		headerTitleDescription.$element.css({
			"margin-top": "10px",
			"margin-left": "30px",
			"margin-bottom": "20px",
		});
		requestRationale = new OO.ui.FieldsetLayout({
			label: new OO.ui.deferMsg('rationale'),
		});
		requestRationale.addItems([
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-1').text(),
			}), {
				label: mw.message('rdr-rationale-1').text(),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-2').text(),
			}), {
				label: mw.message('rdr-rationale-2').text(),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-3').text(),
			}), {
				label: mw.message('rdr-rationale-3').text(),
				align: 'inline'
			}), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-4').text(),
			}), {
				label: mw.message('rdr-rationale-4').text(),
				align: 'inline'
			}), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-5').text(),
			}), {
				label: mw.message('rdr-rationale-5').text(),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(commentInput = new OO.ui.MultilineTextInputWidget({
				placeholder: mw.message('rdr-comment-placeholder').text(),
				value: '',
			}), {
				label: mw.message('comment').text(),
				align: 'inline',
			}),
		]);
		revisionField = new OO.ui.FieldLayout(revisionNumber = new OO.ui.TextInputWidget({
				value: mw.config.get("wgRevisionId")
			}), {
				label: mw.message('revision-id').text(),
				help: mw.message('rdr-revision-id-help').text(),
			}),
			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, requestRationale.$element, commentInput.$element, revisionField.$element);
		this.$body.append(this.content.$element);
	};
	revisionDeletionRequest.prototype.getActionProcess = function(action) {
		var dialog = this;
		if(action) {
			return new OO.ui.Process(function() {
				requestRationale.items.forEach(function(Rationale) {
					if(Rationale.fieldWidget.selected) {
						deletionRationale = Rationale.fieldWidget.data;
					}
				});
				var placeholders = {
					$1: revisionNumber.value,
					$2: deletionRationale,
					$3: commentInput.value,
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
		return revisionDeletionRequest.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new revisionDeletionRequest();
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