
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
					return c.session();
				}).then(() => {
					return c.accept();
				}).then(() => {
					return c.has(k);
				}).then((res) => {
					o.push([k, res]);
					return o;
				});
			})(key[i]);
		}
		return p;
	}

	watch(i) {
		let key = ['7070', '7487', '7488'][i % 3]; // could no them all at once
		console.log(key);
		this.test([key]).then((res) => {
			util.log('value', [new Date().getTime(), res]);
		}).catch((e) => {
			console.log(e);
			util.log('value', [new Date().getTime(), {}]);
			util.log('error', e.toString());
		}).then(() => {
			setTimeout(() => {
				this.watch(i + 1);
			}, 10 * 1000);
		});
	}

}

new Main().watch(0);
