/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * About: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Administrator intervention against vandalism
 */
// Wait for required libraries and DOM to be ready
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]), $.ready).then(function() {
	// Get essential configuration from MediaWiki
	var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
	var api = new mw.Api();
	var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
	var RDRRationale, VandalizedPageInput, revId;
	var VandalizedPage = {};
	var RequestRationale = false;
	VandalizedPage.value = null;
	var revisionID = {};
	revisionID.value = null;

	function RevisionDeleteRequestDialog(config) {
		RevisionDeleteRequestDialog.super.call(this, config);
	}
	OO.inheritClass(RevisionDeleteRequestDialog, OO.ui.ProcessDialog);
	RevisionDeleteRequestDialog.static.name = 'RevisionDeleteRequestDialog';
	RevisionDeleteRequestDialog.static.title = new OO.ui.deferMsg('aiv-module-title');
	RevisionDeleteRequestDialog.static.actions = [{
		action: 'save',
		label: new OO.ui.deferMsg('report'),
		flags: ['primary', 'progressive']
	}, {
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}];
	RevisionDeleteRequestDialog.prototype.initialize = function() {
		RevisionDeleteRequestDialog.super.prototype.initialize.apply(this, arguments);
		var RationaleSelector = new OO.ui.DropdownWidget({
			menu: {
				items: [
					new OO.ui.MenuOptionWidget({
						data: 1,
						label: new OO.ui.deferMsg('vandalism')
					}),
					new OO.ui.MenuOptionWidget({
						data: 2,
						label: new OO.ui.deferMsg('username-violation')
					}),
				]
			},
			label: new OO.ui.deferMsg('report-type'),
		});
		var headerTitle = new OO.ui.MessageWidget({
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg('aiv-header-title')
		});
		var headerTitleDescription = new OO.ui.LabelWidget({
			label: new OO.ui.deferMsg('aiv-header-description')
		});
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		var RequestRationaleContainer = new OO.ui.FieldsetLayout({
			classes: ['adiutor-report-window-rationale-window']
		});
		RationaleSelector.getMenu().on('choose', function(menuOption) {
			switch(menuOption.getData()) {
				case 1:
					RequestRationale = new OO.ui.FieldsetLayout({
						label: new OO.ui.deferMsg('rationale'),
					});
					RequestRationale.addItems([
						new OO.ui.FieldLayout(VandalizedPage = new OO.ui.TextInputWidget({
							value: ''
						}), {
							label: new OO.ui.deferMsg('related-page'),
							help: new OO.ui.deferMsg('related-page-description'),
						}),
						new OO.ui.FieldLayout(revisionID = new OO.ui.TextInputWidget({
							value: ''
						}), {
							label: new OO.ui.deferMsg('revision-id'),
							help: new OO.ui.deferMsg('revision-id-description'),
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-1').text(),
						}), {
							label: mw.message('aiv-rationale-1').text(),
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-2').text(),
						}), {
							label: mw.message('aiv-rationale-2').text(),
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-3').text(),
						}), {
							label: mw.message('aiv-rationale-3').text(),
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-4').text(),
						}), {
							label: mw.message('aiv-rationale-4').text(),
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-5').text(),
						}), {
							label: mw.message('aiv-rationale-5').text(),
							align: 'inline'
						}),
					]);
					break;
				case 2:
					RequestRationale = new OO.ui.FieldsetLayout({
						label: new OO.ui.deferMsg('rationale'),
					});
					RequestRationale.addItems([
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-6').text(),
						}), {
							label: mw.message('aiv-rationale-6').text(),
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-7').text(),
						}), {
							label: mw.message('aiv-rationale-7').text(),
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-8').text(),
						}), {
							label: mw.message('aiv-rationale-8').text(),
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-9').text(),
						}), {
							label: mw.message('aiv-rationale-9').text(),
							align: 'inline'
						}),
						new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget({
							selected: false,
							data: mw.message('aiv-rationale-10').text(),
						}), {
							label: mw.message('aiv-rationale-10').text(),
							align: 'inline'
						}),
					]);
					break;
			}
			RequestRationaleContainer.$element.html(RequestRationale.$element);
		});
		this.content.$element.append(headerTitle.$element, '<br>', headerTitleDescription.$element, '<hr><br>', RationaleSelector.$element, '<br><br>', RequestRationaleContainer.$element);
		RevisionDeleteRequestDialog.prototype.getBodyHeight = function() {
			return Math.max(this.content.$element.outerHeight(false), 450);
		};
		this.$body.append(this.content.$element);
	};
	RevisionDeleteRequestDialog.prototype.getActionProcess = function(action) {
		var dialog = this;
		if(action) {
			if(RequestRationale) {
				RequestRationale.items.forEach(function(Rationale) {
					if(Rationale.fieldWidget.selected) {
						RDRRationale = Rationale.fieldWidget.data;
					}
				});
			}
			if(RDRRationale) {
				return new OO.ui.Process(function() {
					if(VandalizedPage.value) {
						VandalizedPageInput = '[[' + VandalizedPage.value + ']] sayfası üzerinde ';
					} else {
						VandalizedPageInput = '';
					}
					if(revisionID.value) {
						revId = '([[Özel:Fark/' + revisionID.value + '|fark]]) ';
					} else {
						revId = '';
					}
					PreparedText = '{{kopyala:Vikipedi:Kullanıcı engelleme talepleri/Önyükleme-şablon |1= ' + mwConfig.wgPageName.replace(/_/g, " ").replace('Kullanıcı:', '').replace('Özel:Katkılar/', '') + ' |2='.concat(VandalizedPageInput, revId, RDRRationale) + '}}';
					addReport(PreparedText);
					console.log(PreparedText);
					dialog.close({
						action: action
					});
				});
			} else {
				OO.ui.alert(new OO.ui.deferMsg('select-rationale')).done(function() {});
			}
		}
		return RevisionDeleteRequestDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new RevisionDeleteRequestDialog();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);

	function addReport(PreparedText) {
		api.postWithToken('csrf', {
			action: 'edit',
			title: 'Vikipedi:Kullanıcı engelleme talepleri',
			appendtext: "\n" + PreparedText + "\n",
			summary: '[[Kullanıcı:' + mwConfig.wgPageName.replace(/_/g, " ").replace('Kullanıcı:', '').replace('Özel:Katkılar/', '') + ']] raporlandı.',
			tags: 'Adiutor',
			format: 'json'
		}).done(function() {
			window.location = '/wiki/Vikipedi:Kullanıcı engelleme talepleri';
		});
	}
});
/* </nowiki> */