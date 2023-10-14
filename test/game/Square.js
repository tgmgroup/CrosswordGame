/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha */

import { assert } from "chai";
import { Square } from "../../src/game/Square.js";
import { Tile } from "../../src/game/Tile.js";

/**
 * Unit tests for Square class
 */
describe("game/Square", () => {

  it('construct', () => {
    let sq = new Square({type:'q', surface: { id: "base" }, col: 56, row: 42});
    assert.equal(sq.letterScoreMultiplier, 4);
    assert.equal(typeof sq.wordScoreMultiplier, "undefined");
    assert(!sq.tile);
    assert(!sq.hasLockedTile());
    assert(sq.isEmpty());
    let tile = new Tile({
      letter:'S', isBlank:false, score:1, col: 7, row: 7});
    sq.placeTile(tile);
    assert.strictEqual(sq.tile, tile);
    assert(!sq.hasLockedTile());
    assert(!sq.isEmpty());
    assert.equal(tile.col, sq.col);
    assert.equal(tile.row, sq.row);
    assert.equal(sq.stringify(), "#q@56,42<=[S@56,42]");
    // make sure we can place the same tile again
    sq.placeTile(tile);

    sq.unplaceTile();
    assert(!sq.tile);
    assert(!sq.hasLockedTile());
    assert(sq.isEmpty());

    sq.placeTile(tile, true);
    assert.strictEqual(sq.tile, tile);
    assert(sq.hasLockedTile());
    assert(!sq.isEmpty());
    assert.equal(tile.col, sq.col);
    assert.equal(tile.row, sq.row);
    const q = new Square({
      type: 'q',
      surface: { id: "base" },
      col: 0
    });
    assert.equal(q.letterScoreMultiplier, 4);
    assert.equal(typeof q.wordScoreMultiplier, "undefined");
    const Q = new Square({
      type: 'Q',
      surface: { id: "base" },
      col: 0
    });
    assert.equal(typeof Q.letterScoreMultiplier, "undefined");
    assert.equal(Q.wordScoreMultiplier, 4);
    const t = new Square({
      type: 't',
      surface: { id: "base" },
      underlay: "T",
      col: 0
    });
    assert.equal(t.letterScoreMultiplier, 3);
    assert.equal(t.underlay, "T");
    assert.equal(typeof t.wordScoreMultiplier, "undefined");
    const T = new Square({
      type: 'T',
      surface: { id: "base" },
      col: 0
    });
    assert.equal(typeof T.letterScoreMultiplier, "undefined");
    assert.equal(T.wordScoreMultiplier, 3);
    const d = new Square({
      type: 'd',
      surface: { id: "base" },
      tile: "dummy",
      col: 0
    });
    assert.equal(d.letterScoreMultiplier, 2);
    assert.equal(d.tile, "dummy");
    assert.equal(typeof d.wordScoreMultiplier, "undefined");
    const D = new Square({
      type: 'D',
      surface: { id: "base" },
      col: 0
    });
    assert.equal(typeof D.letterScoreMultiplier, "undefined");
    assert.equal(D.wordScoreMultiplier, 2);
    const M = new Square({
      type: 'M',
      surface: { id: "base" },
      col: 9
    });
    assert.equal(typeof M.letterScoreMultiplier, "undefined");
    assert.equal(M.wordScoreMultiplier, 2);
    assert.equal(M.stringify(), "#M@9");
    const _ = new Square({
      type: '_',
      surface: { id: "base" },
      col: 0
    });
    assert.equal(typeof _.letterScoreMultiplier, "undefined");
    assert.equal(typeof _.wordScoreMultiplier, "undefined");
    assert(!_.isBoard);
    const r = new Square({
      type: '_',
      surface: { id: "base" },
      col: 0, row: 0
    });
    assert(r.isBoard);
    assert.equal(r.stringify(), "#_@0,0");
  });
});

