/* 
 * Adiutor: A gadget to assist various user actions
 * Author: Vikipolimer
  * Licencing and attribution: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]
 * Module: Loader
 */
/* <nowiki> */
$.when(mw.loader.using(["mediawiki.user", "oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows", ]), $.ready).then(function() {
    var mwConfig = mw.config.get(["skin", "wgAction", "wgPageName", "wgNamespaceNumber", "wgTitle", "wgUserGroups", "wgUserName"]);
    api = new mw.Api();
    checkAdiutorUser('Kullanıcı:' + mwConfig.wgUserName + '/Adiutor-options.js').then(function(data) {
        if (data.query.pages["-1"]) {} else {
            checkOptions('Kullanıcı:' + mwConfig.wgUserName + '/Adiutor-options.js').then(function(data) {
                if (data.query.pages["-1"]) {
                    Default_Options = JSON.stringify([{
                        "name": "csdSendMessageToCreator",
                        "value": false
                    }, {
                        "name": "csdLogNominatedPages",
                        "value": false
                    }, {
                        "name": "csdLogPageName",
                        "value": "HS günlüğü"
                    }, {
                        "name": "afdSendMessageToCreator",
                        "value": false
                    }, {
                        "name": "afdLogNominatedPages",
                        "value": false
                    }, {
                        "name": "afdLogPageName",
                        "value": "SAS günlüğü"
                    }, {
                        "name": "prdSendMessageToCreator",
                        "value": false
                    }, {
                        "name": "prdLogNominatedPages",
                        "value": false
                    }, {
                        "name": "prdLogPageName",
                        "value": "BS günlüğü"
                    }, {
                        "name": "afdNominateOpinionsLog",
                        "value": false
                    }, {
                        "name": "afdOpinionLogPageName",
                        "value": "SAS görüş günlüğü"
                    }, {
                        "name": "showMyStatus",
                        "value": false
                    }, {
                        "name": "MyStatus",
                        "value": true
                    }]);
                    for (var i in Default_Options) {
                        localStorage.setItem((Default_Options[i]).name, (Default_Options[i]).value);
                    }
                } else {
                    var userSettingsParams = {
                        action: 'parse',
                        page: 'Kullanıcı:' + mwConfig.wgUserName + '/Adiutor-options.js',
                        prop: 'wikitext',
                        format: "json"
                    };
                    api.get(userSettingsParams).done(function(data) {
                        var AdiutorOptions = JSON.parse([data.parse.wikitext['*']]);
                        for (var i in AdiutorOptions) {
                            localStorage.setItem((AdiutorOptions[i]).name, (AdiutorOptions[i]).value);
                        }
                    });
                }
            });
            var DefaultMenuItems = [];
            switch (mwConfig.wgNamespaceNumber) {
                case -1:
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 14:
                case 10:
                case 11:
                case 100:
                case 101:
                case 102:
                case 103:
                case 828:
                case 829:
                    // LOAD MODULES
                    if (mwConfig.wgNamespaceNumber === 3) {
                        var UserParams = {
                            action: 'query',
                            meta: 'userinfo',
                            uiprop: 'rights',
                            format: 'json'
                        };
                        api.get(UserParams).then(function(data) {
                            checkMentor(data.query.userinfo.id);
                        });
                    }
                    mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-AFD-Helper.js');
                    if (/(?:\?|&)(?:action|diff|oldid)=/.test(window.location.href)) {
                        DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
                            icon: 'cancel',
                            data: 'rdr',
                            label: 'SGT Oluştur',
                            classes: ['adiutor-top-rrd-menu'],
                        }));
                    }
                    if (mwConfig.wgPageName.includes('Özel:Katkılar') || mwConfig.wgNamespaceNumber === 2 || mwConfig.wgNamespaceNumber === 3 && !mwConfig.wgPageName.includes(mwConfig.wgUserName)) {
                        DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
                            icon: 'cancel',
                            data: 'report',
                            label: 'Raporla',
                            classes: ['adiutor-top-user-menu'],
                        }));
                    }
                    if (!mwConfig.wgPageName.includes('Özel:Katkılar')) {
                        DefaultMenuItems.push(new OO.ui.MenuOptionWidget({
                            icon: 'add',
                            data: 1,
                            label: 'Hızlı Silme Talebi',
                        }), new OO.ui.MenuOptionWidget({
                            icon: 'add',
                            data: 2,
                            label: 'Bekletmeli Silme Önerisi',
                        }), new OO.ui.MenuOptionWidget({
                            icon: 'add',
                            data: 3,
                            label: 'Silinmeye Aday Göster',
                        }), new OO.ui.MenuOptionWidget({
                            icon: 'arrowNext',
                            data: 'pmr',
                            label: 'Sayfa Taşıma Talebi',
                        }), new OO.ui.MenuOptionWidget({
                            icon: 'lock',
                            data: 'rpp',
                            label: 'Sayfa Koruma Talebi',
                        }), new OO.ui.MenuOptionWidget({
                            icon: 'history',
                            data: 4,
                            label: 'Son Değişiklik',
                        }), new OO.ui.MenuOptionWidget({
                            icon: 'checkAll',
                            data: 5,
                            label: 'Telif İhlali Kontrolü',
                        }), new OO.ui.MenuOptionWidget({
                            icon: 'settings',
                            data: 6,
                            label: 'Adiutor Ayarları',
                            classes: ['adiutor-top-settings-menu'],
                        }));
                    }
                    var adiutorMenu = new OO.ui.ButtonMenuSelectWidget({
                        icon: 'flag',
                        invisibleLabel: true,
                        framed: false,
                        title: 'More options',
                        align: 'force-right',
                        classes: ['adiutor-top-selector', 'mw-indicator'],
                        menu: {
                            horizontalPosition: 'end',
                            items: DefaultMenuItems,
                            classes: ['adiutor-top-menu'],
                        }
                    });
                    adiutorMenu.getMenu().on('choose', function(menuOption) {
                        switch (menuOption.getData()) {
                            case 1:
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-CSD.js');
                                break;
                            case 2:
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-PRD.js');
                                break;
                            case 3:
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-AFD.js');
                                break;
                            case 4:
                                window.location = '/w/index.php?title=' + mwConfig.wgPageName + "&diff=cur&oldid=prev&diffmode=source";
                                break;
                            case 5:
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-COV.js');
                                break;
                            case 6:
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-OPT.js');
                                break;
                            case 'report':
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-AIV.js');
                                break;
                            case 'warn':
                                OO.ui.alert('Yakında aktif olacak :)').done(function() {});
                                break;
                            case 'welcome':
                                OO.ui.alert('Yakında aktif olacak :)').done(function() {});
                                break;
                            case 'rdr':
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-RDR.js');
                                break;
                            case 'pmr':
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-PMR.js');
                                break;
                            case 'rpp':
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-RPP.js');
                                break;
                            case 'gac':
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-GAC.js');
                                break;
                            case 'fac':
                                mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-FAC.js');
                                break;
                        }
                    });
                    if (!mwConfig.wgPageName.includes('Anasayfa')) {
                        $('.page-actions-menu__list').append(adiutorMenu.$element);
                    }
            }

            function checkOptions(title) {
                return api.get({
                    action: 'query',
                    prop: 'revisions',
                    rvlimit: 1,
                    rvprop: ['user'],
                    rvdir: 'newer',
                    titles: title,
                });
            }
            switch (mwConfig.wgNamespaceNumber) {
                case 2:
                case 3:
                    var CurrentUserPage = mwConfig.wgPageName.replace(/Kullanıcı(\s|\_)mesaj\s*?\:\s*?(.*)/gi, "Kullanıcı:$2");
                    checkOptions(CurrentUserPage + '/Adiutor-options.js').then(function(data) {
                        if (data.query.pages["-1"]) {
                            //
                        } else {
                            var XUserParams = {
                                action: 'parse',
                                page: CurrentUserPage + '/Adiutor-options.js',
                                prop: 'wikitext',
                                format: "json"
                            };
                            api.get(XUserParams).done(function(data) {
                                var AdiutorOptions = JSON.parse([data.parse.wikitext['*']]);
                                var ShowStatus;
                                var UserStatus;
                                $.each(AdiutorOptions, function() {
                                    if (this.name == "showMyStatus") {
                                        ShowStatus = this.value;
                                    }
                                });
                                $.each(AdiutorOptions, function() {
                                    if (this.name == "MyStatus") {
                                        UserStatus = this.value;
                                    }
                                });
                                if (ShowStatus) {
                                    switch (UserStatus) {
                                        case "active":
                                            buttonSelect = new OO.ui.ButtonOptionWidget({
                                                framed: false,
                                                label: 'Etkin',
                                                data: 'active',
                                                classes: ['adiutor-user-status-active'],
                                            });
                                            $('.mw-first-heading').append(buttonSelect.$element);
                                            break;
                                        case "passive":
                                            buttonSelect = new OO.ui.ButtonOptionWidget({
                                                framed: false,
                                                label: 'Etkin değil',
                                                data: 'passive',
                                                classes: ['adiutor-user-status-passive'],
                                            });
                                            $('.mw-first-heading').append(buttonSelect.$element);
                                            break;
                                        case "away":
                                            buttonSelect = new OO.ui.ButtonOptionWidget({
                                                framed: false,
                                                label: 'Molada',
                                                data: 'away',
                                                classes: ['adiutor-user-status-away'],
                                            });
                                            $('.mw-first-heading').append(buttonSelect.$element);
                                            break;
                                    }
                                    var checkLoggedUserPage = mwConfig.wgPageName.includes(mwConfig.wgUserName);
                                    if (checkLoggedUserPage) {
                                        buttonSelect.on('click', (function() {
                                            buttonSelect.$element.hide();
                                            var dropdown = new OO.ui.DropdownWidget({
                                                menu: {
                                                    items: [
                                                        new OO.ui.MenuOptionWidget({
                                                            data: 'active',
                                                            label: 'Etkin'
                                                        }),
                                                        new OO.ui.MenuOptionWidget({
                                                            data: 'passive',
                                                            label: 'Etkin değil'
                                                        }),
                                                        new OO.ui.MenuOptionWidget({
                                                            data: 'away',
                                                            label: 'Molada'
                                                        })
                                                    ],
                                                },
                                                label: 'Durum',
                                                classes: ['adiutor-user-status-selector']
                                            });
                                            $('.mw-first-heading').append(dropdown.$element);
                                            dropdown.getMenu().on('choose', function(menuOption) {
                                                changeUserStatus(menuOption.getData());
                                            });
                                        }));
                                    }
                                }
                            });
                        }
                    });
                    break;
            }

            function changeUserStatus(status) {
                api.get({
                    action: 'parse',
                    page: 'Kullanıcı:' + mwConfig.wgUserName + '/Adiutor-options.js',
                    prop: 'wikitext',
                    format: "json"
                }).done(function(data) {
                    var AdiutorOptions = JSON.parse([data.parse.wikitext['*']]);
                    $.each(AdiutorOptions, function() {
                        if (this.name == "MyStatus") {
                            this.value = status;
                        }
                    });
                    api.postWithToken('csrf', {
                        action: 'edit',
                        title: 'Kullanıcı:' + mwConfig.wgUserName + '/Adiutor-options.js',
                        text: JSON.stringify(AdiutorOptions),
                        summary: '[[VP:Adiutor|Adiutor]] ayarları güncellendi',
                        format: 'json'
                    }).done(function() {
                        location.reload();
                    });
                });
            }

            function checkMentor(UserId) {
                api.get({
                    action: 'parse',
                    page: "MediaWiki:GrowthMentors.json",
                    prop: 'wikitext',
                    format: "json"
                }).done(function(data) {
                    if (data.parse.wikitext['*'].includes(UserId) && mwConfig.wgPageName.includes(mwConfig.wgUserName)) {
                        mw.loader.load('//tr.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-Adiutor-CMR.js');
                    }
                });
            }
        }
    });

    function checkAdiutorUser(title) {
        return api.get({
            action: 'query',
            prop: 'revisions',
            rvlimit: 1,
            rvprop: ['user'],
            rvdir: 'newer',
            titles: title,
        });
    }
});
/* </nowiki> */