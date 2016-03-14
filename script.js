// ==UserScript==
// @include     *//ncore.cc/
// @include     *//ncore.cc/index.php
// @include     *//ncore.cc/torrents.php*
// @include     *//ncore.cc/hitnrun.php*
// ==/UserScript==

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

    /**
     * Determines by the given date and ranges, that the in what range the date is falling to
     * and calls the handler function of that range.
     *
     * @param {Date} dateTime
     */
    function determineRangeCategoryByDate(dateTime, ranges) {
        var getRangeCategory = function(date, ranges) {
                var diff = (Date.now() - date) / (24 * 60 * 60 * 1000); // in days

                for (var k in ranges) {
                    var range = ranges[k].range;

                    if (isBetweenRange(diff, range)) {
                        ranges[k].handler.apply(null, [getRangePercent(diff, range)]);
                        break;
                    }
                }
            },
            isBetweenRange = function(day, range) {
                var pattern = /^(\d+)[\s-]*(\d+)$/,
                    matches = range.match(pattern),
                    min     = parseInt(matches ? matches[1] : null),
                    max     = parseInt(matches ? matches[2] : null);

                if (min === min && max === max) {
                    return day >= min && day <= max;
                }

                return false;
            },
            getRangePercent = function(day, range) {
                var pattern = /^(\d+)[\s-]*(\d+)$/,
                    matches = range.match(pattern),
                    min     = parseInt(matches ? matches[1] : null),
                    max     = parseInt(matches ? matches[2] : null),
                    scale,
                    actual;

                if (min === min && max === max) {
                    scale  = max - min;
                    actual = day - min;

                    return actual / scale
                }

                return 0;
            }

        getRangeCategory(dateTime, ranges);
    }

    /**
     * Returns the calculated color value between the 2 given colors determined by the percent.
     * The color is returned in CSS hex color format (e.g.: #FFFFFF).
     *
     * @param {string|number} color1
     * @param {string|number} color2
     * @param {number}        percent
     *
     * @returns {string}
     */
    function getColorGradient(color1, color2, percent) {
        var RED      = 1,
            GREEN    = 2,
            BLUE     = 3,

            getColorComponent = function(hex, component) {
                var pattern = /^#?(?:0x)?([\da-f]+)$/i,
                    sanitized,
                    matches;

                if (typeof hex === 'string') {
                    matches = hex.match(pattern);

                    if (matches && matches[1]) {
                        sanitized = parseInt(matches[1], 16);

                        if (sanitized !== sanitized) {
                            sanitized = null;
                        }
                    }

                } else if (
                    typeof hex === 'number' &&
                    hex === hex &&
                    hex >= 0 &&
                    hex <= Infinity
                ) {

                    sanitized = hex;
                }

                if (sanitized !== null) {
                    switch (component) {
                        case RED:
                            return sanitized >> 16 & 0xFF;

                        case GREEN:
                            return sanitized >> 8 & 0xFF;

                        case BLUE:
                            return sanitized & 0xFF;
                    }
                }

                return 0;
            },

            getColorComponentGradient = function(colorComponent1, colorComponent2, percent) {
                return colorComponent1 + Math.round((colorComponent2 - colorComponent1) * percent);
            },

            getHexComponent = function(colorComponent) {
                var hexComponent;

                if (colorComponent < 0) {
                    colorComponent = 0;

                } else if (colorComponent > 255) {
                    colorComponent = 255;
                }

                hexComponent = colorComponent.toString(16);

                if (colorComponent <= 0x0F) {
                    hexComponent = '0' + hexComponent;
                }

                return hexComponent;
            },

            c1_red   = getColorComponent(color1, RED),
            c1_green = getColorComponent(color1, GREEN),
            c1_blue  = getColorComponent(color1, BLUE),
            c2_red   = getColorComponent(color2, RED),
            c2_green = getColorComponent(color2, GREEN),
            c2_blue  = getColorComponent(color2, BLUE),
            red      = getColorComponentGradient(c1_red, c2_red, percent),
            green    = getColorComponentGradient(c1_green, c2_green, percent),
            blue     = getColorComponentGradient(c1_blue, c2_blue, percent);

        return '#' +
            getHexComponent(red) +
            getHexComponent(green) +
            getHexComponent(blue);
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

        // colorize dates
        $('.box_torrent .box_feltoltve2').each(function() {
            var container = $(this),
                pattern   = /([\d-:]+)/g,
                matches   = container.html().match(pattern),
                ranges    = [
                    {
                        range   : '0 - 7', // days
                        handler : function(percent) {
                            var c1    = '#FFFFFF',
                                c2    = '#FFFB8E',
                                color = getColorGradient(c1, c2, percent);

                            applyContainerStyle(container, {
                                borderRightColor : color
                            });
                        }
                    },
                    {
                        range : '8 - 14', // days
                        handler : function(percent) {
                            var c1    = '#FFFB8E',
                                c2    = '#FFB728',
                                color = getColorGradient(c1, c2, percent);

                            applyContainerStyle(container, {
                                borderRightColor : color
                            });
                        }
                    },
                    {
                        range : '15 - 9999', // days
                        handler : function(percent) {
                            var c1    = '#FFB728',
                                c2    = '#FF8989',
                                color = getColorGradient(c1, c2, percent);

                            applyContainerStyle(container, {
                                borderRightColor : color
                            });
                        }
                    }
                ],
                dateString,
                timeString,
                dateElement,
                timeElement,
                dateTime,

                applyContainerStyle = function(container, customCSS) {
                    container.css({
                        width       : '78px',
                        borderRight : '12px solid'
                    });

                    container.css(customCSS);
                };

            if (matches) {
                if (matches[0] && matches[1]) {
                    dateString = matches[0];
                    timeString = matches[1];
                    dateTime   = Date.parse(dateString + 'T' + timeString);

                    determineRangeCategoryByDate(dateTime, ranges);

                    dateElement = $('<span/>', {
                        text : dateString,
                        css  : {
                            fontWeight : 'bold'
                        }
                    });

                    timeElement = $('<span/>', {
                        text : timeString,
                        css  : {
                            color    : '#BBB',
                            fontSize : '9px'
                        }
                    });

                    container.empty();
                    container.append(dateElement, '<br>', timeElement);
                }
            }
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
    });

})(jQuery);