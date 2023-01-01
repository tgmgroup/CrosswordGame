/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env node, mocha */

import { JSDOM } from "jsdom";
const { window } = new JSDOM(
  '<!doctype html><html><body id="working"></body></html>');
global.window = window;
global.document = window.document;
global.navigator = { userAgent: "node.js" };
import jquery from "jquery";
global.$ = global.jQuery = jquery(window);

import { ServerPlatform } from "../../src/server/ServerPlatform.js";
global.Platform = ServerPlatform;

import { I18N } from "../../src/server/I18N.js";

import { BrowserGame } from "../../src/browser/BrowserGame.js";
const Player = BrowserGame.CLASSES.Player;

describe("browser/BrowserPlayer", () => {

  before(() => {
    // Delayed imports to allow jQuery to be defined
    $.i18n = I18N;
    return Promise.all([
      I18N().load("en"),
      import("jquery-ui/dist/jquery-ui.js")
    ]);
  });

  it("$html-robot", () => {
    const p = {
      name: "Player 1",
      key: "playerkey",
      isRobot: true,
      canChallenge: true,
      missNextTurn: true,
      //_debug: console.debug,
      dictionary: "NoDic"
    };
    const player = new Player(p, BrowserGame.CLASSES);

    const $tr = $(document.createElement("tr")).addClass("player-row");
    $tr[0].id = `player${p.key}`;
    $tr.append("<td class='turn-pointer'>&#10148;</td>");
    $tr.append("<td><div class='ui-icon icon-robot'></div></td>");
    $tr.append(`<td class="player-name miss-turn">${p.name}</td>`);
    $tr.append("<td class='remaining-tiles'></td>");
    $tr.append(`<td class="connect-state online">●</td>`);
    $tr.append("<td class='score'>0</td>");
    $tr.append("<td class='player-clock'></td>");

    player.online(false);

    const $act = player.$tableRow();
    assert($act[0].isEqualNode($tr[0]),
           `expected: ${$tr.html()}\n actual: ${$act.html()}`);
    player.score = 666;
    $("body").append("<div id='playerplayerkey'><div class='score'>fail</div></div>");
    player.$refreshScore();
    assert.equal($("#playerplayerkey .score").text(), player.score);
  });

  it("$html-human", () => {
    const p = {
      name: "Player 1",
      key: "playerkey",
      isRobot: false,
      canChallenge: false,
      missNextTurn: false,
      //_debug: console.debug,
      dictionary: "NoDic"
    };
    const player = new Player(p, BrowserGame.CLASSES);
    player.score = 20;
    player.online(false);

    const $div = $(document.createElement("table"));
    const $tr = $(document.createElement("tr")).addClass("player-row whosTurn");
    $tr[0].id = `player${p.key}`;

    $tr.append("<td class='turn-pointer'>&#10148;</td>");
    $tr.append("<td><div class='ui-icon icon-person'></div></td>");
    $tr.append(`<td class="player-name">You</td>`);
    $tr.append("<td class='remaining-tiles'></td>");
    $tr.append(`<td class='connect-state offline'>●</td>`);
    $tr.append("<td class='score'>20</td>");
    $tr.append("<td class='player-clock'></td>");

    // passing player will make it this player's turn
    const $act = player.$tableRow(player);

    $div.append($tr);
    $div.append($act);
    assert.equal($tr.html(), $act.html());
    assert($act[0].isEqualNode($tr[0]), $div.html());

  });
});
