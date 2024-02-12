/*
 * Description: Adiutor enables users to perform various tasks on Wikimedia wikis more efficiently.
 * Author: Doğu Abaris
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 */

/* <nowiki> */
function callBack() {
    const api = new mw.Api();
    const pmrConfiguration = require( './Adiutor-PMR.json' );
    if ( !pmrConfiguration ) {
        mw.notify( 'MediaWiki:Gadget-Adiutor-PMR.json data is empty or undefined.', {
            title: mw.msg( 'operation-failed' ),
            type: 'error'
        } );
        return;
    }
    const noticeBoardTitle = pmrConfiguration.noticeBoardTitle;
    const noticeBoardLink = noticeBoardTitle.replace( / /g, '_' );
    const addNewSection = pmrConfiguration.addNewSection;
    const appendText = pmrConfiguration.appendText;
    const prependText = pmrConfiguration.prependText;
    const sectionId = pmrConfiguration.sectionId;
    const contentPattern = pmrConfiguration.contentPattern;
    const apiPostSummary = pmrConfiguration.apiPostSummary;
    const sectionTitle = pmrConfiguration.sectionTitle;
    const pageTitle = mw.config.get( 'wgPageName' ).replace( /_/g, ' ' );

    function PageMoveRequestDialog( config ) {
        PageMoveRequestDialog.super.call( this, config );
    }

    OO.inheritClass( PageMoveRequestDialog, OO.ui.ProcessDialog );
    PageMoveRequestDialog.static.name = 'PageMoveRequestDialog';
    PageMoveRequestDialog.static.title = new OO.ui.deferMsg( 'pmr-module-title' );
    PageMoveRequestDialog.static.actions = [ {
        action: 'save',
        label: new OO.ui.deferMsg( 'create' ),
        flags: [ 'primary', 'progressive' ]
    }, {
        label: new OO.ui.deferMsg( 'cancel' ),
        flags: 'safe'
    } ];
    PageMoveRequestDialog.prototype.initialize = function () {
        PageMoveRequestDialog.super.prototype.initialize.apply( this, arguments );
        const headerTitle = new OO.ui.MessageWidget( {
            type: 'notice',
            inline: true,
            label: new OO.ui.deferMsg( 'pmr-header-title' )
        } );
        const headerTitleDescription = new OO.ui.LabelWidget( {
            label: new OO.ui.deferMsg( 'pmr-header-description' )
        } );
        headerTitleDescription.$element.css( {
            'margin-top': '20px',
            'margin-bottom': '20px'
        } );
        const requestRationale = new OO.ui.FieldsetLayout( {} );
        requestRationale.addItems( [
            new OO.ui.FieldLayout( newPageName = new OO.ui.TextInputWidget( {
                value: '',
                indicator: 'required'
            } ), {
                label: new OO.ui.deferMsg( 'new-name' ),
                help: new OO.ui.deferMsg( 'pmr-new-page-name-description' )
            } ),
            new OO.ui.FieldLayout( rationaleInput = new OO.ui.MultilineTextInputWidget( {
                placeholder: new OO.ui.deferMsg( 'pmr-rationale-placeholder' ),
                value: '',
                indicator: 'required'
            } ), {
                label: new OO.ui.deferMsg( 'rationale' ),
                align: 'inline'
            } )
        ] );
        requestRationale.$element.css( 'font-weight', '900' );
        this.content = new OO.ui.PanelLayout( {
            padded: true,
            expanded: false
        } );
        this.content.$element.append( headerTitle.$element, headerTitleDescription.$element, requestRationale.$element, rationaleInput.$element );
        this.$body.append( this.content.$element );
    };
    PageMoveRequestDialog.prototype.getActionProcess = function ( action ) {
        const dialog = this;
        if ( action ) {
            return new OO.ui.Process( function () {
                const placeholders = {
                    $1: pageTitle,
                    $2: newPageName.value,
                    $3: rationaleInput.value
                };
                const preparedContent = replacePlaceholders( contentPattern, placeholders );
                const apiParams = {
                    action: 'edit',
                    title: noticeBoardTitle,
                    summary: replaceParameter( apiPostSummary, '1', pageTitle ),
                    tags: 'Adiutor',
                    format: 'json'
                };
                if ( addNewSection ) {
                    apiParams.section = 'new';
                    apiParams.sectiontitle = replaceParameter( sectionTitle, '1', pageTitle );
                    apiParams.text = preparedContent;
                } else {
                    if ( sectionId ) {
                        apiParams.section = sectionId;
                    }
                    apiParams[ appendText ? 'appendtext' : prependText ? 'prependtext' : 'text' ] = preparedContent + '\n';
                }
                api.postWithToken( 'csrf', apiParams ).done( function () {
                    window.location = '/wiki/' + noticeBoardLink;
                } );
                dialog.close( {
                    action: action
                } );
            } );
        }
        return PageMoveRequestDialog.super.prototype.getActionProcess.call( this, action );
    };
    const windowManager = new OO.ui.WindowManager();
    $( document.body ).append( windowManager.$element );
    const dialog = new PageMoveRequestDialog();
    windowManager.addWindows( [ dialog ] );
    windowManager.openWindow( dialog );

    function replacePlaceholders( input, replacements ) {
        return input.replace( /\$(\d+)/g, function ( match, group ) {
            const replacement = replacements[ '$' + group ];
            return replacement !== undefined ? replacement : match;
        } );
    }

    function replaceParameter( input, parameterName, newValue ) {
        const regex = new RegExp( '\\$' + parameterName, 'g' );
        if ( input.includes( '$' + parameterName ) ) {
            return input.replace( regex, newValue );
        } else {
            return input;
        }
    }
}

module.exports = {
    callBack: callBack
};
/* </nowiki> */
