/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Proposed deletion
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-'+wikiId));

function ProposedDeletionDialog(config) {
	ProposedDeletionDialog.super.call(this, config);
}
OO.inheritClass(ProposedDeletionDialog, OO.ui.ProcessDialog);
ProposedDeletionDialog.static.name = 'ProposedDeletionDialog';
ProposedDeletionDialog.static.title = new OO.ui.deferMsg('rpp-module-title');
ProposedDeletionDialog.static.actions = [{
	action: 'save',
	label: new OO.ui.deferMsg('propose'),
	flags: ['primary', 'progressive']
}, {
	label: new OO.ui.deferMsg('cancel'),
	flags: 'safe'
}];
ProposedDeletionDialog.prototype.initialize = function() {
	ProposedDeletionDialog.super.prototype.initialize.apply(this, arguments);
	var headerTitle = new OO.ui.MessageWidget({
		type: 'notice',
		inline: true,
		label: new OO.ui.deferMsg('prd-header-title')
	});
	var headerTitleDescription = new OO.ui.LabelWidget({
		label: new OO.ui.deferMsg('prd-header-description')
	});
	ProposeOptions = new OO.ui.FieldsetLayout({
		label: new OO.ui.deferMsg('prd-deletion-type')
	});
	ProposeOptions.addItems([
		new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: false,
			value: 'standardPropose'
		}), {
			label: new OO.ui.deferMsg('prd-deletion-type-1'),
			help: new OO.ui.deferMsg('prd-deletion-type-1-help'),
			align: 'inline'
		}),
		new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: false,
			value: 'LivingPersonPropose'
		}), {
			label: new OO.ui.deferMsg('prd-deletion-type-2'),
			help: new OO.ui.deferMsg('prd-deletion-type-2-help'),
			align: 'inline'
		}), rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
			placeholder: new OO.ui.deferMsg('prd-deletion-rationale'),
			indicator: 'required',
			value: '',
		}), {
			label: new OO.ui.deferMsg('rationale'),
			align: 'inline',
		}),
		new OO.ui.FieldLayout(new OO.ui.ToggleSwitchWidget({
			value: adiutorUserOptions.proposedDeletion.prdSendMessageToCreator,
			data: 'informCreator'
		}), {
			label: new OO.ui.deferMsg('afd-inform-creator'),
			align: 'top',
			help: new OO.ui.deferMsg('afd-inform-creator-help'),
		})
	]);
	rationaleInput.on('change', function() {
		if(rationaleInput.value != "") {
			InputFilled = false;
		} else {
			InputFilled = true;
		}
	});
	this.content = new OO.ui.PanelLayout({
		padded: true,
		expanded: false
	});
	this.content.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<br><hr><br>', ProposeOptions.$element);
	this.$body.append(this.content.$element);
};
ProposedDeletionDialog.prototype.getActionProcess = function(action) {
	var dialog = this;
	if(action) {
		return new OO.ui.Process(function() {
			var date = new Date();
			var Months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
			var PRDText;
			var PRDoptions = [];
			ProposeOptions.items.forEach(function(Option) {
				if(Option.fieldWidget.selected) {
					PRDoptions.push({
						value: Option.fieldWidget.value,
						selected: Option.fieldWidget.selected
					});
				}
				if(Option.fieldWidget.value === true) {
					PRDoptions.push({
						value: Option.fieldWidget.value,
						data: Option.fieldWidget.data
					});
				}
			});
			PRDoptions.forEach(function(Option) {
				if(Option.value === "standardPropose") {
					PRDText = '{{Bekletmeli sil-tarih |sorun = ' + rationaleInput.value + ' |gün = ' + date.getDate() + ' |ay = ' + Months[date.getUTCMonth()] + ' |yıl = ' + date.getUTCFullYear() + ' |isteyen = ' + mwConfig.wgUserName + ' }}';
				}
				if(Option.value === "LivingPersonPropose") {
					PRDText = '{{yk:bekletmeli sil|Hiçbir kaynak içermeyen [[VP:YİB|yaşayan insan biyografisi]]|yardım=kapalı}}';
				}
				if(Option.data === "informCreator") {
					getCreator().then(function(data) {
						var Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
						if(!mw.util.isIPAddress(Author)) {
							var message = '{{subst:Bs bildirim|' + mwConfig.wgPageName.replace(/_/g, " ") + '}}';
							sendMessageToAuthor(Author, message);
						}
					});
				}
			});
			putPRDTemplate(PRDText);
			logRequest(rationaleInput.value, adiutorUserOptions);
			dialog.close({
				action: action
			});
		});
	}
	return ProposedDeletionDialog.super.prototype.getActionProcess.call(this, action);
};
var windowManager = new OO.ui.WindowManager();
$(document.body).append(windowManager.$element);
var dialog = new ProposedDeletionDialog();
windowManager.addWindows([dialog]);
windowManager.openWindow(dialog);

function putPRDTemplate(PRDText) {
	api.postWithToken('csrf', {
		action: 'edit',
		title: mwConfig.wgPageName,
		prependtext: PRDText + "\n",
		summary: '[[VP:SÖ]] uyarınca sayfanın sililinmesi önerildi',
		tags: 'Adiutor',
		format: 'json'
	}).done(function() {
		adiutorUserOptions.stats.prodRequests++;
		api.postWithEditToken({
			action: 'globalpreferences',
			format: 'json',
			optionname: 'userjs-adiutor',
			optionvalue: JSON.stringify(adiutorUserOptions),
			formatversion: 2,
		}).done(function() {});
		location.reload();
	});
}

function logRequest(rationaleInput, adiutorUserOptions) {
	if(adiutorUserOptions.proposedDeletion.prdLogNominatedPages === true) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: 'Kullanıcı:'.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.proposedDeletion.prdLogNominatedPages + '').split(' ').join('_'),
			appendtext: "\n" + "# '''[[" + mwConfig.wgPageName.replace(/_/g, " ") + "|" + mwConfig.wgPageName.replace(/_/g, " ") + "]]''' " + rationaleInput + " ~~~~~",
			summary: '[[' + mwConfig.wgPageName.replace(/_/g, " ") + ']] sayfasının bekletmeli silme adaylığının günlük kaydı tutuluyor.',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {});
	}
}

function getCreator() {
	return api.get({
		action: 'query',
		prop: 'revisions',
		rvlimit: 1,
		rvprop: ['user'],
		rvdir: 'newer',
		titles: mwConfig.wgPageName
	});
}

function sendMessageToAuthor(Author, message) {
	api.postWithToken('csrf', {
		action: 'edit',
		title: 'Kullanıcı_mesaj:' + Author,
		appendtext: '\n' + message,
		summary: '[[VP:SÖ]] uyarınca  [[' + mwConfig.wgPageName.replace(/_/g, " ") + ']]' + ' sayfasının silinmesi önerildi',
		tags: 'Adiutor',
		format: 'json'
	});
}
/* </nowiki> */