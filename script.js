// ==UserScript==
// @include     *//ncore.cc/torrents.php*
// ==/UserScript==

(function($) {

    function contains(str, lookFor) {
        return str.indexOf(lookFor) > -1;
    }

    $(function() {

        // delete "red infobar"
        $('.infocsik').remove();

        // delete "yellow adblock warning bar"
        $('center').each(function() {
            var self = $(this),
                html = self.html();

            if (contains(html, 'warning.png') &&
                contains(html, 'rekl') &&
                contains(html, 'blokk')) {

                self.remove();
                return false;
            }
        });

        // open "search panel"
        $('#panel_stuff.panel_closed').click();

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
    });

})(jQuery);