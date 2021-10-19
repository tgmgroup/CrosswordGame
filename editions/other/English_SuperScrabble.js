// Super Scrabble
define('editions/English_SuperScrabble', () => {

	// Centre 15x15 of the board is the same as Scrabble
	const LAYOUT = [
		'M___d__T__d',
		'_d___d__D__',
		'__t___t__D_',
		'___D______T',
		'd___D__d___',
		'_d___D__q__',
		'__t___D__t_',
		'T___d__T__d',
		'_D___q__D__',
		'__D___t__D_',
		'd__T___d__Q'
	];

	// Tile distribution is almost - but not quite - double that
	// of Scrabble
	const BAG = [
		{ score: 0, count: 2 },
		{ letter: 'E', score: 1, count: 24 },
		{ letter: 'A', score: 1, count: 16 },
		{ letter: 'I', score: 1, count: 13 },
		{ letter: 'O', score: 1, count: 15 },
		{ letter: 'N', score: 1, count: 13 },
		{ letter: 'R', score: 1, count: 13 },
		{ letter: 'T', score: 1, count: 15 },
		{ letter: 'L', score: 1, count: 7 },
		{ letter: 'S', score: 1, count: 10 },
		{ letter: 'U', score: 1, count: 7 },
		{ letter: 'D', score: 2, count: 8 },
		{ letter: 'G', score: 2, count: 5 },
		{ letter: 'B', score: 3, count: 4 },
		{ letter: 'C', score: 3, count: 6 },
		{ letter: 'M', score: 3, count: 6 },
		{ letter: 'P', score: 3, count: 4 },
		{ letter: 'F', score: 4, count: 4 },
		{ letter: 'H', score: 4, count: 5 },
		{ letter: 'V', score: 4, count: 3 },
		{ letter: 'W', score: 4, count: 4 },
		{ letter: 'Y', score: 4, count: 4 },
		{ letter: 'K', score: 5, count: 2 },
		{ letter: 'J', score: 8, count: 2 },
		{ letter: 'X', score: 8, count: 2 },
		{ letter: 'Q', score: 10, count: 2 },
		{ letter: 'Z', score: 10, count: 2 }
	];

	return {
		layout: LAYOUT,
		bag: BAG,
		swapCount: 7,
		rackCount: 7,
		bonuses: { 7: 50 }
	};
});
