/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Create speed deletion
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-windows", ]), $.ready).then(function() {
	var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserGroups", "wgUserName", "wgCanonicalNamespace", "wgNamespaceNumber"]);
	var revDelCount = 0;
	var CopVioURL;
	var api = new mw.Api();
	api.get({
		action: 'query',
		list: 'logevents',
		leaction: 'delete/delete',
		letprop: 'delete',
		letitle: mwConfig.wgPageName
	}).done(function(data) {
		if(data.query.logevents) {
			revDelCount = data.query.logevents.length;
		} else {
			revDelCount = 0;
		}
		var csdSendMessageToCreator = localStorage.getItem("csdSendMessageToCreator") == "true";
		// Example: A process dialog that uses an action set with modes.
		// Subclass ProcessDialog.
		function ProcessDialog(config) {
			ProcessDialog.super.call(this, config);
		}
		OO.inheritClass(ProcessDialog, OO.ui.ProcessDialog);
		// Specify a name for .addWindows()
		ProcessDialog.static.name = 'myDialog';
		// Specify a title and an action set that uses modes ('edit' and 'help' mode, in this example).
		ProcessDialog.static.title = 'Adiutor (Beta) - Hızlı Silme Talebi';
		ProcessDialog.static.actions = [{
			action: 'continue',
			modes: 'edit',
			label: 'Etiketle',
			flags: ['primary', 'progressive']
		}, {
			action: 'help',
			modes: 'edit',
			label: 'Yardım'
		}, {
			modes: 'edit',
			label: 'Hızlı silme politikası',
			framed: false,
			rel: 'test'
		}, {
			modes: 'edit',
			label: 'İptal',
			flags: ['safe', 'close']
		}, {
			action: 'back',
			modes: 'help',
			label: 'Geri',
			flags: ['safe', 'back']
		}];
		// Customize the initialize() method to add content and set up event handlers. 
		// This example uses a stack layout with two panels: one displayed for 
		// edit mode and one for help mode.
		ProcessDialog.prototype.initialize = function() {
			ProcessDialog.super.prototype.initialize.apply(this, arguments);
			switch(mwConfig.wgNamespaceNumber) {
				case 0:
					NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
						label: 'Madde'
					});
					NameSpaceDeletionReasons.addItems([
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'M1',
							data: '[[VP:HS#M1]]: [[VP:TASLAK|Taslak madde kriterlerini]] karşılamayan madde',
							selected: false
						}), {
							label: 'M1 - Taslak madde kriterlerini karşılamayan madde',
							align: 'inline',
							help: 'Örneğin: “Fabrikası olan garip bir adamdı.” Maddenin taslak madde kriterlerini sağlayan, bütünsel anlatımlı bir içeriğe sahip olması durumunda, madde yetersiz içerik gerekçesiyle silinemez.'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'M2',
							data: '[[VP:HS#M2]]: Yabancı dilde yazılmış madde',
							selected: false
						}), {
							label: 'M2 - Yabancı dilde yazılmış madde',
							align: 'inline',
							help: 'Yabancı dilde yazılmış maddeler silinebilir'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'M3',
							data: '[[VP:HS#M3]]: Anlamlı bir içerikten yoksun madde',
							selected: false
						}), {
							label: 'M3 - Anlamlı bir içerikten yoksun madde',
							align: 'inline',
							help: 'İçerik olarak sadece dış bağlantı, Göz at, Ayrıca bakınız, şablon veya başlığın tekrarını içeren maddeler.'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'M4',
							data: '[[VP:HS#M4]]: [[VP:KARDEŞ|Başka bir Wikimedia projesine]] taşınmış madde',
							selected: false
						}), {
							label: 'M4 - Başka bir Wikimedia projesine taşınmış madde',
							align: 'inline',
							help: 'Başka bir Wikimedia projesine aktarıma dair şablonlardan birini içeren veya silmeye aday olduktan sonra, oylama ile başka bir projeye aktarılmasına karar verilen ve aktarılan maddeler, işlem başarıyla yapıldıktan ve maddenin yazarı aktarımdan haberdar edildikten sonra silinebilir.'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'M6',
							data: '[[VP:HS#M6]]: [[VP:KD|Kayda değerlik ölçütlerini]] sağlamayan konuya sahip madde',
							selected: false
						}), {
							label: 'M6 - Kayda değerlik ölçütlerini sağlamayan  madde',
							align: 'inline',
							help: 'Genel olarak kayda değerlik ana yönergesi ve alt-yönergelerinin sunduğu kıstaslara bariz bir şekilde uymayan maddeler için bu kural kullanılabilir. Bununla birlikte dikkatli bir şekilde kullanılmalı; kayda değerlik kıstasları ile uyumsuzluğun bariz olmadığı, tartışmalı olduğu durumlarda hızlı silme uygulanmamalıdır. Bunun yerine kayda değerlik tartışması açılabilir veya kayda değerlik sorunu nedeniyle {{kopyala:Bekletmeli sil}} şablonu konulabilir.'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'M8',
							data: '[[VP:HS#M8]]: [[VP:BEK|Düzen]] ve [[VP:VND|ansiklopediklik]] açısından uygun olmayan madde',
							selected: false
						}), {
							label: 'M8 - Düzen ve ansiklopediklik açısından uygunsuz madde',
							align: 'inline',
							help: 'Eğer bir madde,Çalışma var şablonu barındırmıyorsa, ve,İçeriğinin büyük bir kısmında viki işaret dili kodu bulundurmuyorsa, ve,Taraflı veya yanlış bir içerik barındırıyorsa veya içeriğinin en az % 30\luk kısmı Türkçe dışındaki bir dilde ise,hızlı sil ile silinebilir. Bununla birlikte, eğer madde kayıtlı bir kullanıcı tarafından yaratılmışsa, silme işleminden önce veya sonra, kullanıcı ilgili Hızlı Silme kriterinden haberdar edilmelidir. IP numarasıyla katılan anonim bir kullanıcı tarafından yaratılmışsa, maddenin ilgili yazarına haber verilmesine gerek yoktur.'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'M9',
							data: '[[VP:HS#M9]]: Niteliksiz makine çevirisiyle oluşturulmuş madde',
							selected: false
						}), {
							label: 'M9 - Niteliksiz makine çevirisiyle oluşturulmuş madde',
							align: 'inline',
							help: 'Oluşturulan maddede önemli anlam bozukları yaratan, çeşitli makine çevirisi araçlarıyla yapılıp önemli bir düzeltme geçirmeden eklendiği belirlenen maddeler silinebilir.'
						}),
					]);
					break;
				case 6:
					NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
						label: 'Dosyalar'
					});
					NameSpaceDeletionReasons.addItems([
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D1',
							data: '[[VP:HS#D1|Dosya 1]]: Çift kopya dosya',
							selected: false
						}), {
							label: 'D1 - Çift kopya dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D2',
							data: '[[VP:HS#D2|Dosya 2]]: Bozuk veya boş dosya',
							selected: false
						}), {
							label: 'D2 - Bozuk veya boş dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D3',
							data: '[[VP:HS#D3|Dosya 3]]: Uygunsuz lisanslı dosya',
							selected: false
						}), {
							label: 'D3 - Uygunsuz lisanslı dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D4',
							data: '[[VP:HS#D4|Dosya 4]]: Belirsiz lisans/kaynaklı dosya',
							selected: false
						}), {
							label: 'D4 - Belirsiz lisans/kaynaklı dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D5',
							data: '[[VP:HS#D5|Dosya 5]]: Kullanılmayan adil kullanım dosyası',
							selected: false
						}), {
							label: 'D5 - Kullanılmayan adil kullanım dosyası',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D6',
							data: '[[VP:HS#D6|Dosya 6]]: Adil kullanımı hatalı belirtilmiş dosya',
							selected: false
						}), {
							label: 'D6 - Adil kullanımı hatalı belirtilmiş dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D7',
							data: '[[VP:HS#D7|Dosya 7]]: Gerekçelendirilmemiş [[VP:AKP|adil kullanım]] dosyası',
							selected: false
						}), {
							label: 'D7 - Gerekçelendirilmemiş adil kullanım dosyası',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D8',
							data: '[[VP:HS#D8|Dosya 8]]: [[VP:VND|Ansiklopedik]] olmayan ve kullanılmayan dosya',
							selected: false
						}), {
							label: 'D8 - Ansiklopedik olmayan ve kullanılmayan dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D9',
							data: '[[VP:HS#D9|Dosya 9]]: Kullanışsız dosya',
							selected: false
						}), {
							label: 'D9 - Kullanışsız dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D10',
							data: '[[VP:HS#D10|Dosya 10]]: Vektörel dosya',
							selected: false
						}), {
							label: 'D10 -  Vektörel dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D11',
							data: '[[VP:HS#D11|Dosya 11]]: Şüpheli dosya',
							selected: false
						}), {
							label: 'D11 -  Şüpheli dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D12',
							data: '[[VP:HS#D12|Dosya 12]]: Tanımlanamayan dosya',
							selected: false
						}), {
							label: 'D12 - Tanımlanamayan dosya',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'D13',
							data: '[[VP:HS#D13|Dosya 13]]: [[VP:KG|Kaynaklandırılmamış]] dosya',
							selected: false
						}), {
							label: 'D13 -  Kaynaklandırılmamış dosya',
							align: 'inline'
						}),
					]);
					break;
				case 14:
					NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
						label: 'Kategori'
					});
					NameSpaceDeletionReasons.addItems([
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'K1',
							data: '[[VP:HS#K1]]: Boş kategori',
							selected: false
						}), {
							label: 'K1 - Boş kategori',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'K2',
							data: '[[VP:HS#K2]]: Adı değiştirilen kategori',
							selected: false
						}), {
							label: 'K2 - Adı değiştirilen kategori',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'K3',
							data: '[[VP:HS#K3]]: Şablon kategorisi',
							selected: false
						}), {
							label: 'K3 - Şablon kategorisi',
							align: 'inline'
						}),
					]);
					break;
				case 2:
				case 3:
					NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
						label: 'Kullanıcı sayfaları'
					});
					NameSpaceDeletionReasons.addItems([
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'KS2',
							data: '[[VP:HS#KS2|Kullanıcı Sayfası 2]]: Var olmayan kullanıcı',
							selected: false
						}), {
							label: 'KS2 - Var olmayan kullanıcı',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'KS3',
							data: '[[VP:HS#KS3|Kullanıcı Sayfası 3]]: [[VP:AKP|Adil kullanım]] galerisi',
							selected: false
						}), {
							label: 'KS3 - Adil kullanım galerisi',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'KS4',
							data: '[[VP:HS#KS4|Kullanıcı Sayfası 4]]: [[VP:İNAL|Vikipedi\'nin kişisel sayfa olarak kullanımı]]',
							selected: false
						}), {
							label: 'KS4 - Vikipedi\'nin kişisel sayfa olarak kullanımı',
							align: 'inline'
						}),
					]);
					break;
				case 10:
					NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
						label: 'Şablonlar'
					});
					NameSpaceDeletionReasons.addItems([
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'Ş1',
							data: '[[VP:HS#Ş1|Şablon 1]]: Bölücü veya kışkırtıcı şablon',
							selected: false
						}), {
							label: 'Ş1 - Bölücü veya kışkırtıcı şablon',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'Ş2',
							data: '[[VP:HS#Ş2|Şablon 2]]: Kullanılmayan şablon',
							selected: false
						}), {
							label: 'Ş2 - Kullanılmayan şablon',
							align: 'inline'
						}),
					]);
					break;
				case 100:
					NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({
						label: 'Portaller'
					});
					NameSpaceDeletionReasons.addItems([
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'P1',
							data: '[[VP:HS#P1]]: [[VP:HS#M|Madde kriterlerini]] karşılamayan [[VP:P|portal]] sayfası',
							selected: false
						}), {
							label: 'P1 - Madde kriterlerini karşılamayan portal sayfası',
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							value: 'P2',
							data: '[[VP:HS#P2]]: Belirli kriterleri sağlamayan [[VP:P|portal]]',
							selected: false
						}), {
							label: 'P2 - Belirli kriterleri sağlamayan portal',
							align: 'inline'
						}),
					]);
					break;
				default:
					NameSpaceDeletionReasons = new OO.ui.FieldsetLayout({});
					NameSpaceDeletionReasons.addItems([
						new OO.ui.FieldLayout(new OO.ui.MessageWidget({
							type: 'warning',
							inline: true,
							label: new OO.ui.HtmlSnippet('<strong>Bu ad alanı için hızlı silme gerekçesi bulunmamakta.</strong><br><small>lütfen sağ taraftaki genel nedenlerden birini seçiniz.</small><br><hr><br>')
						})),
					]);
					break;
			}
			GeneralReasons = new OO.ui.FieldsetLayout({
				label: 'Genel'
			});
			GeneralReasons.addItems([
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G1',
					data: '[[VP:HS#G1|Genel 1]]: Anlamsız karakter dizilerinden ibaret sayfa',
					selected: false
				}), {
					label: 'G1 - Anlamsız karakter dizilerinden ibaret sayfa',
					align: 'inline',
					help: 'Diğer silme kriterlerinden en az biri sayfa için geçerli olmalı ve bunu gerekçenizde belirtmelisiniz.'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G2',
					data: '[[VP:HS#G2|Genel 2]]: Deneme amaçlı sayfa',
					selected: false
				}), {
					label: 'G2 - Deneme amaçlı sayfa',
					align: 'inline',
					help: 'Örneğin: “nafnşew359cşs.ndc30” veya “traa laa laaa”. Buna: Vandalizm, kısa veya kaynaksız içerik, kötü yazım, partizan nutuklar, imkansız teoriler ve kötü bir tercümeye sahip içerikler dâhil değildir.'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G3',
					data: '[[VP:HS#G3|Genel 3]]: [[VP:Vandalizm|Vandalizm]]',
					selected: false
				}), {
					label: 'G3 - Vandalizm',
					align: 'inline',
					help: 'Ad değiştirme vandalizmi sonucu oluşan yönlendirme sayfaları da buna dâhildir.'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G4',
					data: '[[VP:HS#G4|Genel 4]]: Daha önce [[VP:SP|silinmiş]] içerik',
					selected: false
				}), {
					label: 'G4 - Daha önce silinmiş içerik',
					align: 'inline',
					help: 'SAS tartışması sonucunda veya hızlı silme ile silinen herhangi bir sayfayla büyük ölçüde benzerlik taşıyan herhangi bir isimdeki sayfalar, SAS kararı emsal kabul edilerek silinebilir. Tekrar silinmeden önce, hizmetlinin, içeriğin büyük ölçüde aynı olduğundan ve aynı konuda yeni bir madde olmadığından emin olması gerekmektedir.'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G6',
					data: '[[VP:HS#G6|Genel 6]]: Sayfayı oluşturan kullanıcının talebi',
					selected: false
				}), {
					label: 'G6 - Sayfayı oluşturan kullanıcının talebi',
					align: 'inline',
					help: 'Eğer bir sayfayı oluşturan kişi, yazdığı sayfa başka hiçbir kişi tarafından değişikliğe uğramamışsa ve/veya kullanıcı tarafından yanlışlıkla açılmışsa, sayfanın silinmesini isteyebilir. Bu istek sebebiyle söz konusu sayfa silinir.'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G7',
					data: '[[VP:HS#G7|Genel 7]]: Silinmiş sayfanın [[VP:TS|tartışma sayfası]]',
					selected: false
				}), {
					label: 'G7 - Silinmiş sayfanın tartışma sayfası',
					align: 'inline',
					help: 'Eğer sayfanın niçin silindiğine dair bir tartışma içermiyorsa hızlı silme ile silinebilir.'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G8',
					data: '[[VP:HS#G8|Genel 8]]: Temizlik işlemi',
					selected: false
				}), {
					label: 'G8 - Temizlik işlemi',
					align: 'inline',
					help: 'Tartışma yaratmayacak bakım ve temizlik işlemleri, sayfa geçmişlerini birleştirme, bir isim değişikliği işlemini geri alma ve sadece tek bir maddeye bağlantı veren bir anlam ayrımı sayfasını silme amacıyla sayfalar silinebilir.'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G9',
					data: '[[VP:HS#G9|Genel 9]]: [[VP:TELİF|Telif hakkı ihlali]] yaratan sayfa',
					selected: false
				}), {
					label: 'G9 - Telif hakkı ihlali yaratan sayfa',
					align: 'inline',
					help: 'Telif hakları saklı bir kaynaktan alındığı kesin olarak belirlenen ya da bu konuda ciddi şüpheler bulunan her türlü içerik için hızlı silme işlemi uygulanabilir. Eğer telif hakkı ihlali taşıyan içerik küçük bir kısımsa veya sayfanın belirli bir kısmına eklenmişse, sayfanın hızlı sil ile silinmesinden ziyade ilgili kısımların çıkarılması tavsiye edilebilir.'
				}),
				copyVioField = new OO.ui.FieldLayout(copyVioInput = new OO.ui.TextInputWidget({
					placeholder: 'Telif hakkı ihlali yaratan sayfa',
					value: '',
					data: 'COV',
					classes: ['adiutor-copvio-input'],
				}), {
					label: 'Telif URL',
					align: 'inline',
					classes: ['adiutor-copvio-container'],
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G10',
					data: '[[VP:HS#G10|Genel 10]]: [[VP:SS|Saldırı]] amaçlı sayfa',
					selected: false
				}), {
					label: 'G10 - Saldırı amaçlı sayfa',
					align: 'inline',
					help: 'Saldırı, hakaret dışında bir amaca hizmet etmeyen içeriğe sahip sayfa ve dosyalar (örneğin "... bir salaktır" benzeri bir içerik barındıran bir madde) silinebilir. Herhangi bir şahsa, topluluğa, kuruma ya da fikre yoğun biçimde saldırı niteliği taşıyan ve geri alınacak tarafsız bir sürümü bulunmayan sayfalar buna dâhildir. Parodi amaçlı resim veya medya bu kapsama girmez.'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G11',
					data: '[[VP:HS#G11|Genel 11]]: [[VP:REKLAM|Reklam]] amaçlı sayfa',
					selected: false
				}), {
					label: 'G11 - Reklam amaçlı sayfa',
					align: 'inline',
					help: 'Yalnızca bir şirketin, ürünün, grubun veya hizmetin reklamını yapan ve ansiklopedik olabilmesi için baştan yazılması gereken sayfalar silinebilir. Unutmayınız ki herhangi bir madde, konusu sırf bir şirket, ürün, grup veya hizmeti içeriyor diye bu kriterin uygulanabileceği bir durum yaratmaz: Yoğun şekilde reklam içeren bir maddenin uygunsuz içerik de barındırması gerekmektedir. Eğer herhangi bir madde daha önce silinme prosedürüne dâhil edilmiş, fakat sonuç olarak silinmemiş ise, bu kriter ile hızlı silinmesi mümkün değildir.'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					value: 'G12',
					data: '[[VP:HS#G12|Genel 12]]: İçeriği geliştirmeye yönelik olmayan [[VP:TS|tartışma sayfası]]',
					selected: false
				}), {
					label: 'G12 - İçeriği geliştirmeye yönelik olmayan tartışma sayfası',
					align: 'inline',
					help: 'Tartışma sayfası tamamen bu tür yorumlardan oluşmadıkça silme işlemi yapılamaz. Geliştirme amaçlı yorumlar mevcutsa sayfa silinmez, sadece ilgisiz yorumlar çıkartılır.'
				}),
			]);
			copyVioField.$element.hide();
			copyVioInput.$element.hide();
			isCopyVio = false;
			GeneralReasons.$element.on('click', function(item) {
				if(item.target.value === 'G9') {
					copyVioField.$element.show();
					copyVioInput.$element.show();
				}
			});
			//copyVioInput.on('change', function() {
			//    console.log(copyVioInput.value);
			//});
			DeletionOptions = new OO.ui.FieldsetLayout({
				label: 'Diğer Seçenekler'
			});
			DeletionOptions.addItems([
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: false,
					value: 'recreationProrection'
				}), {
					label: 'Yeniden oluşturmaya karşı koruma',
					help: 'Seçildiğinde, hızlı silme etiketine hizmetliden oluşturma koruması uygulamasını isteyen bir {{salt}} etiketi eklenir. Yalnızca bu sayfa ısrarla oluşturuluyorsa seçin.',
					align: 'inline'
				}),
				new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
					selected: csdSendMessageToCreator,
					value: 'informCreator'
				}), {
					label: 'Oluşturan kullanıcı bilgilendirilsin',
					help: 'Bu kutu işaretliyse, sayfayı oluşturan kullanıcının mesaj sayfasına bir bildirim şablonu gönderilecektir.',
					align: 'inline'
				})
			]);
			HeaderBar = new OO.ui.MessageWidget({
				type: 'notice',
				inline: true,
				label: new OO.ui.HtmlSnippet('<strong>Hızlı silme talebi gerekçesi</strong><br><small>Lütfen bu sayfanın silinmesine bir gerekçe olarak aşağıdaki seçeneklerden uygun olanı seçiniz.</small>')
			});
			var left_panel = new OO.ui.PanelLayout({
				$content: [NameSpaceDeletionReasons.$element, DeletionOptions.$element],
				classes: ['one'],
				scrollable: false,
			});
			var right_panel = new OO.ui.PanelLayout({
				$content: GeneralReasons.$element,
				classes: ['two'],
				scrollable: false,
			});
			var stack = new OO.ui.StackLayout({
				items: [left_panel, right_panel],
				continuous: true,
				classes: ['adiutor-csd-modal-container']
			});
			this.panel1 = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
			if(revDelCount >= "1") {
				HeaderBarRevDel = new OO.ui.MessageWidget({
					type: 'warning',
					label: new OO.ui.HtmlSnippet('Bu sayfa daha önce ' + revDelCount + ' kez silindi! (<a href="/w/index.php?title=Special:Log&page=' + mwConfig.wgPageName + '&type=delete">Günlük Kaydı</a>)')
				});
				this.panel1.$element.append(HeaderBar.$element, '<hr><br>', HeaderBarRevDel.$element, '<br>', stack.$element);
			} else {
				this.panel1.$element.append(HeaderBar.$element, '<hr><br>', stack.$element);
			}
			this.panel2 = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
			this.panel2.$element.append('<p><strong>Adiutor</strong>, çeşitli işlemlerde kullanıcılara kolaylık sağlamak için geliştirilmiş bir küçük araçtır. Hata raporları ve özellik önerileri de dahil olmak üzere tüm geri bildirimlerinizi, tartışma sayfasında belirtebilirsiniz.</p><h2>Lisanslama ve atıf</h2><p>İlk olarak Türkçe Vikipedi\'deki https://tr.wikipedia.org/wiki/MediaWiki:Gadget-Adiutor.js adresinde yayınlanmıştır. Creative Commons Attribution-ShareAlike 3.0 Unported License (CC BY-SA 3.0) https://creativecommons.org/licenses/by-sa/3.0/ ve GNU Free Documentation License (GFDL) http://www.gnu.org/copyleft/fdl.html altında lisanslanmıştır.</p>');
			this.stackLayout = new OO.ui.StackLayout({
				items: [this.panel1, this.panel2]
			});
			this.$body.append(this.stackLayout.$element);
		};
		// Set up the initial mode of the window ('edit', in this example.)  
		ProcessDialog.prototype.getSetupProcess = function(data) {
			return ProcessDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
				this.actions.setMode('edit');
			}, this);
		};
		// Use the getActionProcess() method to set the modes and displayed item.
		ProcessDialog.prototype.getActionProcess = function(action) {
			if(action === 'help') {
				// Set the mode to help.
				this.actions.setMode('help');
				// Show the help panel.
				this.stackLayout.setItem(this.panel2);
			} else if(action === 'back') {
				// Set the mode to edit.
				this.actions.setMode('edit');
				// Show the edit panel.
				this.stackLayout.setItem(this.panel1);
			} else if(action === 'continue') {
				var dialog = this;
				return new OO.ui.Process(function() {
					var CSDReason;
					var CSDSummary;
					var CSDReasons = [];
					var CSDOptions = [];
					NameSpaceDeletionReasons.items.forEach(function(Reason) {
						if(Reason.fieldWidget.selected) {
							CSDReasons.push({
								value: Reason.fieldWidget.value,
								data: Reason.fieldWidget.data,
								selected: Reason.fieldWidget.selected
							});
						}
					});
					GeneralReasons.items.forEach(function(Reason) {
						if(Reason.fieldWidget.selected) {
							CSDReasons.push({
								value: Reason.fieldWidget.value,
								data: Reason.fieldWidget.data,
								selected: Reason.fieldWidget.selected
							});
						}
					});
					var SaltCSDSummary = '';
					if(copyVioInput.value != "") {
						CopVioURL = '|url=' + copyVioInput.value;
					} else {
						CopVioURL = "";
					}
					if(CSDReasons.length > 1) {
						var SaltCSDReason = '{{sil|';
						var i = 0;
						var keys = Object.keys(CSDReasons);
						for(i = 0; i < keys.length; i++) {
							if(i > 0) SaltCSDReason += (i < keys.length - 1) ? ', ' : ' ve ';
							SaltCSDReason += '[[VP:HS#' + CSDReasons[keys[i]].value + ']]';
						}
						for(i = 0; i < keys.length; i++) {
							if(i > 0) SaltCSDSummary += (i < keys.length - 1) ? ', ' : ' ve ';
							SaltCSDSummary += '[[VP:HS#' + CSDReasons[keys[i]].value + ']]';
						}
						CSDReason = SaltCSDReason + CopVioURL + '}}';
						CSDSummary = SaltCSDSummary + ' gerekçeleriyle sayfanın hızlı silinmesi talep ediliyor.';
					} else {
						CSDReason = '{{sil|' + CSDReasons[0].data + CopVioURL + '}}';
						CSDSummary = CSDReasons[0].data + ' gerekçesiyle sayfanın hızlı silinmesi talep ediliyor.';
						SaltCSDSummary = CSDReasons[0].data;
					}
					//Şablon ekleme fonksyionu çağır
					DeletionOptions.items.forEach(function(Option) {
						if(Option.fieldWidget.selected) {
							CSDOptions.push({
								value: Option.fieldWidget.value,
								selected: Option.fieldWidget.selected
							});
						}
					});
					CSDOptions.forEach(function(Option) {
						if(Option.value === "recreationProrection") {
							CSDReason = CSDReason + "\n" + '{{Salt}}';
						}
						if(Option.value === "informCreator") {
							getCreator().then(function(data) {
								var Author = data.query.pages[mw.config.get('wgArticleId')].revisions[0].user;
								if(!mw.util.isIPAddress(Author)) {
									var message = '{{subst:HS-Bildirim|1=' + mwConfig.wgPageName.replace(/_/g, " ") + '|2=' + SaltCSDSummary + '}}';
									sendMessageToAuthor(Author, message);
								}
							});
						}
					});
					putCSDTemplate(CSDReason, CSDSummary);
					showProgress();
					dialog.close();
				});
			}
			return ProcessDialog.super.prototype.getActionProcess.call(this, action);
		};
		// Get dialog height.
		ProcessDialog.prototype.getBodyHeight = function() {
			return this.panel1.$element.outerHeight(true);
		};
		// Create and append the window manager.
		var windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		// Create a new dialog window.
		var processDialog = new ProcessDialog({
			size: 'larger'
		});
		// Add windows to window manager using the addWindows() method.
		windowManager.addWindows([processDialog]);
		// Open the window.
		windowManager.openWindow(processDialog);

		function putCSDTemplate(CSDReason, CSDSummary) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: mwConfig.wgPageName,
				prependtext: CSDReason + "\n",
				summary: CSDSummary,
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {
				location.reload();
			});
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
				summary: '[[' + mwConfig.wgPageName.replace(/_/g, " ") + ']]' + ' sayfası için hızlı silinme talep edildi',
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {});
		}

		function showProgress() {
			var processStartedDialog = new OO.ui.MessageDialog();
			var progressBar = new OO.ui.ProgressBarWidget();
			var windowManager = new OO.ui.WindowManager();
			$(document.body).append(windowManager.$element);
			windowManager.addWindows([processStartedDialog]);
			windowManager.openWindow(processStartedDialog, {
				title: 'İşlem gerçekleştiriliyor',
				message: progressBar.$element
			});
		}
	});
});
/* </nowiki> */
