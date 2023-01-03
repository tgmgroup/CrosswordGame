/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha, node */

import { assert } from "chai";
import { setupBrowser } from "../TestPlatform.js";

describe("standalone/StandaloneGameUI", () => {

  let StandaloneGameUI;

  before(() => setupBrowser()
         // UI imports jquery.i18n which requires jquery, so have
         // to delay the import
         .then(() => import("../../src/standalone/StandaloneGameUI.js"))
         .then(mod => StandaloneGameUI = mod.StandaloneGameUI));

  beforeEach(() => {
    $("head").empty();
    $("body").empty();
  });

  it("handlers", () => {
    $("body").append(`<div id="create-game" class="dialog"></div>`);
    const ui = new StandaloneGameUI();
  });
});
