/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd, node */

/**
 * Letter node in a Dictionary. Each node has multiple links and helpers
 * that trade off space for performance during word searches.
 */
define('dawg/LetterNode', () => {

	class LetterNode {
		constructor(letter) {
			this.letter = letter;
			// The next 2 are numbers during loading, converted to a pointer
			this.next = null;
			this.child = null;
		}

		/**
		 * @callback LetterNode~wordCallback
		 * @param {string} word found
		 * @param {LetterNode} node node where word was terminated
		 */

		/**
		 * Enumerate each word in the dictionary. Calls cb on each word.
		 * Caution this is NOT the same as dawg/TrieNode.eachWord.
		 * @param {string} s the word constructed so far
		 * @param {LetterNode~wordCallback} cb the callback
		 */
		eachWord(s, cb) {
			if (this.isEndOfWord)
				cb(s + this.letter, this);

			if (this.child)
				this.child.eachWord(s + this.letter, cb);

			if (this.next)
				this.next.eachWord(s, cb);
		}

		/**
		 * Enumerate each LONG word in the dictionary. A long word is one
		 * that has no child nodes i.e. cannot be extended by adding more
		 * letters to create a new word. Calls cb on each word.
		 * Caution this is NOT the same as dawg/TrieNode.eachWord.
		 * @param {string} s the word constructed so far
		 * @param {wordCallback} cb the callback
		 */
		eachLongWord(s, cb) {
			if (this.isEndOfWord && !this.child)
				cb(s + this.letter, this);

			if (this.child)
				this.child.eachLongWord(s + this.letter, cb);

			if (this.next)
				this.next.eachLongWord(s, cb);
		}

		/**
		 * @callback LetterNode~nodeCallback
		 * @param {LetterNode} node node
		 * @return {boolean} true to continue the iteration, false to stop it.
		 */

		/**
		 * Enumerate each node in the dictionary in depth-first order.
		 * Calls cb on each node.
		 * @param {LetterNode~nodeCallback} cb the callback
		 */
		eachNode(cb) {
			if (!cb(this))
				return false;

			if (this.child && !this.child.eachNode(cb))
				return false;

			if (this.next && !this.next.eachNode(cb))
				return false;

			return true;
		}

		/**
		 * Build forward and backward lists to allow us to navigate
		 * in both directions - forward through words, and backwards too.
		 */
		buildLists(pre) {
			this.pre = [];
			this.preLetters = [];
			this.post = [];
			this.postLetters = [];
			if (pre) {
				this.pre.push(pre);
				this.preLetters.push(pre.letter);
				pre.post.push(this);
				pre.postLetters.push(this.letter);
			}
			if (this.child)
				this.child.buildLists(this);
			if (this.next)
				this.next.buildLists(pre);
		}

		/**
		 * Return the LetterNode that matches the last character
		 * in chars, even if it's not isEndOfWord
		 * @param {string} chars a string of characters that may
		 * be the root of a word
		 * @param {number} index the start index within partialWord
		 * @return {LetterNode} node found, or undefined
		 */
		match(chars, index) {
			if (typeof index === 'undefined')
				index = 0;
			let node = this;
			while (node) {
				if (node.letter === chars[index]) {
					if (index === chars.length - 1)
						return node;
					if (node.child)
						return node.child.match(chars, index + 1);
				}
				node = node.next;
			}
			return null;
		}

		/**
		 * @param {string} realWord the string built so far in this recursion
		 * @param {string} blankedWord the string built using spaces for blanks
		 * if they are used
		 * @param {string} sortedChars the available set of characters, sorted
		 * @param {string[]} foundWords list of words found
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
		}
	}

	return LetterNode;
});
