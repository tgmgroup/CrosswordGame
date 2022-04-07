/* eslint-env node */

/**
 * This is the requirejs configuration and top level invocation for the server
 * only. The actual code is in {@link Server}. Note that paths are relative
 * to the root of the distribution (where this script lives).
 * @module
 */

const requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname,
    nodeRequire: require,
	paths: {
		server: 'js/server',
		game: 'js/game',
		dawg: 'js/dawg',

		platform: 'js/server/ServerPlatform'
	}
});

// Server exports the mainProgam function, so simply require it and
// run it.
requirejs(['server/Server'], main => main(__dirname));

