
const Request = require('request.libary'),
	util = require('./util.js'),
	crypto = require('crypto');

class beFrench {

	constructor() {
		this.id = 4462;
		this.host = 'http://www.hauts-de-seine.gouv.fr';
		this.cookie = {};
	}

	request() {
		return new Request(this.host);
	}

	updateCookie(res) {
		if (res) {
			let rc = res.headers('set-cookie');
			if (rc) {
				let cookie = util.parseCookies(rc);
				for (let i in cookie) {
					this.cookie[i] = cookie[i];
				}
				return true;
			}
		}
		return false;
	}

	headers() {
		let base = {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
			'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Host': 'www.hauts-de-seine.gouv.fr',
			'Pragma': 'no-cache',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
		};
		let c = util.cookieFlat(this.cookie).Cookie;
		if (c) {
			base.Cookie = c;
		}
		return base;
	}

	setup() {
		return this.request()
			.headers(this.headers())
			.get('/booking/create/' + this.id + '/').then((res) => {
				if (res.status() === 200) {
					return this.updateCookie(res);
				}
				console.log(res.status(), res.body().toString(), res.headers());
				throw new Error('wrong server response for step 0(setup) "' + res.status() + '"');
			});
	}

	accept() {
		return this.request()
			.form({
				condition: 'on',
				nextButton: 'Effectuer une demande de rendez-vous'
			})
			.headers(this.headers())
			.headers({Referer: 'http://www.hauts-de-seine.gouv.fr/booking/create/4462'})
			.post('/booking/create/' + this.id + '/0')
			.then((res) => {
				if (res.status() === 302) {
					return this.updateCookie(res);
				}
				console.log(res.status(), res.body().toString(), res.headers());
				throw new Error('wrong server response for step 1(accept) "' + res.status() + '"');
			});
	}

	options() {
		return this.request()
			.headers(this.headers())
			.headers({Referer: 'http://www.hauts-de-seine.gouv.fr/booking/create/4462'})
			.get('/booking/create/' + this.id + '/1')
			.then((res) => {
				if (res.status() === 200) {
					return this.updateCookie(res);
				}
				console.log(res.status(), res.body().toString(), res.headers());
				throw new Error('wrong server response for step 2(options) "' + res.status() + '"');
			});
	}


	result(id) {
		return this.request()
			.form({
				planning: id,
				nextButton: 'Etape suivante'
			})
			.headers(this.headers())
			.post('/booking/create/' + this.id + '/1').then((res) => {
				if (res.status() === 302) {
					this.updateCookie(res);
					return this.get();
				}
				console.log(res.status(), res.body().toString(), res.headers());
				throw new Error('wrong server response for step 3(result) "' + res.status() + '"');
			});
	}

	get() {
		return this.request()
			.headers(this.headers())
			.get('/booking/create/' + this.id + '/2').then((res) => {
				if (res.isOkay()) {
					let body = res.body().toString(),
						has = (body.match('Il n\'existe plus de plage horaire libre pour votre a demande de rendez-vous. Veuillez recommencer ultérieurement.') !== null);
					const hash = crypto.createHash('sha256');
					hash.update(body);
					let hex = hash.digest('hex');
					return {
						has: has, hex: hex
					};
				}
				console.log(res.status(), res.body().toString(), res.headers());
				throw new Error('wrong server response for step 4(result load) "' + res.status() + '"');
			});
	}

}

module.exports = beFrench;
