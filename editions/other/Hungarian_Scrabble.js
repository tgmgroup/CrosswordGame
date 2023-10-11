define('editions/Hungarian_Scrabble', ['editions/_Scrabble'], (Scrabble) => {

	const scrabble = Scrabble();
	
	scrabble.bag = [
		{ score: 0, count: 2 },
		{ letter: 'A', score: 1, count: 6 },
		{ letter: 'E', score: 1, count: 6 },
		{ letter: 'K', score: 1, count: 6 },
		{ letter: 'T', score: 1, count: 5 },
		{ letter: 'Á', score: 1, count: 4 },
		{ letter: 'L', score: 1, count: 4 },
		{ letter: 'N', score: 1, count: 4 },
		{ letter: 'R', score: 1, count: 4 },
		{ letter: 'I', score: 1, count: 3 },
		{ letter: 'M', score: 1, count: 3 },
		{ letter: 'O', score: 1, count: 3 },
		{ letter: 'S', score: 1, count: 3 },
		{ letter: 'B', score: 2, count: 3 },
		{ letter: 'D', score: 2, count: 3 },
		{ letter: 'G', score: 2, count: 3 },
		{ letter: 'Ó', score: 2, count: 3 },
		{ letter: 'É', score: 3, count: 3 },
		{ letter: 'H', score: 3, count: 2 },
		{ letter: 'SZ', score: 3, count: 2 },
		{ letter: 'V', score: 3, count: 2 },
		{ letter: 'F', score: 4, count: 2 },
		{ letter: 'GY', score: 4, count: 2 },
		{ letter: 'J', score: 4, count: 2 },
		{ letter: 'Ö', score: 4, count: 2 },
		{ letter: 'P', score: 4, count: 2 },
		{ letter: 'U', score: 4, count: 2 },
		{ letter: 'Ü', score: 4, count: 2 },
		{ letter: 'Z', score: 4, count: 2 },
		{ letter: 'C', score: 5, count: 1 },
		{ letter: 'Í', score: 5, count: 1 },
		{ letter: 'NY', score: 5, count: 1 },
		{ letter: 'CS', score: 7, count: 1 },
		{ letter: 'Ő', score: 7, count: 1 },
		{ letter: 'Ő', score: 7, count: 1 },
		{ letter: 'Ú', score: 7, count: 1 },
		{ letter: 'Ű', score: 7, count: 1 },
		{ letter: 'LY', score: 8, count: 1 },
		{ letter: 'ZS', score: 8, count: 1 },
		{ letter: 'TY', score: 10, count: 1 }
	];
	
	return scrabble;
});
