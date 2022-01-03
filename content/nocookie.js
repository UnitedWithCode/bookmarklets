/**
 * Close the cookies/tracking/personalization permission dialog rejecting all
 * non-essential cookies and objecting to all legitimate uses.
 *
 * @title ⛔🍪⛔
 */
(function nocookies() {
	'use strict';

	/* Create a new IFRAME to get a “clean” Window object, so we can use its
	 * console. Sometimes sites (e.g. Twitter) override `console.log` and even
	 * the entire console object. `delete console.log` or `delete console`
	 * does not always work, and messing with the prototype seemed more
	 * brittle than this. */
	const console = (function () {
		let iframe = document.getElementById('xxxJanConsole');
		if (!iframe) {
			iframe = document.createElementNS('http://www.w3.org/1999/xhtml', 'iframe');
			iframe.id = 'xxxJanConsole';
			iframe.style.display = 'none';

			(document.body || document.documentElement).appendChild(iframe);
		}

		return iframe && iframe.contentWindow && iframe.contentWindow.console || {
			log: function () {}
		};
	})();

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		/**
		 * If there is an `openButtonElementOrSelector`, click the corresponding
		 * element and wait a bit before calling the `setAndSaveFunction`. If
		 * there is no such element, immediately call the function.
		 */
		function openAndWaitOrDoItNow(openButtonElementOrSelector, setAndSaveFunction) {
			const openButton = typeof openButtonElementOrSelector === 'string'
				? document.querySelector(openButtonElementOrSelector)
				: openButtonElementOrSelector;

			if (openButton) {
				console.log('nocookies: found button to open settings: ', openButtonElementOrSelector, openButton === openButtonElementOrSelector ? '' : openButton);
				openButton.click();
				setTimeout(setAndSaveFunction, 250);
			} else {
				setAndSaveFunction();
			}
		}

		/**
		 * Call the `click` function on the first element that matches the
		 * given selector.
		 */
		function tryToClick(selector) {
			const elem = document.querySelector(selector);
			if (elem) {
				console.log('nocookie: found button to click: ', elem);
				elem.click();
			}
		}


		/* -----------------------------------------------------------------
		 * Drupal’s EU Cookie Compliance (GDPR Compliance) banner <https://www.drupal.org/project/eu_cookie_compliance>
		 * ----------------------------------------------------------------- */
		tryToClick('.eu-cookie-compliance-banner .decline-button');


		/* -----------------------------------------------------------------
		 * Iubenda Cookie Solution <https://www.iubenda.com/en/cookie-solution>
		 * ----------------------------------------------------------------- */
		tryToClick('.iubenda-cs-reject-btn');


		/* -----------------------------------------------------------------
		 * TrustArc cookie banner
		 * ----------------------------------------------------------------- */
		tryToClick('#truste-consent-required');


		/* -----------------------------------------------------------------
		 * Bol.com cookie dialog
		 * ----------------------------------------------------------------- */
		tryToClick('button[data-test="consent-modal-decline-btn"].js-decline-button');


		/* -----------------------------------------------------------------
		 * Cookie-Script <https://cookie-script.com/>
		 * ----------------------------------------------------------------- */
		tryToClick('#cookiescript_reject');


		/* -----------------------------------------------------------------
		 * CookieYes/Cookie-Law-Info <https://wordpress.org/plugins/cookie-law-info/>
		 * ----------------------------------------------------------------- */
		tryToClick('#cookie_action_close_header_reject');


		/* -----------------------------------------------------------------
		 * PayPal.com cookie dialog
		 * ----------------------------------------------------------------- */
		tryToClick('#gdprCookieBanner #bannerDeclineButton');


		/* -----------------------------------------------------------------
		 * Google Funding Choices <https://developers.google.com/funding-choices>
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.fc-cta-manage-options',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				Array.from(document.querySelectorAll('.fc-preference-legitimate-interest, input[type="checkbox"][id*="egitimate"]')).forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				tryToClick('.fc-confirm-choices');
			}
		);


		/* -----------------------------------------------------------------
		 * Google’s own properties (not using their own Funding Choices…)
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'[aria-modal="true"][title*="Google"] button:first-child:not(:only-child):not([aria-haspopup="true"])',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('c-wiz div[jsaction]:first-child:not(:only-child) button').forEach(
					button => button.click()
				);

				/* Save & exit. */
				tryToClick('c-wiz form[jsaction^="submit:"] button');
			}
		);


		/* -----------------------------------------------------------------
		 * Yahoo IAB
		 * ----------------------------------------------------------------- */
		/* TODO: click the necessary buttons, too. */
		Array.from(document.querySelectorAll('input[type="checkbox"][data-toggle-type="legit"]')).forEach(
			check => check.checked = false
		);


		/* -----------------------------------------------------------------
		 * Onetrust
		 * E.g. https://www.booking.com/
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'#onetrust-pc-btn-handler',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				Array.from(document.querySelectorAll('#onetrust-consent-sdk input[type="checkbox"]')).forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				tryToClick('.onetrust-close-btn-handler');
			}
		);


		/* -----------------------------------------------------------------
		 * Didomi
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'#didomi-notice-learn-more-button',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				setTimeout(_ => tryToClick('.didomi-consent-popup-actions button:first-of-type'), 50);

				/* Save & exit. */
				setTimeout(_ => tryToClick('.didomi-consent-popup-actions button:first-of-type'), 100);
			}
		);


		/* -----------------------------------------------------------------
		 * Quantcast
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.qc-cmp2-summary-buttons button[mode="secondary"]',
			function () {
				/* Cycle through the “Partners” and “Legitimate interest” tabs. */
				document.querySelectorAll('.qc-cmp2-footer-links button').forEach(tabButton => {
					tabButton.click();

					/* Click the corresponding “REJECT ALL” or “OBJECT ALL” button. */
					document.querySelectorAll('.qc-cmp2-header-links button:nth-of-type(1)').forEach(
						/* TODO: make this language-independent, if possible */
						justSayNoButton => justSayNoButton.textContent.match(/(reject|object) all/i) && justSayNoButton.click()
					);
				});

				/* Click the “Save & exit” button. */
				setTimeout(_ => tryToClick('.qc-cmp2-footer button[mode="primary"]'), 50);
			}
		);


		/* -----------------------------------------------------------------
		 * Fandom/Wikia
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'[data-tracking-opt-in-learn-more="true"]',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('[data-tracking-opt-in-overlay="true"] input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				setTimeout(_ => tryToClick('[data-tracking-opt-in-save="true"]'), 100);
			}
		);


		/* -----------------------------------------------------------------
		 * Coolblue cookie dialog
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'button.js-cookie-settings',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('input[type="checkbox"][name="cookie_setting[]"]').forEach(check => check.checked = false);

				/* Save & exit. */
				setTimeout(_ => tryToClick('button[name="accept_cookie"][value="selection"]'), 100);
			}
		);


		/* -----------------------------------------------------------------
		 * Kunstmaan Cookie Bar <https://github.com/Kunstmaan/KunstmaanCookieBundle>
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.js-kmcc-extended-modal-button[data-target="legal_cookie_preferences"]',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('.kmcc-cookies-toggle-pp input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				tryToClick('#kmcc-accept-some-cookies');
			}
		);


		/* -----------------------------------------------------------------
		 * Stad Gent cookie consent
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'#SG-CookieConsent--TogglePreferencesButton',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('.SG-CookieConsent--checkbox').forEach(check => check.checked = false);

				/* Save & exit. */
				tryToClick('#SG-CookieConsent--SavePreferencesButton');
			}
		);


		/* -----------------------------------------------------------------
		 * Osano Cookie Consent <https://www.osano.com/cookieconsent>
		 * E.g. https://www.pelotondeparis.cc/
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.cc-btn.cc-settings',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				Array.from(document.querySelectorAll('.cc-settings-dialog input[type="checkbox"]')).forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				tryToClick('.cc-btn.cc-btn-accept-selected');
			}
		);


		/* -----------------------------------------------------------------
		 * Cybot Cookie Dialog
		 * ----------------------------------------------------------------- */
		const cybotAllowSelectionButton = document.querySelector('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection');
		if (cybotAllowSelectionButton) {
			document.querySelectorAll('.CybotCookiebotDialogBodyLevelButton').forEach(check => check.checked = false);
			cybotAllowSelectionButton.click();
		} else {
			document.querySelector('#CybotCookiebotDialogBodyButtonDecline')?.click();
		}


		/* ================================================================= */


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