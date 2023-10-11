/* See README.md at the root of this distribution for copyright and
   license information */

define('game/Tile', () => {
	/**
	 * A tile in a LetterBag, on a Board, or on a Rack, or during best move
	 * computation.
	 */
	class Tile {

		/**
		 * @param {Tile|object} spec optional Tile to copy or spec of tile
		 * @param {string} spec.letter character(s) represented by this tile
		 * @param {boolean} spec.isBlank true if this tile is a blank (irresepective of letter)
		 * @param {number} spec.score value of this tile
		 * @param {number} spec.col optional column where the tile is placed
		 * @param {number} spec.row optional row where the tile is placed
		 */
		constructor(spec) {
			// Caution; during gameplay, .letter for a blank will be cast
			// to a letter chosen by the player. When the tile is returned
			// to the rack, the letter will be reset to ' ' as isBlank is true.
			// However the letter will stick to the Tile when it is sent to
			// the server as part of the move. Henceforward that Tile will
			// be locked to the chosen letter.

			/**
			 * character(s) represented by this tile
			 * @member {string}
			 */
			this.letter = ' ';

			/**
			 * value of this tile
			 * @member {number}
			 */
			this.score = 0;

			/**
			 * true if this tile is a blank (irresepective of letter)
			 * @member {boolean}
			 */
			this.isBlank = false;

			/**
			 * Column where the tile is placed
			 * @member {number}
			 */
			this.col = undefined;
			
			/**
			 * Row where the tile is placed
			 * @member {number}
			 */
			this.row = undefined;

			if (spec)
				Object.getOwnPropertyNames(spec).forEach(
					p => this[p] = spec[p]);
		}

		toString(place) {
			const pl = place ? `@${this.col},${this.row}` : '';
			return `|${this.letter}${pl}(${this.score})|`;
		}
	}

	return Tile;
});
