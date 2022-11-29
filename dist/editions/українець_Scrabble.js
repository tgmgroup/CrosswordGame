// українець
// @see https://en.wikipedia.org/wiki/Scrabble_letter_distributions#Ukranian
define(["editions/_Scrabble"], Scrabble => {

  const scrabble = Scrabble();

  scrabble.bag = [
    { letter: "'", score: 10, count: 1 },
    { letter: "Є", score: 8, count: 1 },
    { letter: "І", score: 1, count: 5 },
    { letter: "Ї", score: 6, count: 1 },
    { letter: "А", score: 1, count: 8 },
    { letter: "Б", score: 4, count: 2 },
    { letter: "В", score: 1, count: 4 },
    { letter: "Г", score: 4, count: 2 },
    { letter: "Д", score: 2, count: 3 },
    { letter: "Е", score: 1, count: 5 },
    { letter: "Ж", score: 6, count: 1 },
    { letter: "З", score: 4, count: 2 },
    { letter: "И", score: 1, count: 7 },
    { letter: "Й", score: 5, count: 1 },
    { letter: "К", score: 2, count: 4 },
    { letter: "Л", score: 2, count: 3 },
    { letter: "М", score: 2, count: 4 },
    { letter: "Н", score: 1, count: 7 },
    { letter: "О", score: 1, count: 10 },
    { letter: "П", score: 2, count: 3 },
    { letter: "Р", score: 1, count: 5 },
    { letter: "С", score: 2, count: 4 },
    { letter: "Т", score: 1, count: 5 },
    { letter: "У", score: 3, count: 3 },
    { letter: "Ф", score: 8, count: 1 },
    { letter: "Х", score: 5, count: 1 },
    { letter: "Ц", score: 6, count: 1 },
    { letter: "Ч", score: 5, count: 1 },
    { letter: "Ш", score: 6, count: 1 },
    { letter: "Щ", score: 8, count: 1 },
    { letter: "Ь", score: 5, count: 1 },
    { letter: "Ю", score: 7, count: 1 },
    { letter: "Я", score: 4, count: 2 },
    { letter: "Ґ", score: 10, count: 1 },
    { score: 0, count: 2 }
  ];

  return scrabble;
});
