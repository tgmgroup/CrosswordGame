/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha,node */

import { assert } from "chai";
import { setupPlatform, setup$, setupI18n } from "../TestPlatform.js";
import sparseEqual from "../sparseEqual.js";

import { Edition } from "../../src/game/Edition.js";
import { BrowserGame } from "../../src/browser/BrowserGame.js";
const Tile = BrowserGame.CLASSES.Tile;
const Board = BrowserGame.CLASSES.Board;

describe("browser/BrowserBoard", () => {

  before(
    () => setupPlatform()
    .then(() => setup$())
    .then(() => setupI18n()));

  it("analysePlay", () => {
    return Edition.load("Test")
    .then(edition => {
      let b = new Board(BrowserGame.CLASSES, edition);
      for (let r = 0; r < b.rows; r++)
        for (let c = 0; c < b.cols; c++)
          assert(!b.touchingOld(r, c));
      const mr = Math.floor(b.rows / 2);
      const mc = Math.floor(b.cols / 2);

      const W = new Tile({letter: "W", score:4});
      const O = new Tile({letter: "O", score:1});
      const R = new Tile({letter: "R", score:2, isBlank:true});
      const D = new Tile({letter: "D", score:3});

      b.at(mr, mc).placeTile(W);
      b.at(mr, mc+1).placeTile(O);
      b.at(mr, mc+2).placeTile(R);
      b.at(mr, mc+3).placeTile(D);

      // Move will create new tile objects that don't carry the _$tile
      // attribute
      delete W._$tile;
      delete O._$tile;
      delete R._$tile;
      delete D._$tile;

      let move = b.analysePlay();
      sparseEqual(move, {
        words: [ {
          word: "WORD",
          score: 20
        } ],
        /* score 10 for tiles, 2X for first play */
        score: 20,
        placements: [ W, O, R, D ]
      });

      // Clear the temp tiles
      b.at(mr, mc).unplaceTile();
      b.at(mr, mc+1).unplaceTile();
      b.at(mr, mc+2).unplaceTile();
      b.at(mr, mc+3).unplaceTile();

      // Lock down the play
      b.at(mr, mc).placeTile(W, true);
      b.at(mr, mc+1).placeTile(O, true);
      R.letter = "R";
      b.at(mr, mc+2).placeTile(R, true);
      b.at(mr, mc+3).placeTile(D, true);

      // Score another play that extends the existing word
      const S = new Tile({letter: "S", score: 1});
      const U = new Tile({letter: "U", score: 1});
      const N = new Tile({letter: "N", isBlank:true, score: 2});

      b.at(mr, mc-1).placeTile(S);
      b.at(mr+1, mc-1).placeTile(U);
      b.at(mr+2, mc-1).placeTile(N);

      delete S._$tile;
      delete U._$tile;
      delete N._$tile;

      move = b.analysePlay();
      sparseEqual(move, {
        words: [ { word: "SUN", score: 5 }, { word: "SWORD", score: 11 } ],
        score: 16,
        placements: [ S, U, N ]
      });

      // clear temp tiles
      b.at(mr, mc-1).unplaceTile();
      b.at(mr+1, mc-1).unplaceTile();
      b.at(mr+2, mc-1).unplaceTile();

      // Score another play that intersects the existing word
      b.at(mr+1, mc+3).placeTile(U);
      N.letter = "N";
      b.at(mr+2, mc+3).placeTile(N);

      delete U._$tile;
      delete N._$tile;

      move = b.analysePlay();
      sparseEqual(move, {
        words: [ { word: "DUN", score: 6 } ],
        score: 6,
        placements: [ U, N ]
      });
    });
  });

  it("analysePlay - disconnected", () => {
    return Edition.load("Test")
    .then(edition => {
      let b = new Board(BrowserGame.CLASSES, edition);
      for (let r = 0; r < b.rows; r++)
        for (let c = 0; c < b.cols; c++)
          assert(!b.touchingOld(r, c));
      const mr = Math.floor(b.rows / 2);
      const mc = Math.floor(b.cols / 2);

      const W = new Tile({letter: "W", score:4});
      const O = new Tile({letter: "O", score:1});
      const R = new Tile({letter: "R", score:2, isBlank:true});
      const D = new Tile({letter: "D", score:3});

      b.at(mr, mc).placeTile(W);
      b.at(mr, mc+1).placeTile(O);
      b.at(mr, mc+2).placeTile(R);
      b.at(mr, mc+3).placeTile(D);

      delete W._$tile;
      delete O._$tile;
      delete R._$tile;
      delete D._$tile;

      let move = b.analysePlay();
      sparseEqual(move, {
        words: [ { word: "WORD", score: 20 } ],
        score: 20,
        placements: [ W, O, R, D ]
      });

      // Clear the temp tiles
      b.at(mr, mc).unplaceTile();
      b.at(mr, mc+1).unplaceTile();
      b.at(mr, mc+2).unplaceTile();
      b.at(mr, mc+3).unplaceTile();

      // Lock down the play
      b.at(mr, mc).placeTile(W, true);
      b.at(mr, mc+1).placeTile(O, true);
      b.at(mr, mc+2).placeTile(R, true);
      b.at(mr, mc+3).placeTile(D, true);

      const S = new Tile({letter: "S", score: 1});

      b.at(1, 1).placeTile(S);

      delete S._$tile;

      move = b.analysePlay();
      assert.equal(move, $.i18n("warn-disco"));
    });
  });

  it("analyse first play - disconnected", () => {
    return Edition.load("Test")
    .then(edition => {
      let b = new Board(BrowserGame.CLASSES, edition);
      for (let r = 0; r < b.rows; r++)
        for (let c = 0; c < b.cols; c++)
          assert(!b.touchingOld(r, c));
      const mr = Math.floor(b.rows / 2);
      const mc = Math.floor(b.cols / 2);

      const W = new Tile({letter: "W", score:4});
      const O = new Tile({letter: "O", score:1});
      const R = new Tile({letter: "R", score:2, isBlank:true});
      const D = new Tile({letter: "D", score:3});

      b.at(mr, mc).placeTile(W);
      b.at(mr, mc+1).placeTile(O);
      b.at(mr+1, mc+2).placeTile(R);
      b.at(mr, mc+3).placeTile(D);

      let move = b.analysePlay();
      assert.equal(move, $.i18n("warn-disco"));
    });
  });

  it("analyse first play - centre missing", () => {
    return Edition.load("Test")
    .then(edition => {
      let b = new Board(BrowserGame.CLASSES, edition);
      for (let r = 0; r < b.rows; r++)
        for (let c = 0; c < b.cols; c++)
          assert(!b.touchingOld(r, c));
      const mr = Math.floor(b.rows / 2);
      const mc = Math.floor(b.cols / 2);

      const W = new Tile({letter: "W", score:4});
      const O = new Tile({letter: "O", score:1});
      const R = new Tile({letter: "R", score:2, isBlank:true});
      const D = new Tile({letter: "D", score:3});

      b.at(mr, mc+1).placeTile(W);
      b.at(mr, mc+2).placeTile(O);
      b.at(mr, mc+3).placeTile(R);
      b.at(mr, mc+4).placeTile(D);

      let move = b.analysePlay();
      assert.equal(move, $.i18n("warn-uncentred"));
    });
  });

  it("analyse first play - single tile", () => {
    return Edition.load("Test")
    .then(edition => {
      let b = new Board(BrowserGame.CLASSES, edition);
      for (let r = 0; r < b.rows; r++)
        for (let c = 0; c < b.cols; c++)
          assert(!b.touchingOld(r, c));
      const mr = Math.floor(b.rows / 2);
      const mc = Math.floor(b.cols / 2);

      const W = new Tile({letter: "W", score:4});

      b.at(mr, mc).placeTile(W);

      let move = b.analysePlay();
      assert.equal(move, $.i18n("warn-2-tiles"));
    });
  });

  it("$ui", () => {
    let $dact = $(document.createElement("div"));
    $("body").append($dact);

    let $table = $(document.createElement("table"));
    $dact.append($table);

    // 5x5 board
    const edition = new Edition({
      layout: [
        "Dd_",
        "T_t",
        "QqM" ],
      bag: [
        { score: 0, count: 1 },
        { letter: "W", score: 1, count: 1 },
        { letter: "O", score: 1, count: 1 },
        { letter: "R", score: 1, count: 1 },
        { letter: "D", score: 1, count: 1 },
        { letter: "A", score: 1, count: 1 },
        { letter: "L", score: 1, count: 1 },
        { letter: "K", score: 1, count: 1 }
      ],
      rackCount: 3,
      swapCount: 1,
      bonuses: {}
    });

    let b = new Board(BrowserGame.CLASSES, edition);

    b.$populate($table);

    const W = new Tile({letter: "W", score:4});
    const O = new Tile({letter: "O", score:1});
    const R = new Tile({letter: "R", score:2, isBlank:true});
    const A = new Tile({letter: "A", score: 1});
    const L = new Tile({letter: "L", isBlank:true, score: 2});

    // Lock down the play.
    b.at(0, 0).placeTile(W, true);
    b.at(0, 1).placeTile(O, true);
    b.at(0, 2).placeTile(R, true);
    b.at(1, 0).placeTile(A);
    b.at(2, 0).placeTile(L);

    // Not going to do a detailed check because it should be obvious
    // from interface testing if it worked
  });
});
