(function(o, undefined) {

	"use strict";

	var limitV;

	o.event.on(window, "DOMContentLoaded", onLoaded);
	function onLoaded() {
		calcLimitV();
		o.dom.scrollLite(document.body)
		new o.ScrollLite({
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
	}

})(octopus);