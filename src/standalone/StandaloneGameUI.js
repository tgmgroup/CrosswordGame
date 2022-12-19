/*Copyright (C) 2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/
/* eslint-env browser, jquery */

import { Utils } from "../common/Utils.js";
import { Channel } from "../common/Channel.js";
import { Game } from "../game/Game.js";
import { BackendGame } from "../backend/BackendGame.js";
import { BrowserGame } from "../browser/BrowserGame.js";
import { UI } from "../browser/UI.js";
import { GameUIMixin } from "../browser/GameUIMixin.js";
import { Dialog } from "../browser/Dialog.js";
import { StandaloneUIMixin } from "./StandaloneUIMixin.js";

import "touch-punch";

/**
 * Game that runs solely in the browser (no server).
 * To keep the codebase consistent with the client-server model, we
 * have two copies of the game; one is the "client side" (the front end)
 * version, while the other is the "server" version (the back end).
 */
class StandaloneGameUI extends StandaloneUIMixin(GameUIMixin(UI)) {

  constructor() {
    super();

    /**
     * Game on the "server" side
     */
    this.backEndGame = undefined;

    /**
     * Game on the "client" side
     */
    this.frontEndGame = undefined;
  }

  /**
   * @implements browser/GameUIMixin#sendCommand
   */
  sendCommand(command, args) {
    const bePlayer = this.backEndGame.getPlayerWithKey(
      this.player.key);
    this.backEndGame.dispatchCommand(command, bePlayer, args);
  }

  /**
   * @implements browser/GameUIMixin#action_anotherGame
   */
  action_anotherGame() {
    this.backEndGame.anotherGame()
    .then(nextGame => {
      this.backEndGame.nextGameKey =
      this.frontEndGame.nextGameKey = nextGame.key;
      this.setAction("action_nextGame", $.i18n("Next game"));
      this.enableTurnButton(true);
    })
    .catch(assert.fail);
  }

  /**
   * @implements browser/GameUIMixin#action_nextGame
   */
  action_nextGame() {
    this.redirectToGame(this.backEndGame.nextGameKey);
  }

  /**
   * Create and run the game.
   */
  create() {

    super.create();

    const player_key = this.session.key;

    const fe = new Channel();
    const be = new Channel();
    // Cross-couple the channels
    fe.receiver = be;
    be.receiver = fe;

    be.on(
      Game.Notify.MESSAGE,
      message => {
        // Chat message
        const mess = message.text.split(/\s+/);
        const verb = mess[0];

        switch (verb) {
        case "autoplay":
          // Tell *everyone else* that they asked for a hint
          be.game.autoplay();
          break;
        case "hint":
          be.game.hint(be.player);
          break;
        case "advise":
          be.game.toggleAdvice(be.player);
          break;
        case "allow":
          be.game.allow(be.player, mess[1]);
          break;
        default:
          be.game.notifyAll(Game.Notify.MESSAGE, message);
        }
      });

    this.channel = fe;

    this.getGameDefaults()
    .then(() => this.initTheme())
    .then(() => this.initLocale())
    .then(() => {

      // Load the server game from localStorage, or create a new
      // game from defaults if there isn't one there.
      if (this.args.game) {
        console.debug(`Loading game ${this.args.game} from local storage`);
        return this.db.get(this.args.game)
        .then(d => Game.fromCBOR(d, BackendGame.CLASSES))
        .then(game => {
          this.backEndGame = game;
          this.backEndGame._debug = this.args.debug
          ? console.debug : () => {};
          return game.onLoad(this.db);
        });

      } else {
        console.debug("Constructing new game");
        const setup = $.extend({}, StandaloneGameUI.DEFAULTS);
        setup._debug = this.args.debug ? console.debug : () => {};
        return this.createGame(setup)
        .then(game => this.backEndGame = game);
      }
    })
    .then(() => {
      this.attachChannelHandlers();

      // Make a browser copy of the game
      this.frontEndGame =
      BrowserGame.fromCBOR(
        Game.toCBOR(this.backendGame), BrowserGame.CLASSES);

      // Fix the player
      this.player
      = this.frontEndGame.player
      = this.frontEndGame.getPlayerWithKey(player_key);
    })
    .then(() => this.createUI(this.frontEndGame))
    .then(() => {
      $("#gameSetupButton")
      .on("click", () => {
        Dialog.open("../browser/GameSetupDialog", {
          html: "standalone_GameSetupDialog",
          ui: this,
          game: this.backEndGame,
          onSubmit: (dlg, vals) => {
            for (const key of Object.keys(vals))
              this.backEndGame[key] = vals[key];
            this.backEndGame.save();
            this.redirectToGame(this.backEndGame.key);
          },
          error: e => this.alert(e, $.i18n("failed", $.i18n("Game setup")))
        });
      });
      $("#libraryButton")
      .on("click", () => {
        const parts = Utils.parseURLArguments(window.location.toString());
        parts._URL = parts._URL.replace(
          /standalone_game\./, "standalone_games.");
        window.location = Utils.makeURL(parts);
      });
    })
    .then(() => this.attachUIEventHandlers())
    // Tell the backend what channel to use to send and receive
    // notifications
    .then(() => this.backEndGame.connect(be, player_key))
    .catch(e => this.alert(e))
    .then(() => {
      $(".loading").hide();
      $(".waiting").removeClass("waiting");
    });
  }
}

new StandaloneGameUI().create();
