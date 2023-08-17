/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: User page widget
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
// based on http://en.wikipedia.org/wiki/User:Fran Rogers/dimorphism.js
// and on http://en.wikipedia.org/wiki/User:Splarka/sysopdectector.js
// source: https://en.wikipedia.org/wiki/User:PleaseStand/userinfo.js
if((mw.config.get("wgNamespaceNumber") === 2 || mw.config.get("wgNamespaceNumber") === 3) && !(/\//.test(mw.config.get("wgTitle")))) {
	mw.loader.using(['mediawiki.util'], function() {
		$(function() {
			var encodedTitle = encodeURIComponent(mw.config.get("wgTitle"));
			$.getJSON(mw.config.get("wgScriptPath") + "/api.php?format=json&action=query&list=blocks|users|usercontribs&usprop=blockinfo|editcount|gender|registration|groups&uclimit=1&ucprop=timestamp&ususers=" + encodedTitle + "&ucuser=" + encodedTitle + "&bkusers" + encodedTitle + "&meta=allmessages&amfilter=grouppage").done(function(queryResult) {
				if(!queryResult.query) {
					return;
				}
				var user, invalidUser, missingUser, userGroups, groupPages = {},
					editCount, registrationDate, isBlocked, isPartialBlocked, gender, lastEditedDate;
				try {
					user = queryResult.query.users[0];
					invalidUser = typeof user.invalid !== "undefined";
					missingUser = typeof user.missing !== "undefined";
					userGroups = Array.isArray(user.groups) ? user.groups : [];
					editCount = typeof user.editcount === "number" ? user.editcount : null;
					registrationDate = typeof user.registration === "string" ? new Date(user.registration) : null;
					isBlocked = typeof user.blockedby !== "undefined";
					isPartialBlocked = typeof user.blockpartial !== "undefined";
					gender = typeof user.gender === "string" ? user.gender : null;
					if(typeof queryResult.query.usercontribs[0] === "object" && typeof queryResult.query.usercontribs[0].timestamp === "string") {
						lastEditedDate = new Date(queryResult.query.usercontribs[0].timestamp);
					}
					for(var i = 0; i < queryResult.query.allmessages.length; i++) {
						groupPages[queryResult.query.allmessages[i].name.replace("grouppage-", "")] = queryResult.query.allmessages[i]["*"].replace("{{ns:project}}:", "Vikipedi:");
					}
				} catch(e) {
					return;
				}
				var statusText = "";
				var isIpUser = false;
				var isIPv4User = false;
				var isIPv6User = false;
				// User status
				if(isBlocked) {
					if(isPartialBlocked) {
						blockText = "kısmi engellenmiş";
					} else {
						blockText = "engellenmiş";
					}
					statusText += "<a href=\"" + mw.config.get("wgScriptPath") + "/index.php?title=Special:Log&amp;page=" + encodeURIComponent(mw.config.get("wgFormattedNamespaces")[2] + ":" + user.name) + "&amp;type=block\">" + blockText + "</a> ";
				}
				if(missingUser) {
					statusText += "kullanıcı adı kayıtlı değil";
				} else if(invalidUser) {
					isIPv4User = mw.util.isIPv4Address(user.name);
					isIPv6User = mw.util.isIPv6Address(user.name);
					isIpUser = isIPv4User || isIPv6User;
					if(isIPv4User) {
						statusText += "anonim IPv4 kullanıcısı";
					} else if(isIPv6User) {
						statusText += "anonim IPv6 kullanıcısı";
					} else {
						statusText += "geçersiz kullanıcı adı";
					}
				} else {
					var friendlyGroupNames = {
						// Exclude implicit user group information provided by MW 1.17 --PS 2010-02-17
						'*': false,
						'user': false,
						'autoconfirmed': false,
						sysop: "hizmetli",
						accountcreator: "hesap oluşturucu",
						'import': "importer",
						'interface-editor': "teknisyen",
						'interface-admin': "arayüz yöneticisi",
						patroller: "devriye",
						autoreview: "beyaz liste",
						bureaucrat: "bürokrat",
						transwiki: "vikilerarası içe aktarıcı",
						'ipblock-exempt': "IP engelleme muafı",
						checkuser: "denetçi",
						suppress: "gözetmen",
						confirmed: "onaylanmış kullanıcı",
						abusefilter: "süzgeç yöneticisi",
						autoreviewer: "otomatik onaylanmış kullanıcı",
						epcoordinator: "Eğitim Programı ders koordinatörü",
						epcampus: "Eğitim Programı yerleşke gönüllüsü",
						eponline: "Eğitim Programı çevrimiçi gönüllüsü",
						filemover: "dosya taşıyıcı",
						'massmessage-sender': "toplu mesaj gönderici",
						templateeditor: "şablon editörü"
					};
					var friendlyGroups = [];
					for(var i = 0; i < userGroups.length; i++) {
						var groupName = userGroups[i];
						if(groupName === "named") {
							continue;
						}
						var groupPage = groupPages[groupName] || groupName;
						if(friendlyGroupNames.hasOwnProperty(groupName)) {
							if(friendlyGroupNames[groupName]) {
								friendlyGroups.push("<a href='/wiki/" + encodeURIComponent(groupPage) + "'>" + friendlyGroupNames[groupName] + "</a>");
							}
						} else {
							friendlyGroups.push("<a href='/wiki/" + encodeURIComponent(groupPage) + "'>" + groupName + "</a>");
						}
					}
					switch(friendlyGroups.length) {
						case 0:
							if(isBlocked) {
								statusText += "kullanıcı";
							} else {
								statusText += "kayıtlı kullanıcı";
							}
							break;
						case 1:
							statusText += friendlyGroups[0];
							break;
						case 2:
							statusText += friendlyGroups[0] + " ve " + friendlyGroups[1];
							break;
						default:
							var groupList = friendlyGroups.slice(0, -1).join(", ");
							statusText += groupList + ", ve " + friendlyGroups[friendlyGroups.length - 1];
							break;
					}
				}
				// Registration date
				if(registrationDate) {
					var firstLoggedUserDate = new Date("2005-09-07T22:16:00Z");
					var registrationLink = "";
					if(registrationDate >= firstLoggedUserDate) {
						registrationLink = "<a href='" + mw.config.get("wgScriptPath") + "/index.php?title=Special:Log&amp;type=newusers&amp;dir=prev&amp;limit=1&amp;user=" + encodedTitle + "'>";
					} else {
						registrationLink = "<a href='" + mw.config.get("wgScriptPath") + "/index.php?title=Special:ListUsers&amp;limit=1&amp;username=" + encodedTitle + "'>";
					}
					statusText += ", " + registrationLink + formatRelativeDateDifference(registrationDate) + "</a> önce üye oldu.";
				}
				statusText = "Bu " + statusText;
				// Show the correct gender symbol
				var firstHeading = document.getElementById("firstHeading") || document.getElementById("section-0");
				if(!firstHeading) {
					return;
				}
				// Add classes for blocked, registered, and anonymous users
				var newClasses = [];
				if(isBlocked) {
					newClasses.push("ps-blocked");
				}
				if(isIpUser) {
					newClasses.push("ps-anonymous");
				} else if(invalidUser) {
					newClasses.push("ps-invalid");
				} else {
					newClasses.push("ps-registered");
				}
				firstHeading.className += (firstHeading.className.length ? " " : "") + userGroups.map(function(group) {
					return "ps-group-" + group;
				}).concat(newClasses).join(" ");
				var genderSpan = document.createElement("span");
				genderSpan.id = "ps-gender-" + (gender || "unknown");
				genderSpan.style.paddingLeft = "0.25em";
				genderSpan.style.fontSize = "75%";
				var genderSymbol = "";
				switch(gender) {
					case "male":
						genderSymbol = "\u2642";
						break;
					case "female":
						genderSymbol = "\u2640";
						break;
					default:
						genderSymbol = "";
						break;
				}
				var userPageUsernameDetails = new OO.ui.MessageWidget({
					type: 'success',
					icon: 'userRights',
					inline: false,
					label: new OO.ui.HtmlSnippet('<strong class="username">' + user.name + '</strong><br>' + statusText),
					classes: ['adiutor-user-page-username-details']
				});
				var lastEditedText = "Kullancıı henüz değişiklik yapmamış";
				if(lastEditedDate) {
					lastEditedText = "Son değişikliğini <a href='" + mw.config.get("wgArticlePath").replace("$1", "Special:Contributions/" + encodeURIComponent(user.name)) + "'>" + formatRelativeDateDifference(lastEditedDate) + " önce yaptı</a>";
				}
				var userPageChangeCount = new OO.ui.MessageWidget({
					type: 'notice',
					icon: 'edit',
					inline: false,
					label: new OO.ui.HtmlSnippet('<strong>' + formatQuantityWithCommas(editCount) + ' değişikliğe sahip' + '</strong><br>' + lastEditedText + '.'),
					classes: ['adiutor-user-page-change-count']
				});
				var UnBlockButton = new OO.ui.ButtonWidget({
					icon: 'unBlock',
					label: 'Engeli Kaldır',
					flags: ['destructive']
				});
				var BlockButton = new OO.ui.ButtonWidget({
					icon: 'block',
					label: 'Engelle',
					flags: ['destructive']
				});
				var warnUserButton = new OO.ui.ButtonWidget({
					icon: 'hand',
					label: 'Uyar'
				});
				var userContributions = new OO.ui.ButtonWidget({
					icon: 'edit',
					label: 'Katkılar'
				});
				warnUserButton.on('click', function() {
					loadAdiutorScript('WRN');
				});
				userContributions.on('click', function() {
					window.location.href = '/wiki/Özel:Katkılar/' + encodeURIComponent(user.name);
				});
				UnBlockButton.on('click', function() {
					window.location.href = '/wiki/Özel:EngeliKaldır/' + encodeURIComponent(user.name);
				});
				var userPageActionButtons = new OO.ui.ButtonGroupWidget({
					items: [warnUserButton, userContributions],
					classes: ['adiutor-user-page-button-group']
				});
				if(mwConfig.wgUserGroups.includes('sysop')) {
					if(isBlocked) {
						userPageActionButtons.addItems([UnBlockButton]);
					} else {
						userPageActionButtons.addItems([BlockButton]);
					}
					BlockButton.on('click', function() {
						loadAdiutorScript('UBM');
					});
				}
				var userPageUserDetailStack = new OO.ui.StackLayout({
					items: [userPageUsernameDetails, userPageChangeCount, userPageActionButtons],
					continuous: true,
					classes: ['adiutor-user-page-box-container']
				});
				var userPanelStack;
				if(isBlocked) {
					var blockedUserSection;
					if(isPartialBlocked) {
						blockedUserSection = new OO.ui.MessageWidget({
							type: 'warning',
							icon: 'block',
							label: new OO.ui.HtmlSnippet('<strong>Bu kullanıcı kısmi olarak engellenmiş</strong><br>Bu kullanıcı ' + user.blockedtimestampformatted + ' tarihinde ' + user.blockreason + ' gerekçesi ile ' + user.blockedby + ' tarafından engellenmiş.')
						});
					} else {
						blockedUserSection = new OO.ui.MessageWidget({
							type: 'error',
							icon: 'block',
							label: new OO.ui.HtmlSnippet('<strong>Bu kullanıcı engellenmiş</strong><br>Bu kullanıcı ' + user.blockedtimestampformatted + ' tarihinde ' + user.blockreason + ' gerekçesi ile ' + user.blockedby + ' tarafından engellenmiş.')
						});
					}
					userPanelStack = new OO.ui.StackLayout({
						items: [userPageUserDetailStack, blockedUserSection],
						continuous: true,
						classes: ['adiutor-user-page-container']
					});
				} else {
					userPanelStack = new OO.ui.StackLayout({
						items: [userPageUserDetailStack],
						continuous: true,
						classes: ['adiutor-user-page-container']
					});
				}
				$('.ve-init-mw-desktopArticleTarget-targetContainer').prepend(userPanelStack.$element);
			});
		});
	});
}

function formatQuantityWithCommas(number) {
	return String(number).replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
}

function formatRelativeDateDifference(oldDate) {
	var currentTime = new Date().getTime();
	var ageInMilliseconds = currentTime - oldDate.getTime();
	var ageNumber, ageRemainder, ageDescription;
	if(ageInMilliseconds < 60000) {
		ageNumber = Math.floor(ageInMilliseconds / 1000);
		ageDescription = formatQuantityWithCommas(ageNumber) + "\u00a0saniye";
	} else if(ageInMilliseconds < 3600000) {
		ageNumber = Math.floor(ageInMilliseconds / 60000);
		ageDescription = formatQuantityWithCommas(ageNumber) + "\u00a0dakika";
	} else if(ageInMilliseconds < 86400000) {
		ageNumber = Math.floor(ageInMilliseconds / 3600000);
		ageDescription = formatQuantityWithCommas(ageNumber) + "\u00a0saat";
		ageRemainder = Math.floor((ageInMilliseconds - ageNumber * 3600000) / 60000);
	} else if(ageInMilliseconds < 604800000) {
		ageNumber = Math.floor(ageInMilliseconds / 86400000);
		ageDescription = formatQuantityWithCommas(ageNumber) + "\u00a0gün";
	} else if(ageInMilliseconds < 2592000000) {
		ageNumber = Math.floor(ageInMilliseconds / 604800000);
		ageDescription = formatQuantityWithCommas(ageNumber) + "\u00a0hafta";
	} else if(ageInMilliseconds < 31536000000) {
		ageNumber = Math.floor(ageInMilliseconds / 2592000000);
		ageDescription = formatQuantityWithCommas(ageNumber) + "\u00a0ay";
	} else {
		ageNumber = Math.floor(ageInMilliseconds / 31536000000);
		ageDescription = formatQuantityWithCommas(ageNumber) + "\u00a0yıl";
		ageRemainder = Math.floor((ageInMilliseconds - ageNumber * 31536000000) / 2592000000);
		if(ageRemainder) {
			ageDescription += " " + formatQuantityWithCommas(ageRemainder) + "\u00a0ay";
		}
	}
	return ageDescription;
}

function loadAdiutorScript(scriptName) {
	var scriptUrl = '//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-' + scriptName + '.js';
	mw.loader.load(scriptUrl);
}
/* </nowiki> */