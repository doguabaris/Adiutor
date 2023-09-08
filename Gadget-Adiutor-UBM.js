/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: User block module
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["wgAction", "wgPageName", "wgTitle", "wgUserName"]);
var api = new mw.Api();
var wikiId = mw.config.get('wgWikiID');
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor-' + wikiId));
var duration;
var reason;
var blockReason;
var additionalReason = '';
var preventAccountCreationValue;
var preventEmailSendingValue;
var preventEditOwnTalkPageValue;
api.get({
	action: "query",
	prop: "revisions",
	titles: "MediaWiki:Gadget-Adiutor-UBM.json",
	rvprop: "content",
	formatversion: 2
}).done(function(data) {
	var content = data.query.pages[0].revisions[0].content;
	var jsonData = JSON.parse(content);
	var blockDurations = jsonData.blockDurations;
	var blockReasons = jsonData.blockReasons;
	var userPagePrefix = jsonData.userPagePrefix;
	var userTalkPagePrefix = jsonData.userTalkPagePrefix;
	var specialContibutions = jsonData.specialContibutions;
	var userToBlock = userTalkPagePrefix + mwConfig.wgPageName.replace(/_/g, " ").replace(userPagePrefix, '').replace(specialContibutions, '').replace(userTalkPagePrefix, '');

	function UserBlockDialog(config) {
		UserBlockDialog.super.call(this, config);
	}
	OO.inheritClass(UserBlockDialog, OO.ui.ProcessDialog);
	UserBlockDialog.static.title = new OO.ui.deferMsg('user-blocking'),
		UserBlockDialog.static.name = 'UserBlockDialog';
	UserBlockDialog.static.actions = [{
		action: 'continue',
		modes: 'edit',
		label: new OO.ui.deferMsg('block'),
		flags: ['primary', 'destructive']
	}, {
		action: 'about',
		modes: 'edit',
		label: 'Adiutor',
	}, {
		modes: 'edit',
		label: new OO.ui.deferMsg('cancel'),
		flags: 'safe'
	}, {
		action: 'back',
		modes: 'help',
		label: new OO.ui.deferMsg('back'),
		flags: 'safe'
	}];
	UserBlockDialog.prototype.initialize = function() {
		UserBlockDialog.super.prototype.initialize.apply(this, arguments);
		this.userBlockPanel = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		var durationDropdown = new OO.ui.DropdownWidget({
			menu: {
				items: blockDurations.map(function(duration) {
					return new OO.ui.MenuOptionWidget({
						data: duration.data,
						label: duration.label
					});
				})
			},
			label: mw.message('choose-duration').text(),
		});
		// Create an input field for the block reason
		var reasonInput = new OO.ui.MultilineTextInputWidget({
			placeholder: mw.message('please-choose-block-rationale').text()
		});
		var reasonDropdown = new OO.ui.DropdownWidget({
			menu: {
				items: blockReasons.map(function(reason) {
					return new OO.ui.MenuOptionWidget({
						data: reason.data,
						label: reason.label
					});
				})
			},
			label: mw.message('choose-reason').text()
		});
		// Add a listener for the change event of durationDropdown
		durationDropdown.on('change', function(value) {
			duration = value;
		});
		reasonDropdown.on('change', function(value) {
			blockReason = value;
		});
		reasonInput.on('change', function() {
			additionalReason = ' | ' + mw.msg('additional-rationale') + ': ' + reasonInput.value;
		});
		// Create a fieldset to group the widgets
		var fieldset = new OO.ui.FieldsetLayout({});
		// Create checkboxes for additional block options
		var preventAccountCreationCheckbox = new OO.ui.CheckboxInputWidget({
				selected: true
			}),
			preventEmailSendingCheckbox = new OO.ui.CheckboxInputWidget({
				selected: false
			}),
			preventEditOwnTalkPageCheckbox = new OO.ui.CheckboxInputWidget({
				selected: false
			}),
			// Create a fieldset layout with fields for each checkbox.
			additionalOptionsFieldset = new OO.ui.FieldsetLayout({
				label: mw.message('additional-options').text(),
				padded: true // Add padding
			});
		additionalOptionsFieldset.$element.addClass('additional-options-fieldset'); // Add a CSS class
		mw.util.addCSS(`
					.additional-options-fieldset {
						margin-top: 20px; 
					}
				`);
		additionalOptionsFieldset.addItems([
			new OO.ui.FieldLayout(preventAccountCreationCheckbox, {
				label: mw.message('prevent-account-creation').text(),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(preventEmailSendingCheckbox, {
				label: mw.message('prevent-sending-email').text(),
				align: 'inline'
			}),
			new OO.ui.FieldLayout(preventEditOwnTalkPageCheckbox, {
				label: mw.message('prevent-editing-own-talk-page').text(),
				align: 'inline'
			}),
		]);
		preventAccountCreationCheckbox.on('change', function(selected) {
			preventAccountCreationValue = selected;
		});
		preventEmailSendingCheckbox.on('change', function(selected) {
			preventEmailSendingValue = selected;
		});
		preventEditOwnTalkPageCheckbox.on('change', function(selected) {
			preventEditOwnTalkPageValue = selected;
		});
		// Add additional options fieldset to the main fieldset
		fieldset.addItems([
			new OO.ui.FieldLayout(durationDropdown, {
				label: mw.message('block-duration').text(),
			}),
			new OO.ui.FieldLayout(reasonDropdown, {
				label: mw.message('block-reason').text(),
			}),
			new OO.ui.FieldLayout(reasonInput, {
				label: mw.message('other-reason').text(),
				align: 'inline'
			}),
			additionalOptionsFieldset
		]);
		// Append fieldset to the document body
		this.userBlockPanel.$element.append(fieldset.$element);
		this.userBlockStackLayout = new OO.ui.StackLayout({
			items: [this.userBlockPanel]
		});
		preventAccountCreationValue = preventAccountCreationCheckbox.isSelected();
		preventEmailSendingValue = preventEmailSendingCheckbox.isSelected();
		preventEditOwnTalkPageValue = preventEditOwnTalkPageCheckbox.isSelected();
		this.$body.append(this.userBlockStackLayout.$element);
	};
	UserBlockDialog.prototype.getSetupProcess = function(data) {
		return UserBlockDialog.super.prototype.getSetupProcess.call(this, data).next(function() {
			this.actions.setMode('edit');
		}, this);
	};
	UserBlockDialog.prototype.getActionProcess = function(action) {
		if(action === 'about') {
			window.open('https://meta.wikimedia.org/wiki/Adiutor', '_blank');
		} else if(action === 'continue') {
			var BlockingDialog = this;
			return new OO.ui.Process(function() {
				function CheckDurationAndRationaleMessageDialog(config) {
					CheckDurationAndRationaleMessageDialog.super.call(this, config);
				}
				if (userToBlock === mwConfig.wgUserName) {
					mw.notify(mw.message('you-can-not-block-yourself').text(), {
						title: mw.msg('operation-completed'),
						type: 'error'
					});
					BlockingDialog.close();
				} else {
					if(!duration || !blockReason) {
						OO.inheritClass(CheckDurationAndRationaleMessageDialog, OO.ui.MessageDialog);
						CheckDurationAndRationaleMessageDialog.static.name = 'myCheckDurationAndRationaleMessageDialog';
						CheckDurationAndRationaleMessageDialog.static.actions = [{
							action: 'okay',
							label: mw.message('okay').text(),
							flags: 'primary'
						}, ];
						CheckDurationAndRationaleMessageDialog.prototype.initialize = function() {
							CheckDurationAndRationaleMessageDialog.super.prototype.initialize.apply(this, arguments);
							this.content = new OO.ui.PanelLayout({
								padded: true
							});
							this.content.$element.append(mw.message('please-select-block-duration-reason').text());
							this.$body.append(this.content.$element);
						};
						CheckDurationAndRationaleMessageDialog.prototype.getBodyHeight = function() {
							return 100;
						};
						CheckDurationAndRationaleMessageDialog.prototype.getActionProcess = function(action) {
							var WarningDialog = this;
							if(action === 'okay') {
								WarningDialog.close();
							}
							return CheckDurationAndRationaleMessageDialog.super.prototype.getActionProcess.call(this, action);
						};
						var windowManager = new OO.ui.WindowManager();
						$(document.body).append(windowManager.$element);
						var WarningDialog = new CheckDurationAndRationaleMessageDialog();
						windowManager.addWindows([WarningDialog]);
						windowManager.openWindow(WarningDialog);
						return;
					} else {
						var allowusertalkValue = !preventEditOwnTalkPageValue;
						// API request parameters
						var params = {
							action: 'block',
							user: userToBlock,
							expiry: duration,
							reason: blockReason + additionalReason,
							nocreate: preventAccountCreationValue,
							allowusertalk: allowusertalkValue,
							noemail: preventEmailSendingValue,
							tags: 'Adiutor'
						};
						// Send API request
						api.postWithToken('csrf', params).done(function(result) {
							mw.notify(mw.msg('user-blocked'), {
								title: mw.msg('operation-completed'),
								type: 'success'
							});
						}).fail(function(error) {
							mw.notify(error, {
								title: mw.msg('operation-failed'),
								type: 'error'
							});
						});
						BlockingDialog.close();
					}
				}
			});
		}
		return UserBlockDialog.super.prototype.getActionProcess.call(this, action);
	};
	UserBlockDialog.prototype.getBodyHeight = function() {
		return this.userBlockPanel.$element.outerHeight(true);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var BlockingDialog = new UserBlockDialog({
		size: 'medium'
	});
	windowManager.addWindows([BlockingDialog]);
	windowManager.openWindow(BlockingDialog);
});
/* </nowiki> */