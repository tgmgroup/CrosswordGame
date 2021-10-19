// Lexulous
define('editions/English_Lexulous', () => {

	const LAYOUT = [
		'M______T',
		'__d___d_',
		'_d___t__',
		'____D___',
		'___D____',
		'__t___D_',
		'_d___D__',
		'T___d__T'
	];

	const BAG = [
		{ score: 0, count: 2 },
		{ letter: 'A', count: 8, score: 1 },
		{ letter: 'B', count: 2, score: 4 },
		{ letter: 'C', count: 2, score: 4 },
		{ letter: 'D', count: 3, score: 2 },
		{ letter: 'E', count: 11, score: 1 },
		{ letter: 'F', count: 2, score: 5 },
		{ letter: 'G', count: 2, score: 2 },
		{ letter: 'H', count: 2, score: 5 },
		{ letter: 'I', count: 8, score: 1 },
		{ letter: 'J', count: 1, score: 8 },
		{ letter: 'K', count: 1, score: 6 },
		{ letter: 'L', count: 3, score: 1 },
		{ letter: 'M', count: 2, score: 4 },
		{ letter: 'N', count: 5, score: 1 },
		{ letter: 'O', count: 7, score: 1 },
		{ letter: 'P', count: 2, score: 4 },
		{ letter: 'Q', count: 1, score: 12 },
		{ letter: 'R', count: 5, score: 1 },
		{ letter: 'S', count: 3, score: 1 },
		{ letter: 'T', count: 5, score: 2 },
		{ letter: 'U', count: 3, score: 1 },
		{ letter: 'V', count: 2, score: 5 },
		{ letter: 'W', count: 2, score: 5 },
		{ letter: 'X', count: 1, score: 8 },
		{ letter: 'Y', count: 3, score: 5 },
		{ letter: 'Z', count: 1, score: 12 }
	];
	
	return {
		layout: LAYOUT,
		bag: BAG,
		rackCount: 8,
		swapCount: 7,
		bonuses: { 7: 40, 8: 50 } 
	};
});
