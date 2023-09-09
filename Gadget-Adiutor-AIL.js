/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Adiutor Interface Launcher
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgUserName", "wgTitle", "wgUserGroups", "wgUserEditCount", "wgUserRegistration", "wgRelevantUserName", "wgCanonicalNamespace", "wgCanonicalSpecialPageName"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
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
		if(mwConfig.wgUserGroups.includes('sysop')) {
			if(!mwConfig.wgCanonicalSpecialPageName) {
				DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
					icon: 'trash',
					data: 'delete',
					label: new OO.ui.deferMsg('delete'),
					flags: ['destructive'],
					classes: ['adiutor-top-user-menu-end'],
				}));
				if(mwConfig.wgNamespaceNumber != 0) {
					if(mwConfig.wgPageName.includes('Hızlı_silinmeye_aday_sayfalar')) {
						DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
							icon: 'trash',
							data: 'batch-delete',
							label: new OO.ui.deferMsg('batch-delete'),
							flags: ['destructive'],
							classes: ['adiutor-top-user-menu-end'],
						}));
					}
					if(mwConfig.wgPageName.includes('Kullanıcı_engelleme_talepleri')) {
						$('.mw-editsection-like').each(function() {
							blockButtonGroup = new OO.ui.ButtonGroupWidget({
								items: [
									blockedAlready = new OO.ui.ButtonWidget({
										framed: false,
										icon: 'tray',
										label: mw.msg('blocked'),
									}),
									blockThisUser = new OO.ui.ButtonWidget({
										framed: false,
										flags: ['destructive'],
										icon: 'block',
										label: mw.msg('block-button-label'),
									})
								]
							});
							blockButtonGroup.$element.css({
								'margin-left': '20px'
							});
							$(this).append(blockButtonGroup.$element);
							blockThisUser.on('click', () => {
								var sectionElement = $(this).closest('.ext-discussiontools-init-section');
								var headlineElement = sectionElement.find('.mw-headline');
								var headlineText = headlineElement.text();
								var dateRegex = /\d{2}-\d{2}-\d{4}/;
								window.adiutorUserToBlock = headlineText.replace(dateRegex, '').trim();
								var sectionID = new URL(sectionElement.find('.mw-editsection a').attr('href')).searchParams.get('section');
								window.sectionID = sectionID;
								window.headlineElement = headlineElement;
								loadAdiutorScript('UBM');
							});
							blockedAlready.on('click', () => {
								var sectionElement = $(this).closest('.ext-discussiontools-init-section');
								var headlineElement = sectionElement.find('.mw-headline');
								var sectionID = new URL(sectionElement.find('.mw-editsection a').attr('href')).searchParams.get('section');
								window.sectionID = sectionID;
								api.postWithToken('csrf', {
									action: 'edit',
									title: mwConfig.wgPageName,
									section: sectionID,
									text: '',
									summary: mw.msg('blocked-user-removed-from-the-noticeboad'),
									tags: 'Adiutor',
									format: 'json'
								}).done(function() {
									headlineElement.css('text-decoration', 'line-through');
								});
							});
						});
					}
				}
				/*DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
					icon: 'lock',
					data: 'protect',
					label: new OO.ui.deferMsg('protect'),
					classes: ['adiutor-top-user-menu-end'],
				}));*/
			}
			if(mwConfig.wgCanonicalSpecialPageName === 'Contributions' || mwConfig.wgNamespaceNumber === 2 || mwConfig.wgNamespaceNumber === 3 && !mwConfig.wgPageName.includes(mwConfig.wgUserName)) {
				if(mwConfig.wgUserGroups.includes('sysop')) {
					DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
						icon: 'block',
						data: 'block',
						label: new OO.ui.deferMsg('block'),
						classes: ['adiutor-top-user-menu-end'],
					}));
				}
			}
		}
		if(mwConfig.wgUserGroups.includes('sysop')) {
			if(/(?:\?|&)(?:action|diff|oldid)=/.test(window.location.href)) {
				DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
					icon: 'cancel',
					data: 'rdr',
					label: new OO.ui.deferMsg('create-revision-deletion-request'),
					classes: ['adiutor-top-rrd-menu'],
				}));
			}
		}
		if(mwConfig.wgCanonicalSpecialPageName === 'Contributions' || mwConfig.wgNamespaceNumber === 2 || mwConfig.wgNamespaceNumber === 3 && !mwConfig.wgPageName.includes(mwConfig.wgUserName)) {
			// Add common buttons
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
		if(!mwConfig.wgCanonicalSpecialPageName) {
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
				icon: 'templateAdd',
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
		if(mwConfig.wgCanonicalSpecialPageName) {
			DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
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
		// Define a variable to track if the menu is open
		var isMenuOpen = false;
		// Listen for mouseover event on the Adiutor menu button
		adiutorMenu.$element.on('mouseover', function() {
			// Open the menu programmatically
			adiutorMenu.getMenu().toggle(true);
			isMenuOpen = true;
		});
		// Listen for mouseout event on the Adiutor menu button
		adiutorMenu.$element.on('mouseout', function(event) {
			// Check if the mouse is leaving the menu area
			if(!event.relatedTarget || !$(event.relatedTarget).closest('.adiutor-top-selector, .adiutor-top-menu').length) {
				adiutorMenu.getMenu().toggle(false);
				isMenuOpen = false;
			}
		});
		// Listen for mouseout event on the entire document
		$(document).on('mouseout', function(event) {
			// Check if the mouse is leaving the menu area
			if(!event.relatedTarget || !$(event.relatedTarget).closest('.adiutor-top-selector, .adiutor-top-menu').length) {
				adiutorMenu.getMenu().toggle(false);
				isMenuOpen = false;
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
				4: 'diff',
				5: 'COV',
				6: 'OPT',
				7: 'INF',
				'report': 'AIV',
				'block': 'UBM',
				'warn': 'WRN',
				'rdr': 'RDR',
				'pmr': 'PMR',
				'rpp': 'RPP',
				'tag': 'TAG',
				'gan': 'GAN',
				'fan': 'FAN',
				'delete': 'DEL',
				'batch-delete': 'BDM'
			};
			// Get the selected option's corresponding script name
			var selectedOption = optionMapping[menuOption.getData()];
			// Handle different actions based on the selected option
			if(selectedOption === 'diff') {
				// Redirect to a specific page with parameters
				window.location = '/w/index.php?title=' + mwConfig.wgPageName + "&diff=cur&oldid=prev&diffmode=source";
			} else if(selectedOption === 'welcome') {
				// Show an alert for the 'welcome' option
				mw.notify('Coming soon :)'.text(), {
					title: mw.msg('warning'),
					type: 'warning'
				});
			} else {
				// Load the Adiutor script based on the selected option
				loadAdiutorScript(selectedOption);
			}
		});
		if(!mwConfig.wgPageName.includes('Anasayfa')) {
			//Call the packages to be pre-loaded here
			if(mwConfig.wgNamespaceNumber === 2) {
				loadAdiutorScript('UPW');
			}
			if(mwConfig.wgNamespaceNumber === 0 && window.location.href.indexOf("action=") === -1) {
				if(adiutorUserOptions.inlinePageInfo === true) {
					loadAdiutorScript('INF');
				}
			}
			if(mwConfig.wgNamespaceNumber === 4) {
				if(mwConfig.wgPageName.includes('Silinmeye_aday_sayfalar')) {
					loadAdiutorScript('AFD-Helper');
				}
			}
			switch(mwConfig.skin) {
				case 'vector':
					$('.mw-portlet-cactions').parent().append(adiutorMenu.$element);
					break;
				case 'vector-2022':
					$('.vector-collapsible').append(adiutorMenu.$element);
					break;
				case 'monobook':
					$('#pt-notifications-notice').append(adiutorMenu.$element);
					break;
				case 'timeless':
					$('#p-cactions-label').append(adiutorMenu.$element);
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
		$('#pt-notifications-notice').after(adiutorIconContainer);
		break;
	case 'vector-2022':
		$('#pt-notifications-notice').after(adiutorIconContainer);
		break;
	case 'monobook':
		$('#pt-notifications-notice').after(adiutorIconContainer);
		break;
	case 'timeless':
		$('#pt-notifications-notice').after(adiutorIconContainer);
		break;
	case 'minerva':
		$('#pt-notifications-notice').after(adiutorIconContainer);
		break;
}
var myWorks = new OO.ui.FieldsetLayout({});
var items = [];
if(adiutorUserOptions.myWorks.length > 0) {
	adiutorUserOptions.myWorks.forEach(function(article) {
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
			window.location.href = '/wiki/' + mw.util.rawurlencode(articleTitle);
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
if(adiutorUserOptions.myWorks.length) {
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
$('#pt-notifications-notice').after($('<li>').append(WorkListButton.$element));
if(adiutorUserOptions.showEditSummaries === true) {
	loadAdiutorScript('SUM');
}

function loadAdiutorScript(scriptName) {
	mw.loader.load(mw.util.getUrl('MediaWiki:Gadget-Adiutor-' + scriptName + '.js', {
		action: 'raw'
	}) + '&ctype=text/javascript', 'text/javascript');
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
/* </nowiki> */