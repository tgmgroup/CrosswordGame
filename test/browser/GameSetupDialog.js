/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha, node */

import { assert } from "chai";
import { setupBrowser } from "../TestPlatform.js";
import { Game } from "../../src/game/Game.js";
import { GamesUIMixin } from "../../src/browser/GamesUIMixin.js";
import { GameSetupDialog } from "../../src/browser/GameSetupDialog.js";

describe("browser/GameSetupDialog", () => {
  let Test, ui, gamesList = [], gamesHistory = [];

  before(
    () => setupBrowser()
    // UI imports jquery.i18n which requires jquery, so have
    // to delay the import
    .then(() => import("../../src/browser/UI.js"))
    .then(mod => {
      Test = class extends GamesUIMixin(mod.UI) {
        getSetting(t) {
          switch (t) {
          case "language": return "en";
          }
          assert.fail(t); return false;
        }
        getGames() {
          return Promise.resolve(gamesList);
        }
        getHistory(){
          return Promise.resolve(gamesHistory);
        }
        getLocales() {
          return Promise.resolve([ "en" ]);
        }
        getGame(key) {
          const p = gamesList.filter(g => g.key === key)[0];
          return Promise.resolve(p);
        }
      };
    }));

  beforeEach(() => {
    $("head").empty();
    $("body").empty();
    return (ui = new Test()).initLocale();
  });

  it ("game setup dialog", () => {
    gamesList = [
      {
        key: "game1",
        edition: "1st",
        players: [
          { key: "player1", name: "one", score: -999 }
        ],
        turns: [
          { state: Game.Turns.GAME_ENDED }
        ]
      },
      {
        key: "game2",
        edition: "2nd",
        players: [
          { key: "player1", name: "two", score: 1000000 }
        ],
        turns: [
        ]
      }
    ];
    $("body").append(`<table id="gamesList"><tbody></tbody></table>`);

    return ui.readyToListen()
    .then(() => {
      // create a game
      new GameSetupDialog({
          title: $.i18n("Create game"),
          ui: ui,
          postAction: "/createGame",
          postResult: () => this.refreshGames(),
          error: e => ui.alert(e, $.i18n("failed", $.i18n("Create game")))
        });
    });
  });
});
