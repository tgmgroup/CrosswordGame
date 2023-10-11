/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env node, mocha */

/**
 * Test first play on an empty board.
 */
const requirejs = require('requirejs');

requirejs.config({
	baseUrl: '..',
    nodeRequire: require,
	paths: {
		game: 'js/game',
		dawg: 'js/dawg',
		platform: 'js/server/ServerPlatform'
	}
});

requirejs(['test/TestRunner', 'game/Edition', 'game/Tile', 'game/Player', 'game/Game', 'game/Rack', 'game/findBestPlay'], (TestRunner, Edition, Tile, Player, Game, Rack, findBestPlay) => {
    let tr = new TestRunner('first play');
    let assert = tr.assert;

	tr.addTest('first play English Scrabble', () => {
		let bestPlay;

		return new Game('English_Scrabble', 'SOWPODS_English').create()
		.then(game => {
			game.addPlayer(new Player('test', "anonymous", false));
			return game.loadBoard(
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n');
		})

		.then(game => findBestPlay(
			game, new Rack(
				[
					new Tile({letter:'A', isBlank:false, score:1}),
					new Tile({letter:'E', isBlank:false, score:1}),
					new Tile({letter:'I', isBlank:false, score:1}),
					new Tile({letter:'O', isBlank:false, score:1}),
					new Tile({letter:'U', isBlank:false, score:1}),
					new Tile({letter:' ', isBlank:true, score:0}),
					new Tile({letter:' ', isBlank:true, score:0})
				]).tiles(),
			play => {
				console.log(play);
				bestPlay = play;
			}))

		.then(() => {
			assert.equal(bestPlay.words[0].word, 'DOULEIA');
			assert.equal(bestPlay.words[0].score, 62);
			let tile = bestPlay.placements[0];
			assert(tile instanceof Tile);
			assert.equal(tile.letter, 'D');
			assert.equal(tile.score, 0);
			assert(tile.isBlank);
		});
	});

	tr.addTest('first play English WWF', () => {
		let bestPlay;

		return new Game('English_WWF', 'SOWPODS_English').create()
		.then(game => {
			game.addPlayer(new Player('test', "slight", false));
			return game.loadBoard(
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n' +
				'| | | | | | | | | | | | | | | |\n');
		})

		.then(game => findBestPlay(
			game, new Rack([
				new Tile({letter:'Z', isBlank:false, score:1}),
				new Tile({letter:'E', isBlank:false, score:1}),
				new Tile({letter:'B', isBlank:false, score:1}),
				new Tile({letter:'U', isBlank:false, score:1})
			]).tiles(),
			play => bestPlay = play))

		.then(() => {
			assert.equal(bestPlay.words[0].word, 'ZEBU');
			assert.equal(bestPlay.words[0].score, 8);
		});
	});

	tr.run();
});

