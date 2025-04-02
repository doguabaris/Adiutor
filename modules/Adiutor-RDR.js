/* <nowiki> */

/**
 * @file Adiutor-RDR.js
 * @description Revision deletion request module for reporting revisions for oversight or removal.
 * @license CC BY-SA 4.0
 * @see https://meta.wikimedia.org/wiki/Adiutor
 * @author Doğu Abaris <abaris@null.net>
 */

function callBack() {
	const api = new mw.Api();
	const rdrConfiguration = require('./Adiutor-RDR.json');
	let deletionRationale, requestRationale;
	if (!rdrConfiguration) {
		mw.notify('MediaWiki:Gadget-Adiutor-RDR.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}
	const noticeBoardTitle = rdrConfiguration.noticeBoardTitle;
	const noticeBoardLink = noticeBoardTitle.replace(/ /g, '_');
	const addNewSection = rdrConfiguration.addNewSection;
	const appendText = rdrConfiguration.appendText;
	const prependText = rdrConfiguration.prependText;
	const sectionId = rdrConfiguration.sectionId;
	const contentPattern = rdrConfiguration.contentPattern;
	const apiPostSummary = rdrConfiguration.apiPostSummary;
	const sectionTitle = rdrConfiguration.sectionTitle;
	const pageTitle = mw.config.get('wgPageName').replace(/_/g, ' ');

	function RevisionDeletionRequest(config) {
		RevisionDeletionRequest.super.call(this, config);
	}
	OO.inheritClass(RevisionDeletionRequest, OO.ui.ProcessDialog);
	RevisionDeletionRequest.static.name = 'RevisionDeletionRequest';
	RevisionDeletionRequest.static.title = new OO.ui.deferMsg('rdr-module-title');
	RevisionDeletionRequest.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('create'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	RevisionDeletionRequest.prototype.initialize = function() {
		RevisionDeletionRequest.super.prototype.initialize.apply(this, arguments);
		const headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('rdr-header-title')
		});
		const headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('rdr-header-description')
		});
		headerTitleDescription.$element.css({
			'margin-top': '10px',
			'margin-left': '30px',
			'margin-bottom': '20px'
		});
		requestRationale = new OO.ui.FieldsetLayout({
			label: new OO.ui.deferMsg('rationale')
		});
		requestRationale.addItems([
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-1').text()
			}), {
				label: mw.message('rdr-rationale-1').text(),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-2').text()
			}), {
				label: mw.message('rdr-rationale-2').text(),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-3').text()
			}), {
				label: mw.message('rdr-rationale-3').text(),
				align: 'inline'
			}), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-4').text()
			}), {
				label: mw.message('rdr-rationale-4').text(),
				align: 'inline'
			}), new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
				selected: false,
				data: mw.message('rdr-rationale-5').text()
			}), {
				label: mw.message('rdr-rationale-5').text(),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(commentInput = new OO.ui.MultilineTextInputWidget({
				placeholder: mw.message('rdr-comment-placeholder').text(),
				value: ''
			}), {
				label: mw.message('comment').text(),
				align: 'inline'
			})
		]);
		revisionField = new OO.ui.FieldLayout(revisionNumber = new OO.ui.TextInputWidget({
				value: mw.config.get('wgRevisionId')
			}), {
				label: mw.message('revision-id').text(),
				help: mw.message('rdr-revision-id-help').text()
			}),
			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, requestRationale.$element, commentInput.$element, revisionField.$element);
		this.$body.append(this.content.$element);
	};
	RevisionDeletionRequest.prototype.getActionProcess = function(action) {
		const dialog = this;
		if (action) {
			return new OO.ui.Process(() => {
				requestRationale.items.forEach((Rationale) => {
					if (Rationale.fieldWidget.selected) {
						deletionRationale = Rationale.fieldWidget.data;
					}
				});
				const placeholders = {
					$1: revisionNumber.value,
					$2: deletionRationale,
					$3: commentInput.value
				};
				const preparedContent = replacePlaceholders(contentPattern, placeholders);
				const apiParams = {
					action: 'edit',
					title: noticeBoardTitle,
					summary: replaceParameter(apiPostSummary, '1', pageTitle),
					tags: 'Adiutor',
					format: 'json'
				};
				if (addNewSection) {
					apiParams.section = 'new';
					apiParams.sectiontitle = replaceParameter(sectionTitle, '1', pageTitle);
					apiParams.text = preparedContent;
				} else {
					if (sectionId) {
						apiParams.section = sectionId;
					}
					apiParams[appendText ? 'appendtext' : prependText ? 'prependtext' : 'text'] = preparedContent + '\n';
				}
				api.postWithToken('csrf', apiParams).done(() => {
					window.location = '/wiki/' + noticeBoardLink;
				});
				dialog.close({
					action: action
				});
			});
		}
		return RevisionDeletionRequest.super.prototype.getActionProcess.call(this, action);
	};
	const windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	const dialog = new RevisionDeletionRequest();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);

	function replacePlaceholders(input, replacements) {
		return input.replace(/\$(\d+)/g, (match, group) => {
			const replacement = replacements['$' + group];
			return replacement !== undefined ? replacement : match;
		});
	}

	function replaceParameter(input, parameterName, newValue) {
		const regex = new RegExp('\\$' + parameterName, 'g');
		if (input.includes('$' + parameterName)) {
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
