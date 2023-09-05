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
var wikiId = mw.config.get('wgWikiID');
var wikiAdiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor') || '{}'); // Provide a default empty object if no options are set.
var adiutorUserOptions = wikiAdiutorUserOptions[wikiId];

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
		label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('adiutor-dashboard-total-edit-title') + '</strong><br>' + mw.msg('adiutor-dashboard-total-edit', totalEditCount)),
		classes: ['adiutor-user-dashboard-adiutor-total-stats']
	});
	var adiutorDashboardCsdStats = new OO.ui.MessageWidget({
		type: 'notice',
		icon: 'trash',
		inline: false,
		label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('adiutor-dashboard-csd-requests-title') + '</strong><br>' + mw.msg('adiutor-dashboard-csd-requests', adiutorUserOptions.stats.csdRequests)),
		classes: ['adiutor-user-dashboard-adiutor-csd-stats']
	});
	var adiutorDashboardAfDStats = new OO.ui.MessageWidget({
		type: 'notice',
		icon: 'ongoingConversation',
		inline: false,
		label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('adiutor-dashboard-user-warnings-title') + '</strong><br>' + mw.msg('adiutor-dashboard-user-warnings', adiutorUserOptions.stats.userWarnings)),
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
			var showVideoButton = new OO.ui.ButtonWidget({
				label: mw.msg('help'),
				icon: 'play',
				classes: ['adiutor-aricle-show-video-button']
			});
			showVideoButton.on('click', function() {
				function ArticleVideoDialog(config) {
					ArticleVideoDialog.super.call(this, config);
				}
				OO.inheritClass(ArticleVideoDialog, OO.ui.ProcessDialog);
				ArticleVideoDialog.static.name = 'ArticleVideoDialog';
				ArticleVideoDialog.static.title = panelData.title;
				ArticleVideoDialog.static.actions = [{
					action: 'save',
					label: mw.msg('okay'),
					flags: 'primary'
				}, {
					label: mw.msg('close'),
					flags: 'safe'
				}];
				ArticleVideoDialog.prototype.initialize = function() {
					ArticleVideoDialog.super.prototype.initialize.apply(this, arguments);
					this.content = new OO.ui.PanelLayout({
						padded: false,
						expanded: false
					});
					var videoElement = document.createElement('video');
					videoElement.src = "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/17/Els_colors_fronterers_segons_Goethe.webm/Els_colors_fronterers_segons_Goethe.webm.1080p.vp9.webm";
					videoElement.controls = true; // Show controls (play, pause, etc.)
					videoElement.style.width = "100%"; // Adjust width
					videoElement.style.height = "100%"; // Adjust width
					this.content.$element.append(videoElement);
					this.$body.append(this.content.$element);
				};
				ArticleVideoDialog.prototype.getActionProcess = function(action) {
					var dialog = this;
					if(action) {
						return new OO.ui.Process(function() {
							dialog.close({
								action: action
							});
						});
					}
					return ArticleVideoDialog.super.prototype.getActionProcess.call(this, action);
				};
				var windowManager = new OO.ui.WindowManager();
				$(document.body).append(windowManager.$element);
				var dialog = new ArticleVideoDialog({
					size: 'larger',
				});
				windowManager.addWindows([dialog]);
				windowManager.openWindow(dialog);
			});
			var helpArticleContent = new OO.ui.MessageWidget({
				type: 'notice',
				label: new OO.ui.HtmlSnippet('<h1 style="border: none; display: inline; font-size: large;"><strong>' + titleWidget + '</strong></h1>' + '<img style="width: 30%; float: right; margin: 30px;" src="' + panelData.image + '" alt="">' + textWidget + '')
			});
			helpArticleContent.$element.css({
				'display': 'flex',
			});
			tabPanel.$element.append(showVideoButton.$element, helpArticleContent.$element);
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
var _this = this;

function createButtonWidget(labelKey) {
	return new OO.ui.ButtonWidget({
		label: mw.msg(labelKey),
		icon: 'arrowNext',
		flags: ['primary', 'progressive'],
		classes: ['adiutor-dashboard-administrator-tools-fd-show-button'],
		align: 'center'
	});
}

function createMessageWidget(labelKey) {
	return new OO.ui.MessageWidget({
		type: 'notice',
		inline: true,
		icon: 'none',
		label: new OO.ui.HtmlSnippet('<h2 style="font-size: 26px; color: #3367cc; font-weight: 900; line-height: normal;">' + mw.msg(labelKey) + '</h2><span style="font-weight: 100; font-size: 18px;">' + mw.msg('dashboard-' + labelKey + '-welcome') + '</span>'),
		classes: ['adiutor-dashboard-administrator-tools-fd-welcome-messsage'],
		align: 'center'
	});
}

function createImageWidget(imageUrl) {
	return new OO.ui.MessageWidget({
		type: 'notice',
		icon: 'none',
		inline: true,
		label: new OO.ui.HtmlSnippet('<img width="700px" src="' + imageUrl + '" alt="">'),
		align: 'center',
		classes: ['adiutor-dashboard-administrator-tools-welcome-img']
	});
}

function createStackLayout(titleWidget, buttonWidget, imageWidget) {
	var topLayout = new OO.ui.StackLayout({
		items: [titleWidget, buttonWidget],
		continuous: true,
		classes: ['adiutor-dashboard-administrator-tools-welcome-top']
	});
	return new OO.ui.StackLayout({
		items: [topLayout, imageWidget],
		continuous: true,
		classes: ['adiutor-dashboard-administrator-tools-welcome']
	});
}
var showCsdListButton = createButtonWidget('list-pages-for-csd');
var showProdListButton = createButtonWidget('list-pages-for-prod');
var showAfdListButton = createButtonWidget('list-pages-for-afd');
var csdWelcomeTitle = createMessageWidget('pages-for-csd');
var prodWelcomeTitle = createMessageWidget('pages-for-prod');
var afdWelcomeTitle = createMessageWidget('pages-for-afd');
var csdWelcomeImage = createImageWidget('https://upload.wikimedia.org/wikipedia/commons/4/48/Adiutor-dashboard-csd.svg');
var prodWelcomeImage = createImageWidget('https://upload.wikimedia.org/wikipedia/commons/0/0a/Adiutor-dashboard-prod.svg');
var afdWelcomeImage = createImageWidget('https://upload.wikimedia.org/wikipedia/commons/4/4b/Adiutor-dashboard-afd.svg');
var csdWelcome = createStackLayout(csdWelcomeTitle, showCsdListButton, csdWelcomeImage);
var prodWelcome = createStackLayout(prodWelcomeTitle, showProdListButton, prodWelcomeImage);
var afdWelcome = createStackLayout(afdWelcomeTitle, showAfdListButton, afdWelcomeImage);

function administratorToolsLayoutCsd(name, config) {
	administratorToolsLayoutCsd.super.call(this, name, config);
	this.$element.append(csdWelcome.$element);
}
OO.inheritClass(administratorToolsLayoutCsd, OO.ui.PageLayout);
administratorToolsLayoutCsd.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('csd-requests'));
	showCsdListButton.$element.on('click', function() {
		var ArticleListforCsd = [];
		var params = {
			action: "query",
			format: "json",
			list: "categorymembers",
			cmtitle: 'Kategori:Hızlı silinmeye aday sayfalar',
			cmlimit: 1000,
		};
		api.get(params).done(function(data) {
			var pages = data.query.categorymembers;
			pages.forEach(function(page) {
				var pageTitle = page.title;
				var pageTitleForContent = page.title;
				var pageNamespace = page.ns;
				var contentParams = {
					action: "parse",
					format: "json",
					page: pageTitleForContent,
					prop: "text"
				};
				api.get(contentParams).done(function(contentData) {
					var pageContent = contentData.parse.text["*"];
					ArticleListforCsd.push({
						label: pageTitle,
						content: pageContent,
						namespace: pageNamespace,
						special: pageTitleForContent
					});
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
						var apiUrl = "https://xtools.wmcloud.org/api/page/articleinfo/tr.wikipedia.org/" + encodeURIComponent(item.label) + "?format=json";
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
									'list-style': 'none',
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
						var batchDeleteButton = new OO.ui.ButtonWidget({
							label: mw.msg('batch-delete'),
							icon: 'trash',
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
										var NS_MAIN = 0,
											NS_USER = 2,
											NS_USER_TALK = 3,
											NS_FILE = 6,
											NS_TEMPLATE = 10,
											NS_CATEGORY = 14;
										switch(item.namespace) {
											case NS_MAIN:
											case NS_FILE:
											case NS_CATEGORY:
											case NS_USER:
											case NS_USER_TALK:
											case NS_TEMPLATE:
												// Find the selected namespace based on the condition
												selectedNamespace;
												if(item.namespace === NS_USER || item.namespace === NS_USER_TALK) {
													// Case 2 and 3 should share the same namespace
													selectedNamespace = speedyDeletionReasons.find(reason => reason.namespace === NS_USER);
												} else {
													selectedNamespace = speedyDeletionReasons.find(reason => reason.namespace === item.namespace);
												}
												// Continue with the rest of the code
												if(selectedNamespace) {
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
												} else {
													// Handle the case where the selected namespace is not found
													NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({});
													NameSpaceDeletionReasons.addItems([
														new OO.ui.FieldLayout(new OO.ui.MessageWidget({
															type: 'warning',
															inline: true,
															label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('no-namespace-reason-for-csd-title') + '</strong><br><small>' + mw.msg('no-namespace-reason-for-csd') + '</small>')
														})),
													]);
												}
												break;
											default:
												NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({});
												NameSpaceDeletionReasons.addItems([
													new OO.ui.FieldLayout(new OO.ui.MessageWidget({
														type: 'warning',
														inline: true,
														label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('no-namespace-reason-for-csd-title') + '</strong><br><small>' + mw.msg('no-namespace-reason-for-csd') + '</small>')
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
										copyVioInput = new OO.ui.TextInputWidget({
											placeholder: mw.msg('copyright-infringing-page'),
											value: '',
											icon: 'link',
											data: 'COV',
											classes: ['adiutor-copvio-input'],
										});
										copyVioInput.$element.css({
											'margin-top': '10px',
											'margin-bottom': '10px'
										});
										copyVioInput.$element.hide();
										isCopyVio = false;
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
											if(reason.value === 'G9') {
												fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
													label: reason.label,
													align: 'inline',
													help: reason.help
												});
												fieldLayout.$element.append(copyVioInput.$element);
												copyVioInput.$element.hide(); // Hide it initially
											} else {
												fieldLayout = new OO.ui.FieldLayout(checkboxWidget, {
													label: reason.label,
													align: 'inline',
													help: reason.help
												});
											}
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
											$content: [GeneralReasons.$element, OtherReasons.$element],
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
											var deletionMessage = mw.msg('page-deletion-count-warning', revDelCount);
											var deletionMessageWithLink = deletionMessage.replace(/\$2/g, '<a href="/wiki/Special:Log?type=delete&user=&page=' + mwConfig.wgPageName + '">' + mw.msg('log') + '</a>');
											var HeaderBarRevDel = new OO.ui.MessageWidget({
												type: 'warning',
												label: new OO.ui.HtmlSnippet(deletionMessageWithLink)
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
							window.open('/wiki/' + encodeURIComponent(item.label), '_blank');
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
						batchDeleteButton.on('click', function() {
							var batchDeletionList = [];
							var selectedOptions;
							var selectedReason;
							// Process the retrieved pages and create CheckboxMultioptionWidgets for each
							var members = pages;
							members.sort(function(a, b) {
								return a.title.localeCompare(b.title);
							});
							members.forEach(function(page) {
								batchDeletionList.push(new OO.ui.CheckboxMultioptionWidget({
									data: page.title,
									selected: false,
									label: new OO.ui.HtmlSnippet(page.title + '<a style="margin-left:10px" target="_blank" href="' + page.title + '">→ ' + mw.msg('see') + '</a>')
								}));
							});
							// Create a CheckboxMultiselectWidget to display the list of pages
							var multiselectInput = new OO.ui.CheckboxMultiselectWidget({
								items: batchDeletionList,
							});
							multiselectInput.$element.css({
								'margin-top': '10px'
							});
							// Create a "Select All" button to select all checkboxes at once
							var selectAllButton = new OO.ui.ButtonWidget({
								label: mw.msg('select-all'),
								flags: ['progressive']
							});
							// Create a "Clear Selection" button to clear all checkboxes at once
							var clearSelectionButton = new OO.ui.ButtonWidget({
								label: mw.msg('uncheck-selected')
							});
							// Event handler for the "Select All" button
							selectAllButton.on('click', function() {
								batchDeletionList.forEach(function(option) {
									option.setSelected(true);
								});
								printSelectedOptions();
							});
							// Event handler for the "Clear Selection" button
							clearSelectionButton.on('click', function() {
								batchDeletionList.forEach(function(option) {
									option.setSelected(false);
								});
								printSelectedOptions();
							});
							// Event handler for checkbox changes
							batchDeletionList.forEach(function(option) {
								option.on('change', function() {
									printSelectedOptions();
								});
							});
							// Function to update the selectedOptions array and clear console
							function printSelectedOptions() {
								selectedOptions = batchDeletionList.filter(function(option) {
									return option.isSelected();
								}).map(function(option) {
									return option.data;
								});
								console.clear();
							}
							// Fetch JSON data containing speedy deletion reasons
							api.get({
								action: 'query',
								prop: 'revisions',
								titles: 'MediaWiki:Gadget-Adiutor.json',
								rvprop: 'content',
								formatversion: 2
							}).done(function(data) {
								// Extract speedy deletion reasons from the retrieved JSON data
								var content = data.query.pages[0].revisions[0].content;
								var jsonData = JSON.parse(content);
								var speedyDeletionReasons = jsonData[1].adiutorSpeedyDeletionReasons;
								// Define a class for the Batch Deletion Dialog
								function BatchDeletionDialog(config) {
									BatchDeletionDialog.super.call(this, config);
								}
								// Inherit from the ProcessDialog class
								OO.inheritClass(BatchDeletionDialog, OO.ui.ProcessDialog);
								// Set the dialog's name and title
								BatchDeletionDialog.static.name = 'BatchDeletionDialog';
								BatchDeletionDialog.static.title = mw.msg('batch-deletion');
								// Define the dialog's actions (Save and Cancel)
								BatchDeletionDialog.static.actions = [{
									action: 'save',
									label: new OO.ui.deferMsg('confirm-action'),
									flags: ['primary', 'destructive']
								}, {
									label: new OO.ui.deferMsg('cancel'),
									flags: 'safe'
								}];
								// Initialize the dialog
								BatchDeletionDialog.prototype.initialize = function() {
									BatchDeletionDialog.super.prototype.initialize.apply(this, arguments);
									// Create a notice message for header
									var headerTitle = new OO.ui.MessageWidget({
										type: 'notice',
										inline: true,
										label: mw.msg('batch-deletion-warning')
									});
									headerTitle.$element.css({
										'margin-bottom': '20px',
										'font-weight': '300'
									});
									// Construct options for the speedy deletion reasons dropdown
									var dropdownOptions = [];
									speedyDeletionReasons.forEach(function(reasonGroup) {
										dropdownOptions.push({
											"optgroup": reasonGroup.name
										});
										reasonGroup.reasons.forEach(function(reason) {
											dropdownOptions.push({
												"data": reason.data,
												"label": reason.label
											});
										});
									});
									// Create a dropdown input for selecting deletion reasons
									var reasonDropdown = new OO.ui.DropdownInputWidget({
										options: dropdownOptions,
										icon: 'dropdown',
										value: null // Set the initial selected value to null
									});
									reasonDropdown.on('change', function(value) {
										selectedReason = value;
									});
									reasonDropdown.$element.css({
										'margin-top': '20px',
										'margin-bottom': '10px'
									});
									// Create an input field for additional rationale
									otherRationaleInput = new OO.ui.TextInputWidget({
										placeholder: mw.msg('other-reason'),
										value: '',
									});
									otherRationaleInput.$element.css({
										'margin-bottom': '20px',
									});
									// Create a layout for the "Select All" and "Clear Selection" buttons
									var buttonsLayout = new OO.ui.HorizontalLayout({
										items: [selectAllButton, clearSelectionButton]
									});
									var secondHeader = new OO.ui.FieldsetLayout({
										label: mw.msg('pages-to-be-deleted'),
										items: [buttonsLayout]
									});
									buttonsLayout.$element.css({
										'display': 'contents',
									});
									secondHeader.$element.css({
										'margin-bottom': '10px',
									});
									// Create the content layout for the dialog
									this.content = new OO.ui.PanelLayout({
										padded: true,
										expanded: false
									});
									this.content.$element.append(headerTitle.$element, reasonDropdown.$element, otherRationaleInput.$element, secondHeader.$element, multiselectInput.$element);
									this.$body.append(this.content.$element);
								};
								// Define the action process for the dialog
								BatchDeletionDialog.prototype.getActionProcess = function(action) {
									var dialog = this;
									if(action) {
										return new OO.ui.Process(function() {
											var deletionSummary = '';
											if(selectedReason) {
												deletionSummary = selectedReason;
												if(otherRationaleInput.value) {
													deletionSummary += ' | ';
												}
											}
											if(otherRationaleInput.value) {
												deletionSummary += otherRationaleInput.value;
											}
											selectedOptions.forEach(function(pageTitle) {
												// Perform batch deletion for selected pages
												api.postWithToken('csrf', {
													action: 'delete',
													title: pageTitle,
													reason: deletionSummary,
													tags: 'Adiutor',
													format: 'json'
												}).done(function() {
													// Delete corresponding talk pages
													api.postWithToken('csrf', {
														action: 'delete',
														title: "Tartışma:" + pageTitle,
														reason: '[[VP:HS#G7]]: Silinen sayfanın tartışma sayfası',
														tags: 'Adiutor',
														format: 'json'
													}).done(function() {});
													// Close the dialog and display success notification
													dialog.close({
														action: action
													});
													mw.notify(mw.msg('batch-deletion-success'), {
														title: mw.msg('operation-completed'),
														type: 'success'
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
										});
									}
									return BatchDeletionDialog.super.prototype.getActionProcess.call(this, action);
								};
								// Create an instance of WindowManager to manage dialog windows
								var windowManager = new OO.ui.WindowManager();
								$(document.body).append(windowManager.$element);
								// Create and open the Batch Deletion Dialog
								var dialog = new BatchDeletionDialog();
								windowManager.addWindows([dialog]);
								windowManager.openWindow(dialog);
							});
						});
						if(mwConfig.wgUserGroups.includes("sysop")) {
							pageLayout.$toolbar.append(batchDeleteButton.$element, deleteButton.$element);
						}
						return pageLayout;
					});
					var booklet = new OO.ui.BookletLayout({
						outlined: true,
						classes: ['adiutor-user-dashboard-main-2'],
					});
					booklet.addPages(pageLayouts);
					administratorToolsLayoutCsdLayout.$element.empty().append(booklet.$element);
					return false; // Bu tıklamanın sayfanın yeniden yüklenmesini engellemek için false döndürüyoruz
				}).fail(function(jqXHR, textStatus, errorThrown) {
					// Hata durumunda burada işlemler yapabilirsiniz
					console.error("API hatası:", errorThrown);
				});
			});
		}).fail(function(jqXHR, textStatus, errorThrown) {
			// Hata durumunda burada işlemler yapabilirsiniz
			console.error("API hatası:", errorThrown);
		});
	});
};

function administratorToolsLayoutProd(name, config) {
	administratorToolsLayoutProd.super.call(this, name, config);
	this.$element.append(prodWelcome.$element);
	//Butonu için click özelliği eklemeyi unutma
}
OO.inheritClass(administratorToolsLayoutProd, OO.ui.PageLayout);
administratorToolsLayoutProd.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('prod-requests'));
};

function administratorToolsLayoutAfd(name, config) {
	administratorToolsLayoutAfd.super.call(this, name, config);
	this.$element.append(afdWelcome.$element);
	//Butonu için click özelliği eklemeyi unutma
}
OO.inheritClass(administratorToolsLayoutAfd, OO.ui.PageLayout);
administratorToolsLayoutAfd.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('afd-requests'));
};
administratorToolsLayoutCsdLayout = new administratorToolsLayoutCsd('csd');
administratorToolsLayoutProdLayout = new administratorToolsLayoutProd('prod');
administratorToolsLayoutAfdLayout = new administratorToolsLayoutAfd('adf');
var bookletadministratorToolsLayout = new OO.ui.BookletLayout({
	outlined: true,
	size: 'full',
	classes: ['adiutor-csd-administrator-area']
});
bookletadministratorToolsLayout.addPages([administratorToolsLayoutCsdLayout, administratorToolsLayoutProdLayout, administratorToolsLayoutAfdLayout]);

function SectionThreeLayout(name, config) {
	SectionThreeLayout.super.call(this, name, config);
	this.$element.append(bookletadministratorToolsLayout.$element);
}
OO.inheritClass(SectionThreeLayout, OO.ui.PageLayout);
SectionThreeLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('administrator-tools'));
};
var sectionOne = new SectionOneLayout('one');
var sectionTwo = new SectionTwoLayout('two');
var sectionThree = new SectionThreeLayout('four');
var booklet2 = new OO.ui.BookletLayout({
	outlined: true,
	classes: ['adiutor-user-dashboard-main-3'],
});
booklet2.addPages([sectionOne, sectionTwo, sectionThree]);

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