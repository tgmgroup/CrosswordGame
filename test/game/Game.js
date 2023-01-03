/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha,node */

import { assert } from "chai";
import { setupPlatform } from "../TestPlatform.js";
import { Game } from "../../src/game/Game.js";
const Square = Game.CLASSES.Square;
const Turn = Game.CLASSES.Turn;
const Player = Game.CLASSES.Player;

/**
 * Unit tests for Game base class. See ServerGame.ut and BrowserGame.ut
 * for more.
 */
describe("game/Game", () => {

  before(setupPlatform);

  it("construct, serialisable, fromSimple", () => {
    const p = {
      edition:"English_Scrabble",
      dictionary:"Oxford_5000",
      timerType: Game.Timer.GAME,
      timeAllowed: 60,
      timePenalty: 100,
      predictScore: true,
      allowTakeBack: true,
      wordCheck: Game.WordCheck.AFTER,
      minPlayers: 5,
      //_debug: console.debug,
      maxPlayers: 10
    };
    let game;
    return new Game(p)
    .create()
    .then(g => game = g)
    .then(() => {
      assert.equal(game.edition, p.edition);
      assert.equal(game.dictionary, p.dictionary);
      assert.equal(game.timerType, Game.Timer.GAME);
      assert.equal(game.timePenalty, 100);
      assert.equal(game.timeAllowed, 60);
      assert(game.predictScore);
      assert(game.allowTakeBack);
      assert(game.wordCheck);
      assert.equal(game.minPlayers, 5);
      assert.equal(game.maxPlayers, 10);
      assert.equal(game.state, Game.State.WAITING);
      return game.serialisable();
    })
    .then(s => {
      assert.equal(s.key, game.key);
      assert.equal(s.creationTimestamp, game.creationTimestamp);
      assert.equal(s.edition, game.edition);
      assert.equal(s.dictionary, game.dictionary);
      assert.equal(s.predictScore, game.predictScore);
      assert.equal(s.wordCheck, game.wordCheck);
      assert.equal(s.allowTakeBack, game.allowTakeBack);
      assert.equal(s.state, game.state);
      assert.equal(s.whosTurnKey, game.whosTurnKey);
      assert.equal(s.timerType, game.timerType);
      assert.equal(s.timeAllowed, game.timeAllowed);
      assert.equal(s.timePenalty, game.timePenalty);
      assert.equal(s.pausedBy, game.pausedBy);
      assert.equal(s.minPlayers, game.minPlayers);
      assert.equal(s.maxPlayers, game.maxPlayers);
      assert.equal(s.challengePenalty, game.challengePenalty);
      assert.equal(s.penaltyPoints, game.penaltyPoints);
      assert.equal(s.nextGameKey, game.nextGameKey);
      assert.equal(s.lastActivity, game.lastActivity());
      assert.equal(s.players.length, 0);
      game = Game.fromSerialisable(s, Game.CLASSES);
      assert.equal(s.key, game.key);
      assert.equal(s.creationTimestamp, game.creationTimestamp);
      assert.equal(s.edition, game.edition);
      assert.equal(s.dictionary, game.dictionary);
      assert.equal(s.predictScore, game.predictScore);
      assert.equal(s.wordCheck, game.wordCheck);
      assert.equal(s.allowTakeBack, game.allowTakeBack);
      assert.equal(s.state, game.state);
      assert.equal(s.whosTurnKey, game.whosTurnKey);
      assert.equal(s.timerType, game.timerType);
      assert.equal(s.timeAllowed, game.timeAllowed);
      assert.equal(s.timePenalty, game.timePenalty);
      assert.equal(s.pausedBy, game.pausedBy);
      assert.equal(s.minPlayers, game.minPlayers);
      assert.equal(s.maxPlayers, game.maxPlayers);
      assert.equal(s.challengePenalty, game.challengePenalty);
      assert.equal(s.penaltyPoints, game.penaltyPoints);
      assert.equal(s.nextGameKey, game.nextGameKey);
      assert.equal(s.lastActivity, game.lastActivity());
      assert.equal(s.players.length, 0);
      assert.equal(s.turns.length, 0);
    });
  });

  it("basics", () => {
    const p = {
      //_debug: console.debug,
      edition:"English_Scrabble",
      dictionary:"Oxford_5000",
      timerType: Game.Timer.TURN,
      timeAllowed: 999,
      predictScore: false,
      allowTakeBack: false,
      wordCheck: Game.WordCheck.AFTER,
      minPlayers: 30,
      maxPlayers: 1
    };

    const game = new Game(p);
    const robot1 = new Player({
      name:"Robot 1", key:"robot1", isRobot: true}, Game.CLASSES);
    assert.equal(Game.CLASSES, robot1._factory);
    const human2 = new Player({
      name:"human2", key:"human2", isRobot: false}, Game.CLASSES);
    const human3 = new Player({
      name:"human3", key:"human3", isRobot: false}, Game.CLASSES);

    const human4 = new Player({
      name:"human4", key:"human4", isRobot: false}, Game.CLASSES);

    const um = { // UserManager fixture
      getUser: k => Promise.resolve({ email: k.key + "@players.com" })
    };

    return game.create()
    .then(() => {
      assert.equal(game.edition, p.edition);
      assert.equal(game.dictionary, p.dictionary);
      assert.equal(game.timeAllowed, 999);
      assert(!game.predictScore);
      assert(!game.allowTakeBack);
      assert.equal(game.wordCheck, Game.WordCheck.AFTER);
      assert.equal(game.minPlayers, 30);
      assert.equal(typeof game.maxPlayers, "undefined");
      assert(!game.hasRobot());
      game.addPlayer(robot1, true);
      game.addPlayer(human2, true);
      game.addPlayer(human3, false);
      game.addPlayer(human4, true);
      assert(game.hasRobot());
      assert.equal(game.getPlayers().length, 4);
      assert.equal(game.getPlayerWithKey(human2.key), human2);
      assert.equal(game.getPlayerWithNoTiles(), human3);
      human3.fillRack(game.letterBag, 1);
      assert(!game.getPlayerWithNoTiles());
      human3.rack.empty();
      game.whosTurnKey = human2.key;

      robot1.score = 1;
      human2.score = 2;
      human3.score = 3;
      human4.score = 4;

      human4._isConnected = true;
      human4.isNextToGo = true;

      let player = game.getPlayer();
      assert.equal(player, human2);
      player = game.getPlayerWithKey(human2.key);
      assert.equal(player.key, human2.key);
      assert.equal(game.nextPlayer(), human3);
      assert.equal(game.previousPlayer(), robot1);
      assert.equal(game.previousPlayer(robot1), human4);
      assert.equal(game.previousPlayer(human2), robot1);
      assert.equal(game.nextPlayer().key, human3.key);
      assert.equal(game.nextPlayer(robot1), human2);
      assert.equal(game.nextPlayer(human2.key), human3);
      assert.equal(game.winningScore(), 4);
      assert.equal(game.state, Game.State.WAITING);
      assert.equal(game.calculateBonus(1), 0);
      assert.equal(game.calculateBonus(2), 0);
      assert.equal(game.calculateBonus(3), 0);
      assert.equal(game.calculateBonus(4), 0);
      assert.equal(game.calculateBonus(5), 0);
      assert.equal(game.calculateBonus(6), 0);
      assert.equal(game.calculateBonus(7), 50);
      assert.equal(game.getWinner(), human4);
      return game.serialisable(um);
    })
    .then(s => {
      assert.equal(s.key, game.key);
      assert.equal(s.creationTimestamp, game.creationTimestamp);
      assert.equal(s.edition, game.edition);
      assert.equal(s.dictionary, game.dictionary);
      assert.equal(s.predictScore || false, game.predictScore || false);
      assert.equal(s.wordCheck, game.wordCheck);
      assert.equal(s.allowTakeBack || false, game.allowTakeBack || false);
      assert.equal(s.state, game.state);
      assert.equal(s.whosTurnKey, game.whosTurnKey);
      assert.equal(s.timerType, game.timerType);
      assert.equal(s.timeAllowed, game.timeAllowed);
      assert.equal(s.timePenalty, game.timePenalty);
      assert.equal(s.pausedBy, game.pausedBy);
      assert.equal(s.minPlayers, game.minPlayers);
      assert.equal(s.maxPlayers, game.maxPlayers);
      assert.equal(s.challengePenalty, game.challengePenalty);
      assert.equal(s.penaltyPoints, game.penaltyPoints);
      assert.equal(s.nextGameKey, game.nextGameKey);
      assert.equal(s.lastActivity, game.lastActivity());
      assert.equal(s.players.length, 4);
      return Promise.all([
        robot1.serialisable(game, um),
        human2.serialisable(game, um),
        human3.serialisable(game, um)
      ])
      .then(ps => {
        assert.deepEqual(s.players[0], ps[0]);
        assert.deepEqual(s.players[1], ps[1]);
        assert.deepEqual(s.players[2], ps[2]);
        game.removePlayer(robot1);
        game.removePlayer(human4);
        assert.equal(game.getPlayers().length, 2);
        assert(!game.getPlayerWithKey(robot1.key));
        assert.equal(game.getPlayerWithKey(human2.key), human2);
        assert.equal(game.getPlayerWithKey(human3.key), human3);
      });
    });
  });

  it("turns", () => {
    const p = {
      //_debug: console.debug,
      edition:"English_Scrabble",
      dictionary:"Oxford_5000",
      timerType: Game.Timer.TURN,
      timeAllowed: 999,
      predictScore: false,
      allowTakeBack: false,
      wordCheck: Game.WordCheck.AFTER,
      minPlayers: 30,
      maxPlayers: 1
    };

    const game = new Game(p);
    return game.create().then(() => {
      game.turns = [
        new Turn({
          score: 0,
          type: "swap",
          gameKey: "e6c65400618fd8aa",
          playerKey: "2v5oyt5qpi",
          nextToGoKey: "49dabe7iua",
          timestamp: 1
        }),
        new Turn({
          score: -5,
          type: "challenge-lost",
          gameKey: "e6c65400618fd8aa",
          playerKey: "49dabe7iua",
          nextToGoKey: "2v5oyt5qpi",
          challengerKey: "2v5oyt5qpi",
          timestamp: game.creationTimestamp + 1
        })
      ];

      assert.equal(game.lastTurn(), game.turns[1]);
      let i = 0;
      game.forEachTurn(t => {
        assert.equal(t, game.turns[i++]);
      });
      assert.equal(i, 2);

      assert(game.at(0, 0) instanceof Square);

      return game.serialisable();
    })
    .then(s => {
      assert.equal(s.turns.length, 2);
    });
  });

  it("CBOR", () => {
    const p = {
      edition:"English_Scrabble",
      dictionary:"Oxford_5000",
      timerType: Game.Timer.GAME,
      timeAllowed: 60,
      timePenalty: 100,
      predictScore: true,
      allowTakeBack: true,
      wordCheck: Game.WordCheck.AFTER,
      minPlayers: 5,
      //_debug: console.debug,
      maxPlayers: 10
    };
    return new Game(p)
    .create()
    .then(game => {
      Game.toCBOR(game);
    });
  });
});

