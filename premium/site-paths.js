(function () {
    'use strict';

    var PUBLIC_PAGES = {
        'index.html': true,
        'services.html': true,
        'about.html': true,
        'gallery.html': true,
        'prince.html': true,
        'contact.html': true,
        'pay.html': true
    };

    function getPremiumBasePath() {
        var path = window.location.pathname || '';
        var premiumFolderIndex = path.indexOf('/premium/');

        if (premiumFolderIndex !== -1) {
            return path.slice(0, premiumFolderIndex + '/premium/'.length);
        }

        if (/\/premium$/.test(path)) {
            return path + '/';
        }

        var premiumFileMatch = path.match(/^(.*\/premium\/)[^/]*$/);
        if (premiumFileMatch) {
            return premiumFileMatch[1];
        }

        return path.replace(/[^/]*$/, '');
    }

    function isExternalHref(href) {
        return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);
    }

    function rewritePublicLinks() {
        var basePath = getPremiumBasePath();
        if (!basePath) return;

        document.querySelectorAll('a[href]').forEach(function (anchor) {
            var rawHref = anchor.getAttribute('href');
            if (!rawHref || isExternalHref(rawHref)) return;

            var suffixIndex = rawHref.search(/[?#]/);
            var pagePath = suffixIndex === -1 ? rawHref : rawHref.slice(0, suffixIndex);
            var suffix = suffixIndex === -1 ? '' : rawHref.slice(suffixIndex);

            if (!PUBLIC_PAGES[pagePath]) return;

            anchor.setAttribute('href', basePath + pagePath + suffix);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', rewritePublicLinks);
    } else {
        rewritePublicLinks();
    }
})();
