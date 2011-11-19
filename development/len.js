/**
 * Show the length of the given string.
 *
 * @title Show length
 */
(function len() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('String?');
	if (s) {
		/* To count the number of characters, we cannot rely on String.length
		 * because of astral chars. Use this code from BestieJS to deal with
		 * those:
		 * https://github.com/bestiejs/punycode.js/blob/8164242ef1/punycode.js#L99-126
		 */
		var codePoints = [], counter = 0, length = s.length, value, extra;
		while (counter < length) {
			value = s.charCodeAt(counter++);
			if ((value & 0xF800) === 0xD800) {
				extra = s.charCodeAt(counter++);
				if ((value & 0xFC00) != 0xD800 || (extra & 0xFC00) != 0xDC00) {
					alert('Illegal UTF-16 sequence, but continuing anyway.');
				}
				value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
			}
			codePoints.push(value);
		}
		var realLength = codePoints.length;

		/* To count the number of bytes, we URL-encode the string so the
		 * non-ASCII characters are encoded as sequences of %XX. We then
		 * replace those triplets by a single character, "x", and count the
		 * number of characters in the resulting string.
		 */
		var numBytes = encodeURI(s).replace(/%../g, 'x').length;

		/* Shorten the string before displaying, if necessary. */
		var maxDisplayLength = 64;
		if (realLength > maxDisplayLength) {
			var encodeUtf16 = function (value) {
				var output = '';
				if ((value & 0xF800) == 0xD800) {
					alert('Invalid UTF-16 value, but continuing anyway.');
				}
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += String.fromCharCode(value);
				return output;
			};
			s = codePoints.slice(0, maxDisplayLength / 2).map(encodeUtf16).join('')
				+ '…'
				+ codePoints.slice(realLength - maxDisplayLength / 2 + 1).map(encodeUtf16).join('');
		}

		displayString = realLength === numBytes
			? 'The number of characters in the ASCII string "' + s + '" is: '
			: 'The number of characters in the non-ASCII string "' + s + '" (' + numBytes + ' bytes) is: ';
		prompt(displayString, realLength);
	}
})();
