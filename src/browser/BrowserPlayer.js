/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/
/* eslint-env browser */

import "jquery/dist/jquery.js";
import { Player } from "../game/Player.js";

// Unicode characters
const BLACK_CIRCLE = "\u25cf";

/**
 * Browser-side {@linkcode Player}
 * @extends Player
 */
class BrowserPlayer extends Player {

  /**
   * Create score table row for the player.
   * @memberof browser/PlayerMixin
   * @instance
   * @param {Player?} uiPlayer the current player in the UI
   * @return {jQuery} jQuery object for the score table
   */
  $tableRow(uiPlayer) {
    const $tr = $(`<tr id="player${this.key}"></tr>`)
          .addClass("player-row");
    if (this === uiPlayer)
      $tr.addClass("whosTurn");
    $tr.append(`<td class="turn-pointer">&#10148;</td>`);
    const $icon = $('<div class="ui-icon"></div>');
    $icon.addClass(this.isRobot ? "icon-robot" : "icon-person");
    $tr.append($(document.createElement("td")).append($icon));
    const who = this === uiPlayer ? $.i18n("You") : this.name;
    const $name = $(`<td class="player-name">${who}</td>`);
    if (this.missNextTurn)
      $name.addClass("miss-turn");
    $tr.append($name);
    $tr.append('<td class="remaining-tiles"></td>');

    // Robots are always connected
    const $status = $(`<td class='connect-state'>${BLACK_CIRCLE}</td>`);
    $status.addClass(
      this._isConnected || this.isRobot ? "online" : "offline");
    $tr.append($status);

    $tr.append(`<td class='score'>${this.score}</td>`);
    $tr.append(`<td class='player-clock'></td>`);

    return $tr;
  }

  /**
   * Refresh score table representation of the player.
   * @instance
   * @memberof browser/PlayerMixin
   */
  $refreshScore() {
    $(`#player${this.key} .score`).text(this.score);
  }

  /**
   * Set 'online' status of player.
   * @instance
   * @memberof browser/PlayerMixin
   * @param {boolean} tf true/false
   */
  online(tf) {
    const conn = this.isRobot || tf;
    if (!this.isRobot)
      this._isConnected = conn;
    let rem = conn ? "offline" : "online";
    let add = conn ? "online" : "offline";
    $(`#player${this.key} .connect-state`)
    .removeClass(rem)
    .addClass(add);
  }
}

export { BrowserPlayer }
