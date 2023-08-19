/*
 * Adiutor: Adiutor enables versatile editing options and modules to assist a variety of user actions to enhance the Wikipedia editing experience.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * Licensing and Attribution: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: User block module
 */
/* <nowiki> */
// Get essential configuration from MediaWiki
var mwConfig = mw.config.get(["skin", "wgAction", "wgArticleId", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName", "wgUserEditCount", "wgUserRegistration", "wgCanonicalNamespace"]);
var api = new mw.Api();
var adiutorUserOptions = JSON.parse(mw.user.options.get('userjs-adiutor'));
var duration;
var reason;
var blockReason;
var additionalReason = '';
var preventAccountCreationValue,
	preventEmailSendingValue,
	preventEditOwnTalkPageValue;

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
	action: 'help',
	modes: 'edit',
	label: new OO.ui.deferMsg('help'),
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
	// Create a dropdown for block duration
	var durationDropdown = new OO.ui.DropdownInputWidget({
		options: [{
			data: '',
			label: mw.message('choose-duration').text(),
		}, {
			data: 'infinity',
			label: mw.message('infinity').text()
		}, {
			data: '3 hours',
			label: mw.message('3-hours').text()
		}, {
			data: '12 hours',
			label: mw.message('12-hours').text()
		}, {
			data: '24 hours',
			label: mw.message('24-hours').text()
		}, {
			data: '32 hours',
			label: mw.message('32-hours').text()
		}, {
			data: '36 hours',
			label: mw.message('36-hours').text()
		}, {
			data: '48 hours',
			label: mw.message('48-hours').text()
		}, {
			data: '60 hours',
			label: mw.message('60-hours').text()
		}, {
			data: '72 hours',
			label: mw.message('72-hours').text()
		}, {
			data: '1 week',
			label: mw.message('1-week').text()
		}, {
			data: '2 weeks',
			label: mw.message('2-weeks').text()
		}, {
			data: '1 month',
			label: mw.message('1-month').text()
		}, {
			data: '3 months',
			label: mw.message('3-months').text()
		}, {
			data: '6 months',
			label: mw.message('6-months').text()
		}, {
			data: '1 year',
			label: mw.message('1-year').text()
		}, {
			data: '2 years',
			label: mw.message('2-years').text()
		}, {
			data: '3 years',
			label: mw.message('3-years').text()
		}]
	});
	// Create an input field for the block reason
	var reasonInput = new OO.ui.MultilineTextInputWidget({
		placeholder: mw.message('please-choose-block-rationale').text()
	});
	var reasonDropdown = new OO.ui.DropdownInputWidget({
		options: [{
			data: '',
			label: mw.message('choose-reason').text()
		}, {
			data: 'Küfürlü değişiklik',
			label: mw.message('swearing-edit').text()
		}, {
			data: 'Karşıtlık ve rahatsızlık verme',
			label: mw.message('disruption-harassment').text()
		}, {
			data: 'Onaysız botlar',
			label: mw.message('unauthorized-bots').text()
		}, {
			data: 'Yoğun geri dönüş',
			label: mw.message('three-revert-rule-abuse').text()
		}, {
			data: 'Vandalizm',
			label: mw.message('vandalism').text()
		}, {
			data: 'Yasal işlem tehdidi',
			label: mw.message('threatening-legal-action').text()
		}, {
			data: 'Kişisel bilgileri izinsiz açıklama',
			label: mw.message('disclosure-of-personal-information').text()
		}, {
			data: 'Telif hakkı ihlali',
			label: mw.message('copyright-violation').text()
		}, {
			data: 'Uygun olmayan kullanıcı adı',
			label: mw.message('inappropriate-username').text()
		}, {
			data: 'Topluluğun sabrını zorlama',
			label: mw.message('testing-community-patience').text()
		}, {
			data: 'Anonim veya açık vekil sunucu',
			label: mw.message('anonymous-proxy').text()
		}, {
			data: 'Temel içerik politikalarının ihlali',
			label: mw.message('violating-pillar-content-policies').text()
		}, {
			data: 'Uygunsuz kukla kullanımı',
			label: mw.message('inappropriate-sockpuppetry').text()
		}, {
			data: 'Kişi üzerine yorum',
			label: mw.message('personal-attacks').text()
		}, {
			data: 'Nezaket ihlali',
			label: mw.message('incivility').text()
		}, {
			data: 'Israrlı adil kullanım ihlali',
			label: mw.message('persistent-non-free-content-abuse').text()
		}, {
			data: 'Israrlı VP:YİB ihlali',
			label: mw.message('persistent-BLP-abuse').text()
		}]
	});
	// Add a listener for the change event of durationDropdown
	durationDropdown.on('change', function(value) {
		duration = value;
	});
	reasonDropdown.on('change', function(value) {
		blockReason = value;
	});
	reasonInput.on('change', function() {
		additionalReason = ' | Ek gerekçe: ' + reasonInput.value;
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
	if(action === 'help') {
		this.actions.setMode('help');
		this.stackLayout.setItem(this.panel2);
	} else if(action === 'back') {
		this.actions.setMode('edit');
		this.userBlockStackLayout.setItem(this.userBlockPanel);
	} else if(action === 'continue') {
		var BlockingDialog = this;
		return new OO.ui.Process(function() {
			function CheckDurationAndRationaleMessageDialog(config) {
				CheckDurationAndRationaleMessageDialog.super.call(this, config);
			}
			if(mwConfig.wgPageName.includes(mwConfig.wgUserName)) {
				mw.notify(mw.message('you-can-not-block-yourself').text(), { title: 'İşlem tamamlandı!', type: 'error' } );
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
					// Gather input values
					var username = mwConfig.wgPageName.replace(/_/g, " ").replace('Kullanıcı:', '').replace('Özel:Katkılar/', '').replace('Kullanıcı mesaj:', '');
					// API request parameters
					var params = {
						action: 'block',
						user: username,
						expiry: duration,
						reason: blockReason + additionalReason,
						nocreate: preventAccountCreationValue,
						allowusertalk: preventEditOwnTalkPageValue,
						noemail: preventEmailSendingValue,
						tags: 'Adiutor'
					};
					// Send API request
					api.postWithToken('csrf', params).done(function(result) {
						mw.notify( 'Kullanıcı engellendi.', { title: 'İşlem tamamlandı!', type: 'success' } );
					}).fail(function(error) {
						mw.notify(error, { title: 'İşlem başarısız!', type: 'error' } );
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
/* </nowiki> */