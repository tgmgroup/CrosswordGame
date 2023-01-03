/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/
/* eslint-env browser */

/* global assert */

import { BrowserPlatform } from "../browser/BrowserPlatform.js";
window.Platform = BrowserPlatform;

import "../browser/icon_button.js";

import { BrowserGame } from "../browser/BrowserGame.js";
import { UI } from "../browser/UI.js";
import { GameUIMixin } from "../browser/GameUIMixin.js";
import { ClientUIMixin } from "./ClientUIMixin.js";

/**
 * User interface to a game in a browser. The UI reflects the game state as
 * communicated from the server, through the exchange of various messages.
 * @extends UI
 * @mixes client/ClientUIMixin
 * @mixes browser/GameUIMixin
 */
class ClientGameUI extends ClientUIMixin(GameUIMixin(UI)) {

  /**
   * Identify the signed-in user, and make sure they are playing
   * in this game.
   * @param {BrowserGame} game the game
   * @return {Promise} a promise that resolves to the player key
   * or undefined if the player is not signed in or is not in the game
   * @private
   */
  identifyPlayer(game) {
    $(".bad-user").hide();
    return this.getSession()
    .then(session => {
      // Find if they are a player
      this.player = game.getPlayerWithKey(session.key);
      if (this.player)
        return this.player.key;

      $(".bad-user")
      .show()
      .find("button")
      .on("click", () => {
        $.post("/signout")
        .then(() => window.location.reload());
      });
      throw Error("Not a player");
    })
    .catch(() => {
      // May arise if there is no session, or the session is for a non-player
      $(".notPlaying").show();
      return undefined;
    });
  }

  /**
   * @implements client/ClientUIMixin#processArguments
   */
  processArguments(args) {
    return super.processArguments(args)
    .then(() => {
      if (args.observer) {
        this.observer = args.observer;
        this.debug(`\tObserver "${this.observer}"`);
      }
      assert(args.game, `No game found in ${args}`);
      const gameKey = args.game;
      this.debug(`GET /game/${gameKey}`);
      return $.ajax({
        url: `/game/${gameKey}`,
        type: "GET",
        dataType: "binary",
        processData: "false",
        responseType: "arraybuffer"
      })
      .then(data => {
        this.debug(`--> Game ${gameKey}`);
        data = new Uint8Array(data);
        return BrowserGame.fromCBOR(data, BrowserGame.CLASSES);
      })
      .then(game => {
        return this.identifyPlayer(game)
        .then (() => this.createUI(game));
      });
    });
  }

  /**
   * @implements browser/GameUIMixin#sendCommand
   * @override
   */
  sendCommand(command, args) {
    if (command !== BrowserGame.Command.REDO) {
      this.undoStack = [];
      $("#redoButton").hide();
    }
    console.debug(`POST /command/${command}`);
    this.lockBoard(true);
    this.enableTurnButton(false);
    this.cancelNotification();
    $.ajax({
      url: `/command/${command}/${this.game.key}`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(
        args, (key, value) => /^_/.test(key) ? undefined : value)
    })
    .then(r => console.debug(`command '${command}'`, r))
    .catch(console.error);
  }

  /**
   * @implements browser/GameUIMixin#attachUIEventHandlers
   * @override
   */
  attachUIEventHandlers() {

    super.attachUIEventHandlers();

    $(".pauseButton")
    .show()
    .on("click", () => this.sendCommand(BrowserGame.Command.PAUSE));
  }
}

export { ClientGameUI }

