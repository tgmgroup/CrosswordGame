define('editions/Czech_Scrabble', ['editions/_Scrabble'], (Scrabble) => {

	const scrabble = Scrabble();

	scrabble.bag = [
		{ score: 0, count: 2 },
		{ letter: 'A', score: 1, count: 5 },
		{ letter: 'Á', score: 2, count: 2 },
		{ letter: 'B', score: 3, count: 2 },
		{ letter: 'C', score: 2, count: 3 },
		{ letter: 'Č', score: 4, count: 1 },
		{ letter: 'D', score: 1, count: 3 },
		{ letter: 'Ď', score: 8, count: 1 },
		{ letter: 'E', score: 1, count: 5 },
		{ letter: 'É', score: 3, count: 2 },
		{ letter: 'Ě', score: 3, count: 2 },
		{ letter: 'F', score: 5, count: 1 },
		{ letter: 'G', score: 5, count: 1 },
		{ letter: 'H', score: 2, count: 3 },
		{ letter: 'I', score: 1, count: 4 },
		{ letter: 'Í', score: 2, count: 3 },
		{ letter: 'J', score: 2, count: 2 },
		{ letter: 'K', score: 1, count: 3 },
		{ letter: 'L', score: 1, count: 3 },
		{ letter: 'M', score: 2, count: 3 },
		{ letter: 'N', score: 1, count: 5 },
		{ letter: 'Ň', score: 6, count: 1 },
		{ letter: 'O', score: 1, count: 6 },
		{ letter: 'Ó', score: 7, count: 1 },
		{ letter: 'P', score: 1, count: 3 },
		{ letter: 'R', score: 1, count: 3 },
		{ letter: 'Ř', score: 4, count: 2 },
		{ letter: 'S', score: 1, count: 4 },
		{ letter: 'Š', score: 4, count: 2 },
		{ letter: 'T', score: 1, count: 4 },
		{ letter: 'Ť', score: 7, count: 1 },
		{ letter: 'U', score: 2, count: 3 },
		{ letter: 'Ú', score: 5, count: 1 },
		{ letter: 'Ů', score: 4, count: 1 },
		{ letter: 'V', score: 1, count: 4 },
		{ letter: 'X', score: 10, count: 1 },
		{ letter: 'Y', score: 2, count: 2 },
		{ letter: 'Ý', score: 4, count: 2 },
		{ letter: 'Z', score: 2, count: 2 },
		{ letter: 'Ž', score: 4, count: 1 }
	];
	
	return scrabble;
});
