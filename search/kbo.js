/**
 * Search for a company number / VAT number in the Belgian company registry
 * “Crossroads Bank for Enterprises”: https://kbopub.economie.fgov.be/
 *
 * If the selected text or parameter does not look like a VAT number, look it
 * up as the company name.
 *
 * @title KBO
 */
(function kbo(document) {
	'use strict';

	/* Try to get the parameter string from the bookmarklet/search query.
	 * Fall back to the current text selection, if any. If those options
	 * both fail, prompt the user. */
	let s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	/**
	 * Get the active text selection, diving into frames and
	 * text controls when necessary and possible.
	 */
	function getActiveSelection(document) {
		if (!document || typeof document.getSelection !== 'function') {
			return '';
		}

		if (!document.activeElement) {
			return document.getSelection() + '';
		}

		let activeElement = document.activeElement;

		/* Recurse for FRAMEs and IFRAMEs. */
		try {
			if (
				typeof activeElement.contentDocument === 'object'
				&& activeElement.contentDocument !== null
			) {
				return getActiveSelection(activeElement.contentDocument);
			}
		} catch (e) {
			return document.getSelection() + '';
		}

		/* Get the selection from inside a text control. */
		if (typeof activeElement.value === 'string') {
			if (activeElement.selectionStart !== activeElement.selectionEnd) {
				return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
			}

			return activeElement.value;
		}

		/* Get the normal selection. */
		return document.getSelection() + '';
	}

	let isSelectedText = false;

	if (s === '') {
		if ((s = getActiveSelection(document))) {
			isSelectedText = true;
		} else {
			s = prompt('Please enter the Belgian company number / VAT number:');
		}
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection(document) + '$2');
	}

	if (s) {
		let matches;
		if ((matches = s.match(/.*\b(BE)?\s?(0?\d{3})[ .-]?(\d{3})[ .-]?(\d{3})\b.*/i))) {
			/* This looks like a Belgian company number. */
			location = 'https://kbopub.economie.fgov.be/kbopub/toonondernemingps.html?ondernemingsnummer='
				+ encodeURIComponent(('0' + matches[2]).slice(-4) + matches[3] + matches[4]);
		} else {
			let normalizedS = s.trim().replaceAll(/ (bus|boîte|boite) /gi, 'b').replaceAll(/\s+/g, ' ');
			if (
				(matches = normalizedS.match(/(?<street>.{3,63}[^0-9]),? (?<number>\d+[^,]{0,5})[,/-]? (?<postalCode>[1-9]\d\d\d)\b/))
				|| (matches = normalizedS.match(/(?<number>\d+[^,]{0,5}),? (?<street>.{3,63}[^0-9]),? (?<postalCode>[1-9]\d\d\d)\b/))
			) {
				/* This looks like a Belgian address. */
				location = `https://kbopub.economie.fgov.be/kbopub/zoekadresform.html?filterEnkelActieve=true&_filterEnkelActieve=on&actionLU=Zoek&postcod1=${encodeURIComponent(matches.groups.postalCode)}&postgemeente1=&straatgemeente1=${encodeURIComponent(matches.groups.street)}&huisnummer=${encodeURIComponent(matches.groups.number)}`;
				console.log('Yay! ', matches.groups);
				console.log('→ ', location);
				return;
			}

			if (isSelectedText && s.length > 512) {
				alert('No Belgian company number / VAT number or easily-parsable postal address was found in the text you selected. If you select a shorter text, it will be used to look up the company by name.');
				return;
			}

			location = 'https://kbopub.economie.fgov.be/kbopub/zoeknaamfonetischform.html?oudeBenaming=true&_oudeBenaming=on&pstcdeNPRP=&postgemeente1=&ondNP=true&_ondNP=on&ondRP=true&_ondRP=on&rechtsvormFonetic=ALL&vest=true&_vest=on&filterEnkelActieve=true&_filterEnkelActieve=on&actionNPRP=Zoek&searchWord='
				+ encodeURIComponent(s);
		}
	}
})(document);
