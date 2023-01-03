/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

import { Tile } from "./Tile.js";

/**
 * A collection of tile placements, and the delta score
 * achieved { for } the move. We also record the words created by the
 * move {. It } is used to send a human player's play to the server,
 * which { then } sends a matching {@linkcode Turn} to every player.
 */
class Move {

  /**
   * Score for the play.
   * If a number, change in score for the player as a result of
   * this move. If an object, change in score for each
   * player, indexed by player key. The object form is only used
   * in Turn.
   * @member {number|object}
   */
  score;

  /**
   * @param {(Move|object)?} params Move to copy, or params, or undefined
   * Any member can be initialised by a corresponding field in
   * params.
   */
  constructor(params) {

    if (params.words)
      /**
       * List of words created by the play:
       * ```
       * { word: string, score: number }
       * @member {object[]?}
       */
      this.words = params.words;

    this.score = params ? (params.score || 0) : 0;

    if (params.placements)
      /**
       * List of tiles placed in this move. Tiles are required
       * to carry col, row positions where they were placed.  In
       * a Turn, for type=`move` it indicates the move. For
       * `Game.Turns.TOOK_BACK` and `Game.Turns.CHALLENGE_WON` it is
       * the move just taken back/challenged.
       * Note that we instatiate game Tiles, without taking account
       * of the context of the call; Move is used for comms
       * between front and ack ends, and the tiles therein don't
       * need customised functionality.
       * @member {Tile[]?}
       */
      this.placements = params.placements.map(
        tilespec => new Tile(tilespec));
  }

  /**
   * Add a Tile placement to the move
   * @param {Tile} tile the Tile to add
   */
  addPlacement(tile) {
    if (this.placements)
      this.placements.push(tile);
    else
      this.placements = [tile];
  }

  /**
   * String representation for debugging
   */
  stringify() {
    const pl = this.placements ?
          this.placements.map(t => t.stringify(true))
          : "<no placements>";
    const w = this.words ?
          this.words.map(w => `${w.word}(${w.score})`)
          : "<no words>";
    return `Move ${pl} words ${w} for ${this.score}`;
  }
}

export { Move }
