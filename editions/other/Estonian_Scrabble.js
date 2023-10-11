define('editions/Estonian_Scrabble', ['editions/_Scrabble'], (Scrabble) => {

	const scrabble = Scrabble();
	
	scrabble.bag = [
		{ score: 0, count: 2 },
		{ letter: 'E', score: 1, count: 9 },
		{ letter: 'A', score: 1, count: 10 },
		{ letter: 'I', score: 1, count: 9 },
		{ letter: 'O', score: 1, count: 5 },
		{ letter: 'N', score: 2, count: 4 },
		{ letter: 'R', score: 2, count: 2 },
		{ letter: 'T', score: 1, count: 7 },
		{ letter: 'L', score: 1, count: 5 },
		{ letter: 'S', score: 1, count: 8 },
		{ letter: 'U', score: 1, count: 5 },
		{ letter: 'D', score: 2, count: 4 },
		{ letter: 'G', score: 3, count: 2 },
		{ letter: 'B', score: 4, count: 1 },
		{ letter: 'M', score: 2, count: 4 },
		{ letter: 'P', score: 4, count: 2 },
		{ letter: 'F', score: 4, count: 1 },
		{ letter: 'H', score: 4, count: 2 },
		{ letter: 'V', score: 3, count: 2 },
		{ letter: 'K', score: 1, count: 5 },
		{ letter: 'J', score: 4, count: 2 },
		{ letter: 'Z', score: 10, count: 1 },
		{ letter: 'Š', score: 10, count: 1 },
		{ letter: 'Ž', score: 10, count: 1 },
		{ letter: 'Õ', score: 5, count: 2 },
		{ letter: 'Ä', score: 5, count: 2 },
		{ letter: 'Ö', score: 6, count: 2 },
		{ letter: 'Ü', score: 5, count: 2 }
	];
	
	return scrabble;
});
	   
