/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Request Page Protection
<nowiki> */
function callBack() {
	var api = new mw.Api();
	var apiParams = {};
	var rppConfiguration = require('./Adiutor-RPP.json');
	var protectionType, protectionDuration;
	if(!rppConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-RPP.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}
	var noticeBoardTitle = rppConfiguration.noticeBoardTitle;
	var noticeBoardLink = noticeBoardTitle.replace(/ /g, '_');
	var protectionDurations = rppConfiguration.protectionDurations;
	var protectionTypes = rppConfiguration.protectionTypes;
	var addNewSection = rppConfiguration.addNewSection;
	var appendText = rppConfiguration.appendText;
	var prependText = rppConfiguration.prependText;
	var sectionId = rppConfiguration.sectionId;
	var contentPattern = rppConfiguration.contentPattern;
	var apiPostSummary = rppConfiguration.apiPostSummary;
	var sectionTitle = rppConfiguration.sectionTitle;
	var pageTitle = mw.config.get("wgPageName").replace(/_/g, " ");

	function pageProtectionDialog(config) {
		pageProtectionDialog.super.call(this, config);
	}
	OO.inheritClass(pageProtectionDialog, OO.ui.ProcessDialog);
	pageProtectionDialog.static.name = 'pageProtectionDialog';
	pageProtectionDialog.static.title = new OO.ui.deferMsg('rpp-module-title');
	pageProtectionDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('create-request'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	pageProtectionDialog.prototype.initialize = function() {
		pageProtectionDialog.super.prototype.initialize.apply(this, arguments);
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
		typeOfAction = new OO.ui.FieldsetLayout({
			label: new OO.ui.deferMsg('protection-type')
		});
		typeOfAction.addItems([
			durationOfProtection = new OO.ui.DropdownWidget({
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
			typeOfProtection = new OO.ui.DropdownWidget({
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
		typeOfProtection.getMenu().on('choose', function(menuOption) {
			protectionType = menuOption.getData();
		});
		durationOfProtection.getMenu().on('choose', function(duration) {
			protectionDuration = duration.getData();
		});
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, typeOfAction.$element);
		this.$body.append(this.content.$element);
	};
	pageProtectionDialog.prototype.getActionProcess = function(action) {
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
					if(sectionId) {
						apiParams = {
							action: 'edit',
							title: noticeBoardTitle,
							section: sectionId,
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
		return pageProtectionDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new pageProtectionDialog();
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
}
module.exports = {
	callBack: callBack
};
/* </nowiki> */