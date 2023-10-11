// Classic Scrabble
define('editions/English_Scrabble', ['editions/_Scrabble'], (Scrabble) => {

	const scrabble = Scrabble();
	
	scrabble.bag = [
		{ score: 0, count: 2 },
		{ letter: 'A', score: 1, count: 9 },
		{ letter: 'B', score: 3, count: 2 },
		{ letter: 'C', score: 3, count: 2 },
		{ letter: 'D', score: 2, count: 4 },
		{ letter: 'E', score: 1, count: 12 },
		{ letter: 'F', score: 4, count: 2 },
		{ letter: 'G', score: 2, count: 3 },
		{ letter: 'H', score: 4, count: 2 },
		{ letter: 'I', score: 1, count: 9 },
		{ letter: 'J', score: 8, count: 1 },
		{ letter: 'K', score: 5, count: 1 },
		{ letter: 'L', score: 1, count: 4 },
		{ letter: 'M', score: 3, count: 2 },
		{ letter: 'N', score: 1, count: 6 },
		{ letter: 'O', score: 1, count: 8 },
		{ letter: 'P', score: 3, count: 2 },
		{ letter: 'Q', score: 10, count: 1 },
		{ letter: 'R', score: 1, count: 6 },
		{ letter: 'S', score: 1, count: 4 },
		{ letter: 'T', score: 1, count: 6 },
		{ letter: 'U', score: 1, count: 4 },
		{ letter: 'V', score: 4, count: 2 },
		{ letter: 'W', score: 4, count: 2 },
		{ letter: 'X', score: 8, count: 1 },
		{ letter: 'Y', score: 4, count: 2 },
		{ letter: 'Z', score: 10, count: 1 }
	];
	
	return scrabble;
});
