
const Client = require('./src/client.js'),
	util = require('./src/util.js'),
	fs = require('fs'),
	{promisify} = require('util');

class Main {

	constructor() {}

	test(key) {
		let o = [], p = Promise.resolve();
		for (let i in key) {
			(async (k) => {
				const c = new Client();
				await c.setup();
				await util.wait(1000);
				await c.accept();
				await util.wait(1000);
				await c.options();
				await util.wait(1000);
				let res = await c.result(k);
				await promisify(fs.writeFile)('./data/' + res.hash, res.body);
				o.push([k, res]);
				return o;
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
			util.log('value', [new Date().getTime(), [[key, {error: e.toString()}]]]);
			util.log('error', e.toString());
		}).then(() => {
			setTimeout(() => {
				this.watch(i + 1);
			}, 60 * 1000);
		});
	}

}

new Main().watch(0);
