let http = require('http');

let options = {
	method: 'GET',
	hostname: [
		'www',
		'hauts-de-seine',
		'gouv',
		'fr'
	].join('.'),
	path: '/' + ([
		'booking',
		'create',
		'4462',
		''
	].join('/')),
	headers: {}
};
console.log(options);
let req = http.request(options, (res) => {
	let chunks = [];

	res.on('data', (chunk) => {
		chunks.push(chunk);
	});

	res.on('end', () => {
		let body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

req.end();
