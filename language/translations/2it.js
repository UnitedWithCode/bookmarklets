/**
 * Translate the specified or selected text or URL to Italian.
 *
 * It determines what and how to translate using the following logic:
 * - If a parameter has been specified, translate that using Google Translate.
 * - If text has been selected, translate that using Google Translate.
 * - If the page appears to link to the Italian version of itself (e.g. in a
 *   language selector menu), follow that link.
 * - If the page is accessible via HTTP(S), use its URL with Google Translate.
 * - Otherwise, prompt the user for text to translate with Google Translate.
 *
 * @title Translate to Italian
 * @keyword 2it
 */
(function () {
	/* Try to get the parameter string from the bookmarklet/search query. */
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	if (s === '') {
		/* If there is no parameter, see if there is text selected. */
		s = getSelection() + '';

		if (!s) {
			/* If there is no selection, look for translation links. */
			var interLanguageSelectors = [
				/* Wikipedia/Mediawiki */
				'.interlanguage-link a[href][hreflang="it"]',

				/* CatenaCycling.com */
				'#language a[href][hreflang="it"]',

				/* developer.mozilla.org */
				'#translations a[rel="internal"][href^="/it/"]',
				'#translations a[rel="internal"][href^="/it-"]',

				/* Generic */
				'[id*="lang"][id*="elect"] a[hreflang="it"]',
				'[class*="lang"][class*="elect"] a[hreflang="it"]',
				'a[href][title$="this page in Italian"]',
				'a[href][title$="questa pagina in italiano"]'
			];

			for (var link, i = 0; i < interLanguageSelectors.length; i++) {
				link = document.querySelector(interLanguageSelectors[i]);

				if (link) {
					location = link.href;

					return;
				}
			}

			/* If we did not find a translation link, use the current URL if it is HTTP(S). (No point in sending data: or file: URLs to Google Translate.) */
			s = (location.protocol + '').match(/^http/)
				? location + ''
				: '';

			/* If all else fails, prompt the user for the text to translate. */
			if (!s) {
				s = prompt('Please enter your text:');
			}
		}
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		if (s.match(/^(\w+:(\/\/)?)?[^\s.]+(\.[^\s])+/)) {
			var protocol = (s.match(/^https:/))
				? 'https'
				: 'http';
			location = protocol + '://translate.google.com/translate?sl=auto&tl=it&u=' + encodeURIComponent(s);
		} else {
			location = 'https://translate.google.com/translate_t#auto|it|' + encodeURIComponent(s);
		}
	}
})();
