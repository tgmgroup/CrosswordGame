/* eslint-env node */
/* global APP_DIR */
/* global DataView */

/**
 * Dictionary support using a Directed Acyclic Word Graph (DAWG) in the
 * format generated by DAWG_Compressor.c
 * 
 * Note that the DAWG uses letter indices, and not actual characters, to
 * represent code points. To use this dictionary you also need an
 * alphabet of code points sorted in the same order as that used to
 * generate the DAWG.
 */
define("game/Dictionary", ["fs-extra", "node-gzip"], (Fs, Gzip) => {
	
	// Constants used in interpreting the integer encoding of the DAWG
	const END_OF_WORD_BIT_MASK = 0x1;
	const END_OF_LIST_BIT_MASK = 0x2;
	const CHILD_INDEX_SHIFT = 2;
	const CHILD_INDEX_BIT_MASK = 0x3FFFFFFF;
	
	// Cache of dictionaries
	const dictionaries = {};

	// DAWG
	class Node {
		constructor(letter) {
			this.letter = letter;
		}

		/**
		 * Depth-first walk; calls cb on each word encoded in the DAWG
		 * @param s the word constructed so far
		 * @param cb the callback
		 */
		walk(s, cb) {
			if (this.isEndOfWord)
				cb(s + this.letter);
			
			if (this.child)
				this.child.walk(s + this.letter, cb);
			
			if (this.next)
				this.next.walk(s, cb);
		}

		/**
		 * Check if the word beyond char_index is represented by the
		 * DAWG below this node
		 * @param chars the word we're checking
		 * @param char_index the end of the substring matched to reach this node
		 */
		checkWord(chars, chars_index) {
			if (this.letter == chars[chars_index]) {
				if (chars_index == chars.length - 1)
					return this.isEndOfWord;
				if (this.child)
					return this.child.checkWord(chars, chars_index + 1);
				return false;
			} else {
				// Try the next alternative
				if (this.next)
					return this.next.checkWord(chars, chars_index);
				return false;
			}
		}

		/**
		 * @param realWord the string built so far in this recursion
		 * @param blankedWord the string built using spaces for blanks
		 * if they are used
		 * @param sortedChars the available set of characters, sorted
		 */
		findAnagrams(realWord, blankedWord, sortedChars, foundWords) {
			
			// is this character available from sortedChars?
			// Only use blank if no other choice
			let i = sortedChars.indexOf(this.letter);
			if (i < 0) // not there, try blank
				i = sortedChars.indexOf(' ');
			
			if (i >= 0) {
				const match = sortedChars[i];
				
				// The char is available from sortedChars.
				// Is this then a word?
				if (this.isEndOfWord) {
					// A word is found
					foundWords[realWord + this.letter] = blankedWord + match;
				}

				if (sortedChars.length == 1)
					return;
				
				// Cut the matched letter out of sortedChars and recurse
				// over our child node chain
				sortedChars.splice(i, 1);
			
				for (let child = this.child; child; child = child.next) {
					child.findAnagrams(
						realWord + this.letter,
						blankedWord + match,
						sortedChars,
						foundWords);
				}
				sortedChars.splice(i, 0, match);
			}
			
			if (this.next)
				this.next.findAnagrams(
					realWord, blankedWord, sortedChars, foundWords);

			return foundWords;
		}
	}
	
	class Dictionary {

		/**
		 * Promise to load a dictionary
		 */
		static async load(name) {
			if (dictionaries[name])
				return Promise.resolve(dictionaries[name]);
			
			return Fs.readFile(`${APP_DIR}/dictionaries/${name}.dict`)
			.then(data => Gzip.ungzip(data))
			.then(buffer => {
				console.log(`Loaded dictionary ${name}`);
				dictionaries[name] = new Dictionary(buffer.buffer);
				return dictionaries[name];
			});
		}

		/**
		 * @param dawg a Buffer or Array containing the DAWG data.
		 * It's actually an array of little-endian 4-byte integers.
		 */
		constructor(data) {
			let dv = new DataView(data);
			let index = 0;
			let numberOfNodes = dv.getUint32(4 * index++);
			let nodes = [];
			for (let i = 0; i < numberOfNodes; i++) {
				let letter = dv.getUint32(4 * index++);
				let node = new Node(String.fromCodePoint(letter));
				let numb = dv.getUint32(4 * index++);
				if ((numb & END_OF_WORD_BIT_MASK) != 0)
					node.isEndOfWord = true;
				if ((numb & END_OF_LIST_BIT_MASK) == 0)
					node.next = i + 1;
				if (((numb >> CHILD_INDEX_SHIFT) & CHILD_INDEX_BIT_MASK) > 0)
					node.child = ((numb >> CHILD_INDEX_SHIFT) & CHILD_INDEX_BIT_MASK);
				//console.log(`${nodes.length} `,node);
				nodes.push(node);
			}
			for (let i = 0; i < nodes.length; i++) {
				let node = nodes[i];
				if (typeof node.next === "number")
					node.next = nodes[node.next];
				if (typeof node.child === "number")
					node.child = nodes[node.child];
			}
			this.root = nodes[0];
		}

		/**
		 * Apply the callback to each of the words represented in the DAWG
		 * (potentially huge!)
		 * @param callback function that accepts an array of letter indices
		 */
		walk(callback) {
			return this.root.walk([], callback);
		}
		
		/**
		 * Check if a word is in the dictionary
		 * @param chars a word to check
		 * @return true if the word is found, false otherwise
		 */
		hasWord(chars) {
			return this.root.checkWord(chars, 0);
		}


		/**
		 * Find anagrams of a set of letters
		 * @param theChars the letters
		 * @return a map of anagrams to the letter sequence that matched
		 */
		findAnagrams(theChars) {
			theChars = theChars.toUpperCase();
			
			if (theChars.length < 2)
				return [ theChars ];

			// Sort the list of characters. Not strictly needed,
			// just easier to debug.
			let sortedChars = theChars.split("").sort();

			//console.log("Sorted chars", sortedChars);
			const foundWords = {};
			this.root.findAnagrams('', '', sortedChars, foundWords)
			return foundWords;
		}
	}
	return Dictionary;
});
