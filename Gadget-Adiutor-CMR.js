/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * About: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Canned mentor responses
 */
// Wait for required libraries and DOM to be ready
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]), $.ready).then(function() {
	// Get essential configuration from MediaWiki
	var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
	var api = new mw.Api();
	var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
	var SectionLink, SectionPath, sectionNumber, MentorResponse;
	var CRButton = new OO.ui.ButtonWidget({
		framed: false,
		label: '[Hazır Cevap]',
		classes: ['adiutor-canned-response-button']
	});
	$('.mw-editsection').append(CRButton.$element);
	$(".adiutor-canned-response-button").click(function() {
		SectionPath = $(this).parent().parent()[0];
		SectionLink = clearURLfromOrigin(SectionPath.querySelector(".mw-editsection a").getAttribute('href'));
		sectionNumber = SectionLink.replace(/Kullanıcı_mesaj:[a-zA-ZğüşöçıİĞÜŞÖÇ0-9_.-]+&section=/gi, "").replace(/&veaction=editsource/gi, "").replace(/&action=edit&section=/gi, "");
		cmrDialog();
	});

	function cmrDialog() {
		function CannedResponseDialog(config) {
			CannedResponseDialog.super.call(this, config);
		}
		OO.inheritClass(CannedResponseDialog, OO.ui.ProcessDialog);
		CannedResponseDialog.static.name = 'CannedResponseDialog';
		CannedResponseDialog.static.title = 'Adiutor (Beta) - Danışman';
		CannedResponseDialog.static.actions = [{
			action: 'save',
			label: 'Cevapla',
			flags: 'primary'
		}, {
			label: 'İptal',
			flags: 'safe'
		}];
		CannedResponseDialog.prototype.initialize = function() {
			CannedResponseDialog.super.prototype.initialize.apply(this, arguments);
			var dropdown = new OO.ui.DropdownWidget({
				menu: {
					items: [
						new OO.ui.MenuSectionOptionWidget({
							label: 'Nasıl...?'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Selam! [[Vikipedi]]'deki maddeler [[VP:PY|politikalar ve yönergeler]] doğrultusunda kabul edilir, yeni bir madde oluşturmadan önce lütfen [[VP:Kayda değerlik]] politikamızı inceleyiniz. [[VP:Madde sihirbazı]] yardımı ile ya da yukarıdaki arama kutucuğuna oluşturmak istediğiniz maddenin adını yazıp aşağıdaki kırmızı bağlantıya tıkladıktan sonra maddenizi oluşturabilirsiniz. Madde içeriğinizin [[VP:ÖAYV|özgün araştırma]] olmamasına dikkat edin, ayrıca bir başka web sitesinden ya da kaynaktan doğrudan [[Vikipedi:Kopyala-yapıştır|kopyala-yapıştır]] ile alınmadığından emin olunuz, bu durum Vikipedi'nin [[Vikipedi:Telif hakları]] politikasının ihlali olarak değerlendirilir ve maddeniz [[VP:Silme politikası|silinebilir]]. {{Bakınız|Yardım:Yeni madde oluşturmak}}",
							label: 'Yeni Madde (Genel)'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Selam! [[Vikipedi]]'deki maddeler [[VP:PY|politikalar ve yönergeler]] doğrultusunda kabul edilir, yeni bir madde oluşturmadan önce lütfen [[VP:Kayda değerlik]] ve [[Vikipedi:Kayda değerlik (kişiler)]] politikalarımızı inceleyiniz. [[VP:Madde sihirbazı]] yardımı ile ya da yukarıdaki arama kutucuğuna oluşturmak istediğiniz maddenin adını yazıp aşağıdaki kırmızı bağlantıya tıkladıktan sonra maddenizi oluşturabilirsiniz. Madde içeriğinizin [[VP:ÖAYV|özgün araştırma]] olmamasına dikkat edin, ayrıca bir başka web sitesinden ya da kaynaktan doğrudan [[Vikipedi:Kopyala-yapıştır|kopyala-yapıştır]] ile alınmadığından emin olunuz, bu durum Vikipedi'nin [[Vikipedi:Telif hakları]] politikasının ihlali olarak değerlendirilir ve maddeniz [[VP:Silme politikası|silinebilir]]. {{Bakınız|Yardım:Yeni madde oluşturmak}}",
							label: 'Yeni Madde (Kişi)'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Selam! [[Vikipedi]]'deki maddeler [[VP:PY|politikalar ve yönergeler]] doğrultusunda kabul edilir, yeni bir madde oluşturmadan önce lütfen [[VP:Kayda değerlik]] ve [[Vikipedi:Kayda değerlik (organizasyonlar ve şirketler)]] politikalarımızı inceleyiniz. [[VP:Madde sihirbazı]] yardımı ile ya da yukarıdaki arama kutucuğuna oluşturmak istediğiniz maddenin adını yazıp aşağıdaki kırmızı bağlantıya tıkladıktan sonra maddenizi oluşturabilirsiniz. Madde içeriğinizin [[VP:ÖAYV|özgün araştırma]] olmamasına dikkat edin, ayrıca bir başka web sitesinden ya da kaynaktan doğrudan [[Vikipedi:Kopyala-yapıştır|kopyala-yapıştır]] ile alınmadığından emin olunuz, bu durum Vikipedi'nin [[Vikipedi:Telif hakları]] politikasının ihlali olarak değerlendirilir ve maddeniz [[VP:Silme politikası|silinebilir]]. {{Bakınız|Yardım:Yeni madde oluşturmak}}",
							label: 'Yeni Madde (Organizasyon)'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Selam! [[Vikipedi]]'deki maddeler [[VP:PY|politikalar ve yönergeler]] doğrultusunda kabul edilir, yeni bir madde oluşturmadan önce lütfen [[VP:Kayda değerlik]], [[Vikipedi:Kayda değerlik (kişiler)]] ve [[Vikipedi:Kayda değerlik (müzik)]] politikalarımızı inceleyiniz. [[VP:Madde sihirbazı]] yardımı ile ya da yukarıdaki arama kutucuğuna oluşturmak istediğiniz maddenin adını yazıp aşağıdaki kırmızı bağlantıya tıkladıktan sonra maddenizi oluşturabilirsiniz. Madde içeriğinizin [[VP:ÖAYV|özgün araştırma]] olmamasına dikkat edin, ayrıca bir başka web sitesinden ya da kaynaktan doğrudan [[Vikipedi:Kopyala-yapıştır|kopyala-yapıştır]] ile alınmadığından emin olunuz, bu durum Vikipedi'nin [[Vikipedi:Telif hakları]] politikasının ihlali olarak değerlendirilir ve maddeniz [[VP:Silme politikası|silinebilir]]. {{Bakınız|Yardım:Yeni madde oluşturmak}}",
							label: 'Yeni Madde (Müzisyen)'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Selam! [[Vikipedi]]'deki maddeler [[VP:PY|politikalar ve yönergeler]] doğrultusunda kabul edilir, yeni bir madde oluşturmadan önce lütfen [[VP:Kayda değerlik]], [[Vikipedi:Kayda değerlik (kişiler)]] ve [[Vikipedi:Kayda değerlik (akademisyenler)]] politikalarımızı inceleyiniz. [[VP:Madde sihirbazı]] yardımı ile ya da yukarıdaki arama kutucuğuna oluşturmak istediğiniz maddenin adını yazıp aşağıdaki kırmızı bağlantıya tıkladıktan sonra maddenizi oluşturabilirsiniz. Madde içeriğinizin [[VP:ÖAYV|özgün araştırma]] olmamasına dikkat edin, ayrıca bir başka web sitesinden ya da kaynaktan doğrudan [[Vikipedi:Kopyala-yapıştır|kopyala-yapıştır]] ile alınmadığından emin olunuz, bu durum Vikipedi'nin [[Vikipedi:Telif hakları]] politikasının ihlali olarak değerlendirilir ve maddeniz [[VP:Silme politikası|silinebilir]]. {{Bakınız|Yardım:Yeni madde oluşturmak}}",
							label: 'Yeni Madde (Akademisyen)'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Merhaba, hoş geldiniz! [[VP:OTO|Otobiyografi]] yazımı yanlılık unsurları içerebileceğinden ötürü Vikipedi’de hoş karşılanmaz ve yazmanız önerilmez. [[VP:KD|Kayda değerlik]] kriterlerini karşılıyorsa açılmasının önünde herhangi bir engel yoktur ama yazmadan evvel Jimmy Wales’in Kendiniz hakkında yazmanız toplumsal bir gaftır. sözü hatırlanmalıdır. Bilgilerinize sunarım. {{Bakınız|Vikipedi:Otobiyografi}}",
							label: 'Yeni Madde (Otobiyografi)'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Merhaba, hoş geldiniz! Beyaz liste değişiklikleri sürüm kontrolüne takılmadan otomatik olarak onaylanan kullanıcı grubudur. Bir hizmetli yapıcı katkılarınızı fark ettiğinde sizi beyaz listeye alacaktır. Değerlendirme talebinde bulunmak için hizmetli duyuru panosuna bildirimde bulunabilirsiniz. Bilgilerinize sunarım.",
							label: 'Beyaz liste nasıl olurum?'
						}),
						new OO.ui.MenuSectionOptionWidget({
							label: 'Neden...?'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Selam! [[Vikipedi]]'deki maddeler [[VP:PY|politikalar ve yönergeler]] doğrultusunda kabul edilir, [[VP:HS]] sayfsından maddenizin silinme gerekçesinin açıklamasını öğrenebilirsiniz. Yeni bir madde oluşturmadan önce lütfen [[VP:Kayda değerlik]] politikamızı inceleyiniz. Ayrıca maddenizi ısrarlı biçimde oluşturmaya devam ederseniz [[VP:Koruma politikası]] kapsamında maddenize oluşturma koruması uygulanabilir.  Madde içeriğinizin [[VP:ÖAYV|özgün araştırma]] olmamasına dikkat edin, ayrıca bir başka web sitesinden ya da kaynaktan doğrudan [[Vikipedi:Kopyala-yapıştır|kopyala-yapıştır]] ile alınmadığından emin olunuz, bu durum Vikipedi'nin [[Vikipedi:Telif hakları]] politikasının ihlali olarak değerlendirilir ve maddeniz [[VP:Silme politikası|silinebilir]].",
							label: 'Maddem Silindi (Genel)'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Merhaba, hoş geldiniz! Maddeniz Vikipedi’nin hızlı silme politikasında yer alan silme gerekçelerine dayanarak bir hizmetli tarafından silinmiştir. İlgili hizmetliyle mesaj sayfasından iletişim kurabilirsiniz, mesaj atmadan önce bağlantı verdiğim sayfayı okumanızı da öneririm. Bilgilerinize sunarım.",
							label: 'Maddem neden hızlı silindi?'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Merhaba, hoş geldiniz! Oluşturduğunuz maddenin Vikipedi’nin kayda değerlik kriterlerine uymadığı gerekçesiyle bir kullanıcı tarafından silinmesi önerilmiş. Bu süre zarfında topluluk incelemesiyle madde hakkında karar verilecektir, tartışmaya sizin de iştirak etmenizde kuklacılık yapılmadığı sürece herhangi bir engel bulunmamaktadır. Bilgilerinize sunarım.",
							label: 'Maddem silinmeye aday gösterildi?'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Merhaba, hoş geldiniz! Türkçe Vikipedi’de sürüm kontrolü uygulaması bulunmaktadır. Değişikliğiniz mutlaka bir devriye tarafından incelenecektir. İnceleme süresi iş yoğunluğuna göre değişebilmektedir. Sabrınız ve anlayışınız için şükranlarımı sunarım.",
							label: 'Değişikliklerim neden bekliyor?'
						}),
						new OO.ui.MenuOptionWidget({
							data: 'Merhaba, yaptığınız değişiklikler, devriye ve üstü haklara sahip kullanıcılar tarafından kontrol edilir. Bu süreçte katkınızın onaylanıp onaylanmayacağı ve ne kadar süreceği konusunda herhangi bir süre garanti edilemez.',
							label: 'Değişiklik Onaylama'
						}),
						new OO.ui.MenuSectionOptionWidget({
							label: 'Nedir...?'
						}),
						new OO.ui.MenuOptionWidget({
							data: "Merhaba, hoş geldiniz! Vikipedi’nin kayda değerlik politikasına erişim sağlamak için buraya tıklamalısınız. Bilgilerinize sunarım.",
							label: 'Kayda değerlik'
						}),
					]
				},
				label: "Cevap Seç"
			});
			var HeaderBar = new OO.ui.MessageWidget({
				type: 'notice',
				inline: true,
				label: new OO.ui.HtmlSnippet('<strong>Danışman Yanıt Modülü</strong><br><small>Bu alanda size soru soran danışanınıza hazır ceplardan birini seçerek hızlıca cevap verebilirsiniz.</small>')
			});
			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
			this.content.$element.append(HeaderBar.$element, '<br><hr><br>', dropdown.$element, '<div class="adiutor-mentor-response-preview-area"></div>');
			this.$body.append(this.content.$element);
			dropdown.getMenu().on('choose', function(menuOption) {
				MentorResponse = menuOption.getData();
				api.get({
					action: 'parse',
					text: MentorResponse,
					disablelimitreport: 1,
					wrapoutputclass: '',
					contentmodel: 'wikitext',
					contentformat: 'text/x-wiki',
					prop: 'text',
					format: "json"
				}).done(function(data) {
					$('.adiutor-mentor-response-preview-area').html(data.parse.text['*']);
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
			return Math.max(this.content.$element.outerHeight(true), 320);
		};
		var windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		var dialog = new CannedResponseDialog();
		windowManager.addWindows([dialog]);
		windowManager.openWindow(dialog);
	}

	function addResponse(sectionNumber) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: mwConfig.wgPageName,
			section: sectionNumber,
			appendtext: "\n" + ":{{yk:Cevap}} " + MentorResponse + ' ~~~~',
			summary: 'Danışana cevap verildi.',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			location.reload();
		});
	}

	function clearURLfromOrigin(AfDPageUrl) {
		return decodeURIComponent(AfDPageUrl.replace('https://tr.wikipedia.org/w/index.php?title=', ''));
	}
});
/* </nowiki> */