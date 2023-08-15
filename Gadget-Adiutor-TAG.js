/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * About: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Article Tag
 */
// Wait for required libraries and DOM to be ready
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
var preparedTags;

function PageTaggingDialog(config) {
	PageTaggingDialog.super.call(this, config);
}
OO.inheritClass(PageTaggingDialog, OO.ui.ProcessDialog);
PageTaggingDialog.static.name = 'PageTaggingDialog';
PageTaggingDialog.static.title = new OO.ui.deferMsg('tag-module-title');
PageTaggingDialog.static.actions = [{
	action: 'save',
	label: new OO.ui.deferMsg('add-tag'),
	flags: ['primary', 'progressive']
}, {
	label: new OO.ui.deferMsg('cancel'),
	flags: 'safe'
}];
PageTaggingDialog.prototype.initialize = function() {
	PageTaggingDialog.super.prototype.initialize.apply(this, arguments);
	const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
	const dateToday = new Date();
	const markDate = monthNames[dateToday.getMonth()] + ' ' + dateToday.getFullYear();
	var headerTitle = new OO.ui.MessageWidget({
		type: 'notice',
		inline: true,
		label: new OO.ui.deferMsg('tag-header-description')
	});
	var Tags = new OO.ui.CheckboxMultiselectInputWidget({
		options: [{
			data: '{{Doğruluk|tarih=' + markDate + '}}',
			label: 'Aldatmaca'
		}, {
			data: '{{Yazım yanlışları|tarih=' + markDate + '}}',
			label: 'Anlatım bozuklukları'
		}, {
			data: '{{Üslup|tarih=' + markDate + '}}',
			label: 'Ansiklopedik üslup yok'
		}, {
			data: '{{Aşırı alıntı|tarih=' + markDate + '}}',
			label: 'Aşırı alıntı'
		}, {
			data: '{{Daralt|tarih=' + markDate + '}}',
			label: 'Aşırı bölüm başlığı'
		}, {
			data: '{{Çok uzun|tarih=' + markDate + '}}',
			label: 'Aşırı uzun madde'
		}, {
			data: '{{Kurgu-gerçek|tarih=' + markDate + '}}',
			label: 'Ayrıştırılamayan kurgu ve gerçeklik'
		}, {
			data: '{{Çıkmaz sokak|tarih=' + markDate + '}}',
			label: 'Az veya hiç iç bağlantı'
		}, {
			data: '{{Başlık böl|tarih=' + markDate + '}}',
			label: 'Başlık böl'
		}, {
			data: '{{Yerellikten kurtar|tarih=' + markDate + '}}',
			label: 'Belirli bir kısmın bakış açısı'
		}, {
			data: '{{Birleştir|tarih=' + markDate + '}}',
			label: 'Benzer madde'
		}, {
			data: '{{Çalışma|tarih=' + markDate + '}}',
			label: 'Çalışma var'
		}, {
			data: '{{Deneme benzeri|tarih=' + markDate + '}}',
			label: 'Deneme'
		}, {
			data: '{{Özgün araştırma|tarih=' + markDate + '}}',
			label: 'Doğrulanamayan yorumsal katkı'
		}, {
			data: '{{Düzenle|tarih=' + markDate + '}}',
			label: 'Düzenle',
		}, {
			data: '{{Düzyazı|tarih=' + markDate + '}}',
			label: 'Düzyazı olmalı'
		}, {
			data: '{{Ek kaynak gerekli|tarih=' + markDate + '}}',
			label: 'Ek kaynaklar gerekli'
		}, {
			data: '{{Eksik|tarih=' + markDate + '}}',
			label: 'Eksik belirli konu'
		}, {
			data: '{{Evrenselleştir|tarih=' + markDate + '}}',
			label: 'Evrensel bakış açısı yok'
		}, {
			data: '{{Geçmiş birleştir|tarih=' + markDate + '}}',
			label: 'Geçmiş birleştirilmeli'
		}, {
			data: '{{Giriş çok kısa|tarih=' + markDate + '}}',
			label: 'Giriş çok kısa'
		}, {
			data: '{{Giriş çok uzun|tarih=' + markDate + '}}',
			label: 'Giriş çok uzun'
		}, {
			data: '{{Giriş yok|tarih=' + markDate + '}}',
			label: 'Giriş yok'
		}, {
			data: '{{Güncel|tarih=' + markDate + '}}',
			label: 'Güncel olay'
		}, {
			data: '{{Güncel kişi|tarih=' + markDate + '}}',
			label: 'Güncel olaya dahil kişi'
		}, {
			data: '{{Güncelle|tarih=' + markDate + '}}',
			label: 'Güncelleme gerek'
		}, {
			data: '{{Anakaynaklar|tarih=' + markDate + '}}',
			label: 'Güvenilir kaynak yok'
		}, {
			data: '{{Kafa karıştırıcı|tarih=' + markDate + '}}',
			label: 'Kafa karıştırıcı içerik'
		}, {
			data: '{{Kategorisiz|tarih=' + markDate + '}}',
			label: 'Kategorisiz'
		}, {
			data: '{{Kayda değerlik|tarih=' + markDate + '}}',
			label: 'Kayda değerlik'
		}, {
			data: '{{Dipnotsuz|tarih=' + markDate + '}}',
			label: 'Kaynağı belirsiz bilgi'
		}, {
			data: '{{Üçüncül kaynak|tarih=' + markDate + '}}',
			label: 'Kaynağın aşırı kullanımı'
		}, {
			data: '{{Kaynaksız|tarih=' + markDate + '}}',
			label: 'Kaynak içermiyor'
		}, {
			data: '{{Kılavuz gibi|tarih=' + markDate + '}}',
			label: 'Kılavuz gibi'
		}, {
			data: '{{Kötü çeviri|tarih=' + markDate + '}}',
			label: 'Kötü çeviri'
		}, {
			data: '{{Madde adı|tarih=' + markDate + '}}',
			label: 'Madde adı'
		}, {
			data: '{{Öksüz|tarih=' + markDate + '}}',
			label: 'Maddeye bağlantı yok'
		}, {
			data: '{{Otobiyografi|tarih=' + markDate + '}}',
			label: 'Otobiyografi'
		}, {
			data: '{{Kaynakları düzenle|tarih=' + markDate + '}}',
			label: 'Önerilmeyen biçimde kaynaklandırılmış'
		}, {
			data: '{{Temizle-spam|tarih=' + markDate + '}}',
			label: 'Reklam'
		}, {
			data: '{{Reklam-madde|tarih=' + markDate + '}}',
			label: 'Reklam dili'
		}, {
			data: '{{Metrik|tarih=' + markDate + '}}',
			label: 'SI Olmayan'
		}, {
			data: '{{Tartışmalı|tarih=' + markDate + '}}',
			label: 'Süren tartışma'
		}, {
			data: '{{Şahsen yayımlanmış|tarih=' + markDate + '}}',
			label: 'Şahsi kaynaklar'
		}, {
			data: '{{Taraflı|tarih=' + markDate + '}}',
			label: 'Taraflı olabilir'
		}, {
			data: '{{Tek kaynak|tarih=' + markDate + '}}',
			label: 'Tek kaynağa dayalı'
		}, {
			data: '{{Teknik|tarih=' + markDate + '}}',
			label: 'Teknik yazılmış'
		}, {
			data: '{{Kopyala yapıştır|tarih=' + markDate + '}}',
			label: 'Telif ihlali'
		}, {
			data: '{{Dil genişlet|tarih=' + markDate + '}}',
			label: 'Tercüme edilebilir'
		}, {
			data: '{{Türkçe değil|tarih=' + markDate + '}}',
			label: 'Türkçe olmayan içerik'
		}, {
			data: '{{Dış bağlantı|tarih=' + markDate + '}}',
			label: 'uygunsuz dış bağlantı'
		}, {
			data: '{{Kırmızı bağlantı temizleme|tarih=' + markDate + '}}',
			label: 'Uygunsuz kırmızı bağlantı'
		}, {
			data: '{{Uzman|tarih=' + markDate + '}}',
			label: 'Uzman gereksinimi'
		}, {
			data: '{{Ücretli olabilir|tarih=' + markDate + '}}',
			label: 'Ücretli olabilir'
		}, {
			data: '{{Yalın URL temizle|tarih=' + markDate + '}}',
			label: 'Yalın URL kullanımı'
		}, {
			data: '{{Yeniden yaz|tarih=' + markDate + '}}',
			label: 'Yeniden yaz'
		}, {
			data: '{{Yersiz önem verme|tarih=' + markDate + '}}',
			label: 'Yersiz önem'
		}, ],
		classes: ['adiutor-tag-list-container'],
	});
	Tags.$element.on('click', function() {
		if(Tags.getValue().length > 1) {
			saltTags = String(Tags.getValue());
			preparedTags = "{{Çoklu sorun|" + "\n" + saltTags.split(",").join("\n") + "\n" + "}}" + "\n";
			console.log(preparedTags);
		} else {
			saltTags = String(Tags.getValue());
			preparedTags = saltTags.split(",").join("\n") + "\n";
			console.log(preparedTags);
		}
	});
	this.content = new OO.ui.PanelLayout({
		padded: true,
		expanded: false,
	});
	this.content.$element.append(headerTitle.$element, '<br><hr><br>', Tags.$element);
	this.$body.append(this.content.$element);
};
PageTaggingDialog.prototype.getActionProcess = function(action) {
	var dialog = this;
	if(action) {
		return new OO.ui.Process(function() {
			tagPage(preparedTags);
			dialog.close({
				action: action
			});
		});
	}
	return PageTaggingDialog.super.prototype.getActionProcess.call(this, action);
};
var windowManager = new OO.ui.WindowManager();
$(document.body).append(windowManager.$element);
var dialog = new PageTaggingDialog();
windowManager.addWindows([dialog]);
windowManager.openWindow(dialog);

function tagPage(preparedTags) {
	api.postWithToken('csrf', {
		action: 'edit',
		title: mwConfig.wgPageName,
		prependtext: preparedTags.split(',').join('\n') + '\n',
		summary: 'Sayfa etiketlendi',
		tags: 'Adiutor',
		format: 'json'
	}).done(function() {
		location.reload();
	});
}
/* </nowiki> */