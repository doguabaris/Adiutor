/*
 * Description: Adiutor enables users to perform various tasks on Wikimedia wikis more efficiently.
 * Author: Doğu Abaris
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 */

/* <nowiki> */
function callBack() {
    const api = new mw.Api();
    const wikiId = mw.config.get( 'wgWikiID' );
    const adiutorUserOptions = JSON.parse( mw.user.options.get( 'userjs-adiutor-' + wikiId ) );
    const tagConfiguration = require( './Adiutor-TAG.json' );
    const tagOptions = [];
    let selectedTags = [];
    const templateInfo = {};
    const preparedTemplates = [];
    let preparedTagsString;
    if ( !tagConfiguration ) {
        mw.notify( 'MediaWiki:Gadget-Adiutor-TAG.json data is empty or undefined.', {
            title: mw.msg( 'operation-failed' ),
            type: 'error'
        } );
        return;
    }
    const tagList = tagConfiguration.tagList;
    const useMultipleIssuesTemplate = tagConfiguration.useMultipleIssuesTemplate;
    const multipleIssuesTemplate = tagConfiguration.multipleIssuesTemplate;
    const uncategorizedTemplate = tagConfiguration.uncategorizedTemplate;
    const apiPostSummary = tagConfiguration.apiPostSummary;

    function PageTaggingDialog( config ) {
        PageTaggingDialog.super.call( this, config );
    }

    OO.inheritClass( PageTaggingDialog, OO.ui.ProcessDialog );
    PageTaggingDialog.static.name = 'PageTaggingDialog';
    PageTaggingDialog.static.title = new OO.ui.deferMsg( 'tag-module-title' );
    PageTaggingDialog.static.actions = [ {
        action: 'save',
        label: new OO.ui.deferMsg( 'add-tag' ),
        flags: [ 'primary', 'progressive' ]
    }, {
        label: new OO.ui.deferMsg( 'cancel' ),
        flags: 'safe'
    } ];
    PageTaggingDialog.prototype.initialize = function () {
        PageTaggingDialog.super.prototype.initialize.apply( this, arguments );
        const headerTitle = new OO.ui.MessageWidget( {
            type: 'notice',
            inline: true,
            label: new OO.ui.deferMsg( 'tag-header-description' )
        } );
        // Create a search input field
        const searchInput = new OO.ui.TextInputWidget( {
            placeholder: mw.msg( 'search-tag' )
        } );
        searchInput.$element.css( {
            'margin-top': '10px',
            'margin-bottom': '15px'
        } );
        this.content = new OO.ui.PanelLayout( {
            padded: true,
            expanded: false
        } );
        // Now you can safely add the searchInput to the content container
        this.content.$element.append( headerTitle.$element, searchInput.$element );
        // Iterate through the tagList
        tagList.forEach( function ( tagGroup ) {
            // Create a div element for the label
            const labelElement = new OO.ui.LabelWidget( {
                label: tagGroup.label
            } );
            labelElement.$element.css( {
                'margin-top': '10px',
                'margin-bottom': '15px',
                'font-weight': '900'
            } );
            // Append the labelElement to the content container
            this.content.$element.append( labelElement.$element );
            // Create an array to hold tag options
            const tagOptions = [];
            // Iterate through the tags in the current tagGroup
            tagGroup.tags.forEach( function ( tag ) {
                // Create a CheckboxMultioptionWidget for the tag
                const tagOption = new OO.ui.CheckboxMultioptionWidget( {
                    data: tag.tag,
                    name: tag.name,
                    label: tag.description,
                    align: 'inline'
                } );
                tagOption.on( 'change', function ( selected ) {
                    updateSelectedTags( selected, tag );
                } );
                // Check if the tag has additional items
                if ( tag.items ) {
                    // Create a fieldset to contain the sub-items
                    const subItemsLayout = new OO.ui.HorizontalLayout();
                    subItemsLayout.$element.css( 'display', 'none' );
                    // Iterate through the sub-items
                    tag.items.forEach( function ( subItem ) {
                        // Create sub-item widgets based on the sub-item properties
                        if ( subItem.type === 'input' ) {
                            const subItemInput = new OO.ui.TextInputWidget( {
                                label: subItem.label,
                                name: subItem.name,
                                required: subItem.required || false
                            } );
                            subItemsLayout.addItems( [ subItemInput ] );
                        }
                        if ( subItem.type === 'checkbox' ) {
                            const subItemCheckbox = new OO.ui.CheckboxMultioptionWidget( {
                                data: subItem.value,
                                name: subItem.name,
                                label: subItem.label
                            } );
                            subItemCheckbox.on( 'change', function ( selected ) {
                                updateSelectedTags( selected, tag );
                            } );
                            subItemsLayout.addItems( [ subItemCheckbox ] );
                        }
                        // Check if there are items under the subItem
                        if ( subItem.items ) {
                            // Iterate through the subItem items
                            subItem.items.forEach( function ( subItemItem ) {
                                // Create widgets for subItem items
                                if ( subItemItem.type === 'input' ) {
                                    const subItemItemInput = new OO.ui.TextInputWidget( {
                                        label: subItemItem.label,
                                        name: subItemItem.name,
                                        required: subItemItem.required || false,
                                        align: 'inline'
                                    } );
                                    subItemsLayout.addItems( [ subItemItemInput ] );
                                }
                                if ( subItemItem.type === 'checkbox' ) {
                                    const subItemItemCheckbox = new OO.ui.CheckboxMultioptionWidget( {
                                        data: subItemItem.value,
                                        name: subItemItem.name,
                                        label: subItemItem.label,
                                        align: 'inline'
                                    } );
                                    subItemItemCheckbox.on( 'change', function ( selected ) {
                                        updateSelectedTags( selected, tag );
                                    } );
                                    subItemItemCheckbox.$element.css( 'margin-left', '30px' );
                                    subItemsLayout.addItems( [ subItemItemCheckbox ] );
                                }
                                // Add other sub-item item types as needed
                            } );
                        }
                    } );
                    // Add an event handler to show/hide sub-items when the parent checkbox is selected/unselected
                    tagOption.on( 'change', function ( selected ) {
                        if ( selected ) {
                            subItemsLayout.$element.show();
                        } else {
                            subItemsLayout.$element.hide();
                        }
                    } );
                    // Append the sub-items fieldset to the tagOption
                    tagOption.$element.append( subItemsLayout.$element );
                    subItemsLayout.$element.css( 'margin-top', '10px' );
                }
                // Add the tagOption to the tagOptions array
                tagOptions.push( tagOption );
                // Append the tagOption to the content container
                this.content.$element.append( tagOption.$element );
                tagOption.$element.css( 'display', 'block' );
            }, this );
        }, this );
        // After populating the tagOptions array, add the following code within the tagList.forEach loop:
        searchInput.on( 'input', function () {
            const searchText = searchInput.getValue().toLowerCase();
            // Iterate through all tagOptions and check if the search text is present in label or data
            tagOptions.forEach( function ( tagOption ) {
                const label = tagOption.label.toLowerCase();
                const data = tagOption.data ? tagOption.data.toLowerCase() : ''; // Ensure data exists and convert to lowercase
                if ( label.includes( searchText ) || data.includes( searchText ) ) {
                    tagOption.$element.show();
                } else {
                    tagOption.$element.hide();
                }
            } );
        } );
        this.$body.append( this.content.$element );
    };
    PageTaggingDialog.prototype.getActionProcess = function ( action ) {
        const dialog = this;
        if ( action ) {
            return new OO.ui.Process( function () {
                selectedTags.forEach( function ( tag ) {
                    if ( tag.items && tag.items.length > 0 ) {
                        tag.items.forEach( function ( subItem ) {
                            let template = '{{' + tag.tag;
                            if ( subItem.parameter ) {
                                // If information for this template has not been provided before, get it from the user
                                if ( !templateInfo[ tag.tag ] ) {
                                    templateInfo[ tag.tag ] = {};
                                }
                                if ( !templateInfo[ tag.tag ][ subItem.parameter ] ) {
                                    const inputValue = getInputValue( subItem.name ); // Get information from the user
                                    templateInfo[ tag.tag ][ subItem.parameter ] = inputValue;
                                }
                                // Create the template using the previously entered information
                                template += '|' + subItem.parameter + '=' + templateInfo[ tag.tag ][ subItem.parameter ];
                            }
                            template += '}}';
                            preparedTemplates.push( template );
                        } );
                    } else {
                        // If there are no tag.items, just add {{Template}}
                        preparedTemplates.push( '{{' + tag.tag + '}}' );
                    }
                } );
                console.log( preparedTemplates );
                if ( useMultipleIssuesTemplate && preparedTemplates.length > 1 ) {
                    // Join the formatted tags with newline characters and wrap in {{Multiple issues|...}}
                    preparedTagsString = '{{' + multipleIssuesTemplate + '|\n' + preparedTemplates.join( '\n' ) + '\n}}';
                } else {
                    // If there's only one tag or useMultipleIssuesTemplate is false, just use it as-is
                    preparedTagsString = preparedTemplates.join( '\n' );
                }
                if ( selectedTags.length > 0 ) {
                    tagPage();
                    dialog.close( {
                        action: action
                    } );
                } else {
                    mw.notify( mw.msg( 'select-a-tag' ), {
                        title: mw.msg( 'operation-failed' ),
                        type: 'error'
                    } );
                }
            } );
        }
        return PageTaggingDialog.super.prototype.getActionProcess.call( this, action );
    };
    const windowManager = new OO.ui.WindowManager();
    $( document.body ).append( windowManager.$element );
    const dialog = new PageTaggingDialog( {
        size: 'large'
    } );
    windowManager.addWindows( [ dialog ] );
    windowManager.openWindow( dialog );

    function getInputValue( inputName ) {
        // Find the input element that matches inputName
        const inputElement = document.querySelector( 'input[name="' + inputName + '"]' );
        if ( inputElement ) {
            // If the input element is found, get its value
            return inputElement.value;
        } else {
            // If the input element is not found, return a default value or handle the error
            return ''; // You can return a default value or perform other actions
        }
    }

    function updateSelectedTags( selected, tag ) {
        if ( selected ) {
            selectedTags.push( tag );
        } else {
            selectedTags = selectedTags.filter( function ( item ) {
                return item !== tag;
            } );
        }
        console.log( selectedTags );
    }

    function tagPage() {
        const editParams = {
            action: 'edit',
            title: mw.config.get( 'wgPageName' ),
            summary: apiPostSummary,
            tags: 'Adiutor',
            format: 'json'
        };
        let removedContent = '';
        const modifiedTags = preparedTagsString.replace( '{{' + uncategorizedTemplate + '}}', function ( match ) {
            removedContent = match;
            return '';
        } );
        if ( removedContent ) {
            editParams.prependtext = modifiedTags.split( ',' ).join( '\n' ) + '\n';
            editParams.appendtext = '\n' + removedContent;
        } else {
            editParams.prependtext = modifiedTags.split( ',' ).join( '\n' ) + '\n';
        }
        api.postWithToken( 'csrf', editParams ).done( function () {
            adiutorUserOptions.stats.pageTags++;
            api.postWithEditToken( {
                action: 'globalpreferences',
                format: 'json',
                optionname: 'userjs-adiutor-' + mw.config.get( 'wgWikiID' ),
                optionvalue: JSON.stringify( adiutorUserOptions ),
                formatversion: 2
            }, function () {
            } );
            location.reload();
        } );
    }
}

module.exports = {
    callBack: callBack
};
/* </nowiki> */
