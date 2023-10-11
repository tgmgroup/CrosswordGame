/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env node */

/**
 * This is the node.js implementation of game/Platform. There is an
 * implementation for the browser, too, in js/browser/Platform.js
 */
define('platform', [
	'events', 'fs', 'proper-lockfile', 'node-gzip', 'get-user-locale', 'path',
	'game/Platform', 'game/Fridge', 'game/Platform'
], (
	Events, fs, Lock, Gzip, Locale, Path, Platform, Fridge
) => {

	const Fs = fs.promises;
	const emitter = new Events.EventEmitter();

	/**
	 * Simple file database implementing {@link Database} for use
	 * server-side, where data is stored in
	 * files named the same as the key. There are some basic assumptions here:
	 * 1. Callers will filter the set of keys based on their requirements
	 * 2. Keys starting with . are forbidden
	 * 3. Key names must be valid file names
 	 */
	class FileDatabase extends Platform.Database {

		/**
		 * @param {string} id will be used as the name of a directory under
		 * the requirejs root to store game files in.
		 * @param {string} type will be used as the extension on file names
		 */
		constructor(id, type) {
			super(id, type);
			this.directory = requirejs.toUrl(id);
			this.type = type;
			this.re = new RegExp(`\\.${type}$`);
			this.locks = {};
		}

		/** See {@link Database#keys} for documentation */
		keys() {
			return Fs.readdir(this.directory)
			.then(list =>
				  list.filter(f => this.re.test(f))
				  .map(fn => fn.replace(this.re, '')));
		}

		/** See {@link Database#set} for documentation */
		set(key, data) {
			if (/^\./.test(key))
				throw Error(`Invalid DB key ${key}`);
			const fn = Path.join(this.directory, `${key}.${this.type}`);
			const s = JSON.stringify(Fridge.freeze(data), null, 1);
			return Fs.access(fn)
			.then(acc => {
				return Lock.lock(fn) // file exists
				.then(release => Fs.writeFile(fn, s)
					  .then(() => release()));
			})
			.catch(e => Fs.writeFile(fn, s)); // file does not exist
		}

		/** See {@link Database#get} for documentation */
		get(key, classes) {
			const fn = Path.join(this.directory, `${key}.${this.type}`);
/*			return Lock.lock(fn)
			.then(release => Fs.readFile(fn)
				  .then(data => release()
						.then(() => {
							console.log(`Unlocked ${fn}`);
							return Fridge.thaw(JSON.parse(data), classes);
							})));*/
			// Really should lock for read, but it causes issues when
			// restarting after a server shutdown so let's not bother.
			return Fs.readFile(fn)
			.then(data => {
				return Fridge.thaw(JSON.parse(data), classes);
			});
		}

		/** See {@link Database#rm} for documentation */
		rm(key) {
			return Fs.unlink(Path.join(this.directory, `${key}.${this.type}`));
		}
	}

	/**
	 * Partial implementation of jquery i18n to support server-side
	 * string translations using the same data files as browser-side.
	 * Language files will be located by looking up the path for
	 * `./i18n/en.json`
	 */
	class I18N {
		/**
		 * @param {string} lang Language to translate to
		 */
		constructor(lang) {

			// Recurse up the path to find the i18n directory,
			// identified by the end path i18n/en.json
			function findLangPath(path, lang) {
				const f = Path.join(path, 'i18n', 'en.json');
				return Fs.stat(f)
				.then(() => path)
				.catch(e => {
					if (path.length === 0)
						return undefined;
					return findLangPath(Path.dirname(path), lang);
				});
			}

			// process.argv[1] has the path to server.js
			const path = Path.dirname(process.argv[1]);
			let langdir, langfile;
			findLangPath(path, lang)
			.then(path => {
				langdir = Path.join(path, 'i18n');
				//console.log(`Langdir ${langdir}`);
				// Try the full locale e.g. 'en-US'
				langfile = Path.join(langdir, `${lang}.json`);
				//console.log(`Trying ${langfile}`);
				return Fs.readFile(langfile);
			})
			.catch(e => {
				//console.log(e);
				// Try the first part of the locale i.e. 'en' from 'en-US'
				langfile = Path.join(langdir, `${lang.split('-')[0]}.json`);
				//console.log(`Trying ${langfile}`);
				return Fs.readFile(langfile);
			})
			.catch(e => {
				//console.log(e);
				// Fall back to 'en'
				langfile = Path.join(langdir, 'en.json');
				//console.log(`Trying ${langfile}`);
				return Fs.readFile(langfile);
			})
			.then(buffer => {
				this.data = JSON.parse(buffer.toString());
				// Use lookup() to make sure it works
				console.log(this.lookup([/*i18n*/'Strings from $1', langfile]));
			});
		}

		/**
		 * Implement `$.i18n()`
		 */
		lookup(args) {
			let s = args[0];
			if (this.data && typeof this.data[s] !== 'undefined')
				s = this.data[s];
			// TODO: support PLURAL
			return s.replace(
				/\$(\d+)/g,
				(m, index) => args[index]);
		}
	}

	/**
	 * Implementation of {@link Platform} for use in node.js.
	 * See a{@link FileDatabase} of the `Platform.Database` implementation,
	 * and {@link I18N} for the `Platform.i18n` implementation.
	 * {@link module:game/findBestPlay} is used to implement `findBestPlay`.
	 * @implements Platform
	 */
	class ServerPlatform extends Platform {
		/** See {@link Platform#trigger} for documentation */
		static trigger(e, args) {
			emitter.emit(e, args);
		}

		/** See {@link Platform#getResource} for documentation */
		static getResource(path) {
			return Fs.readFile(path)
			.then(data => {
				// Is it a zip file? Header is 10 bytes
				// see https://tools.ietf.org/html/rfc1952.html
				if (data[0] === 0x1f
					&& data[1] === 0x8b // magic number
					&& data[2] === 0x08) { // DEFLATE
					// This is a far from thorough analysis of the header,
					// but given that the only binary files we deal with
					// are gzip format, it's going to work for us.
					return Gzip.ungzip(data);
				}
				return data;
			});
		}

		/** See {@link Platform#findBestPlay} for documentation */
		static findBestPlay() {
			return new Promise(resolve => {
				// game/findBestPlay will findBestPlay in this thread
				// game/findBestPlayController will findBestPlay in
				// a worker thread
				requirejs(['game/findBestPlayController'], findBestPlay => {
					findBestPlay.apply(null, arguments)
					.then(() => resolve());
				});
			});
		}

		/** See {@link Platform#i18n} for documentation */
		static i18n() {
			return ServerPlatform.I18N.lookup(arguments);
		}
	}

	ServerPlatform.I18N = new I18N(Locale.getUserLocale());
	
    ServerPlatform.Database = FileDatabase;

	return ServerPlatform;
});
