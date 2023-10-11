/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env node, jquery */

/**
 * A Rack is a set of tiles that a player can play from. It's
 * a 1D array of Square.
 */
define('game/Rack', ['game/Surface'], Surface => {

	/**
	 * A Rack is a 1-column {@link Surface}
	 */
	class Rack extends Surface {

		/**
		 * @param {(number|Tile[])} size a rack size, or an array
		 * of Tile (for tests)
		 */
		constructor(size) {
			super(typeof size === 'number' ? size : size.length, 1,
				  () => '_');
			if (typeof size !== 'number')
				for (let tile of size)
					this.addTile(tile);
		}

		/**
		 * Debug
		 */
		toString() {
			return `Rack ${this.tiles().join(',')}`;
		}

		/**
		 * One dimensional
		 * @override
		 */
		at(col) {
			return super.at(col, 0);
		}

		/**
		 * Add a Tile to the rack
		 * @param {Tile} tile the Tile to add, must != null
		 * @return {number} the col of the added tile (or -1
		 * if it couldn't be placed)
		 */
		addTile(tile) {
			let col = -1;
			this.forEachEmptySquare(square => {
				square.placeTile(tile);
				col = square.col;
				return true;
			});
			return col;
		}

		/**
		 * Get an array of the letters currently on the rack
		 * @return {string[]}
		 */
		letters() {
			return this.tiles().map(tile => tile.letter);
		}

		/**
		 * Find the Square that contains a Tile that can represent
		 * the given letter.
		 * If a letter tile can't be found, a blank will be used if there
		 * is one.
		 * @param {string} letter the letter to find
		 * @return {Square} carrying a matching tile, or undefined
		 */
		findSquare(letter) {
			let square;
			this.forEachTiledSquare(sq => {
				if (!square && sq.tile.isBlank
					|| sq.tile.letter === letter)
					square = sq;
			});

			return square;
		}

		/**
		 * Find and remove a tile from the rack. Will match the requested
		 * tile within the Rack and return it.
		 * @param {Tile} remove the Tile to remove, or null to remove any tile
		 * @return {Tile} the removed tile
		 */
		removeTile(remove) {
			const square = this.findSquare(remove.letter);
			if (!square)
				throw Error("Cannot find '"
							+ remove.letter + "' on " + this);
			const tile = square.tile;
			tile.letter = remove.letter; // TODO: huh?
			square.placeTile(null);
			return tile;
		}

		/**
		 * Shuffle tile positions within the rack
		 * @return {Rack} this
		 */
		shuffle() {
			const len = this.cols;
			function random() {
				return Math.floor(Math.random() * len);
			}
			for (let i = 0; i < 16; i++) {
				const from = this.at(random());
				const to = this.at(random());
				const tmp = from.tile;
				from.tile = to.tile;
				to.tile = tmp;
			}
			return this;
		}

		/**
		 * Get a list of tiles that are not blanks
		 */
		lettersLeft() {
			return this.tiles().filter(tile => !tile.isBlank)
			.map(tile => tile.letter);
		}

		/**
		 * Create the DOM for the Rack.
		 * @param {string} idbase base of id's to uniquely identify this rack
		 * @param {string} underlay a string of letters to use as background of
		 * the rack squares. This is in place of a label.
		 * @return {jQuery}
		 */
		createDOM(idbase, underlay) {
			const $table = $('<table class="Rack"></table>');
			const $tr = $(`<tr></tr>`);
			let idx = 0;
			this.forEachSquare(square => {
				const $td = square.createDOM(idbase, idx);
				if (underlay) {
					const letter = underlay.charAt(idx);
					$td.addClass('underlay-container');
					$td.append(`<div class='underlay'>${letter}</div>`);
				}
				$tr.append($td);
				idx++;
			});
			$table.append($tr);
			this.refreshDOM();
			return $table;
		}
	}

	return Rack;
});
