/* Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience. */
/* Author: Vikipolimer */
/* Learn more at: https://meta.wikimedia.org/wiki/Adiutor */
/* Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) */
/* Module: Administrator intervention against vandalism */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var wikiId = mw.config.get("wgWikiID");
var adiutorUserOptions = JSON.parse(mw.user.options.get("userjs-adiutor-" + wikiId));
var rationaleInput, VandalizedPageInput, reportType, sockPuppetsList, sockpuppetryType, revId;
var VandalizedPage = {};
VandalizedPage.value = null;
var revisionID = {};
revisionID.value = null;
var sockpuppeteerInput;

function fetchApiData(callback) {
	var api = new mw.Api();
	api.get({
		action: "query",
		prop: "revisions",
		titles: "MediaWiki:Gadget-Adiutor-AIV.json",
		rvprop: "content",
		formatversion: 2
	}).done(function(data) {
		var content = data.query.pages[0].revisions[0].content;
		try {
			var jsonData = JSON.parse(content);
			callback(jsonData);
		} catch(error) {
			// Handle JSON parsing error
			mw.notify('Failed to parse JSON data from API.', {
				title: mw.msg('operation-failed'),
				type: 'error'
			});
		}
	}).fail(function() {
		// Handle API request failure
		mw.notify('Failed to fetch data from the API.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		// You may choose to stop code execution here
	});
}
fetchApiData(function(jsonData) {
	if(!jsonData) {
		// Handle a case where jsonData is empty or undefined
		mw.notify('MediaWiki:Gadget-Adiutor-WRN.json data is empty or undefined.', {
			title: mw.msg('operation-failed'),
			type: 'error'
		});
		// You may choose to stop code execution here
		return;
	}
	var reportRationales = jsonData.reportRationales;
	var noticeBoardTitle = jsonData.noticeBoardTitle;
	var noticeBoardLink = noticeBoardTitle.replace(/ /g, '_');
	var vandalTemplate = jsonData.vandalTemplate;
	var apiPostSummary = jsonData.apiPostSummary;
	var userPagePrefix = jsonData.userPagePrefix;
	var userTalkPagePrefix = jsonData.userTalkPagePrefix;
	var specialContibutions = jsonData.specialContibutions;
	var rationaleText = jsonData.rationaleText;
	var userReported = getFormattedPageName();

	function AivDialog(config) {
		AivDialog.super.call(this, config);
	}
	OO.inheritClass(AivDialog, OO.ui.ProcessDialog);
	AivDialog.static.name = "AivDialog";
	AivDialog.static.title = new OO.ui.deferMsg("aiv-module-title");
	AivDialog.static.actions = [{
		action: "save",
		label: new OO.ui.deferMsg("report"),
		flags: ["primary", "progressive"]
	}, {
		label: new OO.ui.deferMsg("cancel"),
		flags: "safe"
	}];
	AivDialog.prototype.initialize = function() {
		AivDialog.super.prototype.initialize.apply(this, arguments);
		var headerTitle = new OO.ui.MessageWidget({
			type: "notice",
			inline: true,
			label: new OO.ui.deferMsg("aiv-header-title")
		});
		var headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg("aiv-header-description")
		});
		// Add margin-top to headerTitleDescription
		headerTitleDescription.$element.css({
			"margin-top": "20px",
			"font-weight": "300"
		});
		var RationaleSelector = new OO.ui.DropdownWidget({
			menu: {
				items: [
					new OO.ui.MenuOptionWidget({
						data: 1,
						label: new OO.ui.deferMsg("vandalism")
					}),
					new OO.ui.MenuOptionWidget({
						data: 2,
						label: new OO.ui.deferMsg("username-violation")
					}),
					new OO.ui.MenuOptionWidget({
						data: 3,
						label: new OO.ui.deferMsg("sockpuppeteer")
					}),
					new OO.ui.MenuOptionWidget({
						data: 4,
						label: new OO.ui.deferMsg("sockpuppet")
					})
				]
			},
			label: new OO.ui.deferMsg("report-type")
		});
		// Add margin-top to RationaleSelector
		RationaleSelector.$element.css("margin-top", "20px");
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		var RequestRationaleContainer = new OO.ui.FieldsetLayout({
			classes: ["adiutor-report-window-rationale-window"]
		});
		RequestRationaleContainer.$element.css("margin-top", "20px");
		RationaleSelector.getMenu().on("choose", function(menuOption) {
			switch(menuOption.getData()) {
				case 1:
					RequestRationale = new OO.ui.FieldsetLayout({
						label: mw.msg('rationale')
					});
					var generalRationales = reportRationales.filter(function(item) {
						return item.related === "general";
					});
					RequestRationale.addItems([
						new OO.ui.FieldLayout(VandalizedPage = new OO.ui.TextInputWidget({
							value: ""
						}), {
							label: new OO.ui.deferMsg("related-page"),
							help: new OO.ui.deferMsg("related-page-description")
						}),
						new OO.ui.FieldLayout(revisionID = new OO.ui.TextInputWidget({
							value: ""
						}), {
							label: new OO.ui.deferMsg("revision-id"),
							help: new OO.ui.deferMsg("revision-id-description")
						}),
					]);
					generalRationales.forEach(function(rationaleItem) {
						RequestRationale.addItems([
							new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: false,
								data: rationaleItem.data
							}), {
								label: rationaleItem.label,
								align: "inline"
							}),
						]);
					});
					reportType = "regularReport";
					break;
				case 2:
					RequestRationale = new OO.ui.FieldsetLayout({
						label: mw.msg('rationale')
					});
					// Burada, reportRationales setinden gelen ve related değeri username olan öğeleri filtreleyerek yeni bir dizi oluşturuyoruz.
					var usernameRationales = reportRationales.filter(function(item) {
						return item.related === "username";
					});
					// Şimdi bu usernameRationales dizisini kullanarak RequestRationale'a öğeleri ekleyebiliriz.
					usernameRationales.forEach(function(rationaleItem) {
						RequestRationale.addItems([
							new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
								selected: false,
								data: rationaleItem.data
							}), {
								label: rationaleItem.label,
								align: "inline"
							}),
						]);
					});
					reportType = "regularReport";
					break;
				case 3:
					RequestRationale = new OO.ui.FieldsetLayout({
						label: mw.msg("report-suspected-sockpuppeteer")
					});
					RequestRationale.addItems([
						new OO.ui.MessageWidget({
							type: "warning",
							inline: true,
							label: mw.msg("sockpuppetry-warning-text")
						}),
						new OO.ui.FieldLayout(sockPuppetsList = new OO.ui.TagMultiselectWidget({
							placeholder: mw.msg("sockpuppets-input-placeholder"),
							allowArbitrary: true
						})),
						new OO.ui.FieldLayout(evidenceTextInput = new OO.ui.MultilineTextInputWidget({
							placeholder: mw.msg('evidence-input-placeholder'),
							value: "",
							indicator: "required"
						}), {
							label: mw.msg('evidence'),
							align: "inline"
						}),
					]);
					reportType = "sockpuppetry";
					sockpuppetryType = "sockpuppeteer";
					break;
				case 4:
					RequestRationale = new OO.ui.FieldsetLayout({
						label: mw.msg("report-suspected-sockpuppet")
					});
					RequestRationale.addItems([
						new OO.ui.MessageWidget({
							type: "warning",
							inline: true,
							label: mw.msg("sockpuppetry-warning-text")
						}),
						new OO.ui.FieldLayout(sockpuppeteerInput = new OO.ui.TextInputWidget({
							value: "",
							indicator: "required"
						}), {
							label: mw.msg('sockpuppeteer'),
							help: mw.msg('sockpuppeteer-help-text')
						}),
						new OO.ui.FieldLayout(evidenceTextInput = new OO.ui.MultilineTextInputWidget({
							placeholder: mw.msg('evidence-input-placeholder'),
							value: "",
							indicator: "required"
						}), {
							label: mw.msg('evidence'),
							align: "inline"
						}),
					]);
					reportType = "sockpuppetry";
					sockpuppetryType = "sockpuppet";
					break;
			}
			console.log(reportType);
			RequestRationaleContainer.$element.html(RequestRationale.$element);
			windowManager.onWindowResize();
		});
		this.content.$element.append(headerTitle.$element, headerTitleDescription.$element, RationaleSelector.$element, RequestRationaleContainer.$element);
		this.$body.append(this.content.$element);
	};
	AivDialog.prototype.getActionProcess = function(action) {
		if(action) {
			switch(reportType) {
				case "sockpuppetry":
					switch(sockpuppetryType) {
						case "sockpuppeteer":
							var selectedValues = sockPuppetsList.getValue();
							var sockpuppets = selectedValues.map(function(value) {
								return "\n* {{checkuser|" + value + "}}";
							});
							var formattedSockpuppets = sockpuppets.join("");
							preparedText = "=== " + userReported + " === \n* {{checkuser|" + userReported + "}}" + formattedSockpuppets + "\n" + evidenceTextInput.value + " ~~~~";
							postSockpuppetRequest(userReported);
							break;
						case "sockpuppet":
							preparedText = "=== " + sockpuppeteerInput.value + " === \n* {{checkuser|" + sockpuppeteerInput.value + "}}  \n* {{checkuser|" + userReported + "}}\n" + evidenceTextInput.value + ". ~~~~";
							postSockpuppetRequest(sockpuppeteerInput.value);
							break;
					}
					break;
				case "regularReport":
					if(RequestRationale) {
						var rationaleInput = findSelectedRationale();
						if(rationaleInput) {
							var rationale = rationaleText.replace(/\$1/g, VandalizedPage.value).replace(/\$2/g, revisionID.value ? '([[Special:Diff|' + revisionID.value + ']])' : '').replace(/\$3/g, rationaleInput);
							preparedText = '{{subst:' + vandalTemplate + '|' + userReported + '}}\n' + rationale + ' ~~~~';
							postRegularReport();
						} else {
							mw.notify(mw.msg('select-rationale'), {
								title: mw.msg('operation-failed'),
								type: 'warning'
							});
						}
					}
					break;
			}
		}
		return AivDialog.super.prototype.getActionProcess.call(this, action);
	};

	function getFormattedPageName() {
		var cleanedPageName = mwConfig.wgPageName.replace(/_/g, " ").replace(userPagePrefix, '').replace(specialContibutions, '').replace(userTalkPagePrefix, '');
		return cleanedPageName;
	}

	function postSockpuppetRequest(sockpuppeteer) {
		api.postWithToken("csrf", {
			action: "edit",
			title: "Vikipedi:Denetçi isteği/Dava/" + sockpuppeteer,
			appendtext: "\n" + preparedText + "\n",
			summary: "[[Kullanıcı:" + sockpuppeteer + "]] davası oluşturuldu.",
			tags: "Adiutor",
			format: "json"
		}).done(function() {
			api.postWithToken("csrf", {
				action: "edit",
				title: "Vikipedi:Denetçi isteği",
				appendtext: "\n{{Vikipedi:Denetçi isteği/Dava/" + sockpuppeteer + "}}",
				summary: "[[Vikipedi:Denetçi isteği/Dava/" + sockpuppeteer + "|Dava]] eklendi.",
				tags: "Adiutor",
				format: "json"
			}).done(function() {
				window.location = "/wiki/Vikipedi:Denetçi isteği/Dava/" + sockpuppeteer;
			});
		});
	}

	function findSelectedRationale() {
		var rationaleInput = null;
		RequestRationale.items.forEach(function(Rationale) {
			if(Rationale.fieldWidget.selected) {
				rationaleInput = Rationale.fieldWidget.data;
			}
		});
		return rationaleInput;
	}

	function postRegularReport() {
		api.postWithToken("csrf", {
			action: "edit",
			title: noticeBoardTitle,
			section: 'new',
			sectiontitle: userReported,
			text: preparedText,
			summary: apiPostSummary,
			tags: "Adiutor",
			format: "json"
		}).done(function() {
			adiutorUserOptions.stats.blockRequests++;
			api.postWithEditToken({
				action: "globalpreferences",
				format: "json",
				optionname: "userjs-adiutor",
				optionvalue: JSON.stringify(adiutorUserOptions),
				formatversion: 2
			}).done(function() {});
			window.location = "/wiki/" + noticeBoardLink;
		});
	}
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new AivDialog();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);
});
/* </nowiki> */