/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: AfD Helper
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-'+wikiId));
var subPageRegex = /(Silinmeye_aday_sayfalar\/)/;
var isSubPage = subPageRegex.test(mwConfig.wgPageName);
var afdButtons, previewWikitext, firstMonthOfDateString, firstDateMatch, opinionTemplate, nominationPage, purePageName, pageName, header_warn;
if(mwConfig.wgUserGroups.includes("sysop")) {
	if(isSubPage) {
		afdButtons = new OO.ui.ButtonGroupWidget({
			items: [new OO.ui.ButtonWidget({
				icon: 'speechBubbleAdd',
				label: 'Görüş',
				invisibleLabel: true,
				title: 'Görüş Bildir',
				classes: ['afd-helper-button']
			}), new OO.ui.ButtonWidget({
				icon: 'editLock',
				invisibleLabel: true,
				classes: ['afd-closer-button']
			})],
			classes: ['afd-helper-button-group']
		});
	} else {
		afdButtons = new OO.ui.ButtonGroupWidget({
			items: [new OO.ui.ButtonWidget({
				icon: 'eye',
				label: 'Adaylık',
				invisibleLabel: true,
				classes: ['afd-helper-visit-button']
			}), new OO.ui.ButtonWidget({
				icon: 'speechBubbleAdd',
				label: 'Görüş',
				invisibleLabel: true,
				title: 'Görüş Bildir',
				classes: ['afd-helper-button']
			}), new OO.ui.ButtonWidget({
				icon: 'editLock',
				invisibleLabel: true,
				classes: ['afd-closer-button']
			})],
			classes: ['afd-helper-button-group']
		});
	}
} else {
	if(isSubPage) {
		afdButtons = new OO.ui.ButtonGroupWidget({
			items: [new OO.ui.ButtonWidget({
				icon: 'speechBubbleAdd',
				label: 'Görüş',
				invisibleLabel: true,
				title: 'Görüş Bildir',
				classes: ['afd-helper-button']
			})],
			classes: ['afd-helper-button-group']
		});
	} else {
		afdButtons = new OO.ui.ButtonGroupWidget({
			items: [new OO.ui.ButtonWidget({
				icon: 'eye',
				label: 'Adaylık',
				invisibleLabel: true,
				classes: ['afd-helper-visit-button']
			}), new OO.ui.ButtonWidget({
				icon: 'speechBubbleAdd',
				label: 'Görüş',
				invisibleLabel: true,
				title: 'Görüş Bildir',
				classes: ['afd-helper-button']
			}), ],
			classes: ['afd-helper-button-group']
		});
	}
}
$('.afd-helper-button').each(function(index) {
	this.id = "opinion" + (index + 1);
});
$('.afd-helper-button').children().each(function(index) {
	this.id = "opinion" + (index + 1);
});
$('.afd-helper-visit-button').each(function(index) {
	this.id = "opinion" + (index + 1);
});
$('.afd-helper-visit-button').children().each(function(index) {
	this.id = "opinion" + (index + 1);
});
$('.mw-headline').append(afdButtons.$element);
$(".afd-helper-button").children().click(function() {
	pageName = $(this).parent().parent().parent()[0].innerText.replace('Görüş', '').replace('Adaylık', '');
	purePageName = pageName.replace($(this).parent().parent().parent()[0], '').replace('Görüş', '');
	PageTitleElement = $(this).parent().parent().parent().parent()[0].lastElementChild;
	nominationPage = clearURLfromOrigin(PageTitleElement.querySelector(".mw-editsection a").getAttribute('href'));
	afdOpinionDialog(purePageName, adiutorUserOptions);
});
$(".afd-closer-button").children().click(function() {
	pageName = $(this).parent().parent().parent()[0].innerText.replace('Görüş', '').replace('Adaylık', '');
	purePageName = pageName.replace($(this).parent().parent().parent()[0], '').replace('Görüş', '');
	PageTitleElement = $(this).parent().parent().parent().parent()[0].lastElementChild;
	nominationPage = clearURLfromOrigin(PageTitleElement.querySelector(".mw-editsection a").getAttribute('href'));
	var pageContentWithDate;
	if(isSubPage) {
		pageContentWithDate = $(this).parent().parent().parent().parent().parent()[0].innerText;
		discussionText = $(this).parent().parent().parent().parent().parent()[0].innerText;
		firstDateMatch = /\d{1,2} ([a-zA-ZğüşıöçİIĞÜŞÖÇ]*) \d{4}/i.exec(discussionText);
		firstMonthOfDateString = firstDateMatch && firstDateMatch[1];
	} else {
		pageContentWithDate = $(this).parent().parent().parent().parent().next()[0].innerText;
		discussionText = $(this).parent().parent().parent().parent().next().next()[0].innerText;
		firstDateMatch = /\d{1,2} ([a-zA-ZğüşıöçİIĞÜŞÖÇ]*) \d{4}/i.exec(discussionText);
		firstMonthOfDateString = firstDateMatch && firstDateMatch[1];
	}
	var timeExpired = pageContentWithDate.includes("Tartışma için öngörülen süre dolmuştur");
	afdCloserDialog(purePageName, timeExpired);
});
$(".afd-helper-visit-button").children().click(function() {
	PageTitleElement = $(this).parent().parent().parent().parent()[0].lastElementChild;
	nominationPage = clearURLfromOrigin(PageTitleElement.querySelector(".mw-editsection a").getAttribute('href'));
	window.location = '/wiki/' + nominationPage;
});
//var boxes = document.getElementsByClassName('mw-parser-output');
//var headings = boxes[0].getElementsByTagName('h2');
//len = headings !== null ? headings.length : 0, i = 0;
//for (var i; i < len; i++) {
//    headings[i].className += " hide-non-opinion";
//}
//$(".hide-non-opinion .afd-helper-button-group").hide();
$(".ext-discussiontools-init-section .afd-helper-button-group").hide();
$(".xfd-closed .afd-helper-button-group").hide();

function afdOpinionDialog(purePageName, adiutorUserOptions) {
	var InputFilled = false;
	console.log(InputFilled);
	var rationaleInput = new OO.ui.MultilineTextInputWidget({
		placeholder: 'Lütfen bu adaylık için görüşünüzü belirtin',
		indicator: 'required',
		notices: ['Bu alan zorunludur lütfen boş bırakmayınız.'],
		classes: ['afd-helper-comment-textarea']
	});
	rationaleInput.on('change', function() {
		console.log(rationaleInput.value);
		if(rationaleInput.value != "") {
			InputFilled = false;
			console.log(InputFilled);
		} else {
			InputFilled = true;
			console.log(InputFilled);
		}
	});
	log_it = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
		selected: adiutorUserOptions.articlesForDeletion.afdNominateOpinionsLog
	}), {
		align: 'inline',
		label: 'Görüşümü günlüğüme kaydet\u200e',
		help: 'Bu seçenek aktif olduğunuzda kullancı sayfanızda oluşturulacak bir alt sayfada SAS adaylıklarına yaptınız görüşler kayıt olarak tutulacaktır.\u200e'
	});
	var header_warn = new OO.ui.MessageWidget({
		type: 'notice',
		inline: true,
		label: new OO.ui.HtmlSnippet('Silinmeye aday sayfa tartışmaları bir oylama değildir!<br><small>SAS adaylıklarında kararlar görüş sayısına göre değil politika ve yönergelere göre alınmaktadır.</small>')
	});
	var page_url = '<a href="'.concat(purePageName.trim(), '" target="_blank">').concat(purePageName.trim(), "</a>");
	var page_link = page_url.replace(/&lt;(\/?pre\s?\/?)&gt;/g, " ");
	var page_name = new OO.ui.MessageWidget({
		type: 'notice',
		icon: 'article',
		label: '',
		classes: ['afd-helper-page-name']
	});

	function opinionDialog(config, buttonSelect) {
		opinionDialog.super.call(this, config, buttonSelect);
	}
	OO.inheritClass(opinionDialog, OO.ui.ProcessDialog);
	opinionDialog.static.title = 'Adiutor (Beta) - SAS Görüş Bildirimi';
	opinionDialog.static.name = 'opinionDialog';
	opinionDialog.static.actions = [{
		action: 'continue',
		modes: 'edit,preview',
		label: 'Ekle',
		disabled: InputFilled,
		icon: 'add',
		flags: ['primary', 'progressive']
	}, {
		action: 'about',
		modes: 'edit,preview',
		label: 'Hakkında',
		icon: 'infoFilled'
	}, {
		modes: 'edit',
		label: 'İptal',
		flags: 'safe',
		icon: 'close'
	}, {
		action: 'back',
		modes: 'about,preview',
		label: 'Geri',
		flags: 'safe'
	}, {
		action: 'preview',
		modes: 'edit,preview',
		label: 'Önizleme',
		icon: 'eye',
		align: 'right'
	}];
	opinionDialog.prototype.initialize = function() {
		opinionDialog.super.prototype.initialize.apply(this, arguments);
		buttonSelect = new OO.ui.ButtonSelectWidget({
			items: [new OO.ui.ButtonOptionWidget({
				id: 1,
				data: 1,
				label: 'Kalsın',
				title: 'Kalsın',
				classes: ['afd-opinion-select-btn']
			}), new OO.ui.ButtonOptionWidget({
				id: 2,
				data: 2,
				label: 'Hızlı Kalsın',
				title: 'Hızlı Kalsın',
				classes: ['afd-opinion-select-btn']
			}), new OO.ui.ButtonOptionWidget({
				id: 3,
				data: 3,
				label: 'Silinsin',
				title: 'Silinsin',
				classes: ['afd-opinion-select-btn']
			}), new OO.ui.ButtonOptionWidget({
				id: 4,
				data: 4,
				label: 'Hızlı Silinsin',
				title: 'Hızlı Silinsin',
				classes: ['afd-opinion-select-btn']
			}), new OO.ui.ButtonOptionWidget({
				id: 5,
				data: 5,
				label: 'Birleştir',
				title: 'Birleştirilsin',
				classes: ['afd-opinion-select-btn']
			}), new OO.ui.ButtonOptionWidget({
				id: 6,
				data: 6,
				label: 'Taşınsın',
				title: 'Taşınsın',
				classes: ['afd-opinion-select-btn']
			}), new OO.ui.ButtonOptionWidget({
				id: 7,
				data: 7,
				label: 'Aktarılsın',
				title: 'Aktarılsın',
				classes: ['afd-opinion-select-btn']
			}), new OO.ui.ButtonOptionWidget({
				id: 8,
				data: 8,
				label: 'Çekimser',
				title: 'Çekimser',
				classes: ['afd-opinion-select-btn']
			}), new OO.ui.ButtonOptionWidget({
				id: 9,
				data: 9,
				icon: 'speechBubble',
				invisibleLabel: true,
				title: 'Sadece Yorum',
				classes: ['afd-opinion-select-btn']
			}), ],
			classes: ['afd-opinion-select-btn-group']
		});
		buttonSelect.on('select', (function() {
			mw.storage.session.set('selectedOpinion', buttonSelect.findSelectedItem().data);
			switch(buttonSelect.findSelectedItem().data) {
				case 1:
					opinionTemplate = '*{{Kalsın}}';
					break;
				case 2:
					opinionTemplate = '*{{Hızlı kalsın}}';
					break;
				case 3:
					opinionTemplate = '*{{Silinsin}}';
					break;
				case 4:
					opinionTemplate = '*{{Hızlı silinsin}}';
					break;
				case 5:
					opinionTemplate = '*{{Birleştirilsin}}';
					break;
				case 6:
					opinionTemplate = '*{{Taşınsın}}';
					break;
				case 7:
					opinionTemplate = '*{{Aktarılsın}}';
					break;
				case 8:
					opinionTemplate = '*{{Çekimser}}';
					break;
				case 9:
					opinionTemplate = '*{{Yorum}}';
					break;
			}
			previewWikitext = opinionTemplate + ' ' + rationaleInput.value + ' ~~~~';
		}));
		this.panel1 = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.panel1.$element.append(header_warn.$element, page_name.$element, '</br>', buttonSelect.$element, '</br>', rationaleInput.$element, log_it.$element);
		this.panel2 = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.panel2.$element.append('<p><strong>Adiutor</strong>, çeşitli işlemlerde kullanıcılara kolaylık sağlamak için geliştirilmiş bir küçük araçtır. Hata raporları ve özellik önerileri de dahil olmak üzere tüm geri bildirimlerinizi, tartışma sayfasında belirtebilirsiniz.</p><h2>Lisanslama ve atıf</h2><p>İlk olarak Türkçe Vikipedi\'deki https://tr.wikipedia.org/wiki/MediaWiki:Gadget-Adiutor.js adresinde yayınlanmıştır. Creative Commons Attribution-ShareAlike 3.0 Unported License (CC BY-SA 3.0) https://creativecommons.org/licenses/by-sa/3.0/ ve GNU Free Documentation License (GFDL) http://www.gnu.org/copyleft/fdl.html altında lisanslanmıştır.</p>');
		rationaleInput.on('change', function() {
			previewWikitext = opinionTemplate + ' ' + rationaleInput.value + ' ~~~~';
			console.log(previewWikitext);
		});
		this.stackLayout = new OO.ui.StackLayout({
			items: [this.panel1, this.panel2]
		});
		this.$body.append(this.stackLayout.$element);
	};
	opinionDialog.prototype.getSetupProcess = function(data) {
		return opinionDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
			this.actions.setMode('edit');
		}, this);
	};
	opinionDialog.prototype.getActionProcess = function(action) {
		if(action === 'about') {
			this.actions.setMode('about');
			this.stackLayout.setItem(this.panel2);
		} else if(action === 'back') {
			this.actions.setMode('edit');
			this.stackLayout.setItem(this.panel1);
		} else if(action === 'continue') {
			var dialog = this;
			return new OO.ui.Process(function() {
				if(rationaleInput.value != "") {
					addOpinion(purePageName, rationaleInput, adiutorUserOptions);
					dialog.close();
				} else {
					alertDialog("Görüş belirtiniz!", "Silinmeye aday sayfa tartışmaları bir oylama değildir! SAS adaylıklarında kararlar görüş sayısına göre değil politika ve yönergelere göre alınmaktadır.");
				}
			});
		}
		if(action === 'preview') {
			api.get({
				action: 'parse',
				text: previewWikitext,
				disablelimitreport: 1,
				disabletidy: 1,
				prop: 'text',
				format: "json"
			}).done(function(data) {
				function WikiPreviewDialog(config) {
					WikiPreviewDialog.super.call(this, config);
				}
				OO.inheritClass(WikiPreviewDialog, OO.ui.ProcessDialog);
				WikiPreviewDialog.static.name = 'WikiPreviewDialog';
				WikiPreviewDialog.static.title = 'Önizleme';
				WikiPreviewDialog.static.actions = [{
					action: 'save',
					modes: 'edit,preview',
					label: 'Ekle',
					disabled: InputFilled,
					icon: 'add',
					flags: ['primary', 'progressive']
				}, {
					label: 'Kapat',
					flags: 'safe'
				}];
				WikiPreviewDialog.prototype.initialize = function() {
					WikiPreviewDialog.super.prototype.initialize.apply(this, arguments);
					this.content = new OO.ui.PanelLayout({
						padded: true,
						expanded: false
					});
					this.content.$element.html(data.parse.text['*']);
					this.$body.append(this.content.$element);
				};
				WikiPreviewDialog.prototype.getActionProcess = function(action) {
					var dialog = this;
					if(action) {
						return new OO.ui.Process(function() {
							addOpinion(purePageName, rationaleInput, adiutorUserOptions);
							dialog.close({
								action: action
							});
						});
					}
					return WikiPreviewDialog.super.prototype.getActionProcess.call(this, action);
				};
				var windowManager = new OO.ui.WindowManager();
				$(document.body).append(windowManager.$element);
				var dialog = new WikiPreviewDialog({
					size: 'full',
				});
				windowManager.addWindows([dialog]);
				windowManager.openWindow(dialog);
			});
		}
		return opinionDialog.super.prototype.getActionProcess.call(this, action);
	};
	opinionDialog.prototype.getBodyHeight = function() {
		//return this.panel1.$element.outerHeight(true);
		return Math.max(this.panel1.$element.outerHeight(true), 320);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new opinionDialog({
		size: 'large',
		classes: ['afd-helper-window']
	});
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);
	$('.afd-helper-page-name').children().next().append(page_link);
}

function afdCloserDialog(purePageName, timeExpired) {
	if(timeExpired) {
		header_warn = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.HtmlSnippet('Tartışma sonuçlandırılıyor<br><small>Şu anda tartışmayı sonuçlandırmaktasınız, lütfen gerekçe girerek tartışmayı sonuçlandırınız.</small>')
		});
	} else {
		header_warn = new OO.ui.MessageWidget({
			type: 'error',
			inline: true,
			label: new OO.ui.HtmlSnippet('Tartışmanın süresi dolmadı!<br><small>Bu tartışmanın süresi henüz dolmadı, tartışmayı sonuçlandırırken bunu göz önünde bulundurunuz.</small>')
		});
	}
	var page_url = '<a href="wiki/'.concat(purePageName.trim(), '" target="_blank">').concat(purePageName.trim(), "</a>");
	var page_link = page_url.replace(/&lt;(\/?pre\s?\/?)&gt;/g, " ");
	var page_name = new OO.ui.MessageWidget({
		type: 'notice',
		icon: 'article',
		label: '',
		classes: ['afd-helper-page-name']
	});
	var rationaleInput = new OO.ui.MultilineTextInputWidget({
		placeholder: 'Sonuç gerekçesini buraya giriniz',
		indicator: 'required',
		notices: ['Bu alan zorunludur lütfen boş bırakmayınız.'],
		classes: ['afd-helper-comment-textarea']
	});
	rationaleInput.on('change', function() {
		console.log(rationaleInput.value);
	});

	function closerDialog(config) {
		closerDialog.super.call(this, config);
	}
	OO.inheritClass(closerDialog, OO.ui.ProcessDialog);
	closerDialog.static.title = 'Adiutor (Beta) - SAS Tartışma Sonlandırma';
	closerDialog.static.name = 'closerDialog';
	closerDialog.static.actions = [{
		action: 'close',
		modes: 'edit,preview',
		label: 'Sonuçlandır',
		icon: 'lock',
		flags: ['primary', 'progressive']
	}, {
		action: 'about',
		modes: 'edit,preview',
		label: 'Hakkında',
		icon: 'infoFilled'
	}, {
		modes: 'edit',
		label: 'İptal',
		flags: 'safe',
		icon: 'close'
	}, {
		action: 'back',
		modes: 'about,preview',
		label: 'Geri',
		flags: 'safe'
	}, ];
	closerDialog.prototype.initialize = function() {
		closerDialog.super.prototype.initialize.apply(this, arguments);
		buttonSelect = new OO.ui.ButtonSelectWidget({
			items: [new OO.ui.ButtonOptionWidget({
					id: 1,
					data: 1,
					label: 'Kalsın',
					title: 'Kalsın',
					classes: ['afd-result-select-btn']
				}),
				new OO.ui.ButtonOptionWidget({
					id: 2,
					data: 2,
					label: 'Hızlı Kalsın',
					title: 'Hızlı Kalsın',
					classes: ['afd-result-select-btn']
				}),
				new OO.ui.ButtonOptionWidget({
					id: 3,
					data: 3,
					label: 'Silinsin',
					title: 'Silinsin',
					classes: ['afd-result-select-btn']
				}),
				new OO.ui.ButtonOptionWidget({
					id: 4,
					data: 4,
					label: 'Hızlı Silinsin',
					title: 'Hızlı Silinsin',
					classes: ['afd-result-select-btn']
				}),
				new OO.ui.ButtonOptionWidget({
					id: 5,
					data: 5,
					label: 'Birleştir',
					title: 'Birleştirilsin',
					classes: ['afd-result-select-btn']
				}),
				new OO.ui.ButtonOptionWidget({
					id: 6,
					data: 6,
					label: 'Taşınsın',
					title: 'Taşınsın',
					classes: ['afd-result-select-btn']
				}),
				new OO.ui.ButtonOptionWidget({
					id: 7,
					data: 7,
					label: 'Aktarılsın',
					title: 'Aktarılsın',
					classes: ['afd-result-select-btn']
				}),
				new OO.ui.ButtonOptionWidget({
					id: 8,
					data: 8,
					label: 'Kararsız',
					title: 'Kararsız',
					classes: ['afd-result-select-btn']
				}),
				new OO.ui.ButtonOptionWidget({
					id: 9,
					data: 9,
					label: 'Özel',
					title: 'Özel',
					classes: ['afd-result-select-btn']
				}),
			],
			classes: ['afd-result-select-btn-group']
		});
		buttonSelect.on('select', function() {
			var selectedOptionData = buttonSelect.findSelectedItem().data;
			// Check if the selected option requires showing titleInput
			if(selectedOptionData === 5 || selectedOptionData === 6 || selectedOptionData === 7) {
				titleInput.$element.show(); // Show the titleInput element
			} else {
				titleInput.$element.hide(); // Hide the titleInput element
			}
			// Store the selected option's data in mw.storage
			mw.storage.session.set('selectedCloseDesicion', selectedOptionData);
		});
		var actionOption = new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
			selected: true
		}), {
			align: 'inline',
			label: 'Silme sonuçlarında sayfayı otomatik sil\u200e',
			help: 'Eğer bu seçeneği aktif ederseniz silme ile sonuçlanan aday sayfalar otomatik olarak silinecektir.\u200e'
		});
		titleInput = new OO.ui.TextInputWidget({
			'label': 'Birleştirilecek madde:',
		});
		this.panel1 = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.panel1.$element.append(header_warn.$element, page_name.$element, '</br>', buttonSelect.$element, '</br>', rationaleInput.$element, actionOption.$element, titleInput.$element);
		this.panel2 = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.panel2.$element.append('<p><strong>Adiutor</strong>, çeşitli işlemlerde kullanıcılara kolaylık sağlamak için geliştirilmiş bir küçük araçtır. Hata raporları ve özellik önerileri de dahil olmak üzere tüm geri bildirimlerinizi, tartışma sayfasında belirtebilirsiniz.</p><h2>Lisanslama ve atıf</h2><p>İlk olarak Türkçe Vikipedi\'deki https://tr.wikipedia.org/wiki/MediaWiki:Gadget-Adiutor.js adresinde yayınlanmıştır. Creative Commons Attribution-ShareAlike 3.0 Unported License (CC BY-SA 3.0) https://creativecommons.org/licenses/by-sa/3.0/ ve GNU Free Documentation License (GFDL) http://www.gnu.org/copyleft/fdl.html altında lisanslanmıştır.</p>');
		this.stackLayout = new OO.ui.StackLayout({
			items: [this.panel1, this.panel2]
		});
		titleInput.$element.hide();
		this.$body.append(this.stackLayout.$element);
	};
	closerDialog.prototype.getSetupProcess = function(data) {
		return closerDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
			this.actions.setMode('edit');
		}, this);
	};
	closerDialog.prototype.getActionProcess = function(action) {
		if(action === 'preview') {
			this.actions.setMode('preview');
			this.stackLayout.setItem(this.panel3);
		}
		if(action === 'about') {
			this.actions.setMode('about');
			this.stackLayout.setItem(this.panel2);
		} else if(action === 'back') {
			this.actions.setMode('edit');
			this.stackLayout.setItem(this.panel1);
		} else if(action === 'close') {
			var dialog = this;
			return new OO.ui.Process(function() {
				closeDiscussion(purePageName, rationaleInput);
				dialog.close();
			});
		}
		return closerDialog.super.prototype.getActionProcess.call(this, action);
	};
	closerDialog.prototype.getBodyHeight = function() {
		//return this.panel1.$element.outerHeight(true);
		return Math.max(this.panel1.$element.outerHeight(true), 320);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new closerDialog({
		size: 'large',
		classes: ['afd-helper-window']
	});
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);
	$('.afd-helper-page-name').children().next().append(page_link);
}
// ADD OPINION TO NOMINATION AFD PAGE
function addOpinion(purePageName, rationaleInput, adiutorUserOptions) {
	var opinion;
	var opinionText;
	switch(mw.storage.session.get('selectedOpinion')) {
		case '1':
			opinion = "Kalsın";
			opinionText = '*{{subst:Kalsın}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '2':
			opinion = "Hızlı Kalsın";
			opinionText = '*{{subst:Hızlı kalsın}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '3':
			opinion = "Silinsin";
			opinionText = '*{{subst:Silinsin}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '4':
			opinion = "Hızlı Silinsin";
			opinionText = '*{{subst:Hızlı silinsin}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '5':
			opinion = "Birleştirilsin";
			opinionText = '*{{subst:Birleştirilsin}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '6':
			opinion = "Taşınsın";
			opinionText = '*{{subst:Taşınsın}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '7':
			opinion = "Aktarılsın";
			opinionText = '*{{subst:Aktarılsın}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '8':
			opinion = "Çekimser";
			opinionText = '*{{subst:Çekimser}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '9':
			opinion = "Yorum";
			opinionText = '*{{subst:Yorum}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
	}
	api = new mw.Api();
	api.postWithToken('csrf', {
		action: 'edit',
		title: nominationPage,
		appendtext: "\n" + opinionText,
		summary: 'Adaylığa görüş bildirildi',
		tags: 'Adiutor',
		format: 'json'
	}).done(function() {
		if(adiutorUserOptions.articlesForDeletion.afdNominateOpinionsLog) {
			api = new mw.Api();
			api.postWithToken('csrf', {
				action: 'edit',
				title: 'Kullanıcı:'.concat(mwConfig.wgUserName, '/' + adiutorUserOptions.articlesForDeletion.afdOpinionLogPageName + '').split(' ').join('_'),
				appendtext: "\n" + "* ~~~~~ '''[[" + nominationPage + "|" + purePageName + "]]''' | Görüş: '''" + opinion + "'''",
				summary: 'SAS görüş günlüğü tutuluyor.',
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {});
		}
		if(isSubPage) {
			location.reload();
		} else {
			mw.notify('Görüşünüz başarıyla eklendi, sayfayı yenileyiniz.', {
				title: mw.msg('operation-completed'),
				type: 'success'
			});
		}
	});
}
// CLOSE DISCUSSION
function closeDiscussion(purePageName, rationaleInput) {
	var result;
	var closeText;
	switch(mw.storage.session.get('selectedCloseDesicion')) {
		case '1':
			result = "Kalsın";
			closeText = '{{subst:SAS Üst|kalsın}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '2':
			result = "Hızlı Kalsın";
			closeText = '{{subst:SAS Üst|hızlı kalsın}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '3':
			result = "Silinsin";
			closeText = '{{subst:SAS Üst|silinsin}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '4':
			result = "Hızlı Silinsin";
			closeText = '{{subst:SAS Üst|hızlı silinsin}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '5':
			result = "Birleştirilsin";
			closeText = '{{subst:SAS Üst|birleştirilsin}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '6':
			result = "Taşınsın";
			closeText = '{{subst:SAS Üst|taşınsın}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '7':
			result = "Aktarılsın";
			closeText = '{{subst:SAS Üst|aktarılsın}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '8':
			result = "Kararsız";
			closeText = '{{subst:SAS Üst|kararsız}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
		case '9':
			result = "Özel";
			closeText = '{{subst:SAS Üst|özel}}' + ' ' + rationaleInput.value + ' ~~~~';
			break;
	}
	api.postWithToken('csrf', {
		action: 'edit',
		title: nominationPage,
		prependtext: closeText + "\n",
		appendtext: "\n{{subst:SAS Son}}",
		summary: 'Adaylık sonuçlandırıldı',
		tags: 'Adiutor',
		format: 'json'
	}).done(function() {
		switch(mw.storage.session.get('selectedCloseDesicion')) {
			case '1':
				removeAfdTemplatesFromnominationPage(purePageName);
				break;
			case '2':
				removeAfdTemplatesFromnominationPage(purePageName);
				break;
			case '3':
				deletenominationPage(purePageName);
				break;
			case '4':
				deletenominationPage(purePageName);
				break;
			case '5':
				removeAfdTemplatesFromnominationPage(purePageName);
				break;
			case '6':
				removeAfdTemplatesFromnominationPage(purePageName);
				break;
			case '7':
				removeAfdTemplatesFromnominationPage(purePageName);
				break;
			case '8':
				removeAfdTemplatesFromnominationPage(purePageName);
				break;
			case '9':
				removeAfdTemplatesFromnominationPage(purePageName);
				break;
		}
	});
}
// REMOVE AFD TEMPLATES FROM NOMINATED PAGE
function removeAfdTemplatesFromnominationPage(purePageName) {
	var pageContent;
	api.get({
		action: 'parse',
		page: purePageName.trim(),
		prop: 'wikitext',
		format: "json"
	}).done(function(data) {
		pageContent = data.parse.wikitext['*'];
		var templatesCleanedPageContent = pageContent.replace(/\{\{\s*?sas\s*?(|\|.*?)\}\}\n?/gi, "");
		api.postWithToken('csrf', {
			action: 'edit',
			title: purePageName.trim(),
			text: templatesCleanedPageContent,
			summary: '[[VP:SAS|SAS]]: [[' + nominationPage + '|adaylığı]] sonucunda tartışma şablonu kaldırılıyor',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			removeNominationFromAfdPage();
		});
	});
}
// DELETE NOMINATED PAGE
function deletenominationPage(purePageName) {
	api.postWithToken('csrf', {
		action: 'delete',
		title: purePageName.trim(),
		reason: '[[VP:SAS|SAS]]: [[' + nominationPage + '|tartışması]] sonucunda silinmesine karar verilmiştir',
		tags: 'Adiutor',
		format: 'json'
	}).done(function() {
		api.postWithToken('csrf', {
			action: 'delete',
			title: "Tartışma:" + purePageName.trim(),
			reason: '[[VP:HS#G7]]: [[' + nominationPage + '|Tartışma]] sonucu silinen sayfanın tartışma sayfası',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {});
		removeNominationFromAfdPage();
	});
}
// REMOVE NOMINATION FROM AFD PAGE
function removeNominationFromAfdPage() {
	api.get({
		action: 'parse',
		page: "Vikipedi:Silinmeye_aday_sayfalar",
		prop: 'wikitext',
		format: "json"
	}).done(function(data) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: "Vikipedi:Silinmeye_aday_sayfalar",
			text: data.parse.wikitext['*'].replace("{{" + nominationPage.replace(/_/g, " ") + "}}", ""),
			summary: '[[VP:SAS|SAS]]: [[' + nominationPage + '|tartışması]] sonucunda arşivleniyor',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			addNominationToAfdLogPage();
		});
	});
}
// ADD NOMINATION TO AFD LOG PAGE
function addNominationToAfdLogPage() {
	var date = new Date();
	var date_year = date.getUTCFullYear();
	var pageContent;
	api.get({
		action: 'parse',
		page: "Vikipedi:Silinmeye_aday_sayfalar/Kayıt/" + date_year + "_" + firstMonthOfDateString,
		prop: 'wikitext',
		format: "json"
	}).done(function(data) {
		pageContent = data.parse.wikitext['*'];
		pageNameCleaned = nominationPage.replace(/_/g, " ");
		var discusionExistInLog = pageContent.includes("{{" + pageNameCleaned + "}}");
		//CHECK IF ALREADY ADDED
		if(!discusionExistInLog) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: "Vikipedi:Silinmeye_aday_sayfalar/Kayıt/" + date_year + "_" + firstMonthOfDateString,
				appendtext: "\n" + "{{" + pageNameCleaned + "}}",
				summary: "Adaylık [[Vikipedi:Silinmeye aday sayfalar/Kayıt/" + date_year + " " + firstMonthOfDateString + "|mevcut ayın]] kayıtlarına eklendi.",
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {
				if(isSubPage) {
					location.reload();
				} else {
					mw.notify('Adaylık başarıyla sonuçlandırıldı', {
						title: mw.msg('operation-completed'),
						type: 'success'
					});
				}
			});
		} else {
			if(isSubPage) {
				location.reload();
			} else {
				mw.notify('Adaylık başarıyla sonuçlandırıldı', {
					title: mw.msg('operation-completed'),
					type: 'success'
				});
			}
		}
		switch(mw.storage.session.get('selectedCloseDesicion')) {
			case '5':
				putMergeTemplate(purePageName);
				break;
			case '7':
				putMergeTemplate(purePageName);
				break;
		}

		function putMergeTemplate(purePageName) {
			api.postWithToken('csrf', {
				action: 'edit',
				title: purePageName.trim(),
				prependtext: '{{Birleştir SAS|' + nominationPage + '|' + titleInput.getValue() + '}}' + "\n",
				summary: 'SAS tartışması sonucunda birleştirme etiketi eklendi',
				tags: 'Adiutor',
				format: 'json'
			}).done(function() {});
		}
	});
}

function clearURLfromOrigin(AfDPageUrl) {
	return decodeURIComponent(AfDPageUrl.replace('https://'+mw.config.get("wgServerName")+'/w/index.php?title=', '').replace('&section=1&veaction=editsource', '').replace('/w/index.php?title=', '').replace(/\&section=T-1&veaction=editsource/g, "").replace(/\&action=edit&section=1/g, "").replace(/\&action=edit&section=T-1/g, ""));
}

function alertDialog(title, message) {
	var AlertDialog = new OO.ui.MessageDialog();
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	windowManager.addWindows([AlertDialog]);
	windowManager.openWindow(AlertDialog, {
		title: title,
		message: message,
	});
}
/* </nowiki> */