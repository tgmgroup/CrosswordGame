/*@preserve Copyright (C) 2015-2021 Crawford Currie http://c-dot.co.uk license MIT*/
/* eslint-env node, mocha */

if (typeof requirejs === "undefined") {
	throw new Error(__filename + " is not runnable stand-alone");
}

/**
 * Common code for running mocha tests.
 * Look at one of the UnitTest* files to understand the pattern.
 * node.js: Command-line parameters are interpreted as names of tests to run.
 * '*' wildcard.
 * --keep will prevent tmp files from being deleted
 */
define(["mocha", "chai"], (maybeMocha, chai) => {

	if (typeof Mocha === "undefined")
		Mocha = maybeMocha; // node.js

	class TestRunner extends Mocha {

		constructor(title, debug) {
			super({ reporter: (typeof global === "undefined") ? 'html' : 'spec' });
			this.chai = chai;
			this.assert = chai.assert;
			if (typeof title === "string")
				this.suite.title = title;
			this.debug = debug;

			this.matches = [];
			this.keepTmpFiles = false;
			if (typeof process !== "undefined") {
				for (let i = 2; i < process.argv.length; i++) {
					const arg = process.argv[i];
					if (arg === "--keep")
						this.keepTmpFiles = true;
					else {
						const expr = arg.replace('*', '.*');
						this.matches.push(new RegExp(`^${expr}$`));
					}
				}
			}
		}

		/**
		 * True if the two paths are the same
		 */
		static samePath(a, b) {
			if (a.length !== b.length) return false;
			for (let i = 0; i < a.length; i++)
				if (a[i] !== b[i])
					return false;
			return true;
		}

		/**
		 * Promise to get fs
		 * node.js only
		 */
		Fs() {
			return new Promise(
				(resolve, reject) =>
				requirejs(["fs"], fs => resolve(fs.promises), reject));
		}

		/**
		 * Return a promise that resolves to the path to a temporary
		 * file for the test to use
		 * node.js only
		 */
		tmpFile(name) {
			if (this.tmpFileDir)
				return Promise.resolve(`${this.tmpFileDir}/${name}`);
			
			return this.Fs()
			.then(Fs => Fs.mkdtemp("/tmp/TestRunner-"))
			.then(path => {
				this.tmpFileDir = path;
				if (!this.keepTmpFiles) {
					this.suite.afterEach("testdirs", () => {
						this.rm_rf(this.tmpFileDir);
					});
				}
				return `${this.tmpFileDir}/${name}`;
			});
		}

		/**
		 * Remove temp file directory
		 * node.js only
		 */
		rm_rf(path) {
			return this.Fs()
			.then(Fs => {
				return Fs.readdir(path)
				.then(files => {
					let promises = [];
					files.forEach(file => {
						var curPath = `${path}/${file}`;
						promises.push(
							this.Fs()
							.then(Fs => Fs.lstat(curPath))
							.then(stat => {
								if (stat.isDirectory())
									return this.rm_rf(curPath);
								else
									return Fs.unlink(curPath);
							}));
					});
					promises.push(Fs.rmdir(path));
					return Promise.all(promises);
				});
			});
		}

		/**
		 * Alternative for addTest to defuse test
		 */
		deTest() {
		}

		/**
		 * Add the given test
		 */
		addTest(title, fn) {
			if (this.matches.length > 0) {
				let matched = false;
				for (let i = 0; i < this.matches.length; i++) {
					if (this.matches[i].test(title)) {
						matched = true;
						break;
					}
				}
				if (!matched)
					return;
			}

			let test = new Mocha.Test(title, () => fn.call(this));
			this.suite.addTest(test);
			test.timeout(10000);
		}

		run() {
			return new Promise(resolve => {
				this.timeout(10000);
				super.run(resolve);
			});
		}
	}

	return TestRunner;
});
