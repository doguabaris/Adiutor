/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Featured article nomination
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-'+wikiId));
var NominatedPreviously;
var nextNominationNumber = 0;

function FeaturedArticleNominationDialog(config) {
	FeaturedArticleNominationDialog.super.call(this, config);
}
OO.inheritClass(FeaturedArticleNominationDialog, OO.ui.ProcessDialog);
FeaturedArticleNominationDialog.static.name = 'FeaturedArticleNominationDialog';
FeaturedArticleNominationDialog.static.title = 'Adiutor (Beta) - Seçkin Madde Adaylığı';
FeaturedArticleNominationDialog.static.actions = [{
	action: 'save',
	label: 'Devam',
	flags: ['primary', 'progressive']
}, {
	label: 'İptal',
	flags: 'safe'
}];
FeaturedArticleNominationDialog.prototype.initialize = function() {
	FeaturedArticleNominationDialog.super.prototype.initialize.apply(this, arguments);
	var headerTitle = new OO.ui.MessageWidget({
		type: 'error',
		inline: true,
		label: new OO.ui.HtmlSnippet('<strong>Seçkin Madde Adaylığı</strong><br><small>Vikipedi\'deki maddelerden hangilerinin seçkin madde statüsünü alacağı kararlaştırılır. Seçkin maddeler, kullanıcılar tarafından Vikipedi\'nin en iyileri olarak belirlenen maddelerdir. Bu maddeler, <a href="https://tr.wikipedia.org/wiki/Vikipedi:Seçkin_madde_kriterleri">seçkin madde kriterlerine</a> göre kullanışlılık, bütünlük, doğruluk, tarafsızlık ve biçem açısından bu sayfada değerlendirilirler. Eğer bu konuda şüpheniz veya maddeyi aday göstermeden önce daha da geliştirebilmek için görüş almaya ihtiyacınız varsa madde incelemesi için başvurabilirsiniz.</small>')
	});
	var headerTitle2 = new OO.ui.MessageWidget({
		type: 'warning',
		inline: true,
		label: new OO.ui.HtmlSnippet('<strong>Bir maddeyi aday göstermeden önce, maddenin kaliteli madde kriterlerinin tamamını karşıladığından emin olun. Halihazırda açık bir <a href="https://tr.wikipedia.org/wiki/Vikipedi:Madde_incelemesi">madde incelemesi</a> tartışması varsa, bunun sonlanmasını bekleyin.</small>')
	});
	CandidateOptions = new OO.ui.FieldsetLayout({});
	CandidateOptions.addItems([
		rationaleField = new OO.ui.FieldLayout(rationaleInput = new OO.ui.MultilineTextInputWidget({
			placeholder: 'Bu sayfayı neden aday göstermek istiyorsun?',
			indicator: 'required',
			value: '',
		}), {
			label: 'Gerekçe',
			align: 'inline',
		})
	]);
	this.content = new OO.ui.PanelLayout({
		padded: true,
		expanded: false,
		isDraggable: true
	});
	this.content.$element.append(headerTitle.$element, '<br>', headerTitle2.$element, '<br>', CandidateOptions.$element);
	this.$body.append(this.content.$element);
};
FeaturedArticleNominationDialog.prototype.getActionProcess = function(action) {
	var dialog = this;
	if(action) {
		return new OO.ui.Process(function() {
			var FANTemplate;
			var ActionOptions = [];
			CandidateOptions.items.forEach(function(Option) {
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
			checkPreviousNominations("Vikipedi:Seçkin madde adayları/" + mwConfig.wgPageName).then(function(data) {
				if(data.query.pages["-1"]) {
					var nomCount = 0;
					console.log(nomCount);
					NominatedPreviously = false;
					FANTemplate = '{{SMA}}';
					putTemplate(FANTemplate, nextNominationNumber);
				} else {
					Rec(2);
				}
			});

			function Rec(nomCount) {
				checkPreviousNominations("Vikipedi:Seçkin madde adayları/" + mwConfig.wgPageName + ' ' + '(' + nomCount + '._aday_gösterme)').then(function(data) {
					if(!data.query.pages["-1"]) {
						Rec(nomCount + 1);
					} else {
						nextNominationNumber = nomCount++;
						console.log(nextNominationNumber);
						if(nextNominationNumber > 1) {
							FANTemplate = '{{SMA|' + nextNominationNumber + '|' + '}}';
						} else {
							FANTemplate = '{{SMA}}';
						}
						console.log(FANTemplate);
						putTemplate(FANTemplate, nextNominationNumber);
					}
				});
			}
			dialog.close({
				action: action
			});
			showProgress();
		});
	}
	return FeaturedArticleNominationDialog.super.prototype.getActionProcess.call(this, action);
};
var windowManager = new OO.ui.WindowManager();
$(document.body).append(windowManager.$element);
var dialog = new FeaturedArticleNominationDialog({
	size: 'large',
	classes: ['afd-helper-window'],
	isDraggable: true
});
windowManager.addWindows([dialog]);
windowManager.openWindow(dialog);

function putTemplate(FANTemplate, nextNominationNumber) {
	var PageGFA;
	if(nextNominationNumber > 1) {
		PageGFA = mwConfig.wgPageName + ' (' + nextNominationNumber + '._aday_gösterme)';
	} else {
		PageGFA = mwConfig.wgPageName;
	}
	api.postWithToken('csrf', {
		action: 'edit',
		title: 'Tartışma:' + mwConfig.wgPageName,
		prependtext: FANTemplate + "\n",
		summary: 'Sayfa [[VP:SMA|Seçkin madde adayı]] gösterildi',
		tags: 'Adiutor',
		format: 'json'
	}).done(function() {
		createNominationPage(PageGFA);
		logNomination(PageGFA);
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

function createNominationPage(PageGFA) {
	api.postWithToken('csrf', {
		action: 'edit',
		title: 'Vikipedi:Seçkin_madde_adayları/' + PageGFA,
		appendtext: '=== [[' + mwConfig.wgPageName.replace(/_/g, " ") + ']] === \n' + rationaleInput.value + ' ~~~~' + "\n",
		summary: 'Sayfa [[VP:SMA|Seçkin madde adayı]] gösterildi',
		tags: 'Adiutor',
		format: 'json'
	}).done(function() {
		addNominationToFanPage(PageGFA);
	});
}

function addNominationToFanPage(PageGFA) {
	var pageContent;
	api.get({
		action: 'parse',
		page: "Vikipedi:Seçkin_madde_adayları",
		prop: 'wikitext',
		format: "json"
	}).done(function(data) {
		pageContent = data.parse.wikitext['*'];
		var NominatedBefore = pageContent.includes("{{Vikipedi:Seçkin madde adayları/" + PageGFA.replace(/_/g, " ") + "}}");
		if(!NominatedBefore) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: "Vikipedi:Seçkin_madde_adayları",
				appendtext: "\n" + "{{Vikipedi:Seçkin madde adayları/" + PageGFA.replace(/_/g, " ") + "}}",
				summary: "Adaylık [[Vikipedi:Seçkin madde adayları|sma]] listesine eklendi.",
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {
				addNominationToFanLogPage(PageGFA);
			});
		}
	});
}

function addNominationToFanLogPage(PageGFA) {
	var date = new Date();
	var date_months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
	var date_year = date.getUTCFullYear();
	var month_name = date_months[date.getUTCMonth()];
	var pageContent;
	api.get({
		action: 'parse',
		page: "Vikipedi:Seçkin_madde_adayları/Arşiv/" + month_name + "_" + date_year,
		prop: 'wikitext',
		format: "json"
	}).done(function(data) {
		pageContent = data.parse.wikitext['*'];
		var NominatedBefore = pageContent.includes("{{Vikipedi:Seçkin madde adayları/" + PageGFA.replace(/_/g, " ") + "}}");
		//Eğer daha önce aday gösterilmişe
		if(!NominatedBefore) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: "Vikipedi:Seçkin_madde_adayları/Arşiv/" + month_name + "_" + date_year,
				appendtext: "\n" + "{{Vikipedi:Seçkin madde adayları/" + PageGFA.replace(/_/g, " ") + "}}",
				summary: "Adaylık [[Vikipedi:Seçkin madde adayları/Arşiv/" + month_name + " " + date_year + "|mevcut ayın]] kayıtlarına eklendi.",
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {
				window.location = '/wiki/Vikipedi:Seçkin madde adayları/' + PageGFA.replace(/_/g, " ");
			});
		} else {
			window.location = '/wiki/Vikipedi:Seçkin madde adayları/' + PageGFA.replace(/_/g, " ");
		}
	});
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
/* </nowiki> */