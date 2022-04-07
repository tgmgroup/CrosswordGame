/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd */

define('game/LetterBag', ['game/Tile'], (Tile) => {

	/**
	 * The bag of letters during a game.
	 */
	class LetterBag {

		/**
		 * Construct a new letter bag using the distribution for the
		 * given edition
		 * @param {Edition} edition the Edition defining the bag contents
		 */
		constructor(edition) {
			// Tiles in the bag
			this.tiles = [];
			// Array of all the letters in the bag, excluding blank
			this.legalLetters = [];

			for (let letter of edition.bag) {
				if (!letter.isBlank)
					// Not blank
					this.legalLetters.push(letter.letter);

				const count = Math.floor(letter.count);
				for (let n = 0; n < count; ++n) {
					const tile = new Tile({
						letter:	letter.letter,
						score: letter.score
					});
					if (letter.isBlank)
						tile.isBlank = true;
					this.tiles.push(tile);
				}
			}

			this.shake();
		}

		isEmpty() {
			return this.tiles.length === 0;
		}

		/**
		 * Randomize tiles in-place using Durstenfeld shuffle
		 */
		shake() {
			for (let i = this.tiles.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				const temp = this.tiles[i];
				this.tiles[i] = this.tiles[j];
				this.tiles[j] = temp;
			}
		}

		/**
		 * Get a single random tile from the bag. Assumes the bag is
		 * already randomised, and there is no need to shuffle it
		 * again.
		 * @return {Tile} a Tile or null if there are no tiles left
		 */
		getRandomTile() {
			if (this.tiles.length > 0)
				return this.tiles.pop();
			return null;
		}

		/**
		 * Remove count random tiles from the bag. Assumes the bag is
		 * already randomised, and there is no need to shuffle it
		 * again.
		 * @return {Tile[]} 'count' Tile. If there aren't enough
		 * tiles in the bag, may return a shorter array.
		 */
		getRandomTiles(count) {
			const tiles = [];
			if (count < 0)
				throw Error('Negative count');
			for (let i = 0; this.tiles.length > 0 && i < count; i++)
				tiles.push(this.tiles.pop());
			return tiles;
		}

		/**
		 * Return a tile to the bag, and give it a shoogle so the same
		 * tile doesn't re-emerge.
		 * @param {Tile} tile tile to return to bag
		 */
		returnTile(tile) {
			delete tile.row;
			delete tile.col;
			this.tiles.push(tile);
			this.shake();
		}

		/**
		 * Return a set of tiles to the bag, and give it a shoogle so
		 * the tiles don't re-emerge in the same order.
		 * @param {Tile[]} tiles tiles to return to bag
		 */
		returnTiles(tiles) {
			tiles.forEach(tile => {
				delete tile.row;
				delete tile.col;
				this.tiles.push(tile);
			});
			this.shake();
		}

		/**
		 * How many tiles remain?
		 * @return {number} number of tiles still in the bag
		 */
		remainingTileCount() {
			return this.tiles.length;
		}
	}
	return LetterBag;
});
