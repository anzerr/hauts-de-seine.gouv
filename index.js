
const Client = require('./src/client.js'),
	util = require('./src/util.js');

class Main {

	constructor() {}

	test(key) {
		let o = [], p = Promise.resolve();
		for (let i in key) {
			((k) => {
				const c = new Client();
				p = p.then(() => {
					return c.accept();
				}).then(() => {
					return c.has('7070');
				}).then((res) => {
					o.push([k, res]);
					return o;
				});
			})(key[i]);
		}
		return p;
	}

	watch() {
		this.test(['7070', '7487', '7488']).then((res) => {
			util.log('value', [new Date().getTime(), res]);
			setTimeout(() => {
				this.watch();
			}, 30 * 1000);
		}).catch((e) => {
			util.log('error', e);
		});
	}

}

new Main().watch();
