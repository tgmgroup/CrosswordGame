/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd, node */

/**
 !* Structure built during dictionary compression. Is not used in a 'live'
 * dictionary; that uses the richer 'LetterNode'.
 */
define('dawg/Trie', ['dawg/TrieNode'], TrieNode => {
	/**
	 * A tree of nodes, each of which has a letter, a next pointer to another
	 * node, and a child pointer to another node.
	 */
	class Trie {

		/**
		 * Construct a Trie from a simple word list
		 */
		constructor(lexicon) {
			console.log('\nConstruct Trie and fill from lexicon');

			this.numberOfWords = 0;
			this.numberOfNodes = 0;
			this.first = new TrieNode(-1, null, false, 0, 0, null, false);
			this.maxWordLen = 0;
			this.minWordLen = 1000000;

			for (let word of lexicon)
				this.addWord(word);

			console.log(`Trie of ${this.numberOfNodes} nodes built from ${this.numberOfWords} words`);
		}

		/**
		 * Add a word to the Trie
		 * @param {string} word word to add
		 */
		addWord(word) {
			let current = this.first;
			let nNew = 0;
			for (let x = 0; x < word.length; x++) {
				const hangPoint = current.child ?
					current.findChild(word[x]) : null;

				if (!hangPoint) {
					current.insertChild(
						word[x], x === word.length - 1, word.length - x - 1);
					nNew++;
					current = current.findChild(word[x]);
					for (let y = x + 1; y < word.length; y++) {
						current.insertChild(
							word[y], y === word.length - 1, word.length - y - 1);
						nNew++;
						current = current.child;
					}
					break;
				}
				if (hangPoint.maxChildDepth < word.length - x - 1)
					hangPoint.maxChildDepth = word.length - x - 1;
				current = hangPoint;
				// The path for the word that we are trying to insert
				// already exists, so just make sure that the end flag is
				// flying on the last node.  This should never happen if
				// words are added in alphabetical order, but this is not
				// a requirement.
				if (x === word.length - 1) {
					console.log(`WARNING input not in alphabetical order ${word}`);
					current.isEndOfWord = true;
				}
			}
			this.numberOfNodes += nNew;
			this.numberOfWords++;
		}

		/**
		 * Construct an array indexed on `maxChildDepth` (word length)
		 * Each entry is an array that contains all the nodes with that
		 * `maxChildDepth`.
		 * @return {TrieNode[][]} the structure
		 * @private
		 */
		createReductionStructure() {
			console.log('\nCreate reduction structure');

			const counts = [];
			for (let x = this.minWordLen; x < this.maxWordLen; x++)
				counts[x] = 0;

			const red = [];
			const queue = [];
			let current = this.first.child;
			while (current) {
				queue.push(current);
				current = current.next;
			}

			let added = 0;
			while (queue.length > 0) {
				current = queue.shift();
				if (!red[current.maxChildDepth])
					red[current.maxChildDepth] = [];
				red[current.maxChildDepth].push(current);
				counts[current.maxChildDepth]++;
				added++;
				current = current.child;
				while (current) {
					queue.push(current);
					current = current.next;
				}
			}

			for (let x = this.minWordLen; x < this.maxWordLen; x++)
				if (counts[x] > 0)
					console.log(`${counts[x]} words of length ${x}`);

			console.log(`${added} nodes added to the reduction structure`);

			return red;
		}

		/**
		 * Flag all of the redundant nodes in the Trie
		 * Flagging requires the node comparison function that will take a
		 * very long time for a big dictionary.  This is especially true
		 * when comparing the nodes with small 'maxChildDepth''s because
		 * there are so many of them.  It is faster to start with nodes of
		 * the largest 'maxChildDepth' to recursively reduce as many lower
		 * nodes as possible.
		 * @param {TrieNode[][]} red the reduction structure
		 * @private
		 */
		findPrunedNodes(red) {
			console.log('\nMark redundant nodes as pruned');

			// Use recursion because only direct children are considered for
			// elimination to keep the remaining lists intact. Start at
			// the largest 'maxChildDepth' and work down from there for
			// recursive reduction to take place early on to reduce the work
			// load for the shallow nodes.
			let totalPruned = 0;
			for (let y = red.length - 1; y >= 0 ; y--) {
				let numberPruned = 0;
				// Move through the red array from the beginning, looking
				// for any nodes that have not been pruned, these will be the
				// surviving nodes.
				// Could equally use for (w in readArray[y])
				// but this is a useful check
				const nodesAtDepth = red[y];
				for (let w = 0; w < nodesAtDepth.length - 1; w++) {
					if (nodesAtDepth[w].isPruned)
						// The Node is already pruned.  Note that this node need
						// not be the first in a child list, it could have been
						// pruned recursively.  In order to eliminate the need
						// for the 'next' index, the nodes at the root of
						// elimination must be the first in a list, in other
						// words, 'isFirstChild'. The node that we replace the
						// 'isFirstChild' node with can be located at any position.
						continue;

					// Traverse the rest of the list looking for equivalent
					// nodes that are both not pruned and are tagged as
					// first children.  When we have found an identical list
					// structure further on in the array, prune it, and all
					// the nodes coming after, and below it.
					for (let x = w + 1; x < nodesAtDepth.length; x++) {
						if (!nodesAtDepth[x].isPruned
							&& nodesAtDepth[x].isFirstChild) {
							if (nodesAtDepth[w].sameSubtrie(nodesAtDepth[x])) {
								numberPruned += nodesAtDepth[x].prune();
							}
						}
					}
				}
				console.log(`Pruned |${numberPruned}| nodes at depth |${y}|`);
				totalPruned += numberPruned;
			}

			console.log(`Identified a total of ${totalPruned} nodes for pruning`);
		}

		/**
		 * Label all of the remaining nodes in the Trie-turned-DAWG so that
		 * they will fit contiguously into an unsigned integer array.
		 * @return {TrieNode[]} all the nodes in the order they are indexed
		 * @private
		 */
		assignIndices() {

			console.log('\nAssign node indices');
			let current = this.first.child;
			const queue = [];
			const nodeList = [];

			// The use of a queue during this step ensures that
			// lists of contiguous nodes in the array will eliminate the need
			// for a Next pointer.
			while (current) {
				queue.push(current);
				current = current.next;
			}

			let nextIndex = 0;
			while (queue.length > 0) {
				current = queue.shift();
				// If the node already has a non-zero index, don't give it a new one.
				// if it has an index, all it's next and child nodes should too.
				if (current.index < 0) {
					current.index = nextIndex++;
					nodeList.push(current);
					current = current.child;
					while (current) {
						queue.push(current);
						current = current.next;
					}
				}
			}

			console.log(`Assigned ${nextIndex} node indexes`);

			return nodeList;
		}

		/**
		 * Go through the steps to generate a DAWG from a Trie tree
		 * by merging duplicate sub-trees.
		 */
		generateDAWG() {

			const red = this.createReductionStructure();

			this.findPrunedNodes(red);

			// Pruning is complete, so replace all pruned nodes with their
			// first equivalent in the Trie
			let trimmed = this.first.child.replaceRedundantNodes(red);
			console.log(`Pruned ${trimmed} nodes`);
		}

		/**
		 * Convert a Trie tree (DAWG) nodes into a
		 * linear 32-bit integer array.
		 * @return {number[]} array of integers
		 */
		encodeDAWG() {
			console.log('\nGenerate the unsigned integer array');

			const nodelist = this.assignIndices();

			if (nodelist.length > 0x3FFFFFFF)
				throw Error(`Too many nodes remain for integer encoding`);

			const dawg = [ nodelist.length ];
			// Add nodes
			for (let i = 0; i < nodelist.length; i++)
				nodelist[i].encode(dawg);

			console.log(`${dawg.length} integer array generated`);

			return dawg;
		}
	}

	return Trie;
});
