/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/* global assert */

import { Tile } from "./Tile.js";

/**
 * The bag of letters during a game.
 */
class LetterBag {

  /**
   * Array of Tiles in the bag
   * @member {Tile[]}
   */
  tiles = [];

  /**
   * Array of all the letters in the bag, excluding blank.
   * @member {string}
   */
  legalLetters = [];

  /**
   * Construct a new letter bag using the distribution for the
   * given edition
   * @param {Edition|LetterBag} edition the Edition defining the
   * bag contents. Can also be an existing LetterBag to give a predictable,
   * non-random bag
   */
  constructor(edition) {
    if (edition instanceof LetterBag) {
      /**
       * Set to disable shuffling the bag. This is used when
       * replaying moves, when we need a predictable set for tiles
       * to be delivered next out of the bag.
       * @member {boolean?}
       */
      this.predictable = true;

      for (const tile of edition.tiles)
        this.tiles.push(new Tile(tile));
      // Don't shake, we want it predictable!
    } else {
      for (let letter of edition.bag) {
        // legalLetters is an array, not a string, to support
        // multi-character tiles
        if (!letter.isBlank)
          // Not blank
          this.legalLetters.push(letter.letter);

        const count = Math.floor(letter.count);
        for (let n = 0; n < count; ++n) {
          const tile = new Tile({
            letter:  letter.letter,
            score: letter.score
          });
          if (letter.isBlank)
            tile.isBlank = true;
          this.tiles.push(tile);
        }
      }
      this.shake();
    }

    if (edition.isWild) // never true, doc only
      /**
       * Whether this bag is wild or not. When a bag is wild, any tile
       * taken from in the bag can be used as any other tile. This is
       * used client-side, where we are only concerned about the number
       * of tiles left in the bag and we want to prevent reverse
       * engineering of bag and rack contents. By default, bags are not
       * wild.
       * @member {boolean?}
       */
      this.isWild = true;
  }

  /**
   * Test bag for emptiness
   * @return {boolean} true if there are no tiles in the bag
   */
  isEmpty() {
    return this.tiles.length === 0;
  }

  /**
   * Randomize tiles in-place using Durstenfeld shuffle. Randomness
   * can be disabled by setting {@linkcode LetterBag#predictable}
   */
  shake() {
    if (this.predictable || this.isWild) {
      return;
    }

    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    for (let i = this.tiles.length - 1; i > 1; i--) {
      // j ← random integer such that 0 ≤ j ≤ i
      // Note that j < i turns this into Sattolo's algorithm (wrong)
      const j = Math.floor(Math.random() * (i + 1));
      if (j === i)
        continue;
      const temp = this.tiles[i];
      this.tiles[i] = this.tiles[j];
      this.tiles[j] = temp;
    }
    //console.debug("Initial bag", this.tiles.map(t => t.letter));
  }

  /**
   * Get a single random tile from the bag. Assumes the bag is
   * already randomised, and there is no need to shuffle it
   * again.
   * @return {Tile} a Tile or undefined if there are no tiles left
   */
  getRandomTile() {
    if (this.tiles.length > 0)
      return this.tiles.pop();
    return undefined;
  }

  /**
   * Remove count random tiles from the bag. Assumes the bag is
   * already randomised, and there is no need to shuffle it
   * again. Note that you cannot get random tiles from a wild bag.
   * @return {Tile[]} 'count' Tile. If there aren't enough
   * tiles in the bag, may return a shorter array.
   */
  getRandomTiles(count) {
    assert(!this.isWild, "Bag is wild");
    const tiles = [];
    console.assert(count >= 0, "Bag is empty");
    for (let i = 0; this.tiles.length > 0 && i < count; i++)
      tiles.push(this.getRandomTile());
    return tiles;
  }

  /**
   * Return a tile to the bag, and give it a shoogle so the same
   * tile doesn't always re-emerge next.
   * @param {Tile} tile tile to return to bag
   */
  returnTile(tile) {
    this.tiles.push(tile.reset(this.isWild));
    this.shake();
  }

  /**
   * Return an array of tiles to the bag, and give it a shimmy
   * @param {Tile[]} tiles tiles to return to bag
   */
  returnTiles(tiles) {
    for (const tile of tiles)
      this.tiles.push(tile.reset(this.isWild));
    this.shake();
  }

  /**
   * Remove a matching tile from the bag. Either the exact tile
   * will be matched or a tile that represents the same letter.
   * Blanks only match blanks.
   * If the bag is wild, we simply pop a tile, make it look like
   * the requested tile, and return it.
   * @param {Tile} tile tile to match in the bag
   * @return {Tile?} the tile removed, or undefined if it wasn't found
   */
  removeTile(tile) {
    if (this.isWild)
      // Grab a tile, any tile
      return this.tiles.pop().copy(tile);
    for (let i = 0; i < this.tiles.length; i++) {
      const t = this.tiles[i];
      if (t === tile
          || (t.isBlank && tile.isBlank)
          || (!t.isBlank && !tile.isBlank && t.letter === tile.letter))
      {
        this.tiles.splice(i, 1);
        return t;
      }
    }
    return undefined;
  }

  /**
   * Take a list of matching tiles out of the letter bag.
   * @param {Tile[]} tiles list of tiles to match and remove
   * @return {Tile[]} list of tiles removed from the bag
   */
  removeTiles(tiles) {
    const unbagged = [];
    for (const tile of tiles)
      unbagged.push(this.removeTile(tile));
    return unbagged;
  }

  /**
   * How many tiles remain?
   * @return {number} number of tiles still in the bag
   */
  remainingTileCount() {
    return this.tiles.length;
  }

  /**
   * Return an unsorted list of letters in the bag
   * @return {string[]} array of letters
   */
  letters() {
    return this.tiles.map(tile => tile.letter);
  }

  /* c8 ignore start */

  /**
   * Generate a simple string representation of the bag
   */
  stringify() {
    return "(" + this.letters().sort().join("") + ")";
  }

  /* c8 ignore stop */
}

export { LetterBag }

