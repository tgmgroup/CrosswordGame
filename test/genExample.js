const requirejs = require('requirejs');

requirejs.config({
	baseUrl: '.',
    nodeRequire: require,
	paths: {
		game: 'js/game',
		dawg: 'js/dawg',
		platform: 'js/server/ServerPlatform'
	}
});

requirejs(['platform', 'game/Edition', 'game/Game', 'game/Player'], (Platform, Edition, Game, Player) => {

	const db = new Platform.Database('games', 'game');
	Edition.load('English_Scrabble')
	.then(edition => {
		return new Game(edition.name, 'Oxford_5000')
		.create();
	})
	.then(game => game.onLoad(db))
	.then(game => {
		game.addPlayer(new Player('Player', "shuggie", false));
		return game.loadBoard('| | | | | | | | | | | | | | |\n' +
							  '|W|O|R|D|S| | | | |C| | | | |\n' +
							  '|I| | | |C| | | | |U| | | | |\n' +
							  '|T| | |F|R|I|E|N|D|S| | | | |\n' +
							  '|H| | | |A| | | | |T| | | | |\n' +
							  '| | | | |B| | | |B|O|A|R|D| |\n' +
							  '| | | | |B| | | | |M| | |I| |\n' +
							  '|L|E|X|U|L|O|U|S| | | | |C| |\n' +
							  '| | | | |E| | | | | | | |T| |\n' +
							  '| | | | | | | | | | | | |I| |\n' +
							  '| | | | | | | | | | | | |O| |\n' +
							  '| | | | | | | | | | | | |N| |\n' +
							  '| | | | | | | | | | | | |A| |\n' +
							  '| | | | | | | |S|E|R|V|E|R| |\n' +
							  '| | | | | | | | | | | | |Y| |\n');
	})
	.then(game => game.save())
	.then(game => console.log("Saved ", game));
});

