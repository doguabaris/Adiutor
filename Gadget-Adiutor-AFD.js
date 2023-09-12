var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
var mwConfig = mw.config.get(["wgArticleId", "wgPageName", "wgUserName"]);
var nominatedPreviously;
var nextNominationNumber = 0;

function fetchApiData(callback) {
	api.get({
		action: "query",
		prop: "revisions",
		titles: "MediaWiki:Gadget-Adiutor-AFD.json",
		rvprop: "content",
		formatversion: 2
	}).done(function(data) {
		var content = data.query.pages[0].revisions[0].content;
		try {
			var jsonData = JSON.parse(content);
			callback(jsonData);
		} catch(error) {
			mw.notify('Failed to parse JSON data from API.', {
				title: mw.msg('operation-failed'),
				type: 'error'
			});
		}
	}).fail(function() {
		mw.notify('Failed to fetch data from the API.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
	});
}
fetchApiData(function(jsonData) {
	if(!jsonData) {
		mw.notify('MediaWiki:Adiutor-UBM.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		return;
	}
	var afdTemplate = jsonData.afdTemplate;
	var afdPageTitleForMultipleNomination = jsonData.afdPageTitleForMultipleNomination;
	var apiPostSummary = jsonData.apiPostSummary;
	var apiPostSummaryforCreator = jsonData.apiPostSummaryforCreator;
	var apiPostSummaryforUserLog = jsonData.apiPostSummaryforUserLog;
	var apiPostSummaryforAfdPage = jsonData.apiPostSummaryforAfdPage;
	var apiPostSummaryforAfdLog = jsonData.apiPostSummaryforAfdLog;
	var addNominationToNoticeboard = jsonData.addNominationToNoticeboard;
	var contentPattern = jsonData.contentPattern;
	var noticeBoardTitle = jsonData.noticeBoardTitle;
	var noticeBoardLink = noticeBoardTitle.replace(/ /g, '_');
	var logNominations = jsonData.logNominations;
	var afdLogPage = jsonData.afdLogPage;
	var afdNotificationTemplate = jsonData.afdNotificationTemplate;
	var userLogText = jsonData.userLogText;
	var userPagePrefix = jsonData.userPagePrefix;
	var userTalkPagePrefix = jsonData.userTalkPagePrefix;
	var specialContibutions = jsonData.specialContibutions;
	var localMonthsNames = jsonData.localMonthsNames;
	var addNominationToNoticeboardByFindLast = jsonData.addNominationToNoticeboardByFindLast;
	var addNewSection = jsonData.addNewSection;
	var sectionTitle = jsonData.sectionTitle;
	var appendText = jsonData.appendText;
	var prependText = jsonData.prependText;
	var sectionId = jsonData.sectionId;
	var pageTitle = mw.config.get("wgPageName").replace(/_/g, " ");

	function articleForDeletionDialog(config) {
		articleForDeletionDialog.super.call(this, config);
	}
	OO.inheritClass(articleForDeletionDialog, OO.ui.ProcessDialog);
	articleForDeletionDialog.static.name = 'articleForDeletionDialog';
	articleForDeletionDialog.static.title = new OO.ui.deferMsg('afd-module-title');
	articleForDeletionDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('continue'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	articleForDeletionDialog.prototype.initialize = function() {
		articleForDeletionDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('afd-header-title')
		});
		var headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('afd-header-description')
		});
		headerTitleDescription.$element.css({
			'margin-top': '20px',
			'margin-bottom': '20px'
		});
		afdOptions = new OO.ui.FieldsetLayout({});
		afdOptions.addItems([
			rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
				placeholder: new OO.ui.deferMsg('afd-rationale-placeholder'),
				indicator: 'required',
				value: '',
			}), {
				label: new OO.ui.deferMsg('rationale'),
				align: 'inline',
			}),
			new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
				value: adiutorUserOptions.articlesForDeletion.afdSendMessageToCreator,
				data: 'informCreator'
			}), {
				label: new OO.ui.deferMsg('afd-inform-creator'),
				align: 'top',
				help: new OO.ui.deferMsg('afd-inform-creator-help'),
			}),
		]);
		rationaleField.$element.css('font-weight', '900');
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false,
			isDraggable: true
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, afdOptions.$element);
		this.$body.append(this.content.$element);
	};
	articleForDeletionDialog.prototype.getActionProcess = function(action) {
		var dialog = this;
		if(action) {
			return new OO.ui.Process(function() {
				var afdTempalte;
				var ActionOptions = [];
				afdOptions.items.forEach(function(Option) {
					if(Option.fieldWidget.selected) {
						ActionOptions.push({
							value: Option.fieldWidget.value,
							selected: Option.fieldWidget.selected
						});
					}
					if(Option.fieldWidget.value === true) {
						ActionOptions.push({
							value: Option.fieldWidget.value,
							data: Option.fieldWidget.data
						});
					}
				});
				ActionOptions.forEach(function(Option) {
					if(Option.data === "informCreator") {
						console.log(Option.data);
						getCreator().then(function(data) {
							var Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
							if(!mw.util.isIPAddress(Author)) {
								var message = replaceParameter(afdNotificationTemplate, '1', pageTitle);
								sendMessageToAuthor(Author, message);
							}
						});
					}
				});
				checkPreviousNominations(noticeBoardTitle + "/" + mwConfig.wgPageName).then(function(data) {
					if(data.query.pages["-1"]) {
						var nomCount = 0;
						console.log(nomCount);
						nominatedPreviously = false;
						putAfDTemplate(afdTemplate, nextNominationNumber);
					} else {
						Rec(2);
					}
				});

				function Rec(nomCount) {
					var placeholders = {
						$1: pageTitle,
						$2: nomCount,
					};
					var newNominationTitle = replacePlaceholders(afdPageTitleForMultipleNomination, placeholders);
					checkPreviousNominations(noticeBoardTitle + "/" + newNominationTitle).then(function(data) {
						if(!data.query.pages["-1"]) {
							Rec(nomCount + 1);
						} else {
							nextNominationNumber = nomCount++;
							console.log(nextNominationNumber);
							if(nextNominationNumber > 1) {
								afdTempalte = afdTemplate;
							} else {
								afdTempalte = afdTemplate;
							}
							console.log(afdTempalte);
							putAfDTemplate(afdTempalte, nextNominationNumber);
						}
					});
				}
				dialog.close({
					action: action
				});
				showProgress();
			});
		}
		return articleForDeletionDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new articleForDeletionDialog({
		size: 'large',
		classes: ['afd-helper-window'],
		isDraggable: true
	});
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

	function putAfDTemplate(afdTempalte, nextNominationNumber) {
		var nominatedPageTitle;
		if(nextNominationNumber > 1) {
			var placeholders = {
				$1: pageTitle,
				$2: nextNominationNumber,
			};
			var nominatedPageTitle = replacePlaceholders(afdPageTitleForMultipleNomination, placeholders);
		} else {
			nominatedPageTitle = mwConfig.wgPageName;
		}
		api.postWithToken('csrf', {
			action: 'edit',
			title: mwConfig.wgPageName,
			prependtext: afdTempalte + "\n",
			summary: apiPostSummary,
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			createNominationPage(nominatedPageTitle);
			logNomination(nominatedPageTitle, adiutorUserOptions);
		});
	}

	function checkPreviousNominations(title) {
		return api.get({
			action: 'query',
			prop: 'revisions',
			rvlimit: 1,
			rvprop: ['user'],
			rvdir: 'newer',
			titles: title,
		});
	}

	function createNominationPage(nominatedPageTitle) {
		var placeholders = {
			$1: pageTitle,
			$2: nomCount,
			$3: rationaleInput.value,
		};
		var preparedContent = replacePlaceholders(contentPattern, placeholders);
		api.postWithToken('csrf', {
			action: 'edit',
			title: noticeBoardTitle + nominatedPageTitle,
			appendtext: preparedContent,
			summary: apiPostSummary,
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			addNominationToAfdPage(nominatedPageTitle);
		});
	}
	if(addNominationToNoticeboard) {
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
	}
	if(addNominationToNoticeboardByFindLast) {
		var pageContent;
		api.get({
			action: 'parse',
			page: noticeBoardTitle,
			prop: 'wikitext',
			format: "json"
		}).done(function(data) {
			pageContent = data.parse.wikitext['*'];
			var NominatedBefore = pageContent.includes("{{" + noticeBoardTitle + "/" + nominatedPageTitle.replace(/_/g, " ") + "}}");
			if(!NominatedBefore) {
				api.postWithToken('csrf', {
					action: 'edit',
					title: noticeBoardTitle,
					appendtext: "\n" + "{{" + noticeBoardTitle + "/" + nominatedPageTitle.replace(/_/g, " ") + "}}",
					summary: apiPostSummaryforAfdPage,
					tags: 'Adiutor',
					format: 'json'
				}).done(function() {
					if(logNominations) {
						addNominationToAfdLogPage(nominatedPageTitle);
					}
					adiutorUserOptions.stats.afdRequests++;
					api.postWithEditToken({
						action: 'globalpreferences',
						format: 'json',
						optionname: 'userjs-adiutor-' + mw.config.get('wgWikiID'),
						optionvalue: JSON.stringify(adiutorUserOptions),
						formatversion: 2,
					}, function() {});
				});
			}
		});
	} else {
		if(logNominations) {
			addNominationToAfdLogPage(nominatedPageTitle);
		}
	}

	function addNominationToAfdLogPage(nominatedPageTitle) {
		var date = new Date();
		var date_year = date.getUTCFullYear();
		var month_name = localMonthsNames[date.getUTCMonth()];
		var day = date.getUTCDate();
		var pageContent;
		api.get({
			action: 'parse',
			page: afdLogPage + date_year + "_" + month_name + "_" + day,
			prop: 'wikitext',
			format: "json"
		}).done(function(data) {
			pageContent = data.parse.wikitext['*'];
			var NominatedBefore = pageContent.includes("{{" + noticeBoardTitle + "/" + nominatedPageTitle.replace(/_/g, " ") + "}}");
			if(!NominatedBefore) {
				api.postWithToken('csrf', {
					action: 'edit',
					title: afdLogPage + date_year + "_" + month_name + "_" + day,
					appendtext: "\n" + "{{" + noticeBoardTitle + "/" + nominatedPageTitle.replace(/_/g, " ") + "}}",
					summary: apiPostSummaryforAfdLog,
					tags: 'Adiutor',
					format: 'json'
				}).done(function() {
					window.location = '/wiki/' + noticeBoardTitle + '/' + nominatedPageTitle.replace(/_/g, " ");
				});
			} else {
				window.location = '/wiki/' + noticeBoardTitle + '/' + nominatedPageTitle.replace(/_/g, " ");
			}
		});
	}

	function logNomination() {
		if(adiutorUserOptions.speedyDeletion.afdLogNominatedPages === true) {
			var currentDate = new Date();
			var currentMonthYear = currentDate.toLocaleString(localLangCode, {
				month: 'long',
				year: 'numeric'
			});
			var sectionTitle = "== " + currentMonthYear + " ==";
			var newContent;
			api.get({
				action: 'parse',
				page: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.afdLogPageName + '').split(' ').join('_'),
				format: 'json',
				prop: 'wikitext'
			}).then(function(data) {
				var pageContent = data.parse.wikitext['*'];
				if(pageContent.includes(sectionTitle)) {
					newContent = pageContent.replace(sectionTitle, sectionTitle + "\n" + replaceParameter(userLogText, '1', pageTitle));
				} else {
					newContent = pageContent + "\n\n" + sectionTitle + "\n" + replaceParameter(userLogText, '1', pageTitle);
				}
				return api.postWithToken('csrf', {
					action: 'edit',
					title: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.csdLogPageName + '').split(' ').join('_'),
					text: newContent,
					summary: replaceParameter(apiPostSummaryforUserLog, '1', pageTitle),
					tags: 'Adiutor',
					format: 'json'
				});
			}).catch(function(error) {
				console.error('Error:', error);
				api.postWithToken('csrf', {
					action: 'edit',
					title: userPagePrefix.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.speedyDeletion.afdLogPageName + '').split(' ').join('_'),
					section: 'new',
					sectiontitle: sectionTitle,
					text: replaceParameter(userLogText, '1', pageTitle),
					summary: replaceParameter(apiPostSummaryforUserLog, '1', pageTitle),
					format: 'json',
				}).done(function() {});
			});
		}
	}

	function getCreator() {
		return api.get({
			action: 'query',
			prop: 'revisions',
			rvlimit: 1,
			rvprop: ['user'],
			rvdir: 'newer',
			titles: mwConfig.wgPageName.replace(/_/g, " ")
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
		}).done(function() {});
	}

	function showProgress() {
		var processStartedDialog = new OO.ui.MessageDialog();
		var progressBar = new OO.ui.ProgressBarWidget();
		var windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		windowManager.addWindows([processStartedDialog]);
		windowManager.openWindow(processStartedDialog, {
			title: mw.msg('processing'),
			message: progressBar.$element
		});
	}
});