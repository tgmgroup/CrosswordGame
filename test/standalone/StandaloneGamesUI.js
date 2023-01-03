/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha, node */

import { assert } from "chai";
import { setupBrowser } from "../TestPlatform.js";

describe("standalone/StandaloneGamesUI", () => {

  let StandaloneGamesUI;

  before(() => setupBrowser()
         // UI imports jquery.i18n which requires jquery, so have
         // to delay the import
         .then(() => import("../../src/standalone/StandaloneGamesUI.js"))
         .then(mod => StandaloneGamesUI = mod.StandaloneGamesUI));

  beforeEach(() => {
    $("head").empty();
    $("body").empty();
  });

  it("handlers", () => {
    $("body").append(`<div id="create-game" class="dialog"></div>`);
    const ui = new StandaloneGamesUI();

    // Force an import of SettingsDialog
    ui.attachUIEventHandlers();
    //$("#create-game").trigger("click");
  });
});
