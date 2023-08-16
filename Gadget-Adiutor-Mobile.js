/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Loader
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgUserName", "wgTitle", "wgUserGroups", "wgUserEditCount", "wgUserRegistration", "wgRelevantUserName", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
//Call the packages to be pre-loaded here
if(mwConfig.wgNamespaceNumber === 2) {
	loadAdiutorScript('UPW');
}
if(mwConfig.wgNamespaceNumber === 0) {
	loadAdiutorScript('INF');
}
if(mwConfig.wgNamespaceNumber === 4) {
	if(mwConfig.wgPageName.includes('Silinmeye_aday_sayfalar')) {
		loadAdiutorScript('AFD-Helper');
	}
}
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
			icon: 'flag',
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
			$('.page-actions-menu__list').append(adiutorMenu.$element);
		}
}

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
	api.postWithEditToken({
		action: 'globalpreferences',
		format: 'json',
		optionname: 'userjs-adiutor',
		optionvalue: JSON.stringify(updatedOptions),
		formatversion: 2,
	}).done(function() {});
}
/* </nowiki> */