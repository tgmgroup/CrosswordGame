/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha, node */

import { assert } from "chai";
import { setupBrowser, getTestGame } from "../TestPlatform.js";
import { TestSocket } from "../TestSocket.js";
import { BrowserGame } from "../../src/browser/BrowserGame.js";

describe("browser/GameUIMixin", () => {
  let Test, ui, gamesList = [], gamesHistory = [];

  before(
    () => setupBrowser()
    // UI imports jquery.i18n which requires jquery, so have
    // to delay the import
    .then(() => Promise.all([
      import("../../src/browser/UI.js"),
      import("../../src/browser/GameUIMixin.js"),
    ]))
    .then(mods => {
      Test = class extends mods[1].GameUIMixin(mods[0].UI) {
        getSetting(t) {
          switch (t) {
          case "language": return "en";
          case "tile_click": return false;
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

  it("works", () => {
    return getTestGame("unfinished_game", BrowserGame)
    .then(game => {
      ui.channel = new TestSocket("socks");
      ui.player = game.players[0];
      return ui.createUI(game);
    })
    .then(() => {
      ui.attachUIEventHandlers();
      ui.attachChannelHandlers();
      ui.readyToListen();
      ui.selectSquare(ui.game.at(0, 0));
      ui.manuallyPlaceLetter(ui.player.rack.at(0).tile.letter);
    });
  });
});
