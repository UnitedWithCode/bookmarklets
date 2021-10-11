/**
 * Change the video and audio speed (playback rate).
 *
 * @title Set video speed
 */
(function vidspeed() {
	"use strict";

	/* Recursively get all video and audio for the document and its sub-documents. */
	function getMedia(document) {
		let allMedia = Array.from(document.querySelectorAll('video, audio'));

		/* Find video and audio inside shadow DOMs. */
		const notRegularHtmlElementsSelector = 'a,abbr,address,area,article,aside,audio,b,base,bdi,bdo,blockquote,body,br,button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,details,dfn,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,link,main,map,mark,math,math *,menu,meta,meter,nav,noscript,object,ol,optgroup,option,output,p,param,picture,pre,progress,q,rp,rt,ruby,s,samp,script,section,select,slot,small,source,span,strong,style,sub,summary,sup,svg,svg *,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,u,ul,var,video,wbr'
			.split(',')
			.map(s => `:not(${s})`)
			.join('');

		Array.from(document.querySelectorAll(notRegularHtmlElementsSelector))
			.filter(elem => elem.shadowRoot)
			.forEach(elem => allMedia = allMedia.concat(Array.from(elem.shadowRoot.querySelectorAll('video, audio'))));

		/* Recurse for frames and iframes. */
		try {
			Array.from(
				document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')
			).forEach(
				elem => allMedia = allMedia.concat(getMedia(elem.contentDocument))
			);
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}

		return allMedia;
	}

	let allMedia = getMedia(document);

	/* Make sure there are media elements. */
	if (!allMedia.length) {
		return;
	}

	/* Try to get the parameter string from the bookmarklet/search query.
	 * If there is no parameter, prompt the user. */
	let s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	if (s === '') {
		s = prompt('Specify the speed (playback rate) as a number, with 1 being 100%. For example, 1.25 = 125%, 0.75 = 75%, and 1 = 100%.', allMedia[0].playbackRate);
	}

	if (s) {
		allMedia.forEach(media => media.playbackRate = s);
	}
})();
