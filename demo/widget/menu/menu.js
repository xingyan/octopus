(function(o, undefined) {

	"use strict";

	var testData = [{
			name: "pc-browser",
			id: "pc-browser",
			children: [
				{
					name: "opera",
					id: "browser-opera",
					children: [
						{ name: "opera-mini", id: "opera-mini" },
						{ name: "opera-blink", id: "opera-blink", href: "http://www.baidu.com/", children: [
							{ name: "opera-15", id: "opera-15" },
							{ name: "opera-next", id: "opera-next" }
						]},
						{ name: "opera-tradition", id: "opera-tradition", children: [
							{ name: "opera-12", id: "opera-12" },
							{ name: "opera-11", id: "opera-11" },
							{ name: "opera-10", id: "opera-10" },
							{ name: "opera-9", id: "opera-9" },
							{ name: "opera-8", id: "opera-8" },
							{ name: "opera-7", id: "opera-7" }
						]}
					]
				},
				{
					name: "chrome",
					id: "chrome",
					children: [
						{ name: "chrome-30", id: "chrome-30" },
						{ name: "chrome-28", id: "chrome-28" },
						{ name: "chrome-27", id: "chrome-27" },
						{ name: "chrome-26", id: "chrome-26" }
					]
				}
			]
		}, {
			name: "mobile-browser",
			id: "mobile-browser",
			children: [
				{ name: "ucweb", id: "ucweb" },
				{ name: "liebao", id: "liebao" },
				{ name: "opera", id: "mobile-opera", children: [
					{ name: "opera-7.8", id: "opera-7.8" },
					{ name: "opera-7.2", id: "opera-7.2" },
					{ name: "opera-7.0", id: "opera-7.0" },
					{ name: "opera-6.0", id: "opera-6.0" }
				]}
			]
	}];

	o.event.on(window, "ready", onReady, false);

	var menu = new o.Widget.Menu({
		data: testData,
		showAnimateType: "fade",
		animateType: "fold"
	});

	menu.on("menu-item-ontap", function(option) {
		console.log(option);
	});

	function onReady() {
		o.event.on($("input")[0], "click", toggleMenu, false);
	}

	function toggleMenu(e) {
		var t = o.dom.toggleClass(this, "active");
		if(t) {
			!menu.active ? menu.render("menu_container") : menu.show();
		 } else {
			menu.hidden();
		}
	}

})(octopus);