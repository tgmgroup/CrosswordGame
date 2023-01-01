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

import { BrowserSquare } from "../../src/browser/BrowserSquare.js";
import { BrowserTile } from "../../src/browser/BrowserTile.js";

/**
 * Unit tests for Square class
 */
describe("browser/BrowserSquare", () => {

  before(() => {
    // Delayed imports to allow jQuery to be defined
    $.i18n = I18N;
    return Promise.all([
      I18N().load("en"),
      import("jquery-ui/dist/jquery-ui.js")
    ]);
  });

  function UNit() {}

  it('$populate', () => {
    let sq = new BrowserSquare({type: 'q', surface: { id: "base" }, col: 56, row: 42});
    let $dact = $("<div></div>");
    $("body").append($dact);
    let $td = $("<td></td>");
    $dact.append($td);
    let $dexp = $("<div></div>");
    $dexp.append('<td class="square-q score-multiplier ui-droppable" id="base_56x42"><div class="underlay" data-long="QUAD LETTER SCORE" data-short="QL"></div></td>');
    $("body").append($dexp);
    sq.$populate($td);
    assert($dact[0].isEqualNode($dexp[0]));
    $("body").empty();
  });

  it("empty", () => {
    let sq = new BrowserSquare({type: 'q', surface: { id: "base" }, col: 56, row: 42});
    sq.setUnderlay('T');
    let $dact = $("<div></div>");
    $("body").append($dact);
    let $td = $("<td></td>");
    $dact.append($td);
    let $dexp = $("<div></div>");
    $dexp.append('<td class="square-q ui-droppable" id="base_56x42"><div class="underlay">T</div></td>');
    sq.$populate($td);
    assert($dact[0].isEqualNode($dexp[0]));
    $("body").empty();
  });

  it("occupied unlocked", () => {
    let sq = new BrowserSquare({type: 'q', surface: { id: 'surface' }, col: 56, row: 42});
    sq.setUnderlay('T');
    let $td = $("<td></td>");
    $("body").append($("<div id='act'></div>").append($td));
    let tile = new BrowserTile({ letter:'S', isBlank:false });
    sq.placeTile(tile);
    sq.$populate($td);
    sq.select(false);
    
    const $letter = $('<span class="letter">S</span>');
    const $score = $('<span class="score">0</span>');
    const $glyph = $('<div class="glyph"></div>');
    $glyph.append($letter).append($score);
    const $tile = $('<div class="Tile ui-draggable ui-draggable-handle unlocked-tile"></div>');
    $tile.append($glyph);
    const $underlay = $('<div class="underlay">T</div>');
    $td = $('<td class="square-q" id="surface_56x42"></td>');
    $td.append($underlay).append($tile);
    $("body").append($('<div id="exp"></div>').append($td));

    const $act = $("#act").children().first();
    const $exp = $("#exp").children().first();
    assert($act[0].isEqualNode($exp[0]),
           "\n\t" + $("#act").html() + "\n\t" + $("#exp").html());
    $("body").empty();
  });

  it("occupied unlocked selected", () => {
    let sq = new BrowserSquare({type: 'q', surface: {id: 'surface'}, col: 56, row: 42});
    sq.setUnderlay('T');
    let $td = $("<td></td>");
    $("body").append($("<div id='act'></div>").append($td));
    let tile = new BrowserTile({ letter:'S', isBlank:false });
    sq.placeTile(tile);
    sq.$populate($td);
    sq.select(true);

    const $letter = $('<span class="letter">S</span>');
    const $score = $('<span class="score">0</span>');
    const $glyph = $('<div class="glyph"></div>');
    $glyph.append($letter).append($score);
    const $tile = $('<div class="Tile ui-draggable ui-draggable-handle unlocked-tile selected"></div>');
    $tile.append($glyph);
    const $underlay = $('<div class="underlay">T</div>');
    $td = $('<td class="square-q" id="surface_56x42"></td>');
    $td.append($underlay).append($tile);
    $("body").append($('<div id="exp"></div>').append($td));

    const $act = $("#act").children().first();
    const $exp = $("#exp").children().first();
    assert($act[0].isEqualNode($exp[0]),
           "\n\t" + $("#act").html() + "\n\t" + $("#exp").html());
    $("body").empty();
  });

  it("occupied locked", () => {
    let sq = new BrowserSquare({type:'_', surface: { id: 'surface'}, col:56, row:42});
    let $td = $("<td></td>");
    $("body").append($("<div id='act'></div>").append($td));
    let tile = new BrowserTile({ letter:'W', isBlank:false });
    sq.placeTile(tile, true);
    sq.$populate($td);

    const $letter = $('<span class="letter">W</span>');
    const $score = $('<span class="score">0</span>');
    const $glyph = $('<div class="glyph"></div>')
          .append($letter).append($score);
    const $tile = $('<div class="Tile locked-tile"></div>')
          .append($glyph);
    $td = $('<td class="square-_" id="surface_56x42"></td>').append($tile);
    $("body").append($('<div id="exp"></div>').append($td));
    
    const $act = $("#act").children().first();
    const $exp = $("#exp").children().first();
    assert($act[0].isEqualNode($exp[0]),
           "\n\t" + $("#act").html() + "\n\t" + $("#exp").html());
    $("body").empty();
  });

  // Checked dispatched events
  it("place-unplace", () => {

    let sq = new BrowserSquare({type:'_', surface: { id: 'surface'}, col:56, row:42});
    let $td = $("<td></td>");
    let $dact = $("<div></div>").append($td);
    $("body").append($dact);
    sq.$populate($td);

    let tile = new BrowserTile({ letter:'W', isBlank:false });
    sq.placeTile(tile); // should $placeTile

    const $letter = $('<span class="letter">W</span>');
    const $score = $('<span class="score">0</span>');
    const $glyph = $('<div class="glyph"></div>')
          .append($letter).append($score);
    const $tile = $('<div class="Tile ui-draggable ui-draggable-handle unlocked-tile"></div>')
          .append($glyph);
    $td = $('<td class="square-_" id="surface_56x42"></td>').append($tile);
    const $dexp = $('<div></div>').append($td);
    
    assert($dact[0].isEqualNode($dexp[0]),
           "\n" + $dact.html() + "\n" + $dexp.html());

    sq.unplaceTile(); // should $unplaceTile

    $td.addClass("ui-droppable");
    $tile.remove();
    assert($dact[0].isEqualNode($dexp[0]),
           "\n" + $dact.html() + "\n\n" + $dexp.html());
    assert(sq.isEmpty());
    assert(!sq.hasLockedTile());
    $("body").empty();
  });
});

