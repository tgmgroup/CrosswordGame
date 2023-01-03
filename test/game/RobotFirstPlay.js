/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha */

import { assert } from "chai";
import { setupPlatform } from "../TestPlatform.js";

import { MemoryDatabase } from "../../test/MemoryDatabase.js";
import { Game } from "../../src/game/Game.js";
import { findBestPlay } from "../../src/game/findBestPlay.js";
const Player = Game.CLASSES.Player;
const Tile = Game.CLASSES.Tile;

/**
 * Test first play on an empty board.
 */
describe("game/RobotFirstPlay", () => {

  before(setupPlatform);

  it("first play English Scrabble", () => {
    let bestPlay;

    let game = new Game({
      edition:"English_Scrabble",
      dictionary:"Oxford_5000"
    });
    return game.create()
    .then(() => game.onLoad(new MemoryDatabase()))
    .then(() => {
      game.addPlayer(new Player({
        name:"test", key:"anonymous", isRobot:false
      }, Game.CLASSES), true);
      return game.loadBoard(
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n");
    })

    .then(game => findBestPlay(
      game, [
        new Tile({letter:"A", isBlank:false, score:1}),
        new Tile({letter:"E", isBlank:false, score:1}),
        new Tile({letter:"I", isBlank:false, score:1}),
        new Tile({letter:"O", isBlank:false, score:1}),
        new Tile({letter:"U", isBlank:false, score:1}),
        new Tile({letter:" ", isBlank:true, score:0}),
        new Tile({letter:" ", isBlank:true, score:0})
      ],
      play => {
        //console.debug(play);
        bestPlay = play;
      },
      game.dictionary))

    .then(() => {
      assert.equal(bestPlay.words[0].word, "AUDIO");
      assert.equal(bestPlay.words[0].score, 10);
      let tile = bestPlay.placements[2];
      assert(tile instanceof Tile);
      assert.equal(tile.letter, "D");
      assert.equal(tile.score, 0);
      assert(tile.isBlank);
    });
  });

  it("first play English WWF", () => {
    let bestPlay;

    let game = new Game({edition:"English_WWF", dictionary:"Oxford_5000"});
    return game.create()
    .then(() => game.onLoad(new MemoryDatabase()))
    .then(game => {
      game.addPlayer(
        new Player({name:"test", key:"slight", isRobot:false},
                   Game.CLASSES), true);
      return game.loadBoard(
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n" +
        "| | | | | | | | | | | | | | | |\n");
    })

    .then(game => findBestPlay(
      game, [
        new Tile({letter:"Z", isBlank:false, score:1}),
        new Tile({letter:"E", isBlank:false, score:1}),
        new Tile({letter:"B", isBlank:false, score:1}),
        new Tile({letter:"U", isBlank:false, score:1})
      ],
      play => bestPlay = play,
      game.dictionary))

    .then(() => {
      assert.equal(bestPlay.words[0].word, "BE");
      assert.equal(bestPlay.words[0].score, 4);
    });
  });
});

