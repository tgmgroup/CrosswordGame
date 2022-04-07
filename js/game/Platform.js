/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd */

define('game/Platform', () => {

	/**
	 * A pure abstraction isolating platform details from the rest of
	 * the code. The main purpose is to allow common code to run on
	 * both browser and server, but it also provides an abstraction of
	 * the server-side database (unused on the browser).
	 */
	class Database {
		/**
		 * @param {string} id will be used as the name of a directory
		 * under the requirejs root
		 * @param {string} type identifier used to distinguish keys
		 * relevant to this DB from other data that may be co-located
		 * @abstract
		 */
		constructor(id, type) {}
		
		/**
		 * Promise to get a list of keys in the DB
		 * @return {Promise} resolves to a list of key names
		 * @abstract
		 */
		keys() {}

		/**
		 * Promise to set a key value
		 * @param {string} key the entry key
		 * @param {object} data the data to store
		 * @return {Promise} resolves to undefined
		 * @abstract
		 */
		set(key, data) {}

		/**
		 * Promise to get a key value
		 * @param {string} key the entry key
		 * @param {Object[]} classes list of classes passed to Fridge.thaw
		 * @return {Promise} resolves to the key value
		 * @abstract
		 */
		get(key, classes) {}

		/**
		 * Remove a key and all associated data
		 * @param {string} key the entry key
		 * @return {Promise} resolves to undefined
		 * @abstract
		 */
		rm(key) {}
	}

	/**
	 * Abstraction of platform features.
	 */
	class Platform {

		/**
		 * Emit the given event for handling by the platform's event system
		 * @param {string} event name of event to emit
		 * @param {object[]} args array of arguments to pass to the
		 * event handler
		 * @abstract
		 */
		static trigger(event, args) {}

		/**
		 * Get the given file resource.
		 * @param {string} path the path to the resource, relative to
		 * the resource root (the html root on a browser, or the file
		 * system on server)
		 * @abstract
		 */
		static getResource(path) {}

		/**
		 * @callback Platform~bestMoveCallback
		 * @param {(Move|string)} best move found so far, or error string
		 */

		/**
		 * If available, find the best play. This is used to abstract
		 * the best play controller from the rest of the server code,
		 * so it can be invoked either directly or asynchronously. It
		 * should be a NOP on a browser.
		 * @param {Game} game the Game
		 * @param {Tile[]} rack rack in the form of a simple list of Tile
		 * @param {string?} dictionary name of dictionary to override the
		 * game dictionary
		 * @param {Platform~bestMoveCallback} cb accepts a best play whenever a new
		 * one is found, or a string containing a message
		 * @return {Promise} Promise that resolves when all best moves
		 * have been tried
		 * @abstract
		 */
		static findBestPlay(game, rack, cb, dictionary) {}

		/**
		 * Platform-independent interface to i18n translation.
		 * This is modelled on jQuery i18n, so you can simply use
		 * Platform.i18n in the same way as you'd used $.i18n
		 * @abstract
		 */
		static i18n() {}
	}

	/**
	 * Implementation of {@link Database} for this platform
	 * @member {Database}
	 * @memberof Platform
	 */
	Platform.Database = Database;

	return Platform;
});
