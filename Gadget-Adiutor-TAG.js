/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Article Tag
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
    var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber", "wgRevisionId"]);
    var api = new mw.Api();
    var preparedTags;

    function PageTaggingDialog(config) {
        PageTaggingDialog.super.call(this, config);
    }
    OO.inheritClass(PageTaggingDialog, OO.ui.ProcessDialog);
    PageTaggingDialog.static.name = 'PageTaggingDialog';
    PageTaggingDialog.static.title = 'Adiutor (Beta) - Sayfa Etiketleme Modülü';
    PageTaggingDialog.static.actions = [{
        action: 'save',
        label: 'Etiketle',
        flags: ['primary', 'progressive']
    }, {
        label: 'İptal',
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
            label: new OO.ui.HtmlSnippet('<strong>Şu anda bu sayfayı etiketlemektesiniz, aşağıdaki etiket listesinde bu sayfaya yerleştirmek istediğiniz uyarı etiketlerini seçebilirsiniz.</small>')
        });
        var Tags = new OO.ui.CheckboxMultiselectInputWidget({
            options: [{
                data: '{{Düzenle|tarih=' + markDate + '}}',
                label: 'Düzenle',
            }, {
                data: '{{Yeniden yaz|tarih=' + markDate + '}}',
                label: 'Yeniden Yaz'
            }, {
                data: '{{Dış bağlantı|tarih=' + markDate + '}}',
                label: 'Uygunsuz Dış Bağlantı'
            }, {
                data: '{{Kırmızı bağlantı temizleme|tarih=' + markDate + '}}',
                label: 'Uygunsuz Kırmızı Bağlantı'
            }, {
                data: '{{Kopyala yapıştır|tarih=' + markDate + '}}',
                label: 'Telif Hakkı İhlali'
            }, {
                data: '{{Temizle-spam|tarih=' + markDate + '}}',
                label: 'Reklam Bağlantı'
            }, {
                data: '{{Başlık böl|tarih=' + markDate + '}}',
                label: 'Başlık Böl'
            }, {
                data: '{{Çok uzun|tarih=' + markDate + '}}',
                label: 'Madde Aşırı Uzun'
            }, {
                data: '{{Daralt|tarih=' + markDate + '}}',
                label: 'Aşırı Bölüm Başlığı'
            }, {
                data: '{{Giriş çok kısa|tarih=' + markDate + '}}',
                label: 'Kısa Giriş'
            }, {
                data: '{{Giriş çok uzun|tarih=' + markDate + '}}',
                label: 'Uzun Giriş'
            }, {
                data: '{{Giriş yok|tarih=' + markDate + '}}',
                label: 'Giriş Yok'
            }, {
                data: '{{Madde adı|tarih=' + markDate + '}}',
                label: 'Madde Adı'
            }, {
                data: '{{Kayda değerlik|tarih=' + markDate + '}}',
                label: 'Kayda Değerlik'
            }, {
                data: '{{Aşırı alıntı|tarih=' + markDate + '}}',
                label: 'Aşırı Alıntı'
            }, {
                data: '{{Deneme benzeri|tarih=' + markDate + '}}',
                label: 'Deneme'
            }, {
                data: '{{Düzyazı|tarih=' + markDate + '}}',
                label: 'Düzyazı Olmalı'
            }, {
                data: '{{Kılavuz gibi|tarih=' + markDate + '}}',
                label: 'Klavuz Gibi'
            }, {
                data: '{{Metrik|tarih=' + markDate + '}}',
                label: 'SI Olmayan'
            }, {
                data: '{{Reklam-madde|tarih=' + markDate + '}}',
                label: 'Reklam Dilinde'
            }, {
                data: '{{Teknik|tarih=' + markDate + '}}',
                label: 'Teknik Yazılmış'
            }, {
                data: '{{Üslup|tarih=' + markDate + '}}',
                label: 'Ansiklopedik Üslup Değil'
            }, {
                data: '{{Yazım yanlışları|tarih=' + markDate + '}}',
                label: 'Anlatım Bozuklukları Var'
            }, {
                data: '{{Yazım yanlışları|tarih=' + markDate + '}}',
                label: 'Anlatım Bozuklukları Var'
            }, {
                data: '{{Kafa karıştırıcı|tarih=' + markDate + '}}',
                label: 'Kafa Karıştırıcı İçerikler Var'
            }, {
                data: '{{Kurgu-gerçek|tarih=' + markDate + '}}',
                label: 'Kurgu ve Gerçeklik Ayrıştırılamıyor'
            }, {
                data: '{{Eksik|tarih=' + markDate + '}}',
                label: 'Maddede Belirli Bir Konu Eksik'
            }, {
                data: '{{Uzman|tarih=' + markDate + '}}',
                label: 'Uzman Kişilere Gereksinim Var'
            }, {
                data: '{{Yersiz önem verme|tarih=' + markDate + '}}',
                label: 'Maddede Bazı Kısımlara Yersiz Önem Verilmiş'
            }, {
                data: '{{Güncel|tarih=' + markDate + '}}',
                label: 'Madde Güncel Bir Olay Hakkında'
            }, {
                data: '{{Güncel kişi|tarih=' + markDate + '}}',
                label: 'Bu Kişi Güncel Bir Olaya Dahil'
            }, {
                data: '{{Güncelle|tarih=' + markDate + '}}',
                label: 'Maddenin Güncellenmesi Gerek'
            }, {
                data: '{{Doğruluk|tarih=' + markDate + '}}',
                label: 'Madde Aldatmaca Olabilir'
            }, {
                data: '{{Evrenselleştir|tarih=' + markDate + '}}',
                label: 'Madde Evrensel Bakış Açısını Yansıtmıyor'
            }, {
                data: '{{Otobiyografi|tarih=' + markDate + '}}',
                label: 'Madde Bir Otobiyografi'
            }, {
                data: '{{Taraflı|tarih=' + markDate + '}}',
                label: 'Madde Taraflı Olabilir'
            }, {
                data: '{{Tartışmalı|tarih=' + markDate + '}}',
                label: 'Madde Hakkındaki Tartışmalar Sürmekte'
            }, {
                data: '{{Ücretli olabilir|tarih=' + markDate + '}}',
                label: 'Madde Ücretli Olarak Düzenlenmiş Olabilir'
            }, {
                data: '{{Yerellikten kurtar|tarih=' + markDate + '}}',
                label: 'Maddede Yer Alan Bilgiler Belli Bir Bölgenin Bakış Açısını Yansıtıyor Olabilir'
            }, {
                data: '{{Anakaynaklar|tarih=' + markDate + '}}',
                label: 'Madde Güvenilir Bir Kaynağa Sahip Değil'
            }, {
                data: '{{Ek kaynak gerekli|tarih=' + markDate + '}}',
                label: 'Maddenin Doğrulanabilirliği İçin Ek Kaynaklar Gerekli'
            }, {
                data: '{{Kaynaksız|tarih=' + markDate + '}}',
                label: 'Madde Herhangi Bir Kaynak İçermiyor'
            }, {
                data: '{{Özgün araştırma|tarih=' + markDate + '}}',
                label: 'Madde Doğrulanamaz ve Yorumsal Katkılar İçeriyor'
            }, {
                data: '{{Şahsen yayımlanmış|tarih=' + markDate + '}}',
                label: 'Madde Şahsen Yayımlanmış Kaynaklar İçeriyor'
            }, {
                data: '{{Tek kaynak|tarih=' + markDate + '}}',
                label: 'Maddenin Tamamı veya Çoğunluğu Tek Kaynağa Dayanıyor'
            }, {
                data: '{{Üçüncül kaynak|tarih=' + markDate + '}}',
                label: 'Madde İle İlgili Kaynaklar Haddinden Fazla Kullanılmış'
            }, {
                data: '{{Dil genişlet|tarih=' + markDate + '}}',
                label: 'Maddenin İçeriği Tercüme Edilerek Genişletilebilir'
            }, {
                data: '{{Kötü çeviri|tarih=' + markDate + '}}',
                label: 'Madde Bir Başka Dilden Kötü Bir Şekilde Tercüme Edilmiş'
            }, {
                data: '{{Türkçe değil|tarih=' + markDate + '}}',
                label: 'Madde İçeriği Türkçe Değil'
            }, {
                data: '{{Çıkmaz sokak|tarih=' + markDate + '}}',
                label: 'Madde Olması Gerekenden Az Veya Hiç İç Bağlantı İçermiyor'
            }, {
                data: '{{Öksüz|tarih=' + markDate + '}}',
                label: 'Herhangi Bir Maddeden Bu Maddeye Verilmiş Bağlantı Yok'
            }, {
                data: '{{Dipnotsuz|tarih=' + markDate + '}}',
                label: 'Metin İçi Kaynaklar Yeterli Olmadığı Veya Kullanılmadığı İçin Bazı Bilgilerin Kaynağı Belirsiz'
            }, {
                data: '{{Kaynakları düzenle|tarih=' + markDate + '}}',
                label: 'Madde Önerilmeyen Biçimde Kaynaklandırılmış'
            }, {
                data: '{{Yalın URL temizle|tarih=' + markDate + '}}',
                label: 'Maddede Yalın URL Kullanılmmış'
            }, {
                data: '{{Birleştir|tarih=' + markDate + '}}',
                label: 'Madde Başka Bir Maddeye Benziyor'
            }, {
                data: '{{Geçmiş birleştir|tarih=' + markDate + '}}',
                label: 'Maddenin Bir Başka Maddenin Geçmişiyle Birleştirilmeli'
            }, {
                data: '{{Çalışma|tarih=' + markDate + '}}',
                label: 'Maddede Çalışma Var'
            }, {
                data: '{{Kategorisiz|tarih=' + markDate + '}}',
                label: 'Kategorisiz'
            }],
            classes: ['adiutor-tag-list-container'],
        });
        Tags.$element.on('click', function() {
            if (Tags.getValue().length > 1) {
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
        if (action) {
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
});
/* </nowiki> */