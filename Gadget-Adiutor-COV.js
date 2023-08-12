/*
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
 * Licensing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Copyright checker
 * Earwig's Copyvio Detector (https://copyvios.toolforge.org/) api used in MediaWiki:Gadget-Adiutor-COV.js
 */
// Wait for required libraries and DOM to be ready
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]), $.ready).then(function() {
	// Get essential configuration from MediaWiki
	var mwConfig = mw.config.get(["skin", "wgAction", "wgRevisionId", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgRelevantUserName", "wgCanonicalNamespace"]);
	var api = new mw.Api();
	var adiutorUserOptions;
	// Fetch user-specific Adiutor options
	api.get({
		action: "query",
		format: "json",
		prop: "revisions",
		titles: "User:" + mwConfig.wgUserName + "/Adiutor-options.json",
		rvprop: "content"
	}).done(function(data) {
		var pageId = Object.keys(data.query.pages)[0];
		if(pageId !== "-1") {
			var jsonContent = data.query.pages[pageId].revisions[0]["*"];
			try {
				adiutorUserOptions = JSON.parse(jsonContent);
				// Fetch gadget messages for UI language
				api.get({
					action: 'query',
					prop: 'revisions',
					titles: 'MediaWiki:Gadget-Adiutor-i18.json',
					rvprop: 'content',
					formatversion: 2
				}).done(function(data) {
					var messages = JSON.parse(data.query.pages[0].revisions[0].content);
					var lang = mw.config.get('wgUserLanguage') || 'en';
					mw.messages.set(messages[lang] || messages.en);
					// Continue actions here
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
							}, {
								action: 'back',
								modes: 'help',
								label: 'Yardım',
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
							}, {
								action: 'back',
								modes: 'help',
								label: 'Yardım',
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
							}, {
								action: 'back',
								modes: 'help',
								label: 'Yardım',
								flags: 'safe'
							}];
						}
						CopyVioDialog.prototype.initialize = function() {
							CopyVioDialog.super.prototype.initialize.apply(this, arguments);
							var cvRelSource = data.sources.filter(function(source) {
								return source.excluded == false;
							});
							var cvSources = document.createElement('ul');
							cvSources.classList.add("cov-url-list");
							for(var i = 0; i < cvRelSource.length; i++) {
								var li = document.createElement('li');
								li.classList.add("cov-url-list-item");
								if((cvRelSource[i].confidence * 100).toFixed(2) > 40) {
									li.classList.add("cov-url-list-item-vio-high");
								}
								var a = document.createElement("a");
								a.classList.add("cov-url-list-item-link");
								var img = document.createElement("span");
								img.innerText = cvRelSource[i].url;
								img.title = cvRelSource[i].url;
								a.href = cvRelSource[i].url;
								a.appendChild(img);
								li.id = cvRelSource[i].id;
								li.appendChild(a);
								cvSources.appendChild(li);
							}
							this.panel1 = new OO.ui.PanelLayout({
								padded: true,
								expanded: false
							});
							this.panel1.$element.append(headerTitle.$element, '<br><hr><br>', cvSources);
							this.panel2 = new OO.ui.PanelLayout({
								padded: true,
								expanded: false
							});
							this.panel2.$element.append('Boş');
							this.stackLayout = new OO.ui.StackLayout({
								items: [this.panel1, this.panel2]
							});
							this.$body.append(this.stackLayout.$element);
						};
						CopyVioDialog.prototype.getSetupProcess = function(data) {
							return CopyVioDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
								this.actions.setMode('edit');
							}, this);
						};
						CopyVioDialog.prototype.getActionProcess = function(action) {
							if(action === 'help') {
								this.actions.setMode('help');
								this.stackLayout.setItem(this.panel2);
							} else if(action === 'back') {
								this.actions.setMode('edit');
								this.stackLayout.setItem(this.panel1);
							} else if(action === 'continue') {
								var dialog = this;
								return new OO.ui.Process(function() {
									dialog.close();
									mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-CSD.js');
								});
							}
							return CopyVioDialog.super.prototype.getActionProcess.call(this, action);
						};
						CopyVioDialog.prototype.getBodyHeight = function() {};
						var windowManager = new OO.ui.WindowManager();
						$(document.body).append(windowManager.$element);
						var dialog = new CopyVioDialog({
							size: 'larger'
						});
						windowManager.addWindows([dialog]);
						windowManager.openWindow(dialog);
					});
				});
			} catch(error) {
				// Handle JSON parsing error if needed
			}
		}
	}).fail(function(error) {
		// Handle API request failure if needed
	});
	// Define functions below as needed
});
/* </nowiki> */