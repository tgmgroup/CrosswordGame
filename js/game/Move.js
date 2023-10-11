/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd */

define('game/Move', ['game/Tile'], Tile => {

	/**
	 * A Move is a collection of tile placements, and the delta score
	 * achieved for the move. We also record the words created by the
	 * move. It is used to send a human player's play to the server,
	 * which then sends a matching {@link Turn} to every player.
	 */
	class Move {

		/**
		 * @param {Move|object} spec Move to copy, or spec, or undefined
		 * @param {Tile[]} spec.placements list of tiles.
		 * @param {Tile[]} spec.replacements list of tiles replacing
		 * played tiles.
		 * @param {object[]} spec.words words created
		 * @param {number} spec.words.score - score for the word
		 * @param {string} spec.words.word - the word
		 * @param {number} spec.score total score for play
		 * @param {number} spec.bonus bonus for the play (included in score)
		 */
		constructor(spec) {
			/**
			 * List of words created by the play {word: string, score: number}
			 * @member {object[]}
			 */
			this.words = [];

			/**
			 * Score for the play.
			 * If a number, change in score for the player as a result of
			 * this move. If an object, change in score for each
			 * player, indexed by player key. The object form is only used
			 * in Turn.
			 * @member {number|object}
			 */
			this.score = 0;

			/**
			 * Bonus for the play (included in score)
			 * @member {number}
			 */
			this.bonus = 0;

			/**
			 * List of tiles placed in this move. Tiles are required
			 * to carry col, row positions where they were placed.
			 * In a Turn, for type=`move` it indicates the
			 * move. For `took-back` and `challenge-won` it is the
			 * move just taken back/challenged.
			 * @member {Tile[]}
			 */
			this.placements = [];

			/**
			 * List of tiles drawn from the bag to replace the tiles played
			 * in this move. These tiles will not have positions.
			 * @member {Tile[]}
			 */
			this.replacements = [];

			if (spec)
				Object.getOwnPropertyNames(spec).forEach(p => {
					switch (p) {
					case 'placements':
					case 'replacements':
						// Must create Tile objects
						spec[p].forEach(
							tilespec =>
							this[p].push(new Tile(tilespec)));
						break;
					default:
						// Just steal it
						this[p] = spec[p];
					}
				});
		}

		/**
		 * Add a Tile placement to the move
		 * @param {Tile} tile the Tile to add
		 */
		addPlacement(tile) {
			this.placements.push(tile);
		}

		/**
		 * Add a Tile replacement to the move
		 * @param {Tile} tile the Tile to add
		 */
		addReplacement(tile) {
			this.replacements.push(tile);
		}

		toString() {
			const pl = this.placements.map(t => t.toString(true));
			const w = this.words.map(w => `${w.word}(${w.score})`);
			return `Play ${pl} words ${w} for ${this.score}`;
		}
	}

	return Move;
});
