/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env node */

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

requirejs(['test/TestRunner', 'game/Edition', 'game/Tile', 'game/Rack', 'game/Player', 'game/Game', 'game/Move', 'game/Turn', 'game/findBestPlay'], (TestRunner, Edition, Tile, Rack, Player, Game, Move, Turn, findBestPlay) => {
    let tr = new TestRunner('Game');
    let assert = tr.assert;

	tr.addTest('basics', () => {
		return new Game('English_Scrabble', 'Oxford_5000').create()
		.then(game => {
			const player1 = new Player('player1', "rhino", true);
			game.addPlayer(player1);
			const player2 = new Player('player2', "soffit", false);
			game.addPlayer(player2);
			const player3 = new Player('player3', "clean", false);
			game.addPlayer(player3);
			game.whosTurnKey = player2.key;

			player3.rack.empty();
			player1.score = 1;
			player2.score = 2;
			player3.score = 3;

			let player = game.getPlayer();
			assert.equal(player.key, player2.key);
			player = game.getPlayer(player2.key);
			assert.equal(player.key, player2.key);
			assert.equal(game.nextPlayer().key, player3.key);
			assert.equal(game.previousPlayer().key, player1.key);
			assert.equal(game.nextPlayer().key, player3.key);
			assert.equal(game.winningScore(), 3);
			assert.equal(game.getPlayerWithNoTiles().key, player3.key);
		});
	});

	tr.addTest('autoplay', () => {
		return new Game('English_Scrabble', 'Oxford_5000').create()
		.then(game => {
			let player = new Player('test', "cheese", true);
			game.addPlayer(player);
			// Override the random rack
			player.rack.empty();
			player.rack.addTile(new Tile({letter:'I', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:null, isBlank:true, score:0}));
			game.whosTurnKey = player.key;
			return game.autoplay();
		})

		.then(() => new Game('Tiny', 'Oxford_5000').create())
		.then(game => {
			let player = new Player('test', "zebra", true);
			game.addPlayer(player);
			game.whosTurnKey = player.key;
			player.rack.empty();
			player.rack.addTile(new Tile({letter:'A', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'B', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'C', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'D', isBlank:false, score:1}));
			return game.autoplay(player);
		})

		.then(() => new Game('Tiny', 'SOWPODS_English').create())
		.then(game => {
			let player = new Player('test', "isolate", true);
			game.addPlayer(player);
			game.whosTurnKey = player.key;
			player.rack.empty();
			player.rack.addTile(new Tile({letter:' ', isBlank:true, score:1}));
			player.rack.addTile(new Tile({letter:undefined, isBlank:true, score:1}));
			player.rack.addTile(new Tile({letter:null, isBlank:true, score:1}));
			return game.autoplay(player);
		});
	});
	
	tr.addTest('swap', () => {
		return new Game('Tiny', 'Oxford_5000').create()
		.then(game => {
			const player = new Player('test1', "tree", false);
			game.addPlayer(player);
			player.rack.empty();
			player.rack.addTile(new Tile({letter:'A', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'B', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'C', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'D', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'E', isBlank:false, score:1}));
			game.addPlayer(new Player('test2', "van", false));
			// Leave 5 tiles in the bag - enough to swap
			game.letterBag.getRandomTiles(
				game.letterBag.remainingTileCount() - 5);
			game.whosTurnKey = player.key;
			return game.loadBoard('| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n' +
								  '| | | | | | | | | | | |\n')
			.then(game => game.swap([
				new Tile({letter:'A', isBlank:false, score:1}),
				new Tile({letter:'C', isBlank:false, score:1}),
				new Tile({letter:'E', isBlank:false, score:1})
			]))
			.then(turn => {
				//console.log('TURN', turn);
				assert(turn instanceof Turn);
				assert.equal(turn.type, 'swap');
				assert.equal(turn.playerKey, player.key);
				//console.log(turn);
				let newt = turn.replacements;
				assert.equal(3, newt.length);
			});
		});
	});

	tr.addTest('makeMove', () => {
		const W = new Tile({letter:'W', isBlank:false, score:1, col: 7, row: 7});
		const O = new Tile({letter:'O', isBlank:false, score:1, col: 8, row: 7});
		const R = new Tile({letter:'R', isBlank:false, score:1, col: 9, row: 7});
		const D = new Tile({letter:'D', isBlank:false, score:1, col: 10, row: 7});
		const move = new Move({
			placements: [ W, O, R, D ],
			words: [ { word: 'WORD', score: 99 }],
			score: 99
		});
		return new Game('Tiny', 'Oxford_5000').create()
		.then(game => {
			const player = new Player('test1', "ambulance", false);
			game.addPlayer(player);
			player.rack.empty();
			player.rack.addTile(new Tile({letter:'W', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'O', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'R', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'D', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'X', isBlank:false, score:1}));
			const player2 = new Player('test2', "felt", false);
			game.addPlayer(player2);
			// Leave 3 tiles in the bag - not enough to refill the rack
			game.letterBag.getRandomTiles(
				game.letterBag.remainingTileCount() - 3);
			game.whosTurnKey = player.key;
			return game.makeMove(move)
			.then(turn => {
				console.log(turn);
				assert(turn instanceof Turn);
				assert.equal(turn.type, 'move');
				assert.equal(turn.playerKey, player.key);
				assert.equal(turn.nextToGoKey, player2.key);
				assert.equal(turn.score, move.score);
				assert.deepEqual(turn.words, move.words);
				assert.deepEqual(turn.placements, move.placements);
				let newt = turn.replacements;
				assert.equal(3, newt.length);
			});
		});
	});

	tr.addTest('lastMove', () => {
		return new Game('Tiny', 'Oxford_5000').create()
		.then(game => {
			const player = new Player('test1', "mud", false);
			game.addPlayer(player);
			player.rack.empty();
			player.rack.addTile(new Tile({letter:'W', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'O', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'R', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'D', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'X', isBlank:false, score:1}));
			const player2 = new Player('test2', "climax", false);
			game.addPlayer(player2);
			// Empty the bag
			game.letterBag.getRandomTiles(
				game.letterBag.remainingTileCount());
			game.whosTurnKey = player.key;
			const move = new Move({
				placements: [
					new Tile({letter:'X', isBlank:false, score:1, col: 6, row: 7}),
					new Tile({letter:'W', isBlank:false, score:1, col: 7, row: 7}),
					new Tile({letter:'O', isBlank:false, score:1, col: 8, row: 7}),
					new Tile({letter:'R', isBlank:false, score:1, col: 9, row: 7}),
					new Tile({letter:'D', isBlank:false, score:1, col: 10, row: 7})
				],
				words: [ { word: 'XWORD', score: 99 }],
				score: 99
			});
			return game.makeMove(move)
			.then(turn => {
				//console.log(turn);
				assert(turn instanceof Turn);
				assert.equal(turn.type, 'move');
				assert.equal(turn.playerKey, player.key);
				assert.equal(turn.nextToGoKey, player2.key);
				assert.equal(turn.score, 99);
				assert.deepEqual(turn.words, move.words);
				assert.deepEqual(turn.placements, move.placements);
				let newt = turn.replacements;
				assert.equal(0, newt.length);
			});
		});
	});

	tr.addTest('confirm', () => {
		return new Game('Tiny', 'Oxford_5000').create()
		.then(game => {
			const player = new Player('test1', "cloud", false);
			game.addPlayer(player);
			player.rack.empty();
			player.rack.addTile(new Tile({letter:'X', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Y', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Z', isBlank:false, score:1}));
			const player2 = new Player('test2', "squirrel", false);
			game.addPlayer(player2);
			player2.rack.empty();
			// Empty the bag
			game.letterBag.getRandomTiles(
				game.letterBag.remainingTileCount());
			game.whosTurnKey = player.key;
			return game.confirmGameOver('Game over')
			.then(turn => {
				console.log(turn);
				assert(turn instanceof Turn);
				assert.equal(turn.type, 'Game over');
				assert.equal(turn.playerKey, player.key);
				assert.equal(turn.emptyPlayerKey, player2.key);
				assert(!turn.nextToGoKey);
				assert.equal(turn.score[player.key], -3);
				assert.equal(turn.score[player2.key], 3);
			});
		});
	});

	tr.addTest('badChallenge', () => {
		// Implicitly tests pass
		const game = new Game('Tiny', 'Oxford_5000');
		return game.create()
		.then(game => {
			const player = new Player('test1', "river", true);
			game.addPlayer(player);
			const player2 = new Player('test2', "footpad", true);
			game.addPlayer(player2);
			game.whosTurnKey = player.key;
			return game.autoplay()
			.then(() => game.challenge())
			.then(turn => {
				//console.log(turn);
				assert(turn instanceof Turn);
				assert.equal(turn.type, 'challenge-failed');
				assert.equal(turn.playerKey, player2.key);
				assert.equal(turn.nextToGoKey, player.key);
			});
		});
	});

	tr.addTest('goodChallenge', () => {
		const game = new Game('Tiny', 'Oxford_5000');
		return game.create()
		.then(() => {
			const player = new Player('test1', "cavalier", true);
			game.addPlayer(player);
			player.rack.empty();
			player.rack.addTile(new Tile({letter:'X', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Y', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Z', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Z', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Y', isBlank:false, score:1}));
			const player2 = new Player('test2', "roundhead", true);
			game.addPlayer(player2);
			game.whosTurnKey = player.key;
			const move = new Move({
				placements: [
					new Tile({letter:'X', isBlank:false, score:1, col: 7, row: 7}),
					new Tile({letter:'Y', isBlank:false, score:1, col: 8, row: 7}),
					new Tile({letter:'Z', isBlank:false, score:1, col: 9, row: 7}),
					new Tile({letter:'Z', isBlank:false, score:1, col: 10, row: 7}) ],
				words: [ { word: 'XYZZ', score: 99 }],
				score: 99
			});
			return game.makeMove(move)
			.then(() => game.challenge())
			.then(turn => {
				//console.log(turn);
				assert(turn instanceof Turn);
				assert.equal(turn.type, 'challenge-won');
				assert.equal(turn.playerKey, player.key);
				assert.equal(turn.nextToGoKey, player2.key);
				assert.equal(turn.challengerKey, player2.key);
				assert.equal(turn.score, -99);
			});
		});
	});

	tr.addTest('takeBack', () => {
		const game = new Game('Tiny', 'Oxford_5000');
		return game.create()
		.then(() => {
			const player = new Player('test1', "psychologist", true);
			game.addPlayer(player);
			player.rack.empty();
			player.rack.addTile(new Tile({letter:'X', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Y', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Z', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Z', isBlank:false, score:1}));
			player.rack.addTile(new Tile({letter:'Y', isBlank:false, score:1}));
			const player2 = new Player('test2', "chatter", true);
			game.addPlayer(player2);
			game.whosTurnKey = player.key;
			// Player 0 makes a move
			const move = new Move({
				placements: [
					new Tile({letter:'X', isBlank:false, score:1, col: 7, row: 7}),
					new Tile({letter:'Y', isBlank:false, score:1, col: 8, row: 7}),
					new Tile({letter:'Z', isBlank:false, score:1, col: 10, row: 7}) ],
				words: [ { word: 'XYZ', score: 3 }],
				score: 3
			});
			return game.makeMove(move)
			// Player 0 takes their move back
			.then(() => game.takeBack('took-back'))
			.then(turn => {
				//console.log(turn);
				assert(turn instanceof Turn);
				assert.equal(turn.type, 'took-back');
				assert.equal(turn.playerKey, player.key);
				assert.equal(turn.nextToGoKey, player.key);
				// challengerKey isn't relevant, but is set so check it
				assert.equal(turn.challengerKey, player2.key);
				assert.equal(turn.score, -3);
			});
		});
	});

	tr.addTest('challengeLastMoveGood', () => {
		const game = new Game('Tiny', 'Oxford_5000');
		const player1 = new Player('test1', "sheep", false);
		const player2 = new Player('test2', "wolf", false);

		return game.create()
		.then(game => {
			game.addPlayer(player1);
			player1.rack.empty();
			player1.rack.addTile(new Tile({letter:'X', isBlank:false, score:1}));
			player1.rack.addTile(new Tile({letter:'Y', isBlank:false, score:1}));
			player1.rack.addTile(new Tile({letter:'Z', isBlank:false, score:1}));
			game.addPlayer(player2);
			game.whosTurnKey = player1.key;

			// Empty the bag
			game.letterBag.getRandomTiles(
				game.letterBag.remainingTileCount());

			const move = new Move({
				placements: [
					new Tile({letter:'X', isBlank:false, score:1, col: 6, row: 7}),
					new Tile({letter:'Y', isBlank:false, score:1, col: 7, row: 7}),
					new Tile({letter:'Z', isBlank:false, score:1, col: 8, row: 7}),
				],
				words: [ { word: 'XYZ', score: 3 }],
				score: 3
			});
			
			return game.makeMove(move);
		})
		// Player 0 has played, so issue a challenge on behalf of player 2
		.then(() => game.challenge())
		.then(turn => {
			//console.log(turn);
			assert(turn instanceof Turn);
			assert.equal(turn.type, 'challenge-won');
			assert.equal(turn.playerKey, player1.key);
			assert.equal(turn.nextToGoKey, player2.key);
			assert.equal(turn.score, -3);
			assert.equal(turn.replacements.length, 0);
			assert.equal(turn.challengerKey, player2.key);
			assert(!turn.emptyPlayer);
		});
	});

	tr.addTest('challengeLastMoveBad', () => {
		const game = new Game('Tiny', 'Oxford_5000');
		const player1 = new Player('test1', "crime", false);
		const player2 = new Player('test2', "punishment", false);

		return game.create()
		.then(game => {
			game.addPlayer(player1);
			player1.rack.empty();
			player1.rack.addTile(new Tile({letter:'A', isBlank:false, score:1}));
			player1.rack.addTile(new Tile({letter:'R', isBlank:false, score:1}));
			player1.rack.addTile(new Tile({letter:'T', isBlank:false, score:1}));
			game.addPlayer(player2);
			game.whosTurnKey = player1.key;

			// Empty the bag
			game.letterBag.getRandomTiles(
				game.letterBag.remainingTileCount());

			const move = new Move({
				placements: [
					new Tile({letter:'A', isBlank:false, score:1, col: 6, row: 7}),
					new Tile({letter:'R', isBlank:false, score:1, col: 7, row: 7}),
					new Tile({letter:'T', isBlank:false, score:1, col: 8, row: 7}),
				],
				words: [ { word: 'ART', score: 3 }],
				score: 3
			});
			return game.makeMove(move)
			// Player 0 has played, so issue a challenge on behalf of player 1
			.then(() => game.challenge())
			.then(turn => {
				//console.log(turn);
				assert(turn instanceof Turn);
				assert.equal(turn.type, 'challenge-failed');
				assert.equal(turn.playerKey, player2.key);
				assert.equal(turn.nextToGoKey, player1.key);
				// Still empty!
				assert.equal(turn.emptyPlayerKey, player1.key);
			});
		});
	});


	tr.run();
});

