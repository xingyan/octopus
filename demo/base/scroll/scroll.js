(function(o, undefined) {

	"use strict";

	o.event.on(window, "DOMContentLoaded", onLoaded);

	function onLoaded() {
		new o.ScrollLite({
			el: "scroll_container",
			scrollEl: "scroll_scrollContainer",
			distance: 400,
			isTransform: true
		});
	}
})(octopus);