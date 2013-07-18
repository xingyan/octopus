(function(o, undefined) {

	"use strict";

	o.event.on(window, "DOMContentLoaded", onLoaded);

	function onLoaded() {
		new o.ScrollLite("scroll_container", "scroll_scrollContainer");
	}
})(octopus);