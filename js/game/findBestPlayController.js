/* See README.md at the root of this distribution for copyright and
   license information */

/**
 * This is the controller side of a best play thread. It provides 
 * the same API as findBestPlay(). See also findBestPlayWorker.js
 */
define('game/findBestPlayController', ['worker_threads', 'game/Square', 'game/Fridge', "game/Game"], (threads, Square, Fridge, Game) => {

	/**
	 * Interface should be the same as for findBestPlay.js so they
	 * can be switched in and out for debug.
	 * @param {Game} game game to analyse
	 * @param {string[]} array of useable letters, ' ' means blank tile
	 * @param {function} listener fn() taking a string or a best play
	 */
	function findBestPlayController(game, letters, listener, dictionary) {
		return new Promise((resolve, reject) => {
			const worker = new threads.Worker(
				requirejs.toUrl('js/game/findBestPlayWorker.js'),
				{
					workerData: Fridge.freeze({
						game: game,
						rack: letters,
						dictionary: dictionary
					})
				});

			// Apply the game time limit
			let timer;
			if (game.secondsPerPlay > 0) {
				timer = setTimeout(() => {
					console.log('findBestPlay timed out');
					worker.terminate();
				}, game.secondsPerPlay * 1000);
			}

			// Pass worker messages on to listener
			worker.on('message', data => {
				listener(Fridge.thaw(data, Game.classes));
			});

			worker.on('error', e => {
				if (timer)
					clearTimeout(timer);
				reject(e);
			});

			worker.on('exit', (code) => {
				if (timer)
					clearTimeout(timer);
				if (code !== 0)
					console.log(`findBestPlayWorker reported code ${code}`);
				resolve();
			});
		});
	}

	return findBestPlayController;
});
