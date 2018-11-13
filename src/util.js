
const fs = require('fs');

class Util {

	constructor() {
		this.streams = {};

		const exitHandler = (options, exitCode) => {
			if (options.cleanup) {
				for (let i in this.streams) {
					if (this.streams[i] && this.streams[i].end) {
						this.streams[i].end();
					}
				}
			}
			if (exitCode || exitCode === 0) {
				console.log(exitCode);
			}
			if (options.exit) {
				process.exit();
			}
		};

		process.on('exit', exitHandler.bind(null, {cleanup:true}));
		process.on('SIGINT', exitHandler.bind(null, {exit:true}));
		process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
		process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
		process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
	}

	parseCookies(rc) {
		let list = {};
		if (Array.isArray(rc)) {
			for (let i in rc) {
				let a = this.parseCookies(rc[i]);
				for (let x in a) {
					list[x] = a[x];
				}
			}
			return list;
		}
		rc.split(';').forEach((cookie) => {
			let parts = cookie.split('=');
			list[parts.shift().trim()] = decodeURI(parts.join('='));
		});
		return list;
	}

	cookieFlat(rc) {
		let o = '';
		for (let i in rc) {
			o += i + '=' + rc[i] + '; ';
		}
		return {Cookie: o};
	}

	stream(key) {
		if (this.streams[key]) {
			return this.streams[key];
		}
		return this.streams[key] = fs.createWriteStream('./data/' + key + '.log', {flags: 'a'});
	}

	log(key, d) {
		let j = JSON.stringify(d) + '\n';
		console.log(key, j);
		this.stream(key).write(j);
	}

}

module.exports = new Util();
