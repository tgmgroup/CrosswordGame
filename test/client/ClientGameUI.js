/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha, node */

/* global Platform */

import { assert } from "chai";
import { setupPlatform, setup$, setupI18n, StubServer, getTestGame } from "../TestPlatform.js";
import { TestSocket } from "../TestSocket.js";
import { Game } from "../../src/game/Game.js";
import { CBOR } from "../../src/game/CBOR.js";

describe("client/ClientGameUI", () => {

  const GAME_DEFAULTS = {
    edition: "Test",
    dictionary: "Oxford_5000"
  };

  const USER_DEFAULTS = {
    theme: "default",
    jqTheme: "invader"
  };

  const session = {
    name: "Descartes",
    settings: {
      "language": "en",
      "xanadoCSS": "default",
      "jqTheme": "vader",
      "turn_alert": false,
      "cheers": false,
      "tile_click": false,
      "warnings": false,
      "one_window": false,
      "notification": false
    }
  };

  const config = {
    auth: {
      db_file: "delayed"
    },
    defaults: {
      edition: "Test",
      dictionary: "Oxford_5000",
      theme: "default"
    },
    games: "delayed"
  };

  let ClientGameUI, keep = {};
  let received = {}, expected = {};
  before(
    () => setupPlatform()
    .then(() => setup$(
      `${import.meta.url}/../../html/client_game.html?game=unfinished_game`,
      Platform.getFilePath("/html/client_game.html")))
    .then(() => setupI18n())
    // UI imports jquery.i18n which requires jquery, so have
    // to delay the import
    .then(() => import("../../src/client/ClientGameUI.js"))
    .then(mod => ClientGameUI = mod.ClientGameUI)
    .then(() => {
      keep.location = global.location;
      global.location = { href: "here", hash: "" };
    }));

  after(() => {
    global.location = keep.location;
  });

  beforeEach(() => {
    $("head").html("");
    $("body").html("");
  });

  it("handlers", () => {
    const server = new StubServer({
      "/session": {
        promise: Promise.resolve(session),
        count: 2
      },
      "/defaults/user": Promise.resolve(USER_DEFAULTS),
      "/defaults/game": Promise.resolve(GAME_DEFAULTS),
      "/locales": {
        promise: Platform.readFile(Platform.getFilePath("/i18n/index.json")),
        count: 1
      },
      "/game/unfinished_game": getTestGame("unfinished_game", Game)
      .then(game => CBOR.encode(game, Game.CLASSES))
    });
    const ui = new ClientGameUI();
    ui.session = session;
    ui.channel = new TestSocket("socket");
    ui.attachChannelHandlers();
    return ui.create()
    .then(() => server.wait());
    // TODO: actually test a game!
  });
});
