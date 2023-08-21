/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Copyright checker
 * Earwig's Copyvio Detector (https://copyvios.toolforge.org/) api used in MediaWiki:Gadget-Adiutor-COV.js
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
var messageDialog = new OO.ui.MessageDialog();
var windowManager = new OO.ui.WindowManager();
$('body').append(windowManager.$element);
windowManager.addWindows([messageDialog]);
var progressBar = new OO.ui.ProgressBarWidget({
	progress: false
});
windowManager.openWindow(messageDialog, {
	title: 'Kontrol ediliyor...',
	message: progressBar.$element
});
// Fetch data from Copyvio Detector API
$.get("https://copyvios.toolforge.org/api.json?", {
	action: "search",
	lang: "tr",
	project: "wikipedia",
	title: mwConfig.wgPageName,
	oldid: "",
	use_engine: "1",
	use_links: "1",
	turnitin: "0",
}, function(data) {
	messageDialog.close();

	function CopyVioDialog(config) {
		CopyVioDialog.super.call(this, config);
	}
	OO.inheritClass(CopyVioDialog, OO.ui.ProcessDialog);
	var copVioRatio = (data.best.confidence * 100).toFixed(2);
	CopyVioDialog.static.title = 'Sonuç ( %' + copVioRatio + ' )';
	CopyVioDialog.static.name = 'CopyVioDialog';
	var headerTitle;
	if(copVioRatio > 45) {
		headerTitle = new OO.ui.MessageWidget({
			type: 'error',
			inline: true,
			label: 'Muhtemel İhlal: % ' + copVioRatio
		});
		CopyVioDialog.static.actions = [{
			action: 'continue',
			modes: 'edit',
			label: 'Hızlı Silme Talebi',
			flags: ['primary', 'destructive']
		}, {
			modes: 'edit',
			label: 'Kapat',
			flags: 'safe'
		}];
	} else if(copVioRatio < 10) {
		headerTitle = new OO.ui.MessageWidget({
			type: 'success',
			inline: true,
			label: 'Muhtemel İhlal: %' + copVioRatio
		});
		CopyVioDialog.static.actions = [{
			modes: 'edit',
			label: 'Kapat',
			flags: 'safe'
		}];
	} else {
		headerTitle = new OO.ui.MessageWidget({
			type: 'warning',
			inline: true,
			label: 'Muhtemel İhlal: %' + copVioRatio + ' | Bu sayfada kritik seviyeye yakın derecede telif hakkı ihlali var, telifli kısımları çıkarabilirsiniz.'
		});
		CopyVioDialog.static.actions = [{
			modes: 'edit',
			label: 'Kapat',
			flags: 'safe'
		}];
	}
	CopyVioDialog.prototype.initialize = function() {
		CopyVioDialog.super.prototype.initialize.apply(this, arguments);
		var cvRelSource = data.sources.filter(function(source) {
			return !source.excluded;
		});
		var CopyVioLinks = cvRelSource.map(function(source) {
			var messageWidgetConfig = {
				icon: 'link',
				label: new OO.ui.HtmlSnippet('<a target="_blank" href="' + source.url + '">' + source.url + '</a>')
			};
			if((source.confidence * 100).toFixed(2) > 40) {
				messageWidgetConfig.type = 'error';
				messageWidgetConfig.label = new OO.ui.HtmlSnippet('<strong>Yüksek İhlal İçeren Bağlantı (' + (source.confidence * 100).toFixed(2) + ')</strong><br><a target="_blank" href="' + source.url + '">' + source.url + '</a>');
			} else {
				messageWidgetConfig.type = 'notice';
			}
			return new OO.ui.MessageWidget(messageWidgetConfig);
		});
		this.panel1 = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		this.panel1.$element.append(headerTitle.$element);
		CopyVioLinks.forEach(function(link) {
			this.panel1.$element.append(link.$element);
		}, this);
		this.$body.append(this.panel1.$element);
	};
	CopyVioDialog.prototype.getSetupProcess = function(data) {
		return CopyVioDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
			this.actions.setMode('edit');
		}, this);
	};
	CopyVioDialog.prototype.getActionProcess = function(action) {
		if(action === 'continue') {
			var dialog = this;
			return new OO.ui.Process(function() {
				dialog.close();
				mw.loader.load(mw.util.getUrl('MediaWiki:Gadget-Adiutor-CSD.js', {
					action: 'raw'
				}) + '&ctype=text/javascript', 'text/javascript');
			});
		}
		return CopyVioDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new CopyVioDialog({
		size: 'larger'
	});
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);
});
/* </nowiki> */