/* eslint-env node */

/**
 * Command-line program to explore the words encoded in a DAWG generated by DAWG_Compare.c
 */
const requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
	paths: {
		game: "js/game",
	}
});

const DESCRIPTION = "USAGE\n  node dict.js [options] <dictionary> <words>\n"
+ "Explore a DAWG dictionary."

APP_DIR = __dirname;

requirejs(["node-getopt", "fs-extra", "node-gzip", "game/Dictionary"], (Getopt, Fs, Gzip, Dictionary) => {
	
	function check(opt, words) {
	console.log(`Loading dictionary from ${opt.dawgfile}`);
	Dictionary.load(opt.dawgfile)
	.then(dict => {
		if (opt.options.list) {
			let list = [];
			dict.walk(w => list.push(w));
			console.log(list.join("\n"));
		}
		for (let word of words) {
			let ok = dict.hasWord(word.toUpperCase());
			if (!ok && word.length > 14)
				console.log(`"${word}" is BAD`);
			if (opt.options.anagrams) {
				console.log(`\nAnagrams of "${word}"`);
				let anag = dict.findAnagrams(word);
				console.log(anag);
			}
		}
		console.log(`Checked ${words.length} words`);
	});
}

	let opt = Getopt.create([
        ["h", "help", "Show this help"],
		["l", "list", "Dump a complete list of the words in the DAWG"],
		["f", "file=ARG", "Check all words in file"],
		["a", "anagrams", "Find anagrams of the words"]
	])
        .bindHelp()
        .setHelp(`${DESCRIPTION}\nOPTIONS\n[[OPTIONS]]`)
		.parseSystem();

    if (opt.argv.length == 0) {
        opt.showHelp();
        throw "No DAWG filename given";
    } else {
		opt.dawgfile = opt.argv.shift();
	}

	if (opt.options.file) {
		Fs.readFile(opt.options.file)
		.then(data => {
			let words = data.toString().split(/\s+/);
			console.log(`Checking ${words.length} words`);
			check(opt, words);
		});
		
	} else
		check(opt, opt.argv);
	
});
