/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Edit summaries helper
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
// Create an API instance
var api = new mw.Api();
// Get user options from Adiutor configuration
var wikiId = mw.config.get('wgWikiID');
var wikiAdiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor') || '{}'); // Provide a default empty object if no options are set.
var adiutorUserOptions = wikiAdiutorUserOptions[wikiId];
// Select the summary box and summary textarea
var $summaryBox, $summaryTextarea = $('#wpSummary');
// Different summary categories for different types of edits
var summaryCategories = {
	general: ['Yazım hatası düzeltildi', 'Üslup iyileştirildi', 'Medya içeriği eklendi', 'Ufak düzenleme yapıldı', 'Geniş kapsamlı düzenleme gerçekleştirildi, [[Şablon:Düzenle|Düzenle]] şablonu kaldırıldı', 'Bağlantı düzeltilmesi', 'Güncelleme yapıldı', 'Kaynak ekleme/iyileştirme yapıldı', 'İçerik genişletildi', 'Dış bağlantı(lar) eklendi/değiştirildi', 'Kategori(ler) eklendi/değiştirildi', 'Interwiki/kategori eklendi/değiştirildi'],
	article: ['Silinmiş Commmons dosyası çıkarıldı', 'Telif hakkı ihlali tespit edildi', 'Ansiklopedik olmayan içerik çıkarıldı', 'İlgisiz kategori(ler) kaldırıldı', 'İlgisiz dış bağlantı(lar) çıkarıldı', 'İlgisiz dil bağlantıları kaldırıldı', 'Kaynağı olmayan içerik çıkarıldı', 'Reklam amacı taşıyan veya ilgisiz dış bağlantı çıkarıldı', 'Temizleme yapıldı'],
	nonArticle: ['Yanıt verildi', 'Yorum eklendi', 'Öneri sunuldu'],
	talkPage: ['[[Vikipedi:Vikiproje|Vikiproje]] işareti eklendi', '[[Vikipedi:Vikiproje|Vikiproje]] değerlendirmesi yapıldı']
};
// Assuming adiutorUserOptions.myCustomSummaries is an array of custom summaries
summaryCategories.general = summaryCategories.general.concat(adiutorUserOptions.myCustomSummaries);
// Function to add options to a dropdown menu
function addOptionsToDropdown(dropdown, optionTexts) {
	optionTexts.forEach(function(optionText) {
		dropdown.menu.addItems([new OO.ui.MenuOptionWidget({
			label: optionText
		})]);
	});
}
// Function to handle selection of a summary option
function onSummarySelect(option) {
	var originalSummary = $summaryTextarea.val(),
		cannedSummary = option.getLabel(),
		newSummary = originalSummary;
	if(newSummary.length !== 0 && newSummary.charAt(newSummary.length - 1) !== ' ') {
		newSummary += ' ';
	}
	newSummary += cannedSummary;
	$summaryTextarea.val(newSummary).trigger('change');
}
// Function to insert summary options into the editing interface
function insertSummaryOptions($insertBeforeElement) {
	var namespace = mw.config.get('wgNamespaceNumber'),
		$optionsContainer = $('<div>').css('display', 'flex');
	// Dropdown for article-related edits
	var dropdown = new OO.ui.DropdownWidget({
		label: mw.msg('namespace-edit-summaries')
	});
	dropdown.menu.on('select', onSummarySelect);
	addOptionsToDropdown(dropdown, namespace === 0 ? summaryCategories.article : summaryCategories.nonArticle);
	$optionsContainer.append(dropdown.$element);
	// Dropdown for general edits
	var generalDropdown = new OO.ui.DropdownWidget({
		label: mw.msg('common-edit-summaries')
	});
	generalDropdown.menu.on('select', onSummarySelect);
	addOptionsToDropdown(generalDropdown, summaryCategories.general);
	$optionsContainer.append(generalDropdown.$element);
	// Dropdown for talk page edits (if applicable)
	if(namespace !== 0 && (namespace % 2 !== 0 && namespace !== 3)) {
		var talkDropdown = new OO.ui.DropdownWidget({
			label: mw.msg('ccommon-discussion-edit-summaries')
		});
		talkDropdown.menu.on('select', onSummarySelect);
		addOptionsToDropdown(talkDropdown, summaryCategories.talkPage);
		$optionsContainer.append(talkDropdown.$element);
	}
	$optionsContainer.css('margin-bottom', '10px'); // Add bottom margin
	$insertBeforeElement.before($optionsContainer);
}
// Hook into the save dialog state change event
mw.hook('ve.saveDialog.stateChanged').add(function() {
	var target, $saveOptions;
	if($('body').data('wppresent')) {
		return;
	}
	$('body').data('wppresent', 'true');
	target = ve.init.target;
	$saveOptions = target.saveDialog.$saveOptions;
	$summaryTextarea = target.saveDialog.editSummaryInput.$input;
	if(!$saveOptions.length) {
		return;
	}
	insertSummaryOptions($saveOptions);
});
// Wait for necessary libraries to load before adding options
$.when(mw.loader.using('oojs-ui-core'), $.ready).then(function() {
	var $editCheckboxes = $('.editCheckboxes');
	if(!$editCheckboxes.length) {
		return;
	}
	insertSummaryOptions($editCheckboxes, '50%');
});
/* </nowiki> */