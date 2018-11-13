
const Request = require('request.libary'),
	util = require('./util.js'),
	crypto = require('crypto');

class beFrench {

	constructor() {
		this.id = 4462;
		this.host = 'http://www.hauts-de-seine.gouv.fr';
		this.cookie = {
			xtvrn: '$488932$',
			xtan488932: '-',
			xtant488932: 1
		};
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
			'Origin': 'http://www.hauts-de-seine.gouv.fr',
			'Pragma': 'no-cache',
			'Referer': 'http://www.hauts-de-seine.gouv.fr/booking/create/4462',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
		};
		let c = util.cookieFlat(this.cookie).Cookie;
		if (c) {
			base.Cookie = c;
		}
		return base;
	}

	session() {
		return this.request()
			.headers(this.headers())
			.get('/booking/create/' + this.id + '/').then((res) => {
				if (res.status() === 200) {
					return this.updateCookie(res);
				}
				console.log(res.status(), res.body().toString(), res.headers());
				throw new Error('wrong server response for step -1 "' + res.status() + '"');
			});
	}

	accept() {
		return this.request()
			.form({
				condition: 'on',
				nextButton: 'Effectuer une demande de rendez-vous'
			})
			.headers(this.headers())
			.post('/booking/create/' + this.id + '/0')
			.then((res) => {
				if (res.status() === 302) {
					return this.updateCookie(res);
				}
				console.log(res.status(), res.body().toString(), res.headers());
				throw new Error('wrong server response for step 0 "' + res.status() + '"');
			});
	}

	has(id) {
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
				throw new Error('wrong server response for step 1 "' + res.status() + '"');
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
				throw new Error('wrong server response for step 2 "' + res.status() + '"');
			});
	}

}

module.exports = beFrench;
