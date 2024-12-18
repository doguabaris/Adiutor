/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Copyright Violation Checker
 * Earwig's Copyvio Detector (https://copyvios.toolforge.org/) api used in MediaWiki:Gadget-Adiutor-COV.js
<nowiki> */
function callBack() {
	var api = new mw.Api();
	var mwConfig = mw.config.get(["wgPageName"]);
	var wgContentLanguage = mw.config.get('wgContentLanguage');
	var wikiId = mw.config.get('wgWikiID');
	var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
	var messageDialog = new OO.ui.MessageDialog();
	var windowManager = new OO.ui.WindowManager();
	$('body').append(windowManager.$element);
	windowManager.addWindows([messageDialog]);
	var progressBar = new OO.ui.ProgressBarWidget({
		progress: false
	});
	windowManager.openWindow(messageDialog, {
		title: mw.msg('copyvio-checking'),
		message: progressBar.$element
	});
	// Fetch data from Copyvio Detector API
	$.get("https://copyvios.toolforge.org/api.json?", {
		action: "search",
		lang: wgContentLanguage,
		project: "wikipedia",
		title: mwConfig.wgPageName,
		oldid: "",
		use_engine: "1",
		use_links: "1",
		turnitin: "0",
	}, function(data) {
		messageDialog.close();

		function copyVioDialog(config) {
			copyVioDialog.super.call(this, config);
		}
		OO.inheritClass(copyVioDialog, OO.ui.ProcessDialog);
		var copVioRatio = (data.best.confidence * 100).toFixed(2);
		copyVioDialog.static.title = mw.msg('copyvio-result', copVioRatio),
			copyVioDialog.static.name = 'copyVioDialog';
		var headerTitle;
		if(copVioRatio > 45) {
			headerTitle = new OO.ui.MessageWidget({
				type: 'error',
				inline: true,
				label: mw.msg('copyvio-potential-violation', copVioRatio),
			});
			copyVioDialog.static.actions = [{
				action: 'continue',
				modes: 'edit',
				label: mw.msg('create-speedy-deletion-request'),
				flags: ['primary', 'destructive']
			}, {
				modes: 'edit',
				label: mw.msg('close'),
				flags: 'safe'
			}, {
				action: 'analysis',
				modes: 'edit',
				label: mw.msg('detailed-analysis'),
				framed: false,
			}];
		} else if(copVioRatio < 10) {
			headerTitle = new OO.ui.MessageWidget({
				type: 'success',
				inline: true,
				label: mw.msg('copyvio-potential-violation', copVioRatio),
			});
			copyVioDialog.static.actions = [{
				action: 'close',
				modes: 'edit',
				label: mw.msg('okay'),
				flags: ['primary', 'progressive']
			}, {
				modes: 'edit',
				label: mw.msg('close'),
				flags: 'safe'
			}, {
				action: 'analysis',
				modes: 'edit',
				label: mw.msg('detailed-analysis'),
				framed: false,
			}];
		} else {
			headerTitle = new OO.ui.MessageWidget({
				type: 'warning',
				inline: true,
				label: mw.msg('copyvio-potential-violation-low', copVioRatio),
			});
			copyVioDialog.static.actions = [{
				action: 'close',
				modes: 'edit',
				label: mw.msg('okay'),
				flags: ['primary', 'progressive']
			}, {
				modes: 'edit',
				label: mw.msg('close'),
				flags: 'safe'
			}, {
				action: 'analysis',
				modes: 'edit',
				label: mw.msg('detailed-analysis'),
				framed: false,
			}];
		}
		copyVioDialog.prototype.initialize = function() {
			copyVioDialog.super.prototype.initialize.apply(this, arguments);
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
					messageWidgetConfig.label = new OO.ui.HtmlSnippet('<strong>' + mw.msg('high-violation-link') + ' (' + (source.confidence * 100).toFixed(2) + ')</strong><br><a target="_blank" href="' + source.url + '">' + source.url + '</a>');
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
		copyVioDialog.prototype.getSetupProcess = function(data) {
			return copyVioDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
				this.actions.setMode('edit');
			}, this);
		};
		copyVioDialog.prototype.getActionProcess = function(action) {
			var dialog = this;
			if(action === 'continue') {
				return new OO.ui.Process(function() {
					dialog.close();
					mw.loader.load(mw.util.getUrl('MediaWiki:Gadget-Adiutor-CSD.js', {
						action: 'raw'
					}) + '&ctype=text/javascript', 'text/javascript');
				});
			} else if(action === 'analysis') {
				var targetURL = "https://copyvios.toolforge.org/?lang=" + wgContentLanguage + "&project=wikipedia&title=" + mwConfig.wgPageName;
				window.open(targetURL, '_blank');
			} else if(action === 'close') {
				dialog.close();
			}
			return copyVioDialog.super.prototype.getActionProcess.call(this, action);
		};
		var windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		var dialog = new copyVioDialog({
			size: 'larger'
		});
		windowManager.addWindows([dialog]);
		windowManager.openWindow(dialog);
	});
}
module.exports = {
	callBack: callBack
};
/* </nowiki> */