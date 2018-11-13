
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

	accept() {
		return this.request()
			.form({
				condition: 'on',
				nextButton: 'Effectuer une demande de rendez-vous'
			}).post('/booking/create/' + this.id + '/0').then((res) => {
				if (res.status() === 302) {
					return this.updateCookie(res);
				}
				throw new Error('wrong server response');
			});
	}

	has(id) {
		return this.request()
			.form({
				planning: id,
				nextButton: 'Etape suivante'
			})
			.headers(util.cookieFlat(this.cookie))
			.post('/booking/create/' + this.id + '/1').then((res) => {
				if (res.status() === 302) {
					this.updateCookie(res);
					return this.get();
				}
				throw new Error('wrong server response');
			});
	}

	get() {
		return this.request()
			.headers(util.cookieFlat(this.cookie))
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
				throw new Error('wrong server response');
			});
	}

}

module.exports = beFrench;
