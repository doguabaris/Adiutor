/* Adiutor: Enhancing Wikipedia Editing Through a Comprehensive Set of Versatile Tools and Modules.
 * Author: Vikipolimer
 * Learn more at: https://meta.wikimedia.org/wiki/Adiutor
 * License: Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * Module: Administrator Intervention Against Vandalism
<nowiki> */
function callBack() {
	const windowManager = new OO.ui.WindowManager();
	const api = new mw.Api();
	const wikiId = mw.config.get( 'wgWikiID' );
	const adiutorUserOptions = JSON.parse( mw.user.options.get( 'userjs-adiutor-' + wikiId ) );
	const mwConfig = mw.config.get( [ 'wgPageName' ] );
	const aivConfiguration = require( './Adiutor-AIV.json' );
	if (!aivConfiguration) {
		mw.notify( 'MediaWiki:Gadget-Adiutor-AIV.json data is empty or undefined.', {
			title: mw.msg( 'operation-failed' ),
			type: 'error'
		} );
		return;
	}
	let rationaleInput, reportType, sockPuppetsList, sockpuppetryType, revId;
	let vandalizedPage = {};
	vandalizedPage.value = null;
	let revisionID = {};
	revisionID.value = null;
	let sockpuppeteerInput;
	let placeholders = {};
	const reportRationales = aivConfiguration.reportRationales;
	const noticeBoardTitle = aivConfiguration.noticeBoardTitle;
	const noticeBoardLink = noticeBoardTitle.replace( / /g, '_' );
	const addNewSection = aivConfiguration.addNewSection;
	const sectionTitle = aivConfiguration.sectionTitle;
	const apiPostSummary = aivConfiguration.apiPostSummary;
	const sectionId = aivConfiguration.sectionId;
	const appendText = aivConfiguration.appendText;
	const prependText = aivConfiguration.prependText;
	const spiNoticeBoard = aivConfiguration.spiNoticeBoard;
	const spiNoticeBoardCase = aivConfiguration.spiNoticeBoardCase;
	const spiApiPostSummary = aivConfiguration.spiApiPostSummary;
	const spiApiPostCaseSummary = aivConfiguration.spiApiPostCaseSummary;
	const contentPattern = aivConfiguration.contentPattern;
	const userPagePrefix = aivConfiguration.userPagePrefix;
	const userTalkPagePrefix = aivConfiguration.userTalkPagePrefix;
	const specialContibutions = aivConfiguration.specialContibutions;
	const rationaleText = aivConfiguration.rationaleText;
	const sockpuppetTemplate = aivConfiguration.sockpuppetTemplate;
	const sockpuppeteerContentPattern = aivConfiguration.sockpuppeteerContentPattern;
	const sockpuppetContentPattern = aivConfiguration.sockpuppetContentPattern;
	const userReported = getFormattedPageName();

	function AivDialog( config ) {
		AivDialog.Super.call( this, config );
	}

	OO.inheritClass( AivDialog, OO.ui.ProcessDialog );
	AivDialog.static.name = 'AivDialog';
	AivDialog.static.title = new OO.ui.deferMsg( 'aiv-module-title' );
	AivDialog.static.actions = [ {
		action: 'save',
		label: new OO.ui.deferMsg( 'report' ),
		flags: [ 'primary', 'progressive' ]
	}, {
		label: new OO.ui.deferMsg( 'cancel' ),
		flags: 'safe'
	} ];
	AivDialog.prototype.initialize = function () {
		AivDialog.Super.prototype.initialize.apply( this, arguments );
		const headerTitle = new OO.ui.MessageWidget( {
			type: 'notice',
			inline: true,
			label: new OO.ui.deferMsg( 'aiv-header-title' )
		} );
		const headerTitleDescription = new OO.ui.LabelWidget( {
			label: new OO.ui.deferMsg( 'aiv-header-description' )
		} );
		// Add margin-top to headerTitleDescription
		headerTitleDescription.$element.css( {
			'margin-top': '20px',
			'font-weight': '300'
		} );
		const rationaleSelector = new OO.ui.DropdownWidget( {
			menu: {
				items: [
					new OO.ui.MenuOptionWidget( {
						data: 1,
						label: new OO.ui.deferMsg( 'vandalism' )
					} ),
					new OO.ui.MenuOptionWidget( {
						data: 2,
						label: new OO.ui.deferMsg( 'username-violation' )
					} ),
					new OO.ui.MenuOptionWidget( {
						data: 3,
						label: new OO.ui.deferMsg( 'sockpuppeteer' )
					} ),
					new OO.ui.MenuOptionWidget( {
						data: 4,
						label: new OO.ui.deferMsg( 'sockpuppet' )
					} )
				]
			},
			label: new OO.ui.deferMsg( 'report-type' )
		} );
		// Add margin-top to rationaleSelector
		rationaleSelector.$element.css( 'margin-top', '20px' );
		this.content = new OO.ui.PanelLayout( {
			padded: true,
			expanded: false
		} );
		const requestRationaleContainer = new OO.ui.FieldsetLayout( {
			classes: [ 'adiutor-report-window-rationale-window' ]
		} );
		requestRationaleContainer.$element.css( 'margin-top', '20px' );
		rationaleSelector.getMenu().on( 'choose', ( menuOption ) => {
			switch (menuOption.getData()) {
			case 1:
				requestRationale = new OO.ui.FieldsetLayout( {
					label: mw.msg( 'rationale' )
				} );
				const generalRationales = reportRationales.filter( ( item ) => item.related === 'general' );
				requestRationale.addItems( [
					new OO.ui.FieldLayout( vandalizedPage = new OO.ui.TextInputWidget( {
						value: ''
					} ), {
						label: new OO.ui.deferMsg( 'related-page' ),
						help: new OO.ui.deferMsg( 'related-page-description' )
					} ),
					new OO.ui.FieldLayout( revisionID = new OO.ui.TextInputWidget( {
						value: ''
					} ), {
						label: new OO.ui.deferMsg( 'revision-id' ),
						help: new OO.ui.deferMsg( 'revision-id-description' )
					} )
				] );
				generalRationales.forEach( ( rationaleItem ) => {
					requestRationale.addItems( [
						new OO.ui.FieldLayout( new OO.ui.CheckboxInputWidget( {
							selected: false,
							data: rationaleItem.data
						} ), {
							label: rationaleItem.label,
							align: 'inline'
						} )
					] );
				} );
				reportType = 'regularReport';
				break;
			case 2:
				requestRationale = new OO.ui.FieldsetLayout( {
					label: mw.msg( 'rationale' )
				} );
				// Burada, reportRationales setinden gelen ve related değeri username olan öğeleri filtreleyerek yeni bir dizi oluşturuyoruz.
				const usernameRationales = reportRationales.filter( ( item ) => item.related === 'username' );
				// Şimdi bu usernameRationales dizisini kullanarak requestRationale'a öğeleri ekleyebiliriz.
				usernameRationales.forEach( ( rationaleItem ) => {
					requestRationale.addItems( [
						new OO.ui.FieldLayout( new OO.ui.CheckboxInputWidget( {
							selected: false,
							data: rationaleItem.data
						} ), {
							label: rationaleItem.label,
							align: 'inline'
						} )
					] );
				} );
				reportType = 'regularReport';
				break;
			case 3:
				requestRationale = new OO.ui.FieldsetLayout( {
					label: mw.msg( 'report-suspected-sockpuppeteer' )
				} );
				requestRationale.addItems( [
					new OO.ui.MessageWidget( {
						type: 'warning',
						inline: true,
						label: mw.msg( 'sockpuppetry-warning-text' )
					} ),
					new OO.ui.FieldLayout( sockPuppetsList = new OO.ui.TagMultiselectWidget( {
						placeholder: mw.msg( 'sockpuppets-input-placeholder' ),
						allowArbitrary: true
					} ) ),
					new OO.ui.FieldLayout( evidenceTextInput = new OO.ui.MultilineTextInputWidget( {
						placeholder: mw.msg( 'evidence-input-placeholder' ),
						value: '',
						indicator: 'required'
					} ), {
						label: mw.msg( 'evidence' ),
						align: 'inline'
					} )
				] );
				reportType = 'sockpuppetry';
				sockpuppetryType = 'sockpuppeteer';
				break;
			case 4:
				requestRationale = new OO.ui.FieldsetLayout( {
					label: mw.msg( 'report-suspected-sockpuppet' )
				} );
				requestRationale.addItems( [
					new OO.ui.MessageWidget( {
						type: 'warning',
						inline: true,
						label: mw.msg( 'sockpuppetry-warning-text' )
					} ),
					new OO.ui.FieldLayout( sockpuppeteerInput = new OO.ui.TextInputWidget( {
						value: '',
						indicator: 'required'
					} ), {
						label: mw.msg( 'sockpuppeteer' ),
						help: mw.msg( 'sockpuppeteer-help-text' )
					} ),
					new OO.ui.FieldLayout( evidenceTextInput = new OO.ui.MultilineTextInputWidget( {
						placeholder: mw.msg( 'evidence-input-placeholder' ),
						value: '',
						indicator: 'required'
					} ), {
						label: mw.msg( 'evidence' ),
						align: 'inline'
					} )
				] );
				reportType = 'sockpuppetry';
				sockpuppetryType = 'sockpuppet';
				break;
			}
			console.log( reportType );
			requestRationaleContainer.$element.html( requestRationale.$element );
			windowManager.onWindowResize();
		} );
		this.content.$element.append( headerTitle.$element, headerTitleDescription.$element, rationaleSelector.$element, requestRationaleContainer.$element );
		this.$body.append( this.content.$element );
	};
	AivDialog.prototype.getActionProcess = function ( action ) {
		if (action) {
			switch (reportType) {
			case 'sockpuppetry':
				switch (sockpuppetryType) {
				case 'sockpuppeteer':
					const selectedValues = sockPuppetsList.getValue();
					const sockpuppets = selectedValues.map( ( value ) => '\n* {{' + sockpuppetTemplate + '|' + value + '}}' );
					const formattedSockpuppets = sockpuppets.join( '' );
					placeholders = {
						$1: userReported,
						$3: formattedSockpuppets,
						$5: evidenceTextInput.value
					};
					preparedContent = replacePlaceholders( sockpuppeteerContentPattern, placeholders );
					postSockpuppetRequest( userReported );
					break;
				case 'sockpuppet':
					placeholders = {
						$1: sockpuppeteerInput.value,
						$3: userReported,
						$5: evidenceTextInput.value
					};
					preparedContent = replacePlaceholders( sockpuppetContentPattern, placeholders );
					postSockpuppetRequest( sockpuppeteerInput.value );
					break;
				}
				break;
			case 'regularReport':
				if (requestRationale) {
					rationaleInput = findSelectedRationale();
					if (rationaleInput) {
						placeholders = {
							$1: userReported,
							$2: rationaleText.replace( /\$1/g, vandalizedPage.value ).replace( /\$2/g, revisionID.value ? '([[Special:Diff|' + revisionID.value + ']])' : '' ).replace( /\$3/g, rationaleInput )
						};
						preparedContent = replacePlaceholders( contentPattern, placeholders );
						postRegularReport();
					} else {
						mw.notify( mw.msg( 'select-rationale' ), {
							title: mw.msg( 'operation-failed' ),
							type: 'warning'
						} );
					}
				}
				break;
			}
		}
		return AivDialog.Super.prototype.getActionProcess.call( this, action );
	};

	function replacePlaceholders( input, replacements ) {
		return input.replace( /\$(\d+)/g, ( match, group ) => {
			const replacement = replacements['$' + group];
			return replacement !== undefined ? replacement : match;
		} );
	}

	function replaceParameter( input, parameterName, newValue ) {
		const regex = new RegExp( '\\$' + parameterName, 'g' );
		if (input.includes( '$' + parameterName )) {
			return input.replace( regex, newValue );
		} else {
			return input;
		}
	}

	function getFormattedPageName() {
		const cleanedPageName = mwConfig.wgPageName.replace( /_/g, ' ' ).replace( userPagePrefix, '' ).replace( specialContibutions, '' ).replace( userTalkPagePrefix, '' );
		return cleanedPageName;
	}

	function postSockpuppetRequest( sockpuppeteer ) {
		api.postWithToken( 'csrf', {
			action: 'edit',
			title: spiNoticeBoardCase + '/' + sockpuppeteer,
			appendtext: preparedContent,
			summary: replaceParameter( spiApiPostSummary, '1', sockpuppeteer ),
			tags: 'Adiutor',
			format: 'json'
		} ).done( () => {
			api.postWithToken( 'csrf', {
				action: 'edit',
				title: spiNoticeBoard,
				appendtext: '\n{{' + spiNoticeBoardCase + '/' + sockpuppeteer + '}}',
				summary: replaceParameter( spiApiPostCaseSummary, '1', spiNoticeBoardCase + '/' + sockpuppeteer ),
				tags: 'Adiutor',
				format: 'json'
			} ).done( () => {
				window.location = '/wiki/' + spiNoticeBoardCase + '/' + sockpuppeteer;
			} );
		} );
	}

	function findSelectedRationale() {
		let rationaleInput = null;
		requestRationale.items.forEach( ( Rationale ) => {
			if (Rationale.fieldWidget.selected) {
				rationaleInput = Rationale.fieldWidget.data;
			}
		} );
		return rationaleInput;
	}

	function postRegularReport() {
		const apiParams = {
			action: 'edit',
			title: noticeBoardTitle,
			summary: replaceParameter( apiPostSummary, '1', userReported ),
			tags: 'Adiutor',
			format: 'json'
		};
		if (addNewSection) {
			apiParams.section = 'new';
			apiParams.sectiontitle = replaceParameter( sectionTitle, '1', userReported );
			apiParams.text = preparedContent;
		} else {
			if (sectionId) {
				apiParams.section = sectionId;
			}
			if (appendText) {
				apiParams.appendtext = preparedContent + '\n';
			} else if (prependText) {
				apiParams.prependtext = preparedContent + '\n';
			} else {
				apiParams.text = preparedContent + '\n';
			}
		}
		api.postWithToken( 'csrf', apiParams ).done( () => {
			window.location = '/wiki/' + noticeBoardLink;
		} );
	}

	$( document.body ).append( windowManager.$element );
	const dialog = new AivDialog();
	windowManager.addWindows( [ dialog ] );
	windowManager.openWindow( dialog );
}

module.exports = {
	callBack: callBack
};
/* </nowiki> */
