/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/**
 * Command-line invocation of the Valett word corpus analyser
 * Based on code from https://github.com/jmlewis/valett
 *
 * `node bin/valett.js` will tell you how to use it.
 * @module
 */
import getopt from "posix-getopt";
import { promises as Fs } from "fs";
import path from "path";
import { Valett } from "../src/design/Valett.js";

const config = { // default config for Scrabble(R)
  weights: {
    frequency: .34,
    frequencyByLength: .33,
    entropy: .33
  },
  frequencyByLengthWeights: [
    0, 50, 25, 5, 2.5, 1.25, 0.625, 25, 12.5, 2.5, 1.25
  ],
  entropyWeights: [ .5, .5 ],
  minPoints: 1,
  maxPoints: 10,
  tileCount: 98
};

const DESCRIPTION = [
  "USAGE",
  `\tnode ${path.relative(".", process.argv[1])} [options] <wordfile>`,
  "\nOPTIONS",
  "\t-c, --config - configuration file",
  "\nDESCRIPTION",
  "\tAnalyse a set of words. Output is in the form of a bag definition",
  "\tfor use in an Edition.",
  "\tOptional config is a JSON file allowing you to override the following:",
  "\t{",
  "\t  minPoints: minimum point value for a tile.",
  `\t    Default: ${config.minPoints}`,
  "\t  maxPoints: maximum point value for a tile.",
  `\t    Default: ${config.maxPoints}`,
  "\t  tileCount: number of tiles in the initial bag, not including blanks.",
  `\t    Default: ${config.tileCount}`,
  "\t  weights: relative weighting of frequency, frequency by length, and",
  "\t    entropy when calculating letter values. Fields should sum to 1.",
  `\t    Default: ${JSON.stringify(config.weights)}`,
  "\t  frequencyByLengthWeights: relative value of a letter\"s occurrence",
  "\t    in words of different length. For example, in Scrabble",
  "\t    it is particularly valuable for a letter to appear in 2,",
  "\t    3, 7 and 8 tile words.",
  `\t    Default: ${JSON.stringify(config.frequencyByLengthWeights)}`,
  "\t  entropyWeights: relative value of the ease of transitioning into",
  "\t    a letter (how evenly the transition probabilities toward",
  "\t    a letter are distributed) and out of a letter. For example,",
  "\t    Q has a low entropy out since its transition probability",
  "\t    distribution is highly peaked at U.",
  `\t    Default: [${config.entropyWeights}]`,
  "\t}"
].join("\n");

const go_parser = new getopt.BasicParser("c:(config)", process.argv);

const options = {};
let option;
while ((option = go_parser.getopt())) {
  switch (option.option) {
  default: console.debug(DESCRIPTION); process.exit();
  case 'c': options.config = option.optarg; break;
  }
}
  
const infile = process.argv[go_parser.optind()];

let premonition;
if (options.config) {
  // Read config from file (JSON)
  console.log(`Config from ${options.config}`);
  premonition = Fs.readFile(options.config)
  .then(json => config = JSON.parse(json));
}
else
  premonition = Promise.resolve();

premonition
.then(() => {
  if (!infile)
    throw Error("No wordfile");

  console.log(`Analyse ${infile}`);
  console.log(config);

  return Fs.readFile(infile);
})
.then(data => {
  const words = data.toString().toUpperCase().split(/\r?\n/);
  // Extract the alphabet from the corpus
  const chars = {};
  words.forEach(
    w => w.split("").forEach(
      c => chars[c] = true));
  const letters = Object.keys(chars);
  letters.sort();

  const v = new Valett(words, letters);
  const values = v.analyze(config.maxPoints - config.minPoints,
                           config.weights,
                           config.frequencyByLengthWeights,
                           config.entropyWeights);
  let sum;
  const count = [];
  let factor = config.tileCount;
  while (config.tileCount > 0) {
    sum = 0;
    for (let letter of letters) {
      let n = values[v.hash[letter]].count * factor;
      if (n < 1)
        n = 1;
      else
        n = Math.round(n);
      count[letter] = n;
      sum += n;
    }
    if (sum <= config.tileCount)
      break;
    factor -= 0.01;
  }
  sum = 0;
  for (let letter of letters) {
    const score = values[v.hash[letter]].score + config.minPoints;
    const num = count[letter];
    sum += num;
    console.log(`{ letter: "${letter}", score: ${score}, count: ${num} }`);
  }
  console.log(`Total ${sum} tiles`);

})
.catch(e => {
  console.error(e);
  console.error(DESCRIPTION);
});

