// Icelandic
// @see https://www.liquisearch.com/scrabble_letter_distributions/icelandic
define(["editions/_Scrabble"], Scrabble => {

  const scrabble = Scrabble();

  scrabble.bag = [
    { letter: "A", score: 1, count: 10 },
    { letter: "B", score: 6, count: 1 },
    { letter: "D", score: 4, count: 2 },
    { letter: "E", score: 1, count: 6 },
    { letter: "F", score: 3, count: 3 },
    { letter: "G", score: 2, count: 4 },
    { letter: "H", score: 3, count: 2 },
    { letter: "I", score: 1, count: 8 },
    { letter: "J", score: 5, count: 1 },
    { letter: "K", score: 2, count: 3 },
    { letter: "L", score: 2, count: 3 },
    { letter: "M", score: 2, count: 3 },
    { letter: "N", score: 1, count: 8 },
    { letter: "O", score: 3, count: 3 },
    { letter: "P", score: 8, count: 1 },
    { letter: "R", score: 1, count: 7 },
    { letter: "S", score: 1, count: 6 },
    { letter: "T", score: 1, count: 5 },
    { letter: "U", score: 1, count: 6 },
    { letter: "V", score: 3, count: 2 },
    { letter: "X", score: 10, count: 1 },
    { letter: "Y", score: 7, count: 1 },
    { letter: "Á", score: 4, count: 2 },
    { letter: "Æ", score: 5, count: 1 },
    { letter: "É", score: 6, count: 1 },
    { letter: "Í", score: 4, count: 2 },
    { letter: "Ð", score: 2, count: 5 },
    { letter: "Ó", score: 6, count: 1 },
    { letter: "Ö", score: 7, count: 1 },
    { letter: "Ú", score: 8, count: 1 },
    { letter: "Ý", score: 9, count: 1 },
    { letter: "Þ", score: 4, count: 1 },
    { score: 0, count: 2 }
  ];

  return scrabble;
});
