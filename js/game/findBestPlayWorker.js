/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd, node */
const requirejs = require('requirejs');

requirejs.config({
	baseUrl: `${__dirname}/../..`,
    nodeRequire: require,
	paths: {
		game: `js/game`,
		dawg: `js/dawg`,
		platform: 'js/server/ServerPlatform'
	}
});

/**
 * Worker thread for findBestPlay. This allows the best play to be
 * found asynchronously, without blocking the main thread, so we can
 * time it out if necessary. See also findBestPlayController.js
 */
requirejs(['worker_threads', 'game/Fridge', 'game/Game', 'game/findBestPlay'], (threads, Fridge, Game, findBestPlay) => {

	const info = Fridge.thaw(threads.workerData, Game.classes);

	/**
	 * Note that the game is NOT a Game, but just the fields. If methods
	 * need to be called on it, then game/Fridge can be used to freeze-thaw.
	 */
	findBestPlay(info.game, info.rack,
				 bestPlay => threads.parentPort.postMessage(
					 Fridge.freeze(bestPlay)),
				info.dictionary)

	.then(() => {
		threads.parentPort.postMessage('findBestPlayWorker is exiting');
	})

	.catch(e => {
		threads.parentPort.postMessage('findBestPlayWorker error', e);
		throw e;
	});
});
