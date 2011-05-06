/**
 * Make all forms use GET.
 *
 * @title Form GET
 */
(function frmget(document) {
	Array.prototype.slice.call(document.forms || document.getElementsByTagName('form')).forEach(function (form) {
		form.method = 'get';
	});

	/* Recurse for frames and iframes. */
		Array.prototype.slice.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
			frmget(elem.contentDocument);
		});
	try {
	} catch (e) {
		/* Catch exceptions for out-of-domain access, but do not do anything with them. */
	}
})(document);
