/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Loader
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]), $.ready).then(function() {
	var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgUserName", "wgTitle", "wgUserGroups", "wgUserEditCount", "wgUserRegistration", "wgRelevantUserName", "wgCanonicalNamespace"]);
	var api = new mw.Api();
	var adiutorUserOptions;
	var myArticleWorks = [];

	function initializeUserOptions() {
		console.log('Ayarlar yok');
		adiutorUserOptions = {
			"myWorks": [],
			"speedyDeletion": {
				"csdSendMessageToCreator": true,
				"csdLogNominatedPages": true,
				"csdLogPageName": "HS günlüğü"
			},
			"articlesForDeletion": {
				"afdSendMessageToCreator": true,
				"afdLogNominatedPages": true,
				"afdLogPageName": "SAS günlüğü",
				"afdNominateOpinionsLog": true,
				"afdOpinionLogPageName": "SAS görüş günlüğü"
			},
			"proposedDeletion": {
				"prdSendMessageToCreator": true,
				"prdLogNominatedPages": true,
				"prdLogPageName": "BS günlüğü"
			},
			"status": {
				"showMyStatus": true,
				"myStatus": "active"
			},
			"inlinePageInfo": true
		};
		api.postWithToken('csrf', {
			action: 'edit',
			title: "Kullanıcı:" + mwConfig.wgUserName + "/Adiutor-options.json",
			text: JSON.stringify(adiutorUserOptions),
			tags: 'Adiutor',
			summary: "Ayar dosyaları oluşturuldu",
		}).done(function() {});
	}
	api.get({
		action: "query",
		format: "json",
		prop: "revisions",
		titles: "Kullanıcı:" + mwConfig.wgUserName + "/Adiutor-options.json",
		rvprop: "content"
	}).done(function(data) {
		var pageId = Object.keys(data.query.pages)[0];
		if(pageId === "-1") {
			// Dosya bulunamadı veya içerik yok
			initializeUserOptions();
		} else {
			var jsonContent = data.query.pages[pageId].revisions[0]["*"];
			try {
				adiutorUserOptions = JSON.parse(jsonContent);
				myArticleWorks = adiutorUserOptions.myWorks;
				api.get({
					action: 'query',
					prop: 'revisions',
					titles: 'MediaWiki:Gadget-Adiutor-i18.json',
					rvprop: 'content',
					formatversion: 2
				}).done(function(data) {
					var content = data.query.pages[0].revisions[0].content;
					var messages = JSON.parse(content);
					var lang = mw.config.get('wgUserLanguage') || 'en';
					mw.messages.set(messages[lang] || messages.en);
					var DefaultMenuItems = [];
					switch(mwConfig.wgNamespaceNumber) {
						case -1:
						case 0:
						case 1:
						case 2:
						case 3:
						case 4:
						case 5:
						case 6:
						case 7:
						case 14:
						case 10:
						case 11:
						case 100:
						case 101:
						case 102:
						case 103:
						case 828:
						case 829:
							// LOAD MODULES
							if(mwConfig.wgNamespaceNumber === 3) {
								var UserParams = {
									action: 'query',
									meta: 'userinfo',
									uiprop: 'rights',
									format: 'json'
								};
								api.get(UserParams).then(function(data) {
									checkMentor(data.query.userinfo.id);
								});
							}
							// Load the Adiutor AFD-Helper script using the loadAdiutorScript function
							loadAdiutorScript('AFD-Helper');
							if(/(?:\?|&)(?:action|diff|oldid)=/.test(window.location.href)) {
								DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
									icon: 'cancel',
									data: 'rdr',
									label: new OO.ui.deferMsg('create-revision-deletion-request'),
									classes: ['adiutor-top-rrd-menu'],
								}));
							}
							if(mwConfig.wgPageName.includes('Özel:Katkılar') || mwConfig.wgNamespaceNumber === 2 || mwConfig.wgNamespaceNumber === 3 && !mwConfig.wgPageName.includes(mwConfig.wgUserName)) {
								DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
									icon: 'cancel',
									data: 'report',
									label: new OO.ui.deferMsg('report'),
									classes: ['adiutor-top-user-menu-end'],
								}), new OO.ui.MenuOptionWidget({
									icon: 'hand',
									data: 'warn',
									label: new OO.ui.deferMsg('warn'),
									classes: ['adiutor-top-user-menu-end'],
								}));
							}
							if(!mwConfig.wgPageName.includes('Özel:Katkılar')) {
								DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
									icon: 'add',
									data: 1,
									label: mw.msg('create-speedy-deletion-request'),
								}), new OO.ui.MenuOptionWidget({
									icon: 'add',
									data: 2,
									label: mw.msg('proposed-deletion-nomination'),
								}), new OO.ui.MenuOptionWidget({
									icon: 'add',
									data: 3,
									label: mw.msg('nominate-article-for-deletion'),
								}), new OO.ui.MenuOptionWidget({
									icon: 'arrowNext',
									data: 'pmr',
									label: mw.msg('page-move-request'),
								}), new OO.ui.MenuOptionWidget({
									icon: 'lock',
									data: 'rpp',
									label: mw.msg('page-protection-request'),
								}), new OO.ui.MenuOptionWidget({
									icon: 'history',
									data: 4,
									label: mw.msg('recent-changes'),
								}), new OO.ui.MenuOptionWidget({
									icon: 'tag',
									data: 'tag',
									label: mw.msg('tag-page'),
								}), new OO.ui.MenuOptionWidget({
									icon: 'checkAll',
									data: 5,
									label: mw.msg('copyright-violation-check'),
								}), new OO.ui.MenuOptionWidget({
									icon: 'info',
									data: 7,
									label: mw.msg('article-info'),
								}), new OO.ui.MenuOptionWidget({
									icon: 'settings',
									data: 6,
									label: mw.msg('adiutor-settings'),
									classes: ['adiutor-top-settings-menu'],
								}));
							}
							var adiutorMenu = new OO.ui.ButtonMenuSelectWidget({
								icon: 'ellipsis',
								invisibleLabel: true,
								framed: false,
								title: 'More options',
								align: 'force-right',
								classes: ['adiutor-top-selector', 'mw-indicator'],
								menu: {
									horizontalPosition: 'end',
									items: DefaultMenuItems,
									classes: ['adiutor-top-menu'],
								}
							});
							// Define a function to load Adiutor scripts
							// Listen for menu option selection
							adiutorMenu.getMenu().on('choose', function(menuOption) {
								// Map option values to corresponding Adiutor script names
								var optionMapping = {
									1: 'CSD',
									2: 'PRD',
									3: 'AFD',
									5: 'COV',
									6: 'OPT',
									7: 'INF',
									'report': 'AIV',
									'warn': 'WRN',
									'rdr': 'RDR',
									'pmr': 'PMR',
									'rpp': 'RPP',
									'tag': 'TAG',
									'gac': 'GAC',
									'fac': 'FAC'
								};
								// Get the selected option's corresponding script name
								var selectedOption = optionMapping[menuOption.getData()];
								// Handle different actions based on the selected option
								if(selectedOption === 'diff') {
									// Redirect to a specific page with parameters
									window.location = '/w/index.php?title=' + mwConfig.wgPageName + "&diff=cur&oldid=prev&diffmode=source";
								} else if(selectedOption === 'welcome') {
									// Show an alert for the 'welcome' option
									OO.ui.alert('Coming soon :)').done(function() {});
								} else {
									// Load the Adiutor script based on the selected option
									loadAdiutorScript(selectedOption);
								}
							});
							if(!mwConfig.wgPageName.includes('Anasayfa')) {
								switch(mwConfig.skin) {
									case 'vector':
										$('.mw-portlet-cactions').parent().append(adiutorMenu.$element);
										$('.vector-menu-content-list').append($('<li>').append(AdiutorDashboardIcon.$element));
										break;
									case 'vector-2022':
										$('.vector-collapsible').append(adiutorMenu.$element);
										break;
									case 'monobook':
										$('.mw-indicators').append(adiutorMenu.$element);
										break;
									case 'timeless':
										$('.mw-portlet-body').append(adiutorMenu.$element);
										break;
									case 'minerva':
										$('.page-actions-menu__list').append(adiutorMenu.$element);
										break;
								}
								break;
							}
					}
					var AdiutorDashboardIcon = new OO.ui.ToggleButtonWidget({
						icon: 'infoFilled',
						label: 'pin',
						invisibleLabel: true,
						framed: false
					});
					AdiutorDashboardIcon.on('click', function() {
						// Load the Adiutor Dashboard script using the loadAdiutorScript function
						loadAdiutorScript('DAS');
					});
					var adiutorIconContainer = $('<li>').append(AdiutorDashboardIcon.$element);
					switch(mwConfig.skin) {
						case 'vector':
							$('#pt-watchlist-2').after(adiutorIconContainer);
							break;
						case 'vector-2022':
							$('#pt-watchlist-2').after(adiutorIconContainer);
							break;
						case 'monobook':
							//
							break;
						case 'timeless':
							//
							break;
						case 'minerva':
							//
							break;
					}
					switch(mwConfig.wgNamespaceNumber) {
						case 2:
						case 3:
							var CurrentUserPage = mwConfig.wgPageName.replace(/Kullanıcı(\s|\_)mesaj\s*?\:\s*?(.*)/gi, "Kullanıcı:$2");
							checkOptions(CurrentUserPage + '/Adiutor-options.json').then(function(data) {
								if(data.query.pages["-1"]) {
									//
								} else {
									var XUserParams = {
										action: 'parse',
										page: CurrentUserPage + '/Adiutor-options.json',
										prop: 'wikitext',
										format: "json"
									};
									api.get(XUserParams).done(function(data) {
										var AdiutorOptions = JSON.parse([data.parse.wikitext['*']]);
										var ShowStatus, UserStatus;
										$.each(AdiutorOptions.status, function() {
											if(this.hasOwnProperty("showMyStatus")) {
												ShowStatus = this.showMyStatus;
											}
										});
										$.each(AdiutorOptions.status, function() {
											if(this.hasOwnProperty("mySatus")) {
												UserStatus = this.mySatus;
											}
										});
										if(ShowStatus) {
											switch(UserStatus) {
												case "active":
													buttonSelect = new OO.ui.ButtonOptionWidget({
														framed: false,
														label: mw.msg('active'),
														data: 'active',
														classes: ['adiutor-user-status-active'],
													});
													$('.mw-first-heading').append(buttonSelect.$element);
													break;
												case "passive":
													buttonSelect = new OO.ui.ButtonOptionWidget({
														framed: false,
														label: mw.msg('passive'),
														data: 'passive',
														classes: ['adiutor-user-status-passive'],
													});
													$('.mw-first-heading').append(buttonSelect.$element);
													break;
												case "away":
													buttonSelect = new OO.ui.ButtonOptionWidget({
														framed: false,
														label: mw.msg('away'),
														classes: ['adiutor-user-status-away'],
													});
													$('.mw-first-heading').append(buttonSelect.$element);
													break;
											}
											var checkLoggedUserPage = mwConfig.wgPageName.includes(mwConfig.wgUserName);
											if(checkLoggedUserPage) {
												buttonSelect.on('click', (function() {
													buttonSelect.$element.hide();
													var dropdown = new OO.ui.DropdownWidget({
														menu: {
															items: [
																new OO.ui.MenuOptionWidget({
																	data: 'active',
																	label: mw.msg('active'),
																}),
																new OO.ui.MenuOptionWidget({
																	data: 'passive',
																	label: mw.msg('passive'),
																}),
																new OO.ui.MenuOptionWidget({
																	data: 'away',
																	label: mw.msg('away'),
																})
															],
														},
														label: mw.msg('status'),
														classes: ['adiutor-user-status-selector']
													});
													$('.mw-first-heading').append(dropdown.$element);
													dropdown.getMenu().on('choose', function(menuOption) {
														changeUserStatus(menuOption.getData());
													});
												}));
											}
										}
									});
								}
							});
							break;
					}
					switch(mwConfig.wgNamespaceNumber) {
						case 0:
							var newArticleToWorkOnIt = {
								"id": mwConfig.wgArticleId,
								"name": mwConfig.wgPageName
							};
							const wikiUrl = "https://xtools.wmcloud.org/api/page/articleinfo/tr.wikipedia.org/" + mwConfig.wgPageName + "?format=json";
							const xhr = new XMLHttpRequest();
							xhr.open("GET", wikiUrl, true);
							xhr.onreadystatechange = function() {
								if(xhr.readyState === 4 && xhr.status === 200) {
									const response = JSON.parse(xhr.responseText);
									// Check if article already in list or not
									var isAlreadyAdded = myArticleWorks.some(function(article) {
										return article.id === newArticleToWorkOnIt.id;
									});
									// Define details to buttons
									var addButtonInfo = {
										icon: isAlreadyAdded ? 'unFlag' : 'flag',
										label: isAlreadyAdded ? mw.msg('unpin-from-works') : mw.msg('pin-to-works')
									};
									var infoButton = new OO.ui.ButtonWidget({
										icon: 'info'
									});
									var AboutArticleActionButtons = new OO.ui.ButtonGroupWidget({
										items: [
											new OO.ui.ButtonWidget(Object.assign({}, addButtonInfo)),
											infoButton
										],
										classes: ['adiutor-aricle-detail-box-button-group']
									});
									infoButton.on('click', function() {
										loadAdiutorScript('INF');
									});
									var AboutArticleContent = $('<div>').append(mw.msg('page-info-tip', response.created_at, response.author, response.author_editcount, response.revisions, response.editors, response.pageviews, response.pageviews_offset)).append(AboutArticleActionButtons.$element);
									var AboutArticle = new OO.ui.MessageWidget({
										type: 'notice',
										icon: 'article',
										showClose: true,
										label: new OO.ui.HtmlSnippet(AboutArticleContent),
										classes: ['adiutor-aricle-detail-box']
									});
									AboutArticleActionButtons.items[0].on('click', function() {
										if(isAlreadyAdded) {
											var indexToRemove = myArticleWorks.findIndex(function(article) {
												return article.id === newArticleToWorkOnIt.id;
											});
											myArticleWorks.splice(indexToRemove, 1);
										} else {
											adiutorUserOptions.myWorks.push(newArticleToWorkOnIt);
											console.log(newArticleToWorkOnIt);
										}
										// Update the button's text and icon
										var addButtonInfo = {
											icon: isAlreadyAdded ? 'flag' : 'unFlag', // Reverse the icon based on isAlreadyAdded
											label: isAlreadyAdded ? mw.msg('pin-to-works') : mw.msg('unpin-from-works') // Reverse the label based on isAlreadyAdded
										};
										AboutArticleActionButtons.items[0].setIcon(addButtonInfo.icon);
										AboutArticleActionButtons.items[0].setLabel(addButtonInfo.label);
										console.log(adiutorUserOptions);
										updateOptions(adiutorUserOptions);
									});
									if(adiutorUserOptions.inlinePageInfo === true) {
										$('#siteSub').append(AboutArticle.$element);
									}
								}
							};
							xhr.send();
							break;
					}
					var myWorks = new OO.ui.FieldsetLayout({});
					var items = [];
					myArticleWorks = adiutorUserOptions.myWorks;
					if(myArticleWorks.length) {
						myArticleWorks.forEach(function(article) {
							var articleTitle = article.name; // Get the name property from each article
							var articleWidget = new OO.ui.MessageWidget({
								type: 'article',
								icon: 'article',
								label: articleTitle,
								showClose: true,
								classes: ['adiutor-work-list-item'],
							});
							// Add a click event handler to open the link with the articleTitle
							articleWidget.$element.on('click', function() {
								window.location.href = '/wiki/' + encodeURIComponent(articleTitle);
							});
							items.push(articleWidget);
						});
					} else {
						var imageWidget = new OO.ui.MessageWidget({
							type: 'notice',
							icon: 'none',
							inline: true,
							label: new OO.ui.HtmlSnippet('<img width="70px" src="https://upload.wikimedia.org/wikipedia/commons/1/19/Under_construction_blue.svg" alt="">'),
							classes: ['articles-worked-on-popup-search-box-enmpy-image'],
						});
						var textWidget = new OO.ui.LabelWidget({
							label: mw.msg('aticle-work-list-description')
						});
						var horizontalLayout = new OO.ui.HorizontalLayout({
							items: [imageWidget, textWidget],
							classes: ['articles-worked-on-popup-search-box-enmpy'],
						});
						items.push(horizontalLayout);
					}
					// Add the items to the myWorks fieldset
					myWorks.addItems(items);
					var TopSearch = new OO.ui.TextInputWidget({
						placeholder: mw.msg('search-article'), // Add placeholder text
						classes: ['articles-worked-on-popup-search-box'],
					});
					if(myArticleWorks.length) {
						myWorks.addItems(TopSearch);
					}
					myWorks.addItems(items);
					var FooterButtonsGroup = new OO.ui.ButtonGroupWidget({
						items: [
							new OO.ui.ButtonWidget({
								label: mw.msg('clear'),
								framed: true,
								href: '/wiki/',
								icon: 'clear',
								classes: ['articles-worked-on-popup-footer-button']
							}),
							new OO.ui.ButtonWidget({
								label: mw.msg('edit'),
								framed: true,
								href: '/wiki/',
								icon: 'edit',
								classes: ['articles-worked-on-popup-footer-button']
							}),
						],
						classes: ['articles-worked-on-popup-footer-buttons']
					});
					var WorkListButton = new OO.ui.PopupButtonWidget({
						icon: 'flag',
						framed: false,
						label: mw.msg('works'),
						invisibleLabel: true,
						classes: ['articles-worked-on-button'],
						popup: {
							head: true,
							label: mw.msg('my-works'),
							icon: 'flag',
							$content: $(myWorks.$element),
							padded: false,
							align: 'center',
							autoFlip: true,
							$footer: (FooterButtonsGroup.$element),
							classes: ['articles-worked-on-popup'],
						}
					});
					// Listen to search input and show/hide articles
					TopSearch.on('change', function() {
						var query = TopSearch.getValue().toLowerCase();
						items.forEach(function(articleWidget) {
							var articleLabel = articleWidget.getLabel().toLowerCase();
							if(articleLabel.includes(query)) {
								articleWidget.toggle(true);
							} else {
								articleWidget.toggle(false);
							}
						});
					});
					$('#pt-watchlist-2').after($('<li>').append(WorkListButton.$element));
				});
			} catch(error) {
				initializeUserOptions();
			}
		}
	}).fail(function(error) {
		initializeUserOptions();
	});

	function loadAdiutorScript(scriptName) {
		var scriptUrl = '//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-' + scriptName + '.js';
		mw.loader.load(scriptUrl);
	}

	function checkOptions(title) {
		return api.get({
			action: 'query',
			prop: 'revisions',
			rvlimit: 1,
			rvprop: ['user'],
			rvdir: 'newer',
			titles: title,
		});
	}

	function changeUserStatus(status) {
		adiutorUserOptions.status.mySatus = status.mySatus;
		updateOptions(adiutorUserOptions);
	}

	function checkMentor(UserId) {
		api.get({
			action: 'parse',
			page: "MediaWiki:GrowthMentors.json",
			prop: 'wikitext',
			format: "json"
		}).done(function(data) {
			if(data.parse.wikitext['*'].includes(UserId) && mwConfig.wgPageName.includes(mwConfig.wgUserName)) {
				// Load the Adiutor CMR script using the loadAdiutorScript function
				loadAdiutorScript('CMR');
			}
		});
	}

	function updateOptions(updatedOptions) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: "Kullanıcı:" + mwConfig.wgUserName + "/Adiutor-options.json",
			text: JSON.stringify(updatedOptions),
			tags: 'Adiutor',
			summary: '[[VP:Adiutor|Adiutor]] ayarları güncellendi'
		}).done(function() {});
	}
});
/* </nowiki> */