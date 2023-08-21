/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Adiutor User Dashboard
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
var ArticleListforCsd = [];

function updateArticleList() {
	var apiUrl = "https://tr.wikipedia.org/w/api.php";
	var categoryTitle = "Kategori:Hızlı_silinmeye_aday_sayfalar";
	var params = {
		action: "query",
		format: "json",
		list: "categorymembers",
		cmtitle: categoryTitle,
		cmlimit: 1000, // İstenen sonuç sayısı
	};
	$.ajax({
		url: apiUrl,
		data: params,
		dataType: "jsonp",
		success: function(data) {
			var pages = data.query.categorymembers;
			pages.forEach(function(page) {
				var pageTitle = page.title;
				var pageId = page.pageid;
				var pageNamespace = page.ns;
				var contentParams = {
					action: "parse",
					format: "json",
					pageid: pageId,
					prop: "text" // Sayfa içeriğini HTML olarak almak için "text"
				};
				$.ajax({
					url: apiUrl,
					data: contentParams,
					dataType: "jsonp",
					success: function(contentData) {
						var pageContent = contentData.parse.text["*"];
						ArticleListforCsd.push({
							label: pageTitle,
							content: pageContent,
							namespace: pageNamespace
						});
						mw.storage.session.set('ArticleListforCsd', JSON.stringify(ArticleListforCsd));
					}
				});
			});
		}
	});
}
updateArticleList();

function SectionOneLayout(name, config) {
	SectionOneLayout.super.call(this, name, config);
	var currentUserWelcomeText = new OO.ui.LabelWidget({
		label: mw.msg('hello'),
		classes: ['adiutor-user-dashboard-welcome-text']
	});
	var currentUserWelcomeUsername = new OO.ui.LabelWidget({
		label: mwConfig.wgUserName,
		classes: ['adiutor-user-dashboard-welcome-username']
	});
	var adiutorDashboardLogo = new OO.ui.LabelWidget({
		label: '',
		classes: ['adiutor-user-dashboard-logo']
	});
	var myTalkButton = new OO.ui.ButtonWidget({
		label: mw.msg('my-talk-page'),
		icon: 'speechBubbles',
		flags: ['progressive']
	});
	myTalkButton.on('click', function() {
		window.open('/wiki/Kullanıcı_mesaj:' + mwConfig.wgUserName + '', '_blank');
	});
	var myContributionsButton = new OO.ui.ButtonWidget({
		label: mw.msg('my-contributions'),
		icon: 'userContributions',
		flags: ['progressive']
	});
	myContributionsButton.on('click', function() {
		window.open('/wiki/Özel:Katkılar/' + mwConfig.wgUserName + '', '_blank');
	});
	var buttonsContainer = new OO.ui.StackLayout({
		items: [myTalkButton, myContributionsButton],
		continuous: true
	});
	var totalEditCount = Object.values(adiutorUserOptions.stats).reduce(function(acc, value) {
		return acc + value;
	}, 0);
	var adiutorDashboardTotalStats = new OO.ui.MessageWidget({
		type: 'success',
		icon: 'edit',
		inline: false,
		label: new OO.ui.HtmlSnippet(mw.msg('adiutor-dashboard-total-edit', totalEditCount)),
		classes: ['adiutor-user-dashboard-adiutor-total-stats']
	});
	var adiutorDashboardCsdStats = new OO.ui.MessageWidget({
		type: 'notice',
		icon: 'trash',
		inline: false,
		label: new OO.ui.HtmlSnippet(mw.msg('adiutor-dashboard-csd-requests', adiutorUserOptions.stats.csdRequests)),
		classes: ['adiutor-user-dashboard-adiutor-csd-stats']
	});
	var adiutorDashboardAfDStats = new OO.ui.MessageWidget({
		type: 'notice',
		icon: 'ongoingConversation',
		inline: false,
		label: new OO.ui.HtmlSnippet(mw.msg('adiutor-dashboard-user-warnings', adiutorUserOptions.stats.userWarnings)),
		classes: ['adiutor-user-dashboard-adiutor-afd-stats']
	});
	var adiutorEditStats = new OO.ui.StackLayout({
		items: [adiutorDashboardTotalStats, adiutorDashboardCsdStats, adiutorDashboardAfDStats],
		continuous: true,
		classes: ['adiutor-user-dashboard-stats-container']
	});
	var adiutorDashboardDescription = new OO.ui.MessageWidget({
		type: 'notice',
		inline: true,
		label: new OO.ui.HtmlSnippet('<strong>' + mw.msg('adiutor-dashboard-about-adiutor-title') + '</strong><br>' + mw.msg('adiutor-dashboard-about-adiutor-description') + ''),
		classes: ['adiutor-user-dashboard-adiutor-description']
	});
	var unixTimestamp = mwConfig.wgUserRegistration;
	var date = new Date(unixTimestamp);

	function formatDate(date) {
		var day = date.getDate().toString().padStart(2, '0');
		var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
		var year = date.getFullYear();
		return day + '.' + month + '.' + year;
	}
	var formattedDate = formatDate(date);
	var currentUserContributionCount = new OO.ui.LabelWidget({
		label: mw.msg('welcome-date-change-message', formattedDate, mwConfig.wgUserEditCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')),
		classes: ['adiutor-user-dashboard-contribution-count']
	});
	var adiutorUserDahboardStack = new OO.ui.StackLayout({
		items: [currentUserWelcomeText, currentUserWelcomeUsername, currentUserContributionCount, buttonsContainer, adiutorEditStats, adiutorDashboardDescription, adiutorDashboardLogo],
		continuous: true,
		classes: ['adiutor-user-dashboard-container']
	});
	this.$element.append(adiutorUserDahboardStack.$element);
}
OO.inheritClass(SectionOneLayout, OO.ui.PageLayout);
SectionOneLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('adiutor-dashboard-main-page'));
};

function SectionTwoLayout(name, config) {
	SectionTwoLayout.super.call(this, name, config);
	var tabPanelsArray = [];
	api.get({
		action: 'query',
		prop: 'revisions',
		titles: 'MediaWiki:Gadget-Adiutor-Help.json',
		rvprop: 'content',
		formatversion: 2
	}).then(data => {
		var content = data.query.pages[0].revisions[0].content;
		const tabPanelData = JSON.parse(content);

		function AdiutorGuideTabPanelLayout(name) {
			AdiutorGuideTabPanelLayout.super.call(this, name);
			this.label = name;
			this.tabItem = new OO.ui.TabOptionWidget({
				classes: ['AdiutorGuideTabPanelLayout-tabItem']
			});
		}
		OO.inheritClass(AdiutorGuideTabPanelLayout, OO.ui.TabPanelLayout);
		tabPanelData.forEach(function(panelData) {
			var tabPanel = new AdiutorGuideTabPanelLayout(panelData.title);
			// Create widgets for title and content
			var titleWidget = new OO.ui.HtmlSnippet(panelData.title);
			var textWidget = new OO.ui.HtmlSnippet(panelData.content);
			var helpArticleContent = new OO.ui.MessageWidget({
				type: 'notice',
				label: new OO.ui.HtmlSnippet('<strong>' + titleWidget + '</strong><br>' + textWidget + '')
			});
			tabPanel.$element.append(helpArticleContent.$element);
			tabPanelsArray.push(tabPanel);
		});
		var index = new OO.ui.IndexLayout({
			framed: false
		});
		index.addTabPanels(tabPanelsArray);
		this.$element.append(index.$element);
	}).catch(error => console.error("Error fetching data from API:", error));
}
OO.inheritClass(SectionTwoLayout, OO.ui.PageLayout);
SectionTwoLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('help-and-guides'));
};

function AdministratorPageOneLayout(name, config) {
	AdministratorPageOneLayout.super.call(this, name, config);
	this.$element.append('Engelleme talepleri detay alanı...');
}
OO.inheritClass(AdministratorPageOneLayout, OO.ui.PageLayout);
AdministratorPageOneLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('block-requests'));
};

function AdministratorPageTwoLayout(name, config) {
	AdministratorPageTwoLayout.super.call(this, name, config);
	var storedData = mw.storage.session.get('ArticleListforCsd');
	var ArticleListforCsd = JSON.parse(storedData);
	var currentPageIndex = 0;
	// PageLayout sınıfı
	function CustomPageLayout(name, config) {
		CustomPageLayout.super.call(this, name, config);
		this.$content = $('<div>').addClass('adiutor-administrator-helper-csd--content-area');
		this.$toolbar = $('<div>').addClass('adiutor-administrator-helper-csd--toolbar');
		this.$toolbar.parent().addClass('adiutor-administrator-helper-csd-main-container-box'); // Alternatif araç çubuğu
		// Sol taraftaki listede isimlerin görünmesi için
		this.setupOutlineItem = function() {
			this.outlineItem.setLabel(this.getName());
		};
		this.$element.append(this.$toolbar, this.$content);
	}
	OO.inheritClass(CustomPageLayout, OO.ui.PageLayout);
	// Her bir sayfa için CustomPageLayout örneklerini oluştur
	var pageLayouts = ArticleListforCsd.map(function(item, index) {
		var pageLayout = new CustomPageLayout(item.label);
		pageLayout.$content.append(item.content);
		var csdPageTitle = new OO.ui.LabelWidget({
			label: item.label
		});
		csdPageTitle.$element.addClass('adiutor-administrator-helper-csd-toolbar-page-name');
		pageLayout.$element.addClass('adiutor-administrator-helper-csd-article-content');
		pageLayout.$toolbar.append(csdPageTitle.$element);
		var backButton = new OO.ui.ButtonWidget({
			label: mw.msg('back'),
			icon: 'previous',
		});
		backButton.on('click', function() {
			if(currentPageIndex > 0) {
				currentPageIndex--;
				booklet.setPage(pageLayouts[currentPageIndex]);
			}
		});
		pageLayout.$toolbar.append(backButton.$element);
		var forwardButton = new OO.ui.ButtonWidget({
			label: mw.msg('next'),
			icon: 'next',
		});
		forwardButton.on('click', function() {
			if(currentPageIndex < pageLayouts.length - 1) {
				currentPageIndex++;
				booklet.setPage(pageLayouts[currentPageIndex]);
			}
		});
		pageLayout.$toolbar.append(forwardButton.$element);
		// Sil butonu
		var deleteButton = new OO.ui.ButtonWidget({
			label: mw.msg('delete'),
			icon: 'trash',
			flags: ['destructive']
		});
		deleteButton.on('click', function() {
			// Example: An action set used in a process dialog
			function csdAdminProcessDialog(config) {
				csdAdminProcessDialog.super.call(this, config);
			}
			OO.inheritClass(csdAdminProcessDialog, OO.ui.ProcessDialog);
			csdAdminProcessDialog.static.title = item.label;
			csdAdminProcessDialog.static.name = 'csdAdminProcessDialog';
			// An action set that uses modes ('edit' and 'help' mode, in this example).
			csdAdminProcessDialog.static.actions = [{
				action: 'continue',
				modes: 'edit',
				label: mw.msg('confirm-action'),
				flags: ['primary', 'destructive']
			}, {
				action: 'help',
				modes: 'edit',
				label: mw.msg('help')
			}, {
				modes: 'edit',
				label: mw.msg('cancel'),
				flags: 'safe'
			}, {
				action: 'back',
				modes: 'help',
				label: mw.msg('back'),
				flags: 'safe'
			}];
			csdAdminProcessDialog.prototype.initialize = function() {
				csdAdminProcessDialog.super.prototype.initialize.apply(this, arguments);
				switch(item.namespace) {
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
					label: mw.msg('other-options')
				});
				DeletionOptions.addItems([
					new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
						selected: false,
						value: 'recreationProrection'
					}), {
						label: new OO.ui.deferMsg('protect-against-rebuilding'),
						help: new OO.ui.deferMsg('protect-against-rebuilding-help'),
						align: 'inline'
					}),
					new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
						selected: true,
						value: 'informCreator'
					}), {
						label: new OO.ui.deferMsg('afd-inform-creator'),
						help: new OO.ui.deferMsg('afd-inform-creator-help'),
						align: 'inline'
					})
				]);
				var headerTitle = new OO.ui.MessageWidget({
					type: 'notice',
					inline: true,
					label: new OO.ui.deferMsg('csd-header-title')
				});
				var headerTitleDescription = new OO.ui.LabelWidget({
					label: new OO.ui.deferMsg('csd-header-description')
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
					expanded: false,
					classes: ['adiutor-csd-modal-container-panel-1']
				});
				this.panel1.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<hr><br>', stack.$element);
				this.panel2 = new OO.ui.PanelLayout({
					padded: true,
					expanded: false,
					classes: ['adiutor-csd-modal-container-panel-2']
				});
				this.panel2.$element.append('<p><strong>Adiutor</strong>, çeşitli işlemlerde kullanıcılara kolaylık sağlamak için geliştirilmiş bir küçük araçtır. Hata raporları ve özellik önerileri de dahil olmak üzere tüm geri bildirimlerinizi, tartışma sayfasında belirtebilirsiniz.</p><h2>Lisanslama ve atıf</h2><p>İlk olarak Türkçe Vikipedi\'deki https://tr.wikipedia.org/wiki/MediaWiki:Gadget-Adiutor.js adresinde yayınlanmıştır. Creative Commons Attribution-ShareAlike 3.0 Unported License (CC BY-SA 3.0) https://creativecommons.org/licenses/by-sa/3.0/ ve GNU Free Documentation License (GFDL) http://www.gnu.org/copyleft/fdl.html altında lisanslanmıştır.</p>');
				this.stackLayout = new OO.ui.StackLayout({
					items: [this.panel1, this.panel2],
					classes: ['adiutor-csd-modal-container-user-panel']
				});
				this.$body.append(this.stackLayout.$element);
			};
			csdAdminProcessDialog.prototype.getSetupProcess = function(data) {
				return csdAdminProcessDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
					this.actions.setMode('edit');
				}, this);
			};
			csdAdminProcessDialog.prototype.getActionProcess = function(action) {
				if(action === 'help') {
					this.actions.setMode('help');
					this.stackLayout.setItem(this.panel2);
				} else if(action === 'back') {
					this.actions.setMode('edit');
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
							CSDSummary = SaltCSDSummary;
						} else {
							CSDReason = '{{sil|' + CSDReasons[0].data + CopVioURL + '}}';
							CSDSummary = CSDReasons[0].data;
							SaltCSDSummary = CSDReasons[0].data;
						}
						api.postWithToken('csrf', {
							action: 'delete',
							title: item.label,
							reason: CSDSummary,
							tags: 'Adiutor',
							format: 'json'
						}).done(function() {
							api.postWithToken('csrf', {
								action: 'delete',
								title: "Tartışma:" + item.label,
								reason: '[[VP:HS#G7]]: Silinen sayfanın tartışma sayfası',
								tags: 'Adiutor',
								format: 'json'
							}).done(function() {});
							dialog.close();
							mw.notify('Madde başarılı şekilde silindi.', {
								title: 'İşlem tamamlandı!',
								type: 'success'
							});
							if(pageLayouts.length > 1) {
								booklet.removePages([pageLayout]); // Sayfa düzenini direkt olarak kaldır
								// Remove the deleted page from ArticleListforCsd
								ArticleListforCsd.splice(currentPageIndex, 1);
								// Update mw.storage
								mw.storage.session.set('ArticleListforCsd', JSON.stringify(ArticleListforCsd));
								// Update the currentPageIndex if it exceeds the new page count
								currentPageIndex = Math.min(currentPageIndex, pageLayouts.length - 2);
							}
						});
					});
				}
				return csdAdminProcessDialog.super.prototype.getActionProcess.call(this, action);
			};
			var CsdWindowManager = new OO.ui.WindowManager();
			$(document.body).append(CsdWindowManager.$element);
			var dialog = new csdAdminProcessDialog({
				size: 'larger',
				classes: 'adiutor-user-dashboard-admin-csd-reason-dialog'
			});
			CsdWindowManager.addWindows([dialog]);
			CsdWindowManager.openWindow(dialog);
		});
		if(mwConfig.wgUserGroups.includes("sysop")) {
			pageLayout.$toolbar.append(deleteButton.$element);
		}
		return pageLayout;
	});
	var booklet = new OO.ui.BookletLayout({
		outlined: true,
		classes: ['adiutor-user-dashboard-main-2'],
	});
	booklet.addPages(pageLayouts);
	this.$element.append(booklet.$element);
}
OO.inheritClass(AdministratorPageTwoLayout, OO.ui.PageLayout);
AdministratorPageTwoLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('csd-requests'));
};
// Create instances of each page layout
var Administratorpage1 = new AdministratorPageOneLayout('page1'),
	Administratorpage2 = new AdministratorPageTwoLayout('page2');
// Add the pages to the booklet
var bookletAdministrator = new OO.ui.BookletLayout({
	outlined: true,
	size: 'full',
	classes: ['adiutor-csd-administrator-area']
});
bookletAdministrator.addPages([Administratorpage1, Administratorpage2]);

function SectionFourLayout(name, config) {
	SectionFourLayout.super.call(this, name, config);
	this.$element.append(bookletAdministrator.$element);
}
OO.inheritClass(SectionFourLayout, OO.ui.PageLayout);
SectionFourLayout.prototype.setupOutlineItem = function() {
	this.outlineItem.setLabel(mw.msg('administrator-tools'));
};
var sectionOne = new SectionOneLayout('one');
var sectionTwo = new SectionTwoLayout('two');
var sectionFour = new SectionFourLayout('four');
var booklet2 = new OO.ui.BookletLayout({
	outlined: true,
	classes: ['adiutor-user-dashboard-main-3'],
});
booklet2.addPages([sectionOne, sectionTwo, sectionFour]);

function MyProcessDialog(config) {
	MyProcessDialog.super.call(this, config);
}
OO.inheritClass(MyProcessDialog, OO.ui.ProcessDialog);
MyProcessDialog.static.name = 'myProcessDialog';
MyProcessDialog.static.title = mw.msg('adiutor-contributor-dashboard');
MyProcessDialog.static.actions = [{
	action: 'close',
	label: mw.msg('close'),
	flags: ['primary', 'progressive']
}, {
	action: 'help',
	modes: 'help',
	label: mw.msg('about'),
	classes: ['adiutor-user-dashboard-bottom-about-button'],
}, {
	label: new OO.ui.HtmlSnippet('<img width="80px" height="auto" src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Adiutor_logo.svg" alt="">'),
	classes: ['adiutor-user-dashboard-top-logo'],
	flags: 'safe'
}];
MyProcessDialog.prototype.initialize = function() {
	MyProcessDialog.super.prototype.initialize.apply(this, arguments);
	this.content = new OO.ui.PanelLayout({
		padded: true,
		expanded: false,
		size: 'full',
		classes: ['adiutor-user-dashboard-main-x'],
	});
	this.content.$element.append(booklet2.$element);
	this.$body.append(this.content.$element);
};
MyProcessDialog.prototype.getActionProcess = function(action) {
	if(action === 'help') {
		window.open('https://meta.wikimedia.org/wiki/Adiutor', '_blank');
	} else if(action === 'close') {
		var dialog = this;
		dialog.close();
	}
	return MyProcessDialog.super.prototype.getActionProcess.call(this, action);
};
var windowManager = new OO.ui.WindowManager();
$(document.body).append(windowManager.$element);
var dialog = new MyProcessDialog({
	size: 'full',
	classes: ['adiutor-user-dashboard-main-container'],
});
windowManager.addWindows([dialog]);
windowManager.openWindow(dialog);
/* </nowiki> */