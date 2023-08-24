/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Adiutor User Dashboard
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
var ArticleListforCsd = [];

function updateArticleList() {
	var apiUrl = "https://tr.wikipedia.org/w/api.php";
	var categoryTitle = "Kategori:Hızlı_silinmeye_aday_sayfalar";
	var params = {
		action: "query",
		format: "json",
		list: "categorymembers",
		cmtitle: categoryTitle,
		cmlimit: 1000, // İstenen sonuç sayısı
	};
	$.ajax({
		url: apiUrl,
		data: params,
		dataType: "jsonp",
		success: function(data) {
			var pages = data.query.categorymembers;
			pages.forEach(function(page) {
				var pageTitle = page.title;
				var pageId = page.pageid;
				var pageNamespace = page.ns;
				var contentParams = {
					action: "parse",
					format: "json",
					pageid: pageId,
					prop: "text" // Sayfa içeriğini HTML olarak almak için "text"
				};
				$.ajax({
					url: apiUrl,
					data: contentParams,
					dataType: "jsonp",
					success: function(contentData) {
						var pageContent = contentData.parse.text["*"];
						ArticleListforCsd.push({
							label: pageTitle,
							content: pageContent,
							namespace: pageNamespace
						});
						mw.storage.session.set('ArticleListforCsd', JSON.stringify(ArticleListforCsd));
					}
				});
			});
		}
	});
}
updateArticleList();

function SectionOneLayout(name, config) {
	SectionOneLayout.super.call(this, name, config);
	var currentUserWelcomeText = new OO.ui.LabelWidget({
		label: mw.msg('hello'),
		classes: ['adiutor-user-dashboard-welcome-text']
	});
	var currentUserWelcomeUsername = new OO.ui.LabelWidget({
		label: mwConfig.wgUserName,
		classes: ['adiutor-user-dashboard-welcome-username']
	});
	var adiutorDashboardLogo = new OO.ui.LabelWidget({
		label: '',
		classes: ['adiutor-user-dashboard-logo']
	});
	var myTalkButton = new OO.ui.ButtonWidget({
		label: mw.msg('my-talk-page'),
		icon: 'speechBubbles',
		flags: ['progressive']
	});
	myTalkButton.on('click', function() {
		window.open('/wiki/Kullanıcı_mesaj:' + mwConfig.wgUserName + '', '_blank');
	});
	var myContributionsButton = new OO.ui.ButtonWidget({
		label: mw.msg('my-contributions'),
		icon: 'userContributions',
		flags: ['progressive']
	});
	myContributionsButton.on('click', function() {
		window.open('/wiki/Özel:Katkılar/' + mwConfig.wgUserName + '', '_blank');
	});
	var buttonsContainer = new OO.ui.StackLayout({
		items: [myTalkButton, myContributionsButton],
		continuous: true
	});
	var totalEditCount = Object.values(adiutorUserOptions.stats).reduce(function(acc, value) {
		return acc + value;
	}, 0);
	var adiutorDashboardTotalStats = new OO.ui.MessageWidget({
		type: 'success',
		icon: 'edit',
		inline: false,
		label: new OO.ui.HtmlSnippet(mw.msg('adiutor-dashboard-total-edit', totalEditCount)),
		classes: ['adiutor-user-dashboard-adiutor-total-stats']
	});
	var adiutorDashboardCsdStats = new OO.ui.MessageWidget({
		type: 'notice',
		icon: 'trash',
		inline: false,
		label: new OO.ui.HtmlSnippet(mw.msg('adiutor-dashboard-csd-requests', adiutorUserOptions.stats.csdRequests)),
		classes: ['adiutor-user-dashboard-adiutor-csd-stats']
	});
	var adiutorDashboardAfDStats = new OO.ui.MessageWidget({
		type: 'notice',
		icon: 'ongoingConversation',
		inline: false,
		label: new OO.ui.HtmlSnippet(mw.msg('adiutor-dashboard-user-warnings', adiutorUserOptions.stats.userWarnings)),
		classes: ['adiutor-user-dashboard-adiutor-afd-stats']
	});
	var adiutorEditStats = new OO.ui.StackLayout({
		items: [adiutorDashboardTotalStats, adiutorDashboardCsdStats, adiutorDashboardAfDStats],
		continuous: true,
		classes: ['adiutor-user-dashboard-stats-container']
	});
	var adiutorDashboardDescription = new OO.ui.MessageWidget({
		type: 'notice',
		inline: true,
		label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('adiutor-dashboard-about-adiutor-title') + '</strong><br>' + mw.msg('adiutor-dashboard-about-adiutor-description') + ''),
		classes: ['adiutor-user-dashboard-adiutor-description']
	});
	var unixTimestamp = mwConfig.wgUserRegistration;
	var date = new Date(unixTimestamp);

	function formatDate(date) {
		var day = date.getDate().toString().padStart(2, '0');
		var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
		var year = date.getFullYear();
		return day + '.' + month + '.' + year;
	}
	var formattedDate = formatDate(date);
	var currentUserContributionCount = new OO.ui.LabelWidget({
		label: mw.msg('welcome-date-change-message', formattedDate, mwConfig.wgUserEditCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')),
		classes: ['adiutor-user-dashboard-contribution-count']
	});
	var adiutorUserDahboardStack = new OO.ui.StackLayout({
		items: [currentUserWelcomeText, currentUserWelcomeUsername, currentUserContributionCount, buttonsContainer, adiutorEditStats, adiutorDashboardDescription, adiutorDashboardLogo],
		continuous: true,
		classes: ['adiutor-user-dashboard-container']
	});
	this.$element.append(adiutorUserDahboardStack.$element);
}
OO.inheritClass(SectionOneLayout, OO.ui.PageLayout);
SectionOneLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('adiutor-dashboard-main-page'));
};

function SectionTwoLayout(name, config) {
	SectionTwoLayout.super.call(this, name, config);
	var tabPanelsArray = [];
	api.get({
		action: 'query',
		prop: 'revisions',
		titles: 'MediaWiki:Gadget-Adiutor.json',
		rvprop: 'content',
		formatversion: 2
	}).then(data => {
		var content = data.query.pages[0].revisions[0].content;
		var contentObject = JSON.parse(content);
		var tabPanelData = contentObject[0].adiutorHelpArticles;

		function AdiutorGuideTabPanelLayout(name) {
			AdiutorGuideTabPanelLayout.super.call(this, name);
			this.label = name;
			this.tabItem = new OO.ui.TabOptionWidget({
				classes: ['AdiutorGuideTabPanelLayout-tabItem']
			});
		}
		OO.inheritClass(AdiutorGuideTabPanelLayout, OO.ui.TabPanelLayout);
		tabPanelData.forEach(function(panelData) {
			var tabPanel = new AdiutorGuideTabPanelLayout(panelData.title);
			// Create widgets for title and content
			var titleWidget = new OO.ui.HtmlSnippet(panelData.title);
			var textWidget = new OO.ui.HtmlSnippet(panelData.content);
			var helpArticleContent = new OO.ui.MessageWidget({
				type: 'notice',
				label: new OO.ui.HtmlSnippet('<strong>' + titleWidget + '</strong><br>' + textWidget + '')
			});
			tabPanel.$element.append(helpArticleContent.$element);
			tabPanelsArray.push(tabPanel);
		});
		var index = new OO.ui.IndexLayout({
			framed: false
		});
		index.addTabPanels(tabPanelsArray);
		this.$element.append(index.$element);
	}).catch(error => console.error("Error fetching data from API:", error));
}
OO.inheritClass(SectionTwoLayout, OO.ui.PageLayout);
SectionTwoLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('help-and-guides'));
};

function AdministratorPageOneLayout(name, config) {
	AdministratorPageOneLayout.super.call(this, name, config);
	this.$element.append('Engelleme talepleri detay alanı...');
}
OO.inheritClass(AdministratorPageOneLayout, OO.ui.PageLayout);
AdministratorPageOneLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('block-requests'));
};

function AdministratorPageTwoLayout(name, config) {
	AdministratorPageTwoLayout.super.call(this, name, config);
	var storedData = mw.storage.session.get('ArticleListforCsd');
	var ArticleListforCsd = JSON.parse(storedData);
	var currentPageIndex = 0;
	// PageLayout sınıfı
	function CustomPageLayout(name, config) {
		CustomPageLayout.super.call(this, name, config);
		this.$content = $('<div>').addClass('adiutor-administrator-helper-csd--content-area');
		this.$articleinfobox = $('<div>').addClass('adiutor-administrator-helper-csd--article-infobox');
		this.$toolbar = $('<div>').addClass('adiutor-administrator-helper-csd--toolbar');
		this.$toolbar.parent().addClass('adiutor-administrator-helper-csd-main-container-box'); // Alternatif araç çubuğu
		// Sol taraftaki listede isimlerin görünmesi için
		this.setupOutlineItem = function() {
			this.outlineItem.setLabel(this.getName());
		};
		this.$element.append(this.$toolbar, this.$articleinfobox, this.$content);
	}
	OO.inheritClass(CustomPageLayout, OO.ui.PageLayout);
	// Her bir sayfa için CustomPageLayout örneklerini oluştur
	var pageLayouts = ArticleListforCsd.map(function(item, index) {
		var newArticleToWorkOnIt = {
			"id": mwConfig.wgArticleId,
			"name": mwConfig.wgPageName
		};
		var apiUrl = "https://xtools.wmcloud.org/api/page/articleinfo/tr.wikipedia.org/" + item.label + "?format=json";
		// AJAX isteği
		$.ajax({
			url: apiUrl,
			method: "GET",
			dataType: "json",
			success: function(response) {
				var isAlreadyAdded = adiutorUserOptions.myWorks.some(function(article) {
					return article.id === newArticleToWorkOnIt.id;
				});
				var authorEditcount = response.author_editcount;
				if(authorEditcount === null) {
					authorEditcount = 0;
				}
				var AboutArticleContent = $('<div>').append(mw.msg('page-info-tip', response.created_at, response.author, authorEditcount, response.revisions, response.editors, response.pageviews, response.pageviews_offset)).append();
				var AboutArticle = new OO.ui.MessageWidget({
					type: 'notice',
					icon: 'article',
					showClose: true,
					label: new OO.ui.HtmlSnippet(AboutArticleContent),
					classes: ['adiutor-aricle-detail-box']
				});
				pageLayout.$articleinfobox.append(AboutArticle.$element);
				pageLayout.$articleinfobox.css({
					'margin-top': '53px',
					'position': 'fixed',
					'width': '-webkit-fill-available',
				});
			},
			error: function(xhr, status, error) {
				console.error("AJAX error:", error);
			}
		});
		var pageLayout = new CustomPageLayout(item.label);
		pageLayout.$content.append(item.content);
		var csdPageTitle = new OO.ui.LabelWidget({
			label: item.label
		});
		csdPageTitle.$element.addClass('adiutor-administrator-helper-csd-toolbar-page-name');
		pageLayout.$element.addClass('adiutor-administrator-helper-csd-article-content');
		pageLayout.$toolbar.append(csdPageTitle.$element);
		var backButton = new OO.ui.ButtonWidget({
			label: mw.msg('back'),
			icon: 'previous',
		});
		backButton.on('click', function() {
			if(currentPageIndex > 0) {
				currentPageIndex--;
				booklet.setPage(pageLayouts[currentPageIndex]);
			}
		});
		pageLayout.$toolbar.append(backButton.$element);
		var forwardButton = new OO.ui.ButtonWidget({
			label: mw.msg('next'),
			icon: 'next',
		});
		var copyVioButton = new OO.ui.ButtonWidget({
			label: mw.msg('copyright-violation-check'),
			icon: 'checkAll',
		});
		var openThePageButton = new OO.ui.ButtonWidget({
			label: mw.msg('open-the-page'),
			icon: 'linkExternal',
		});
		forwardButton.on('click', function() {
			if(currentPageIndex < pageLayouts.length - 1) {
				currentPageIndex++;
				booklet.setPage(pageLayouts[currentPageIndex]);
			}
		});
		pageLayout.$toolbar.append(forwardButton.$element, copyVioButton.$element, openThePageButton.$element);
		// Sil butonu
		var deleteButton = new OO.ui.ButtonWidget({
			label: mw.msg('delete'),
			icon: 'trash',
			flags: ['destructive']
		});
		deleteButton.on('click', function() {
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
				api.get({
					action: 'query',
					list: 'logevents',
					leaction: 'delete/delete',
					letprop: 'delete',
					letitle: item.label
				}).done(function(data) {
					if(data.query.logevents) {
						revDelCount = data.query.logevents.length;
					} else {
						revDelCount = 0;
					}
					// Example: An action set used in a process dialog
					function csdAdminProcessDialog(config) {
						csdAdminProcessDialog.super.call(this, config);
					}
					OO.inheritClass(csdAdminProcessDialog, OO.ui.ProcessDialog);
					csdAdminProcessDialog.static.title = item.label;
					csdAdminProcessDialog.static.name = 'csdAdminProcessDialog';
					// An action set that uses modes ('edit' and 'help' mode, in this example).
					csdAdminProcessDialog.static.actions = [{
						action: 'continue',
						modes: 'edit',
						label: mw.msg('confirm-action'),
						flags: ['primary', 'destructive']
					}, {
						action: 'help',
						modes: 'edit',
						label: mw.msg('help')
					}, {
						modes: 'edit',
						label: mw.msg('cancel'),
						flags: 'safe'
					}, {
						action: 'back',
						modes: 'help',
						label: mw.msg('back'),
						flags: 'safe'
					}];
					csdAdminProcessDialog.prototype.initialize = function() {
						csdAdminProcessDialog.super.prototype.initialize.apply(this, arguments);
						var i, reason, checkboxWidget, fieldLayout;
						var selectedNamespace = null;
						switch(item.namespace) {
							case 0:
							case 6:
							case 14:
							case 2:
							case 3:
							case 10:
							case 100:
								for(i = 0; i < speedyDeletionReasons.length; i++) {
									if(speedyDeletionReasons[i].namespace === item.namespace) {
										selectedNamespace = {
											name: speedyDeletionReasons[i].name,
											reasons: speedyDeletionReasons[i].reasons
										};
										break;
									}
								}
								NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
									label: selectedNamespace.name
								});
								for(i = 0; i < selectedNamespace.reasons.length; i++) {
									reason = selectedNamespace.reasons[i];
									checkboxWidget = new OO.ui.CheckboxInputWidget({
										value: reason.value,
										data: reason.data,
										selected: false
									});
									fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
										label: reason.label,
										align: 'inline',
										help: reason.help
									});
									NameSpaceDeletionReasons.addItems([fieldLayout]);
								}
								break;
							default:
								NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({});
								NameSpaceDeletionReasons.addItems([
									new OO.ui.FieldLayout(new OO.ui.MessageWidget({
										type: 'warning',
										inline: true,
										label: new OO.ui.HtmlSnippet(mw.msg('no-namespace-reason-for-csd'))
									})),
								]);
								break;
						}
						sselectedNamespaceForGeneral = null;
						for(i = 0; i < speedyDeletionReasons.length; i++) {
							if(speedyDeletionReasons[i].namespace === 'general') {
								selectedNamespaceForGeneral = {
									name: speedyDeletionReasons[i].name,
									reasons: speedyDeletionReasons[i].reasons
								};
								break;
							}
						}
						GeneralReasons = new OO.ui.FieldsetLayout({
							label: selectedNamespaceForGeneral.name
						});
						for(i = 0; i < selectedNamespaceForGeneral.reasons.length; i++) {
							reason = selectedNamespaceForGeneral.reasons[i];
							checkboxWidget = new OO.ui.CheckboxInputWidget({
								value: reason.value,
								data: reason.data,
								selected: false
							});
							fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
								label: reason.label,
								align: 'inline',
								help: reason.help
							});
							GeneralReasons.addItems([fieldLayout]);
						}
						selectedNamespaceForOthers = null;
						for(i = 0; i < speedyDeletionReasons.length; i++) {
							if(speedyDeletionReasons[i].namespace === 'other') {
								selectedNamespaceForOthers = {
									name: speedyDeletionReasons[i].name,
									reasons: speedyDeletionReasons[i].reasons
								};
								break;
							}
						}
						OtherReasons = new OO.ui.FieldsetLayout({
							label: selectedNamespaceForOthers.name
						});
						for(i = 0; i < selectedNamespaceForOthers.reasons.length; i++) {
							reason = selectedNamespaceForOthers.reasons[i];
							checkboxWidget = new OO.ui.CheckboxInputWidget({
								value: reason.value,
								data: reason.data,
								selected: false
							});
							fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
								label: reason.label,
								align: 'inline',
								help: reason.help
							});
							OtherReasons.addItems([fieldLayout]);
						}
						copyVioInput = new OO.ui.TextInputWidget({
							placeholder: mw.msg('copyright-infringing-page'),
							value: '',
							data: 'COV',
							classes: ['adiutor-copvio-input'],
						});
						copyVioInput.$element.hide();
						isCopyVio = false;
						GeneralReasons.$element.on('click', function(item) {
							if(item.target.value === 'G9') {
								copyVioInput.$element.show();
							}
						});
						var left_panel = new OO.ui.PanelLayout({
							$content: [NameSpaceDeletionReasons.$element],
							classes: ['one'],
							scrollable: false,
						});
						var right_panel = new OO.ui.PanelLayout({
							$content: [GeneralReasons.$element, OtherReasons.$element, copyVioInput.$element],
							classes: ['two'],
							scrollable: false,
						});
						var stack = new OO.ui.StackLayout({
							items: [left_panel, right_panel],
							continuous: true,
							classes: ['adiutor-csd-modal-container']
						});
						this.panel1 = new OO.ui.PanelLayout({
							padded: true,
							expanded: false,
							classes: ['adiutor-csd-modal-container-panel-1']
						});
						if(revDelCount >= "1") {
							HeaderBarRevDel = new OO.ui.MessageWidget({
								type: 'warning',
								label: new OO.ui.HtmlSnippet(mw.msg('page-deletion-count-warning', revDelCount, mwConfig.wgPageName))
							});
							HeaderBarRevDel.$element.css({
								'margin-bottom': '20px',
							});
							this.panel1.$element.append(HeaderBarRevDel.$element, stack.$element);
						} else {
							this.panel1.$element.append(stack.$element);
						}
						this.stackLayout = new OO.ui.StackLayout({
							items: [this.panel1],
							classes: ['adiutor-csd-modal-container-user-panel']
						});
						this.$body.append(this.stackLayout.$element);
					};
					csdAdminProcessDialog.prototype.getSetupProcess = function(data) {
						return csdAdminProcessDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
							this.actions.setMode('edit');
						}, this);
					};
					csdAdminProcessDialog.prototype.getActionProcess = function(action) {
						if(action === 'help') {
							this.actions.setMode('help');
							this.stackLayout.setItem(this.panel2);
						} else if(action === 'back') {
							this.actions.setMode('edit');
							this.stackLayout.setItem(this.panel1);
						} else if(action === 'continue') {
							var dialog = this;
							return new OO.ui.Process(function() {
								var CSDReason;
								var CSDSummary;
								var CSDReasons = [];
								var CSDOptions = [];
								NameSpaceDeletionReasons.items.forEach(function(Reason) {
									if(Reason.fieldWidget.selected) {
										CSDReasons.push({
											value: Reason.fieldWidget.value,
											data: Reason.fieldWidget.data,
											selected: Reason.fieldWidget.selected
										});
									}
								});
								GeneralReasons.items.forEach(function(Reason) {
									if(Reason.fieldWidget.selected) {
										CSDReasons.push({
											value: Reason.fieldWidget.value,
											data: Reason.fieldWidget.data,
											selected: Reason.fieldWidget.selected
										});
									}
								});
								var SaltCSDSummary = '';
								if(copyVioInput.value != "") {
									CopVioURL = '|url=' + copyVioInput.value;
								} else {
									CopVioURL = "";
								}
								if(CSDReasons.length > 1) {
									var SaltCSDReason = '{{sil|';
									var i = 0;
									var keys = Object.keys(CSDReasons);
									for(i = 0; i < keys.length; i++) {
										if(i > 0) SaltCSDReason += (i < keys.length - 1) ? ', ' : ' ve ';
										SaltCSDReason += '[[VP:HS#' + CSDReasons[keys[i]].value + ']]';
									}
									for(i = 0; i < keys.length; i++) {
										if(i > 0) SaltCSDSummary += (i < keys.length - 1) ? ', ' : ' ve ';
										SaltCSDSummary += '[[VP:HS#' + CSDReasons[keys[i]].value + ']]';
									}
									CSDReason = SaltCSDReason + CopVioURL + '}}';
									CSDSummary = SaltCSDSummary;
								} else {
									CSDReason = '{{sil|' + CSDReasons[0].data + CopVioURL + '}}';
									CSDSummary = CSDReasons[0].data;
									SaltCSDSummary = CSDReasons[0].data;
								}
								api.postWithToken('csrf', {
									action: 'delete',
									title: item.label,
									reason: CSDSummary,
									tags: 'Adiutor',
									format: 'json'
								}).done(function() {
									api.postWithToken('csrf', {
										action: 'delete',
										title: "Tartışma:" + item.label,
										reason: '[[VP:HS#G7]]: Silinen sayfanın tartışma sayfası',
										tags: 'Adiutor',
										format: 'json'
									}).done(function() {});
									dialog.close();
									mw.notify(mw.msg('article-successfully-deleted'), {
										title: mw.msg('operation-completed'),
										type: 'success',
										autoHide: true,
										autoHideSeconds: 1
									});
									if(pageLayouts.length > 1) {
										booklet.removePages([pageLayout]); // Sayfa düzenini direkt olarak kaldır
										// Remove the deleted page from ArticleListforCsd
										ArticleListforCsd.splice(currentPageIndex, 1);
										// Update mw.storage
										mw.storage.session.set('ArticleListforCsd', JSON.stringify(ArticleListforCsd));
										// Update the currentPageIndex if it exceeds the new page count
										currentPageIndex = Math.min(currentPageIndex, pageLayouts.length - 2);
									}
								});
							});
						}
						return csdAdminProcessDialog.super.prototype.getActionProcess.call(this, action);
					};
					var CsdWindowManager = new OO.ui.WindowManager();
					$(document.body).append(CsdWindowManager.$element);
					var dialog = new csdAdminProcessDialog({
						size: 'larger',
						classes: 'adiutor-user-dashboard-admin-csd-reason-dialog'
					});
					CsdWindowManager.addWindows([dialog]);
					CsdWindowManager.openWindow(dialog);
				});
			});
		});
		openThePageButton.on('click', function() {
			window.open('/wiki/' + item.label, '_blank');
		});
		copyVioButton.on('click', function() {
			var messageDialog = new OO.ui.MessageDialog();
			var windowManager = new OO.ui.WindowManager();
			$('body').append(windowManager.$element);
			windowManager.addWindows([messageDialog]);
			var progressBar = new OO.ui.ProgressBarWidget({
				progress: false
			});
			windowManager.openWindow(messageDialog, {
				title: mw.msg('copyvio-checking'),
				message: progressBar.$element
			});
			// Fetch data from Copyvio Detector API
			$.get("https://copyvios.toolforge.org/api.json?", {
				action: "search",
				lang: "tr",
				project: "wikipedia",
				title: item.label,
				oldid: "",
				use_engine: "1",
				use_links: "1",
				turnitin: "0",
			}, function(data) {
				messageDialog.close();

				function CopyVioDialog(config) {
					CopyVioDialog.super.call(this, config);
				}
				OO.inheritClass(CopyVioDialog, OO.ui.ProcessDialog);
				var copVioRatio = (data.best.confidence * 100).toFixed(2);
				CopyVioDialog.static.title = mw.msg('copyvio-result', copVioRatio),
					CopyVioDialog.static.name = 'CopyVioDialog';
				CopyVioDialog.static.actions = [{
					action: 'continue',
					modes: 'edit',
					label: mw.msg('detailed-analysis'),
					flags: ['primary', 'progressive']
				}, {
					modes: 'edit',
					label: mw.msg('close'),
					flags: 'safe'
				}];
				var headerTitle;
				if(copVioRatio > 45) {
					headerTitle = new OO.ui.MessageWidget({
						type: 'error',
						inline: true,
						label: mw.msg('copyvio-potential-violation', copVioRatio),
					});
				} else if(copVioRatio < 10) {
					headerTitle = new OO.ui.MessageWidget({
						type: 'success',
						inline: true,
						label: mw.msg('copyvio-potential-violation', copVioRatio),
					});
				} else {
					headerTitle = new OO.ui.MessageWidget({
						type: 'warning',
						inline: true,
						label: mw.msg('copyvio-potential-violation-low', copVioRatio),
					});
				}
				CopyVioDialog.prototype.initialize = function() {
					CopyVioDialog.super.prototype.initialize.apply(this, arguments);
					var cvRelSource = data.sources.filter(function(source) {
						return !source.excluded;
					});
					var CopyVioLinks = cvRelSource.map(function(source) {
						var messageWidgetConfig = {
							icon: 'link',
							label: new OO.ui.HtmlSnippet('<a target="_blank" href="' + source.url + '">' + source.url + '</a>')
						};
						if((source.confidence * 100).toFixed(2) > 40) {
							messageWidgetConfig.type = 'error';
							messageWidgetConfig.label = new OO.ui.HtmlSnippet('<strong>' + mw.msg('high-violation-link') + ' (' + (source.confidence * 100).toFixed(2) + ')</strong><br><a target="_blank" href="' + source.url + '">' + source.url + '</a>');
						} else {
							messageWidgetConfig.type = 'notice';
						}
						return new OO.ui.MessageWidget(messageWidgetConfig);
					});
					this.panel1 = new OO.ui.PanelLayout({
						padded: true,
						expanded: false
					});
					this.panel1.$element.append(headerTitle.$element);
					CopyVioLinks.forEach(function(link) {
						this.panel1.$element.append(link.$element);
					}, this);
					this.$body.append(this.panel1.$element);
				};
				CopyVioDialog.prototype.getSetupProcess = function(data) {
					return CopyVioDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
						this.actions.setMode('edit');
					}, this);
				};
				CopyVioDialog.prototype.getActionProcess = function(action) {
					if(action === 'continue') {
						var dialog = this;
						return new OO.ui.Process(function() {
							dialog.close();
							var targetURL = "https://copyvios.toolforge.org/?lang=tr&project=wikipedia&title=" + item.label;
							window.open(targetURL, '_blank');
						});
					}
					return CopyVioDialog.super.prototype.getActionProcess.call(this, action);
				};
				var windowManager = new OO.ui.WindowManager();
				$(document.body).append(windowManager.$element);
				var dialog = new CopyVioDialog({
					size: 'larger'
				});
				windowManager.addWindows([dialog]);
				windowManager.openWindow(dialog);
			});
		});
		if(mwConfig.wgUserGroups.includes("sysop")) {
			pageLayout.$toolbar.append(deleteButton.$element);
		}
		return pageLayout;
	});
	var booklet = new OO.ui.BookletLayout({
		outlined: true,
		classes: ['adiutor-user-dashboard-main-2'],
	});
	booklet.addPages(pageLayouts);
	this.$element.append(booklet.$element);
}
OO.inheritClass(AdministratorPageTwoLayout, OO.ui.PageLayout);
AdministratorPageTwoLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('csd-requests'));
};
// Create instances of each page layout
var Administratorpage1 = new AdministratorPageOneLayout('page1'),
	Administratorpage2 = new AdministratorPageTwoLayout('page2');
// Add the pages to the booklet
var bookletAdministrator = new OO.ui.BookletLayout({
	outlined: true,
	size: 'full',
	classes: ['adiutor-csd-administrator-area']
});
bookletAdministrator.addPages([Administratorpage1, Administratorpage2]);

function SectionFourLayout(name, config) {
	SectionFourLayout.super.call(this, name, config);
	this.$element.append(bookletAdministrator.$element);
}
OO.inheritClass(SectionFourLayout, OO.ui.PageLayout);
SectionFourLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('administrator-tools'));
};
var sectionOne = new SectionOneLayout('one');
var sectionTwo = new SectionTwoLayout('two');
var sectionFour = new SectionFourLayout('four');
var booklet2 = new OO.ui.BookletLayout({
	outlined: true,
	classes: ['adiutor-user-dashboard-main-3'],
});
booklet2.addPages([sectionOne, sectionTwo, sectionFour]);

function MyProcessDialog(config) {
	MyProcessDialog.super.call(this, config);
}
OO.inheritClass(MyProcessDialog, OO.ui.ProcessDialog);
MyProcessDialog.static.name = 'myProcessDialog';
MyProcessDialog.static.title = mw.msg('adiutor-contributor-dashboard');
MyProcessDialog.static.actions = [{
	action: 'close',
	label: mw.msg('close'),
	flags: ['primary', 'progressive']
}, {
	action: 'help',
	modes: 'help',
	label: mw.msg('about'),
	classes: ['adiutor-user-dashboard-bottom-about-button'],
}, {
	label: new OO.ui.HtmlSnippet('<img width="80px" height="auto" src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Adiutor_logo.svg" alt="">'),
	classes: ['adiutor-user-dashboard-top-logo'],
	flags: 'safe'
}];
MyProcessDialog.prototype.initialize = function() {
	MyProcessDialog.super.prototype.initialize.apply(this, arguments);
	this.content = new OO.ui.PanelLayout({
		padded: true,
		expanded: false,
		size: 'full',
		classes: ['adiutor-user-dashboard-main-x'],
	});
	this.content.$element.append(booklet2.$element);
	this.$body.append(this.content.$element);
};
MyProcessDialog.prototype.getActionProcess = function(action) {
	if(action === 'help') {
		window.open('https://meta.wikimedia.org/wiki/Adiutor', '_blank');
	} else if(action === 'close') {
		var dialog = this;
		dialog.close();
	}
	return MyProcessDialog.super.prototype.getActionProcess.call(this, action);
};
var windowManager = new OO.ui.WindowManager();
$(document.body).append(windowManager.$element);
var dialog = new MyProcessDialog({
	size: 'full',
	classes: ['adiutor-user-dashboard-main-container'],
});
windowManager.addWindows([dialog]);
windowManager.openWindow(dialog);

function updateOptions(updatedOptions) {
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: 'userjs-adiutor',
		optionvalue: JSON.stringify(updatedOptions),
		formatversion: 2,
	}).done(function() {});
}
/* </nowiki> */