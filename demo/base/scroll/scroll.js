(function(o, undefined) {

	"use strict";

	var limitV,
		scrollLite;

	o.event.on(window, "ready", onLoaded);
	o.event.on(window, "ortchange", calcLimitV)
	function onLoaded() {
		calcLimitV();
		o.dom.scrollLite(document.body)
		scrollLite = new o.ScrollLite({
			el: "scroll_container",
			scrollEl: "scroll_scrollContainer",
			distance: 400,
			isTransform: true,
			maxV: 50,
			limitV: limitV,
			swipeVelocity: 0.1
		});
	}

	function calcLimitV() {
		limitV = o.dom.getWidth("scroll_scrollContainer") - o.dom.getWidth("scroll_container");
		scrollLite && (scrollLite.limitV = limitV, true);
	}

})(octopus);