/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Proposed deletion
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["wgArticleId", "wgPageName", "wgUserGroups", "wgUserName"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));

function fetchApiData(callback) {
	var api = new mw.Api();
	api.get({
		action: "query",
		prop: "revisions",
		titles: "MediaWiki:Gadget-Adiutor-PRD.json",
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
	var standardProposeTemplate = jsonData.standardProposeTemplate;
	var livingPersonProposeTemplate = jsonData.livingPersonProposeTemplate;
	var apiPostSummary = jsonData.apiPostSummary;
	var apiPostSummaryforCreator = jsonData.apiPostSummaryforCreator;
	var apiPostSummaryforLog = jsonData.apiPostSummaryforLog;
	var localMonthsNames = jsonData.localMonthsNames;
	var userPagePrefix = jsonData.userPagePrefix;
	var userTalkPagePrefix = jsonData.userTalkPagePrefix;
	var prodNotificationTemplate = jsonData.prodNotificationTemplate;
	var pageTitle = mw.config.get("wgPageName").replace(/_/g, " ");

	function ProposedDeletionDialog(config) {
		ProposedDeletionDialog.super.call(this, config);
	}
	OO.inheritClass(ProposedDeletionDialog, OO.ui.ProcessDialog);
	ProposedDeletionDialog.static.name = 'ProposedDeletionDialog';
	ProposedDeletionDialog.static.title = new OO.ui.deferMsg('rpp-module-title');
	ProposedDeletionDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('propose'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	ProposedDeletionDialog.prototype.initialize = function() {
		ProposedDeletionDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('prd-header-title')
		});
		var headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('prd-header-description')
		});
		headerTitleDescription.$element.css({
			"margin-top": "10px",
			"margin-left": "30px",
			"margin-bottom": "20px",
		});
		ProposeOptions = new OO.ui.FieldsetLayout({
			label: new OO.ui.deferMsg('prd-deletion-type')
		});
		ProposeOptions.addItems([
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				value: 'standardPropose'
			}), {
				label: new OO.ui.deferMsg('prd-deletion-type-1'),
				help: new OO.ui.deferMsg('prd-deletion-type-1-help'),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				value: 'LivingPersonPropose'
			}), {
				label: new OO.ui.deferMsg('prd-deletion-type-2'),
				help: new OO.ui.deferMsg('prd-deletion-type-2-help'),
				align: 'inline'
			}), rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: new OO.ui.deferMsg('prd-deletion-rationale'),
				indicator: 'required',
				value: '',
			}), {
				label: new OO.ui.deferMsg('rationale'),
				align: 'inline',
			}),
			new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
				value: adiutorUserOptions.proposedDeletion.prdSendMessageToCreator,
				data: 'informCreator'
			}), {
				label: new OO.ui.deferMsg('afd-inform-creator'),
				align: 'top',
				help: new OO.ui.deferMsg('afd-inform-creator-help'),
			})
		]);
		rationaleInput.on('change', function() {
			if(rationaleInput.value != "") {
				InputFilled = false;
			} else {
				InputFilled = true;
			}
		});
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, ProposeOptions.$element);
		this.$body.append(this.content.$element);
	};
	ProposedDeletionDialog.prototype.getActionProcess = function(action) {
		var dialog = this;
		if(action) {
			return new OO.ui.Process(function() {
				var date = new Date();
				var Months = localMonthsNames;
				var PRDText;
				var PRDoptions = [];
				ProposeOptions.items.forEach(function(Option) {
					if(Option.fieldWidget.selected) {
						PRDoptions.push({
							value: Option.fieldWidget.value,
							selected: Option.fieldWidget.selected
						});
					}
					if(Option.fieldWidget.value === true) {
						PRDoptions.push({
							value: Option.fieldWidget.value,
							data: Option.fieldWidget.data
						});
					}
				});
				PRDoptions.forEach(function(Option) {
					if(Option.value === "standardPropose") {
						var placeholders = {
							$1: pageTitle,
							$2: rationaleInput.value,
							$3: date.getDate(),
							$4: Months[date.getUTCMonth()],
							$5: date.getUTCFullYear(),
							$6: mwConfig.wgUserName,
						};
						var preparedContent = replacePlaceholders(standardProposeTemplate, placeholders);
						PRDText = preparedContent;
					}
					if(Option.value === "LivingPersonPropose") {
						PRDText = livingPersonProposeTemplate;
					}
					if(Option.data === "informCreator") {
						getCreator().then(function(data) {
							var Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
							if(!mw.util.isIPAddress(Author)) {
								var message = replaceParameter(prodNotificationTemplate, '1', pageTitle);
								sendMessageToAuthor(Author, message);
							}
						});
					}
				});
				putPRDTemplate(PRDText);
				logRequest(rationaleInput.value, adiutorUserOptions);
				dialog.close({
					action: action
				});
			});
		}
		return ProposedDeletionDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new ProposedDeletionDialog();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);

	function putPRDTemplate(PRDText) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: mwConfig.wgPageName,
			prependtext: PRDText + "\n",
			summary: replaceParameter(apiPostSummary, '1', pageTitle),
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			adiutorUserOptions.stats.prodRequests++;
			api.postWithEditToken({
				action: 'globalpreferences',
				format: 'json',
				optionname: 'userjs-adiutor',
				optionvalue: JSON.stringify(adiutorUserOptions),
				formatversion: 2,
			}).done(function() {});
			location.reload();
		});
	}

	function logRequest(rationaleInput, adiutorUserOptions) {
		if(adiutorUserOptions.proposedDeletion.prdLogNominatedPages === true) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.proposedDeletion.prdLogNominatedPages + '').split(' ').join('_'),
				appendtext: "\n" + "# '''[[" + pageTitle + "|" + pageTitle + "]]''' " + rationaleInput + " ~~~~~",
				summary: replaceParameter(apiPostSummaryforLog, '1', pageTitle),
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {});
		}
	}

	function getCreator() {
		return api.get({
			action: 'query',
			prop: 'revisions',
			rvlimit: 1,
			rvprop: ['user'],
			rvdir: 'newer',
			titles: mwConfig.wgPageName
		});
	}

	function sendMessageToAuthor(Author, message) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: userTalkPagePrefix + Author,
			appendtext: '\n' + message,
			summary: replaceParameter(apiPostSummaryforCreator, '1', pageTitle),
			tags: 'Adiutor',
			format: 'json'
		});
	}

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