var o = octopus;
var wait = function (ms) {
	return new o.Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve(ms);
		}, ms)
	});
}

/**
 * Normal use
 */
var startTime = Date.now();
wait(1000).then(function (ms) {
	console.log('wait after ' + (Date.now() - startTime) + ' ms');
	return wait(500);
}).then(function (ms) {
	console.log('wait after ' + (Date.now() - startTime) + ' ms');
})


