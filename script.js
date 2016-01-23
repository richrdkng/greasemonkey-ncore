// ==UserScript==
// @include     *//ncore.cc/
// @include     *//ncore.cc/index.php
// @include     *//ncore.cc/torrents.php*
// @include     *//ncore.cc/hitnrun.php*
// ==/UserScript==

// hide site until the script finished
document.getElementsByTagName('body')[0].style.display = 'none';

(function($) {

    /**
     * @const General timeout in milliseconds
     */
    var TIMEOUT = 15000;

    /**
     * Returns whether the string contains the given string to look for.
     *
     * @param {string} str
     * @param {string} lookFor
     *
     * @return {boolean}
     */
    function contains(str, lookFor) {
        return str.indexOf(lookFor) > -1;
    }

    /**
     * Returns the constructed download button with given parameters.
     *
     * @param {Object} options
     *
     * @return {jQuery}
     */
    function getDownloadButton(options) {
        var a   = $('<a/>'),
            img = $('<img/>', {
                src : 'https://cdn.rawgit.com/richrdkng/greasemonkey-ncore/master/img/arrow_square_green_16x16.png'
            }),
            opt,
            hrefAttr,
            hrefPattern,
            hrefTemplate,
            href;

        options = options || {};

        if (options.a) {
            opt = options.a;

            if (opt.href && opt.href.element) {
                hrefAttr     = $(opt.href.element).attr('href');
                hrefPattern  = /id=(\d+)/i;
                hrefTemplate = '//ncore.cc/torrents.php?action=download&id=';

                if (hrefAttr) {
                    href = hrefTemplate + hrefAttr.match(hrefPattern)[1];
                }

            } else if (typeof opt.href === 'string') {
                href = opt.href;
            }

            if (href) {
                a.attr('href',  href);
                a.attr('title', 'Download ' + href);
            }

            if (opt.class) {
                a.addClass(opt.class);
            }

            if (opt.css) {
                a.css(opt.css);
            }
        }

        if (options.img) {
            opt = options.img;

            if (opt.src) {
                img.attr('src', opt.src);
            }

            if (opt.css) {
                img.css(opt.css);
            }
        }

        return a.append(img);
    }

    $(function() {

        // tidy up the top of the page
        $('#div_body').children('div[id*="fej_"]').remove();

        // look for <br> tags until they are added
        var startTime = Date.now(),
            intID     = setInterval(function() {
                var br = $('#main_tartalom').children('br');

                if (br.length > 0) {
                    br.remove();
                    clearInterval(intID);
                }

                if (Date.now() - startTime > TIMEOUT) {
                    console.warn('Script timed out for <br>');
                    clearInterval(intID);
                }
            }, 0);

        // delete "red infobar"
        $('.infocsik').remove();

        // open "search panel"
        $('#panel_stuff.panel_closed').click();

        // delete "yellow adblock warning bar"
        $('center').each(function() {
            var self = $(this),
                html = self.html();

            if (contains(html, 'warning.png') &&
                contains(html, 'rekl') &&
                contains(html, 'blokk')) {

                self.remove();
            }
        });

        // remove "middle ad bar"
        $('center .banner').parent().remove();

        // remove ads from individual torrent dropdowns
        $('.torrent_txt, .torrent_txt2').each(function() {
            var link = $(this).find('a[href*="id"]');

            link.on('click', function() {
                if (!link.hasClass('opened-already')) {
                    link.addClass('opened-already');

                    var start = Date.now(),
                        intID = setInterval(function() {

                        var torrentID = /id=(\d+)/i.exec(link.attr('href'))[1],
                            dropdown  = $('#' + torrentID),
                            content   = dropdown.find('.torrent_lenyilo_tartalom'),
                            pair;

                        if (content.length) {
                            pair = content.find('center + .hr_stuff');

                            if (pair.length) {
                                content.find('center > .banner').closest('center').remove();
                                pair.remove();

                                clearInterval(intID);
                            }
                        }

                        if (Date.now() - start > TIMEOUT) {
                            console.warn('Script timed out for link', link);
                            clearInterval(intID);
                        }
                    }, 0);
                }
            });
        });

        // replace "bookmark plus" buttons to "download torrent"
        $('.box_torrent').each(function() {
            var self           = $(this),
                opacity        = .65,
                bookmarkButton = self.find('div[class*="torrent_konyvjelzo"]'),
                downloadButton = getDownloadButton({
                    a : {
                        href : {
                            element : self.find('div[class*="torrent_txt"] a[href*="id"]')
                        },
                        class : 'btn-download-torrent',
                        css   : {
                            float         : 'left',
                            'margin-left' : '-4px',
                            opacity       : opacity
                        }
                    },
                    img : {
                        css : {
                            margin : '4px 5px',
                            height : '24px'
                        }
                    }
                });

            downloadButton.on('mouseover mouseout', function(e) {
                downloadButton.css({
                    opacity : e.type === 'mouseover' ? 1 : opacity
                });
            });

            bookmarkButton.replaceWith(downloadButton);
        });

        // add "download torrent" button to HnR page
        $('.hnr_torrents').each(function() {
            var row            = $(this),
                nameColumn     = row.find('.hnr_tname'),
                downloadButton = getDownloadButton({
                    a : {
                        href  : {
                            element : nameColumn.find('a[href*="id"]')
                        },
                        class : 'btn-download-torrent',
                        css   : {
                            float  : 'left',
                            margin : '-2px 10px -2px -2px'
                        }
                    },
                    img : {
                        css : {
                            height : '16px'
                        }
                    }
                });

            nameColumn.prepend(downloadButton);
        });

        // add "download all torrent" button to HnR page
        $('.box_alcimek_all .alcim .hnr_name').each(function() {
            var self           = $(this),
                column         = self.closest('td'),
                downloadButton = getDownloadButton({
                    a : {
                        class : 'btn-download-all-torrent',
                        css   : {
                            float  : 'left',
                            margin : '-2px 10px -2px -7px',
                            cursor : 'pointer'
                        }
                    },
                    img : {
                        css : {
                            height : '19px'
                        }
                    }
                });

            // gather every link
            var linkElements = $('.btn-download-torrent'),
                numLinks     = linkElements.length,
                template     = 'window.open("{{link}}");',
                eventString  = '',
                title        = 'Download 1 torrent';

            if (numLinks > 0) {
                linkElements.each(function() {
                    eventString += template.replace('{{link}}', $(this).attr('href'));
                });

                if (numLinks > 1) {
                    title = 'Download all the ' + numLinks + ' torrents';
                }

                // add the event string as a series of "window.open(..)"-s to trigger,
                // when click event through user interaction will happen
                downloadButton.attr('onclick', eventString);
                downloadButton.attr('title',   title);

                column.prepend(downloadButton);
            }
        });

        // remove empty "bottom row" of the page
        $('#div_body_space').remove();

        // show the page after all the changes ran
        $('body').show();
    });

})(jQuery);