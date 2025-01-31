/**
 * Remove analytics and tracking parameters such as Google Analytics’ “utm_*”
 * and Facebook’s “fbclid” from the current document location (URI/URL) and
 * from the links on the page. It does not reload the page or its frames.
 *
 * @title Untrack links
 */
(function untrack() {
	'use strict';

	/* The following list was based on
	* <https://en.wikipedia.org/wiki/UTM_parameters#See_also> and has since been
	* expanded, primarily with the code from https://privacytests.org/
	* <https://github.com/arthuredelstein/privacytests.org/blob/master/testing/index.js>.
	* */
	const parameterPatterns =[
		/* Google (Analytics, Ads, DoubleClick) */
		'utm_[^=]*',
		'gclid',
		'dclid',
		'_ga',

		 /* Facebook */
		'fbclid',
		'__cft__((%5B|\\[)[^=]*)?',
		'__tn__',
		'__eep__',

		 /* Instagram */
		'igshid',

		/* Microsoft/Bing */
		'msclkid',

		 /* Mailchimp */
		'mc_eid',

		 /* HubSpot */
		'__hsfp',
		'__hssc',
		'__hstc',
		'_hsenc',
		'hsCtaTracking',

		 /* Drip.com */
		'__s',

		/* Adobe Marketo */
		'mkt_tok',

		/* MailerLite */
		'ml_subscriber',
		'ml_subscriber_hash',

		/* Omeda */
		'oly_anon_id',
		'oly_enc_id',

		/* Omnisend */
		'omnisendContactID',

		/* Outbrain */
		'obOrigUrl',
		'outbrainclickid',

		/* Cloudflare DDOS challenge tokens */
		'__cf_chl_jschl_tk__',
		'__cf_chl_captcha_tk__',

		/* Unknown Russian tracker */
		'rb_clickid',

		/* Adobe Site Catalyst */
		's_cid',
		'ss_[^=]*',

		/* Vero */
		'vero_conv',
		'vero_id',

		/* Wicked Reports */
		'wickedid',

		/* Yandex */
		'yclid',
		'ymclid',
		'_openstat',

		/* Zanox/Awin */
		'zanpid'
	];

	const hrefRegexp = new RegExp('[?&](' + parameterPatterns.join('|') + ')=');
	const parameterRegexp = new RegExp('^(' + parameterPatterns.join('|') + ')$');

	/* Some URIs work just fine without parameters, and the parameters they
	 * use, seem to be mostly tracking-related anyway. Just delete them all.
	 *
	 * Note that because these patterns are defined as normal strings instead
	 * of RegExps, you need to escape the backslash you use to escape special
	 * characters in the pattern, e.g. `example\\.com` instead of
	 * `example\.com`. */
	const uriPatternsForWhichToDeleteAllParameters = [
		/* New York Times articles */
		/* E.g. https://www.nytimes.com/2021/12/17/realestate/right-at-home-kitchen-reno.html?action=click&algo=bandit-all-surfaces-alpha-06&block=editors_picks_recirc&fellback=false&imp_id=000000000&impression_id=0abc123d-0000-0000-0000-000000000000&index=0&pgtype=Article&pool=pool%2F00000000-0000-0000-0000-000000000000&region=footer&req_id=000000000&surface=eos-home-featured&variant=0_bandit-all-surfaces-alpha-06 */
		'https?://(www\\.)?nytimes\\.com/[^?]*\\.html',

		/* TikTok videos */
		/* E.g. https://www.tiktok.com/@andreswilley/video/7039611724638604549?_d=a0000000000000BcD000SdffsddfF0&checksum=0000000000000000000000000000000000000000000000000000000000000000&language=en&preview_pb=0&sec_user_id=Abcd12345DsdfdsfsdfsdfSDFS&share_app_id=1233&share_item_id=0000000000000000000&share_link_id=00000000-0000-0000-0000-000000000000&source=h5_m&timestamp=2147483648&tt_from=more&u_code=abcdef12345678&user_id=abcdef12345678efabc&_r=1&is_copy_url=1&is_from_webapp=v1 */
		'https?://(www\\.)?tiktok\\.com/[^?]*/video/\\d+'
	];

	const hrefRegexpForWhichToDeleteAllParameters = new RegExp('(?:' + uriPatternsForWhichToDeleteAllParameters.join('|') + ')\\?');

	/* Link redirectors in the form 'CSS selector': handlerFunction(element). */
	const linkRedirectors = {
		/* Facebook */
		'a[href^="https://l.facebook.com/l.php?"]': a => {
			/* Facebook’s `l.php` takes the original URI in the `u` query string parameter. We do not care about the checksum or other parameters. */
			a.href = new URLSearchParams(new URL(a.href).search)?.get('u') ?? a.href;
		},

		/* Instagram */
		'a[href^="https://l.instagram.com/?"]': a => {
			a.href = new URLSearchParams(new URL(a.href).search)?.get('u') ?? a.href;
		},

		/* Google */
		'a[href^="https://www.google."][href*="/url?"], a[href^="http://www.google."][href*="/url?"], a[href^="/url?"]': a => {
			/* Make sure we only process Google’s redirects. It seems the
			 * localised sites (e.g. www.google.de) do not use the `/url?`
			 * redirect, so checking if `a.hostname === 'www.google.com'`
			 * should suffise. However, the following regexp check is a good
			 * compromise between allowing only the `.com` and incorporating
			 * the entire Public Suffix List to check for valid top-level
			 * Google domains. */
			if (a.getAttribute('href').indexOf('/url?') === 0 && !a.hostname.match(/^www\.google\.(com?\.)?[^.]+$/)) {
				return;
			}

			const usp = new URLSearchParams(new URL(a.href).search);
			/* Sometimes the parameters is `url`, other times `q`. Heh. */
			a.href = usp.get('url') ?? usp.get('q') ?? a.href;
		},

		/* YouTube */
		'a[href^="https://www.youtube.com/redirect?"][href*="q="]': a => {
			let targetUri = new URLSearchParams(new URL(a.href).search)?.get('q');
			if (!targetUri) {
				return;
			}

			/* Sometimes the `q=` URIs do not specify the protocol, e.g.
			 * `www.example.com`. In that case, assume they are HTTPS. */
			if (!targetUri.match(/^[^\/]+:/)) {
				targetUri = `https://${targetUri}`;
			}

			a.href = targetUri;
		},

		/* Twitter */
		'a[href^="https://t.co/"], a[href^="http://t.co/"]': a => {
			/* See if we are able to extract a URI from the link text. For
			 * text links without previews, the original URI is somewhat
			 * hidden inside a few SPANs and a text node, which are shown
			 * as a tooltip on hover. */
			let possibleUri = a.textContent;

			/* The site link in a user’s profile does not contain the full
			 * URI as its text. However, if there are no ellipses, we can
			 * safely ass-u-me the URI is shown as-is, albeit without its
			 * scheme. */
			if (a.dataset.testid === 'UserUrl' && possibleUri.indexOf('…') === -1) {
				if (possibleUri.indexOf('/') === -1) {
					possibleUri += '/';
				}

				if (!possibleUri.match(/^https?:\/\//)) {
					possibleUri = `${a.protocol}//${possibleUri}`;
				}
			}

			possibleUri = possibleUri.replace(/(^…|…$)/g, '');

			if (!possibleUri.match(/^https?:\/\//)) {
				return;
			}

			a.href = a.textContent = possibleUri;
		},

		/* LinkedIn */
		'a[href^="https://www.linkedin.com/redir/redirect?"]': a => {
			a.href = new URLSearchParams(new URL(a.href).search)?.get('url') ?? a.href;
		},

		/* Links that were processed by this bookmarklet to restore their
		 * original `A@href` after it was changed on the fly because of user
		 * interaction, e.g. by clicking on Google Ads text links or
		 * Skimlinks affiliate links. */
		'a[data-xxx-jan-original-href]': a => {
			if (a.href !== a.dataset.xxxJanOriginalHref) {
				a.href = a.dataset.xxxJanOriginalHref;
			}
		}
	};

	/**
	 * Return the given query string without the known tracking parameters.
	 */
	function cleanQueryString(queryString) {
		return new URLSearchParams(
			Array.from(new URLSearchParams(queryString))
				.filter(([key, value]) => !key.match(parameterRegexp))
		).toString();
	}

	/**
	 * Clean the query string for the given element’s `href` attribute.
	 */
	function cleanQueryStringForHrefAttribute(element) {
		try {
			const oldUrl = new URL(element.href);

			const newUrl = new URL(element.href);
			newUrl.search = cleanQueryString(oldUrl.search);

			if (oldUrl.toString() !== newUrl.toString()) {
				element.href = newUrl.toString();
			}
		} catch (e) {
		}
	}

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		/* Update the document location. */
		const oldUrl = new URL(document.location);

		const newUrl = new URL(document.location);
		newUrl.search = cleanQueryString(oldUrl.search);

		if (oldUrl.toString() !== newUrl.toString()) {
			document.defaultView.history.replaceState({}, document.title, newUrl);
		}

		/* Discard Outbrain’s event handlers by removing all the handlers
		 * defined as HTML `onSomeEvent` attributes, and then resetting
		 * the handler-less HTML. */
		document.querySelectorAll('.OUTBRAIN').forEach(element => {
			element.querySelectorAll('a').forEach(a => {
				Array.from(a.attributes).forEach(attribute => {
					if (attribute.name.match(/^on/i)) {
						a.removeAttribute(attribute.name);
					}
				});

				/* Remove placeholder/template URI parameters that look like
				 * `foo=$bar_baz$`. “Normal” tracking parameters can be added to
				 * `parameterPatterns`.
				 */
				const usp = new URLSearchParams(a.search);
				Array.from(usp).forEach(([name, value]) => {
					if (value.match(/^\$.*\$$/)) {
						usp.delete(name);
					}
				});
				a.search = usp.toString();
			});

			element.outerHTML = element.outerHTML;
		});

		/* Keep track of the original `A@href` of Google Ads text links. */
		document.querySelectorAll('[data-text-ad] a[href]').forEach(a => {
			if (a.dataset.xxxJanOriginalHref) {
				return;
			}

			/* Google Ads text links have a bunch of data attributes with possibly
			 * minified names. Just look at the values, not the names, to
			 * determine whether this is an ad whose `A@href` will change
			 * onclick/onmousedown/… */
			let isGoogleAd = Object.entries(a.dataset).some(
				([name, value]) => value.indexOf('https://www.googleadservices.com/pagead') === 0 || value.indexOf('https://www.google.com/aclk') === 0
			);

			if (isGoogleAd) {
				a.dataset.xxxJanOriginalHref = a.href;
			}
		});

		/* Circumvent link redirectors. */
		Object.entries(linkRedirectors).forEach(
			([selector, callback]) => document.querySelectorAll(selector).forEach(element => callback(element))
		);

		/* Update all A@href links in the document. */
		const allAHrefs = Array.from(document.querySelectorAll('a[href]'));

		allAHrefs
			.filter(a => a.href.match(hrefRegexpForWhichToDeleteAllParameters))
			.forEach(a => a.search = '');

		allAHrefs
			.filter(a => a.href.match(hrefRegexp))
			.forEach(a => cleanQueryStringForHrefAttribute(a));

		/* Prevent tracking attributes from being re-added (looking at you, Facebook!) */
		new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				cleanQueryStringForHrefAttribute(mutation.target);

				Object.entries(linkRedirectors).forEach(
					([selector, callback]) => {
						mutation.target.matches(selector) && callback(mutation.target)
					}
				);
			});
		}).observe(document, {
			attributes: true,
			attributeFilter: ['href'],
			subtree: true
		});

		/* Keep track of the original `A@href` of links on pages with
		 * Skimlinks. This needs to be run after all our other code that
		 * changes the `href` values, like the link redirector bypassing
		 * code, or it would undo that code’s effects.
		 *
		 * E.g. https://road.cc/content/feature/13-best-worst-and-wackiest-cycling-crowdfunders-289179
		 */
		if (typeof skimlinksAPI !== 'undefined') {
			document.querySelectorAll('a[href]').forEach(a => {
				if (a.dataset.xxxJanOriginalHref) {
					return;
				}

				a.dataset.xxxJanOriginalHref = a.href;
			});
		}

		/* Recurse for (i)frames. */
		try {
			Array.from(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(
				elem => { try { execute(elem.contentDocument) } catch (e) { } }
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}
	}

	execute(document);
})();
