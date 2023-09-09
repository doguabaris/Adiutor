/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: User warning
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var api = new mw.Api();
var mwConfig = mw.config.get(["wgPageName", "wgNamespaceNumber"]);
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
var RequestRationale, warningData;

function fetchApiData(callback) {
	var api = new mw.Api();
	api.get({
		action: "query",
		prop: "revisions",
		titles: "MediaWiki:Gadget-Adiutor-WRN.json",
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
		mw.notify('MediaWiki:Gadget-Adiutor-WRN.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		// You may choose to stop code execution here
		return;
	}
	var userWarnings = jsonData.userWarnings;
	var apiPostSummary = jsonData.apiPostSummary;
	var warningMessageTitle = jsonData.warningMessageTitle;
	var userPagePrefix = jsonData.userPagePrefix;
	var userTalkPagePrefix = jsonData.userTalkPagePrefix;
	var specialContibutions = jsonData.specialContibutions;
	var userWarned = userTalkPagePrefix + mwConfig.wgPageName.replace(/_/g, " ").replace(userPagePrefix, '').replace(specialContibutions, '').replace(userTalkPagePrefix, '');

	function UserWarningDialog(config) {
		UserWarningDialog.super.call(this, config);
	}
	OO.inheritClass(UserWarningDialog, OO.ui.ProcessDialog);
	UserWarningDialog.static.name = 'UserWarningDialog';
	UserWarningDialog.static.title = new OO.ui.deferMsg('wrn-module-title');
	UserWarningDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('warn'),
		flags: ['primary', 'progressive'],
		id: 'warn-button'
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	UserWarningDialog.prototype.initialize = function() {
		UserWarningDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('wrn-dialog-description')
		});
		headerTitle.$element.css('margin-top', '20px');
		var RationaleSelector = new OO.ui.DropdownWidget({
			menu: {
				items: userWarnings.map(function(warning) {
					return new OO.ui.MenuOptionWidget({
						data: warning,
						label: warning.label
					});
				})
			},
			label: new OO.ui.deferMsg('warning-type'),
		});
		RationaleSelector.getMenu().on('choose', function(menuOption) {
			warningData = menuOption.getData();
			console.log(warningData);
		});
		RationaleSelector.$element.css('margin-top', '20px');
		relatedPageField = new OO.ui.FieldLayout(relatedPage = new OO.ui.TextInputWidget({
			value: '',
			required: true
		}), {
			label: new OO.ui.deferMsg('related-page'),
			help: new OO.ui.deferMsg('wrn-related-page-help')
		});
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		warningLevel = new OO.ui.RadioSelectInputWidget({
			options: [{
				data: 1,
				label: new OO.ui.deferMsg('wrn-user-mildly'),
			}, {
				data: 2,
				label: new OO.ui.deferMsg('wrn-user-seriously'),
			}, {
				data: 3,
				label: new OO.ui.deferMsg('wrn-user-sternly'),
			}, ]
		});
		relatedPageField.$element.css({
			'margin-top': '20px',
			'margin-bottom': '20px'
		});
		this.content.$element.append(headerTitle.$element, RationaleSelector.$element, relatedPageField.$element, warningLevel.$element);
		this.$body.append(this.content.$element);
	};
	UserWarningDialog.prototype.getActionProcess = function(action) {
		if(action === 'save') {
			if(relatedPage.value === '' || !warningData) {
				// If the related page is empty or warning data is missing, show an error notification.
				if(!relatedPage.value) {
					mw.notify(mw.message('related-page-required').text(), {
						title: mw.msg('operation-failed'),
						type: 'error'
					});
				} else {
					mw.notify(mw.message('warning-required').text(), {
						title: mw.msg('operation-failed'),
						type: 'error'
					});
				}
			} else {
				// If the action is 'save', proceed to warn the user and close the dialog.
				return new OO.ui.Process(function() {
					warnUser(warningData);
					dialog.close({
						action: action
					});
				});
			}
		}
		return UserWarningDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new UserWarningDialog();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);

	function warnUser(warningData) {
		api.postWithEditToken({
			action: 'edit',
			title: userWarned,
			section: 'new',
			sectiontitle: warningMessageTitle,
			text: '{{subst:ADT-WT|' + warningLevel.getValue() + '|' + warningData.title + '|' + warningData.body.replace(/\$1/g, '[[' + relatedPage.value + ']]') + '|~~~~}}',
			summary: apiPostSummary,
			tags: 'Adiutor',
			watchlist: 'unwatch',
			format: 'json'
		}).done(function() {
			window.location = '/wiki/' + userTalkPagePrefix + mwConfig.wgPageName.replace(/_/g, " ").replace(userPagePrefix, '').replace(specialContibutions, '').replace(userTalkPagePrefix, '');
			adiutorUserOptions.stats.userWarnings++;
			api.postWithEditToken({
				action: 'globalpreferences',
				format: 'json',
				optionname: 'userjs-adiutor',
				optionvalue: JSON.stringify(adiutorUserOptions),
				formatversion: 2,
			}).done(function() {});
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