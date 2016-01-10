// ==UserScript==
// @include     *//ncore.cc/torrents.php*
// ==/UserScript==

// hide site until the script finished
document.getElementsByTagName('body')[0].style.display = 'none';

(function($) {

    function contains(str, lookFor) {
        return str.indexOf(lookFor) > -1;
    }

    $(function() {

        // tidy up the top of the page
        $('#div_body').children('div[id*="fej_"]').remove();

        // look for <br> tags until they are added
        var intID = setInterval(function() {
            var br = $('#main_tartalom').children('br');

            if (br.length > 0) {
                br.remove();
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

        // replace "bookmark plus" buttons to "download torrent"
        $('.box_torrent').each(function() {
            var self              = $(this),
                bookmarkButton    = self.find('div[class*="torrent_konyvjelzo"]'),
                hrefSourceElement = self.find('div[class*="torrent_txt"] a[href*="id"]'),
                hrefAttr          = hrefSourceElement.attr('href'),
                hrefPattern       = /id=(\d+)/i,
                hrefTemplate      = '//ncore.cc/torrents.php?action=download&id=',
                href              = hrefTemplate + hrefAttr.match(hrefPattern)[1],
                downloadButton    = $('<a/>', {
                    href  : href,
                    title : href,
                    css   : {
                        float  : 'left',
                        margin : '0 10px 0 -4px'
                    }
                }).append($('<img/>', {
                    src : '//static.ncore.cc/styles/nspring/letoltve.gif',
                    css : {
                        height : '33px'
                    }
                }));

            bookmarkButton
                .after(downloadButton)
                .remove();
        });

        // remove empty "bottom row" of the page
        $('#div_body_space').remove();

        // show the page after all the changes ran
        $('body').show();
    });

})(jQuery);