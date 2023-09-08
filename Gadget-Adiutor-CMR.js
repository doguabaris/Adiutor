/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Canned mentor responses
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
var sectionLink, sectionPath, sectionNumber, mentorResponse;
api.get({
	action: "query",
	prop: "revisions",
	titles: "MediaWiki:Gadget-Adiutor-CMR.json",
	rvprop: "content",
	formatversion: 2
}).done(function(data) {
	var content = data.query.pages[0].revisions[0].content;
	var jsonData = JSON.parse(content);
	var predefinedResponses = jsonData.predefinedResponses;
	var apiPostSummary = jsonData.apiPostSummary;
	var userTalkPagePrefix = jsonData.userTalkPagePrefix;
	console.log(predefinedResponses);
	var crButton = new OO.ui.ButtonWidget({
		framed: false,
		label: '['+mw.msg('cmr-canned-response')+']',
		classes: ['adiutor-canned-response-button']
	});
	$('.mw-editsection').append(crButton.$element);
	$(".adiutor-canned-response-button").click(function() {
		var buttonElement = $(this);
		var sectionPath = buttonElement.parent().parent()[0];
		var sectionLink = clearURLfromOrigin(sectionPath.querySelector(".mw-editsection a").getAttribute('href'));
		var match = sectionLink.match(/[?&]section=(\d+)/);
		if(match) {
			sectionNumber = match[1];
		} else {
			console.log("Number not found.");
		}
		openCmrDialog();
	});
	function openCmrDialog() {
		function CannedResponseDialog(config) {
			CannedResponseDialog.super.call(this, config);
		}
		OO.inheritClass(CannedResponseDialog, OO.ui.ProcessDialog);
		CannedResponseDialog.static.name = 'CannedResponseDialog';
		CannedResponseDialog.static.title = mw.msg('cmr-module-title');
		CannedResponseDialog.static.actions = [{
			action: 'save',
			label: mw.msg('cmr-response'),
			flags: 'primary'
		}, {
			label: mw.msg('cancel'),
			flags: 'safe'
		}];
		CannedResponseDialog.prototype.initialize = function() {
			CannedResponseDialog.super.prototype.initialize.apply(this, arguments);
			var menuItems = [].concat.apply([], predefinedResponses.map(function(group) {
				var groupItems = group.options.map(function(option) {
					return new OO.ui.MenuOptionWidget({
						data: option.data,
						label: option.label
					});
				});
				return [new OO.ui.MenuSectionOptionWidget({
					label: group.label
				})].concat(groupItems);
			}));
			var dropdown = new OO.ui.DropdownWidget({
				label: mw.msg('cmr-choose-answer'),
				menu: {
					items: menuItems
				}
			});
			var headerMessage = new OO.ui.MessageWidget({
				type: 'notice',
				inline: true,
				label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('cmr-header-title') + '</strong><br><small>' + mw.msg('cmr-header-description') + '</small>')
			});
			headerMessage.$element.css({'margin-top': '20px','margin-bottom': '20px'});
			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
		
			var previewArea = new OO.ui.Element( {
				text: '',
				classes: [ 'adiutor-mentor-response-preview-area' ]
			} );
			previewArea.$element.css('display', 'none');
			this.content.$element.append(headerMessage.$element,dropdown.$element,previewArea.$element);
			this.$body.append(this.content.$element);
			dropdown.getMenu().on('choose', function(menuOption) {
				mentorResponse = menuOption.getData();
				api.get({
					action: 'parse',
					text: mentorResponse,
					disablelimitreport: 1,
					wrapoutputclass: '',
					contentmodel: 'wikitext',
					contentformat: 'text/x-wiki',
					prop: 'text',
					format: "json"
				}).done(function(data) {
					previewArea.$element.css('display', 'block');
					previewArea.$element.html(data.parse.text['*']);
					windowManager.onWindowResize();
				});
			});
		};
		CannedResponseDialog.prototype.getActionProcess = function(action) {
			var dialog = this;
			if(action) {
				return new OO.ui.Process(function() {
					addResponse(sectionNumber);
					dialog.close({
						action: action
					});
				});
			}
			return CannedResponseDialog.super.prototype.getActionProcess.call(this, action);
		};
		CannedResponseDialog.prototype.getBodyHeight = function() {
			//return this.panel1.$element.outerHeight(true);
			return Math.max(this.content.$element.outerHeight(true), 400);
		};
		var windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		var dialog = new CannedResponseDialog();
		windowManager.addWindows([dialog]);
		windowManager.openWindow(dialog);

		function addResponse(sectionNumber) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: mwConfig.wgPageName,
				section: sectionNumber,
				appendtext: "\n" + ":" + mentorResponse + ' ~~~~',
				summary: apiPostSummary,
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {
				location.reload();
			});
		}
	}
});

function clearURLfromOrigin(sectionPart) {
	return decodeURIComponent(sectionPart.replace('https//:' + mw.config.get("wgServerName") + '/w/index.php?title=', ''));
}
/* </nowiki> */