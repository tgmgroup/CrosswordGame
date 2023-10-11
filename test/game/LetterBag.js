/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha */

import { assert } from "chai";
import { Edition } from "../../src/game/Edition.js";
import { Tile } from "../../src/game/Tile.js";
import { LetterBag } from "../../src/game/LetterBag.js";
import { setupPlatform } from "../TestPlatform.js";

/**
 * Unit tests for Rack
 */
describe("game/LetterBag", () => {

  before(setupPlatform);

  it("basics", () => {
    return Edition.load("Test")
    .then(edition => {
      let bag = new LetterBag(edition);
      let fullBag = bag.letters();
      let base = fullBag.sort().join("");

      assert.equal(fullBag.length, 59);
      assert.equal(bag.legalLetters.length, 26);
      assert(!bag.isEmpty());

      let t = bag.getRandomTile();
      assert.equal(bag.letters().length, 58);
      assert.equal(bag.letters().sort().join(""), base.replace(t.letter, ""));
      bag.returnTile(t);
      assert.equal(bag.letters().length, 59);
      assert.equal(bag.letters().sort().join(""), base);
      t = bag.getRandomTiles(10);
      assert.equal(t.length, 10);
      assert.equal(bag.letters().length, 49);
      bag.returnTiles(t);
      assert.equal(bag.letters().sort().join(""), base);

      let q = bag.removeTile({letter: "Q"});
      assert(q instanceof Tile);
      assert.equal(q.letter, "Q");
      assert(!q.isBlank);

      let b = bag.removeTile({letter: "Q"});
      assert(!b);

      t = bag.removeTiles([ {letter: "A"}, {letter: "A"} ]);
      assert.equal(bag.remainingTileCount(), 56);
      assert.deepEqual(t, [ { letter: 'A', score: 1 },
                            { letter: 'A', score: 1 } ]);
      bag.returnTiles(t);
      bag.returnTile(q);
      assert.equal(bag.letters().length, 59);
      assert.equal(bag.letters().sort().join(""), base);
    });
  });

  it("wild", () => {
    return Edition.load("Test")
    .then(edition => {
      let bag = new LetterBag(edition);
      bag.isWild = true;
      assert.equal(bag.letters().length, 59);
      assert.equal(bag.legalLetters.length, 26);
      assert(!bag.isEmpty());

      let q = bag.removeTile({letter: "Q", score: 10});
      assert(q instanceof Tile);
      assert.equal(q.letter, "Q");
      assert.equal(q.score, 10);
      assert(!q.isBlank);

      let b = bag.removeTile({letter: "Q", isBlank: true});
      assert(b instanceof Tile);
      assert.equal(b.letter, "Q");
      assert(b.isBlank);

      let t = bag.removeTiles([
        {letter: "A", score: 99},
        {letter: "A", score: -10}
      ]);
      assert.equal(bag.remainingTileCount(), 55);
      assert.deepEqual(t, [ { letter: 'A', score: 99 },
                            { letter: 'A', score: -10 } ]);

      let i = 0;
      while (bag.remainingTileCount() > 0) {
        let b = bag.removeTile({letter: "Q", score: ++i});
        assert.equal(b.letter, "Q");
        assert.equal(b.score, i);
        assert(!b.isBlank);
      }
    });
  });
});
