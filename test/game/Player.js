/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha */

import { assert } from "chai";
import { Game } from "../../src/game/Game.js";
const Player = Game.CLASSES.Player;

describe("game/Player", () => {

  it("construct", () => {
    const p = {
      name: "name",
      key: "key",
      isRobot: true,
      canChallenge: true,
      missNextTurn: true,
      dictionary: "NoDic"
    };
    let player = new Player(p, Game.CLASSES);
    for (const f in p)
      assert.equal(player[f], p[f], f);
    // Check fields that must be zeroed
    p.score = 999;
    p.passes = 999;
    p.clock = 999;
    player = new Player(p, Game.CLASSES);
    assert.equal(player.score, 0);
    assert.equal(player.passes, 0);
    assert.equal(player.clock, 0);
  });

  it("valueOf, toString, and serialisable", () => {
    const p = {
      name: "Player 1",
      key: "playerkey",
      isRobot: false,
      canChallenge: false,
      missNextTurn: false,
      //_debug: console.debug,
      dictionary: "NoDic"
    };
    const player = new Player(p, Game.CLASSES);
    player.isRobot = true;
    player.score = 20;

    return player.serialisable()
    .then(d => {
      assert.deepEqual(d, {
        name: 'Player 1',
        isRobot: true,
        dictionary: 'NoDic',
        key: 'playerkey',
        score: 20
      });
      const pp = Player.fromSerialisable(d, Game.CLASSES);
      pp._debug = player._debug;
      delete player.rack;
      delete pp.rack;
      assert(!pp.canChallenge);
      assert(!pp.missNextTurn);
      assert(pp.isRobot);
      assert.deepEqual(pp, player);
    });
  });
});
