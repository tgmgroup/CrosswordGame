define('editions/German_Scrabble', ['editions/_Scrabble'], (Scrabble) => {

	const scrabble = Scrabble();

	scrabble.bag = [
		{ score: 0, count: 2 },
 		{ letter: 'E', score: 1, count: 15 },
		{ letter: 'N', score: 1, count: 9 },
		{ letter: 'S', score: 1, count: 7 },
		{ letter: 'I', score: 1, count: 6 },
		{ letter: 'R', score: 1, count: 6 },
		{ letter: 'T', score: 1, count: 6 },
		{ letter: 'U', score: 1, count: 6 },
		{ letter: 'A', score: 1, count: 5 },
		{ letter: 'D', score: 1, count: 4 },
		
		{ letter: 'H', score: 2, count: 4 },
		{ letter: 'G', score: 2, count: 3 },
		{ letter: 'L', score: 2, count: 3 },
		{ letter: 'O', score: 2, count: 3 },
		
		{ letter: 'M', score: 3, count: 4 },
		{ letter: 'B', score: 3, count: 2 },
		{ letter: 'W', score: 3, count: 1 },
		{ letter: 'Z', score: 3, count: 1 },
		
		{ letter: 'C', score: 4, count: 2 },
		{ letter: 'F', score: 4, count: 2 },
		{ letter: 'K', score: 4, count: 2 },
		{ letter: 'P', score: 4, count: 1 },
		
		{ letter: 'Ä', score: 6, count: 1 },
		{ letter: 'J', score: 6, count: 1 },
		{ letter: 'Ü', score: 6, count: 1 },
		{ letter: 'V', score: 6, count: 1 },
		
		{ letter: 'Ö', score: 8, count: 1 },
		{ letter: 'X', score: 8, count: 1 },
		
		{ letter: 'Q', score: 10, count: 1 },
		{ letter: 'Y', score: 10, count: 1 }
	];

	return scrabble;
});
