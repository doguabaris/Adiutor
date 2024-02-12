/*
 * Description: Adiutor enables users to perform various tasks on Wikimedia wikis more efficiently.
 * Author: Doğu Abaris
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 */

/* <nowiki> */
function callBack() {
    const api = new mw.Api();
    const mwConfig = mw.config.get( [ 'wgAction', 'wgPageName', 'wgTitle', 'wgUserName' ] );
    const ubmConfiguration = require( './Adiutor-UBM.json' );
    let duration;
    let reason;
    let blockReason;
    let additionalReason = '';
    let preventAccountCreationValue;
    let preventEmailSendingValue;
    let preventEditOwnTalkPageValue;
    if ( !ubmConfiguration ) {
        mw.notify( 'MediaWiki:Gadget-Adiutor-UBM.json data is empty or undefined.', {
            title: mw.msg( 'operation-failed' ),
            type: 'error'
        } );
        return;
    }
    const blockDurations = ubmConfiguration.blockDurations;
    const blockReasons = ubmConfiguration.blockReasons;
    const userPagePrefix = ubmConfiguration.userPagePrefix;
    const userTalkPagePrefix = ubmConfiguration.userTalkPagePrefix;
    const specialContibutions = ubmConfiguration.specialContibutions;
    const noticeBoardTitle = ubmConfiguration.noticeBoardTitle;
    const apiPostSummary = ubmConfiguration.apiPostSummary;
    let userToBlock = window.adiutorUserToBlock;
    const headlineElement = window.headlineElement;
    const sectionId = window.sectionId;
    if ( !userToBlock ) {
        userToBlock = getFormattedPageName();
    }

    function UserBlockDialog( config ) {
        UserBlockDialog.super.call( this, config );
    }

    OO.inheritClass( UserBlockDialog, OO.ui.ProcessDialog );
    UserBlockDialog.static.title = mw.msg( 'user-blocking' ) + ' ' + '(' + userToBlock + ')',
        UserBlockDialog.static.name = 'UserBlockDialog';
    UserBlockDialog.static.actions = [ {
        action: 'continue',
        modes: 'edit',
        label: new OO.ui.deferMsg( 'block' ),
        flags: [ 'primary', 'destructive' ]
    }, {
        action: 'about',
        modes: 'edit',
        label: 'Adiutor'
    }, {
        modes: 'edit',
        label: new OO.ui.deferMsg( 'cancel' ),
        flags: 'safe'
    }, {
        action: 'back',
        modes: 'help',
        label: new OO.ui.deferMsg( 'back' ),
        flags: 'safe'
    } ];
    UserBlockDialog.prototype.initialize = function () {
        UserBlockDialog.super.prototype.initialize.apply( this, arguments );
        this.userBlockPanel = new OO.ui.PanelLayout( {
            padded: true,
            expanded: false
        } );
        const durationDropdown = new OO.ui.DropdownWidget( {
            menu: {
                items: blockDurations.map( function ( duration ) {
                    return new OO.ui.MenuOptionWidget( {
                        data: duration.data,
                        label: duration.label
                    } );
                } )
            },
            label: mw.message( 'choose-duration' ).text()
        } );
        durationDropdown.on( 'change', function ( value ) {
            console.log( 'Dropdown changed:', value );
            duration = value;
        } );
        // Create an input field for the block reason
        const reasonInput = new OO.ui.MultilineTextInputWidget( {
            placeholder: mw.message( 'please-choose-block-rationale' ).text()
        } );
        const reasonDropdown = new OO.ui.DropdownWidget( {
            menu: {
                items: blockReasons.map( function ( reason ) {
                    return new OO.ui.MenuOptionWidget( {
                        data: reason.data,
                        label: reason.label
                    } );
                } )
            },
            label: mw.message( 'choose-reason' ).text()
        } );
        durationDropdown.getMenu().on( 'choose', function ( menuOption ) {
            duration = menuOption.data;
        } );
        reasonDropdown.getMenu().on( 'choose', function ( menuOption ) {
            blockReason = menuOption.data;
        } );
        reasonInput.on( 'change', function () {
            additionalReason = ' | ' + mw.msg( 'additional-rationale' ) + ': ' + reasonInput.value;
        } );
        // Create a fieldset to group the widgets
        const fieldset = new OO.ui.FieldsetLayout( {} );
        // Create checkboxes for additional block options
        const preventAccountCreationCheckbox = new OO.ui.CheckboxInputWidget( {
                selected: true
            } ),
            preventEmailSendingCheckbox = new OO.ui.CheckboxInputWidget( {
                selected: false
            } ),
            preventEditOwnTalkPageCheckbox = new OO.ui.CheckboxInputWidget( {
                selected: false
            } ),
            // Create a fieldset layout with fields for each checkbox.
            additionalOptionsFieldset = new OO.ui.FieldsetLayout( {
                label: mw.message( 'additional-options' ).text(),
                padded: true // Add padding
            } );
        additionalOptionsFieldset.$element.addClass( 'additional-options-fieldset' ); // Add a CSS class
        additionalOptionsFieldset.$element.css( {
            'margin-top': '20px'
        } );
        additionalOptionsFieldset.addItems( [
            new OO.ui.FieldLayout( preventAccountCreationCheckbox, {
                label: mw.message( 'prevent-account-creation' ).text(),
                align: 'inline'
            } ),
            new OO.ui.FieldLayout( preventEmailSendingCheckbox, {
                label: mw.message( 'prevent-sending-email' ).text(),
                align: 'inline'
            } ),
            new OO.ui.FieldLayout( preventEditOwnTalkPageCheckbox, {
                label: mw.message( 'prevent-editing-own-talk-page' ).text(),
                align: 'inline'
            } )
        ] );
        preventAccountCreationCheckbox.on( 'change', function ( selected ) {
            preventAccountCreationValue = selected;
        } );
        preventEmailSendingCheckbox.on( 'change', function ( selected ) {
            preventEmailSendingValue = selected;
        } );
        preventEditOwnTalkPageCheckbox.on( 'change', function ( selected ) {
            preventEditOwnTalkPageValue = selected;
        } );
        // Add additional options fieldset to the main fieldset
        fieldset.addItems( [
            new OO.ui.FieldLayout( durationDropdown, {
                label: mw.message( 'block-duration' ).text()
            } ),
            new OO.ui.FieldLayout( reasonDropdown, {
                label: mw.message( 'block-reason' ).text()
            } ),
            new OO.ui.FieldLayout( reasonInput, {
                label: mw.message( 'other-reason' ).text(),
                align: 'inline'
            } ),
            additionalOptionsFieldset
        ] );
        // Append fieldset to the document body
        this.userBlockPanel.$element.append( fieldset.$element );
        this.userBlockStackLayout = new OO.ui.StackLayout( {
            items: [ this.userBlockPanel ]
        } );
        preventAccountCreationValue = preventAccountCreationCheckbox.isSelected();
        preventEmailSendingValue = preventEmailSendingCheckbox.isSelected();
        preventEditOwnTalkPageValue = preventEditOwnTalkPageCheckbox.isSelected();
        this.$body.append( this.userBlockStackLayout.$element );
    };
    UserBlockDialog.prototype.getSetupProcess = function ( data ) {
        return UserBlockDialog.super.prototype.getSetupProcess.call( this, data ).next( function () {
            this.actions.setMode( 'edit' );
        }, this );
    };
    UserBlockDialog.prototype.getActionProcess = function ( action ) {
        if ( action === 'about' ) {
            window.open( 'https://meta.wikimedia.org/wiki/Adiutor', '_blank' );
        } else if ( action === 'continue' ) {
            const BlockingDialog = this;
            return new OO.ui.Process( function () {
                function CheckDurationAndRationaleMessageDialog( config ) {
                    CheckDurationAndRationaleMessageDialog.super.call( this, config );
                }

                if ( userToBlock.includes( mwConfig.wgUserName ) ) {
                    mw.notify( mw.message( 'you-can-not-block-yourself' ).text(), {
                        title: mw.msg( 'operation-completed' ),
                        type: 'error'
                    } );
                    BlockingDialog.close();
                } else {
                    if ( !duration || !blockReason ) {
                        OO.inheritClass( CheckDurationAndRationaleMessageDialog, OO.ui.MessageDialog );
                        CheckDurationAndRationaleMessageDialog.static.name = 'myCheckDurationAndRationaleMessageDialog';
                        CheckDurationAndRationaleMessageDialog.static.actions = [ {
                            action: 'okay',
                            label: mw.message( 'okay' ).text(),
                            flags: 'primary'
                        } ];
                        CheckDurationAndRationaleMessageDialog.prototype.initialize = function () {
                            CheckDurationAndRationaleMessageDialog.super.prototype.initialize.apply( this, arguments );
                            this.content = new OO.ui.PanelLayout( {
                                padded: true
                            } );
                            this.content.$element.append( mw.message( 'please-select-block-duration-reason' ).text() );
                            this.$body.append( this.content.$element );
                        };
                        CheckDurationAndRationaleMessageDialog.prototype.getBodyHeight = function () {
                            return 100;
                        };
                        CheckDurationAndRationaleMessageDialog.prototype.getActionProcess = function ( action ) {
                            const WarningDialog = this;
                            if ( action === 'okay' ) {
                                WarningDialog.close();
                            }
                            return CheckDurationAndRationaleMessageDialog.super.prototype.getActionProcess.call( this, action );
                        };
                        const windowManager = new OO.ui.WindowManager();
                        $( document.body ).append( windowManager.$element );
                        const WarningDialog = new CheckDurationAndRationaleMessageDialog();
                        windowManager.addWindows( [ WarningDialog ] );
                        windowManager.openWindow( WarningDialog );

                    } else {
                        const allowusertalkValue = !preventEditOwnTalkPageValue;
                        // API request parameters
                        const params = {
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
                        api.postWithToken( 'csrf', params ).done( function ( result ) {
                            mw.notify( mw.msg( 'user-blocked' ), {
                                title: mw.msg( 'operation-completed' ),
                                type: 'success'
                            } );
                            if ( sectionId ) {
                                api.postWithToken( 'csrf', {
                                    action: 'edit',
                                    title: noticeBoardTitle,
                                    section: sectionId,
                                    text: '',
                                    summary: apiPostSummary,
                                    tags: 'Adiutor',
                                    format: 'json'
                                } ).done( function () {
                                    if ( headlineElement ) {
                                        headlineElement.css( 'text-decoration', 'line-through' );
                                    }
                                } );
                            }
                        } ).fail( function ( error ) {
                            mw.notify( error, {
                                title: mw.msg( 'operation-failed' ),
                                type: 'error'
                            } );
                        } );
                        console.log( userToBlock );
                        BlockingDialog.close();
                    }
                }
            } );
        }
        return UserBlockDialog.super.prototype.getActionProcess.call( this, action );
    };
    UserBlockDialog.prototype.getBodyHeight = function () {
        return this.userBlockPanel.$element.outerHeight( true );
    };
    const windowManager = new OO.ui.WindowManager();
    $( document.body ).append( windowManager.$element );
    const BlockingDialog = new UserBlockDialog( {
        size: 'medium'
    } );
    windowManager.addWindows( [ BlockingDialog ] );
    windowManager.openWindow( BlockingDialog );

    function getFormattedPageName() {
        const cleanedPageName = mwConfig.wgPageName.replace( /_/g, ' ' ).replace( userPagePrefix, '' ).replace( specialContibutions, '' ).replace( userTalkPagePrefix, '' );
        return cleanedPageName;
    }
}

module.exports = {
    callBack: callBack
};
/* </nowiki> */
