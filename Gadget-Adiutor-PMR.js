/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Page Move Request
<nowiki> */
function callBack() {
	var api = new mw.Api();
	var pmrConfiguration = require('./Adiutor-PMR.json');
	if(!pmrConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-PMR.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}
	var noticeBoardTitle = pmrConfiguration.noticeBoardTitle;
	var noticeBoardLink = noticeBoardTitle.replace(/ /g, '_');
	var addNewSection = pmrConfiguration.addNewSection;
	var appendText = pmrConfiguration.appendText;
	var prependText = pmrConfiguration.prependText;
	var sectionId = pmrConfiguration.sectionId;
	var contentPattern = pmrConfiguration.contentPattern;
	var apiPostSummary = pmrConfiguration.apiPostSummary;
	var sectionTitle = pmrConfiguration.sectionTitle;
	var pageTitle = mw.config.get("wgPageName").replace(/_/g, " ");

	function pageMoveRequestDialog(config) {
		pageMoveRequestDialog.super.call(this, config);
	}
	OO.inheritClass(pageMoveRequestDialog, OO.ui.ProcessDialog);
	pageMoveRequestDialog.static.name = 'pageMoveRequestDialog';
	pageMoveRequestDialog.static.title = new OO.ui.deferMsg('pmr-module-title');
	pageMoveRequestDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('create'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	pageMoveRequestDialog.prototype.initialize = function() {
		pageMoveRequestDialog.super.prototype.initialize.apply(this, arguments);
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
	pageMoveRequestDialog.prototype.getActionProcess = function(action) {
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
					apiParams.sectiontitle = replaceParameter(sectionTitle, '1', pageTitle);
					apiParams.text = preparedContent;
				} else {
					if(sectionId) {
						apiParams.section = sectionId;
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
		return pageMoveRequestDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new pageMoveRequestDialog();
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