/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha, node */

import { assert } from "chai";
import { setupPlatform, setup$, setupI18n } from "../TestPlatform.js";
import { BrowserDatabase } from "../../src/browser/BrowserDatabase.js";
import { BrowserGame } from "../../src/browser/BrowserGame.js";
import { BrowserPlayer } from "../../src/browser/BrowserPlayer.js";
import { GameSetupDialog } from "../../src/browser/GameSetupDialog.js";

describe("browser/GameSetupDialog", () => {

  before(
    () => setupPlatform()
    .then(() => setup$())
    .then(() => setupI18n()));

  beforeEach(() => {
    $("head").empty();
    $("body").empty();
  });

  it ("dialog", () => {
    const db = new BrowserDatabase();
    const game = new BrowserGame({ edition: "Test" });
		const robot1 = new BrowserPlayer(
			{name:"Robot 1", key:"robot1", isRobot: true, score: 1},
      BrowserGame.CLASSES);
		const human1 = new BrowserPlayer(
			{name:"Human 1", key:"human1", isRobot: false, score: 2},
      BrowserGame.CLASSES);

    const ui = {
      session: { key : "session key" },
      getSetting: s => {
        if (s === "canEmail") return false;
        return BrowserGame.DEFAULTS[s];
      },
      promiseEditions: () => Promise.resolve([ "Test", "Divide" ]),
      promiseDictionaries: () => Promise.resolve([ "Jurassic", "Devonian" ]),
      promiseDefaults: type => Promise.resolve(
        (type === "game")
        ? {
	        edition: "Test",
	        dictionary: "Devonian"
        }
        : assert.fail(type))
    };

    let dlg;

    return game.onLoad(db)
    .then(() => game.create())
    .then(() => new Promise(resolve => {
      dlg = new GameSetupDialog({
        game: game,
        ui: ui,
        //debug: console.debug,
        onReady: dlg => {
          dlg.$dlg.dialog("close");
        },
        close: resolve
      });
    }));
  });
});
