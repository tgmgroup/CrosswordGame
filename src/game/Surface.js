/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/**
 * Abstract base class of a 2D grid of {@linkcode Sqaure} (a Rack or a Board)
 */
class Surface {

  // Note that we do NOT use the field syntax for the fields that
  // are serialised. If we do that, then the constructor blows the
  // field away when loading using CBOR.

  /**
   * @param {object.<string,class>} factory maps class name to a class
   * @param {object} spec specification of the surface
   * @param {string} spec.id unique id for the surface
   * @param {number} spec.cols number of columns
   * @param {number} spec.rows number of rows (1 for a rack)
   * @param {function} spec.type function(col, row) returning the square type
   */
  constructor(factory, spec) {

    /**
     * Unique id for the surface. This is used in the construction
     * of HTML id attributes for the Squares it contains.
     * @member {string}
     */
    this.id = spec.id;

    /**
     * Number of columns on the surface.
     * @member {number}
     */
    this.cols = spec.cols;

    /**
     * Number of rows on the surface. This will be 0 for a Rack.
     * @member {number}
     */
    this.rows = spec.rows;

    /**
     * rows X cols array of squares
     * @member {Square[][]}
     * @private
     */
    this.squares = [];

    for (let i = 0; i < this.cols; i++) {
      const row = [];
      for (let j = 0; j < this.rows; j++) {
        const sq = {
          type: spec.type(i, j),
          surface: this,
          col: i
        };
        if (spec.rows > 1)
          sq.row = j;
        row.push(new factory.Square(sq));
      }
      this.squares.push(row);
    }
  }

  /**
   * Get the square at [col][row]
   * @param {number} col the column containing the square
   * @param {number?} row the column containing the square, 0 if undefined
   */
  at(col, row) {
    return this.squares[col][row || 0];
  }

  /**
   * Call fn on every square, column major.
   * @param {function} fn function(Square, col, row)
   * Iteration will stop if fn returns true.
   * @return {boolean} true if fn() returns true, false otherwise
   */
  forEachSquare(fn) {
    for (let c = 0; c < this.cols; c++)
      for (let r = 0; r < this.rows; r++)
        if (fn(this.squares[c][r], c, r))
          return true;
    return false;
  }

  /**
   * Call fn(square, col, row) on every square that has a tile
   * @param {function} fn function(Square, col, row)
   * Iteration will stop if the function returns true.
   * @return {boolean} true if fn() returns true, false otherwise
   */
  forEachTiledSquare(fn) {
    return this.forEachSquare((square, c, r) => {
      if (square.tile)
        return fn(square, c, r);
      return false;
    });
  }

  /**
   * Call fn(square, col, row) on every square that has no tile.
   * @param {function} fn function(Square, col, row)
   * Iteration will stop if the function returns true.
   * @return {boolean} true if fn() returns true, false otherwise
   */
  forEachEmptySquare(fn) {
    return this.forEachSquare((square, c, r) => {
      if (!square.tile)
        return fn(square, c, r);
      return false;
    });
  }

  /**
   * Get the number of squares currently occupied by a tile
   * @return {number} number of occupied squares
   */
  squaresUsed() {
    let count = 0;
    this.forEachTiledSquare(() => {
      count++;
      return false;
    });
    return count;
  }

  /**
   * Get a list of the tiles placed on the surface
   * @return {Tile[]} list of placed tiles
   */
  tiles() {
    const tiles = [];
    this.forEachTiledSquare(square => {
      tiles.push(square.tile);
      return false;
    });
    return tiles;
  }

  /**
   * Remove all tiles from the surface, return a list of tiles
   * removed;
   */
  empty() {
    const removed = [];
    this.forEachTiledSquare(square => {
      removed.push(square.tile);
      square.unplaceTile();
    });
    return removed;
  }

  /**
   * Get the total of the scoring tiles placed on the
   * surface. DOES NOT APPLY SQUARE MULTIPLIERS.
   * @return {number} total score
   */
  score() {
    return this.tiles().reduce((s, tile) => s + tile.score, 0);
  }

  /**
   * Determine if the surface is empty of tiles
   * @return {boolean} true if surface is empty
   */
  isEmpty() {
    return this.tiles().length === 0;
  }
}

export { Surface }
