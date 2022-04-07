/* See README.md at the root of this distribution for copyright and
   license information */

/* eslint-env node */

/**
 * Command-line invocation of the Valett word corpus analyser
 * Based on code from https://github.com/jmlewis/valett
 *
* `node js/design/valett.js` will tell you how to use it.
 * @module
 */
const requirejs = require('requirejs');

requirejs.config({
	baseUrl: `${__dirname}/..`
});

requirejs(['node-getopt', 'fs', 'design/ValettCore'], (Getopt, fs, Valett) => {
	const Fs = fs.promises;
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
		'USAGE',
		`node ${process.argv[1].replace(/.*\//, '')} [options] <wordfile>`,
		'Analyse a set of words. Output is in the form of a bag definition',
		'for use in an Edition.',
		'Optional config is a JSON file allowing you to override the following:',
		'{',
		'minPoints: minimum point value for a tile.',
		`\tDefault: ${config.minPoints}`,
		'maxPoints: maximum point value for a tile.',
		`\tDefault: ${config.maxPoints}`,
		'tileCount: number of tiles in the initial bag, not including blanks.',
		`\tDefault: ${config.tileCount}`,
		'weights: relative weighting of frequency, frequency by length, and',
		'\tentropy when calculating letter values. Fields should sum to 1.',
		`\tDefault: ${JSON.stringify(config.weights)}`,
		'frequencyByLengthWeights: relative value of a letter\'s occurrence',
		'\tin words of different length. For example, in Scrabble',
		'\tit is particularly valuable for a letter to appear in 2,',
		'\t3, 7 and 8 tile words.',
		`\tDefault: ${JSON.stringify(config.frequencyByLengthWeights)}`,
		'entropyWeights: relative value of the ease of transitioning into',
		'\ta letter (how evenly the transition probabilities toward',
		'\ta letter are distributed) and out of a letter. For example,',
		'\tQ has a low entropy out since its transition probability',
		'\tdistribution is highly peaked at U.',
		`\tDefault: [${config.entropyWeights}]`,
		'}'
	].join('\n');

	const opt = Getopt.create([
		['c', 'config=ARG', 'Config file (JSON) - see above']
	])
        .bindHelp()
        .setHelp(`${DESCRIPTION}\nOPTIONS\n[[OPTIONS]]`)
		.parseSystem();

	if (opt.options.config) {
		// Read config from file (JSON)
		Fs.readFile(opt.options.config)
		.then(data => {
			let reconfig;
			eval(`reconfig=${data.toString()}`);
			console.log(`Config from ${opt.options.config}`);
			for (let key of Object.keys(reconfig))
				config[key] = reconfig[key];
		});
	}
	console.log(opt);
    if (opt.argv.length == 0) {
        opt.showHelp();
        throw 'No word corpus filename given';
    }
	const infile = opt.argv.shift();

	console.log(`Analyse ${infile}`);
	console.log(config);

	Fs.readFile(infile)
	.then(data => {
		const words = data.toString().toUpperCase().split(/\r?\n/);
		// Extract the alphabet from the corpus
		const chars = {};
		words.forEach(
			w => w.split('').forEach(
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
			console.log(`{ letter: '${letter}', score: ${score}, count: ${num} }`);
		}
		console.log(`Total ${sum} tiles`);

	})
	.catch(e => {
		console.log(e);
		console.log(DESCRIPTION.join('\n'));
	});
});
