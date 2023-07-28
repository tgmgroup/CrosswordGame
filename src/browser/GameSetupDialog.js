/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

import { Game } from "../game/Game.js";
import { Dialog } from "./Dialog.js";

/**
 * Dialog for modifying game options.
 * @extends Dialog
 */
class GameSetupDialog extends Dialog {

  // ordered types for <select>s in UI
  static Penalty_types = [
    Game.Penalty.PER_WORD, Game.Penalty.PER_TURN,
    Game.Penalty.MISS, Game.Penalty.NONE
  ];

  static Timer_types = [
    Game.Timer.NONE, Game.Timer.TURN, Game.Timer.GAME
  ];

  static WordCheck_types = [
    Game.WordCheck.NONE, Game.WordCheck.AFTER, Game.WordCheck.REJECT
  ];

  /**
   * @override
   */
  canSubmit() {
    //console.debug("Validate edition",
    //              this.$dlg.find("[name=edition]").val(),
    //              "play dictionary",
    //              this.$dlg.find("[name=dictionary]").val());
    return (this.$dlg.find("[name=edition]").val() !== 'none');
  }

  constructor(options) {
    super("GameSetupDialog", options);
  }

  showTimerFields() {
    const type = this.$dlg.find("[name=timerType]").val();
    switch (type) {
    default:
      this.$dlg.find("[name=timeAllowed]")
      .parent().hide();
      this.$dlg.find("[name=timePenalty]")
      .parent().hide();
      break;
    case Game.Timer.TURN:
      this.$dlg.find("[name=timeAllowed]")
      .parent().show();
      this.$dlg.find("[name=timePenalty]")
      .parent().hide();
      break;
    case Game.Timer.GAME:
      this.$dlg.find("[name=timeAllowed]")
      .parent().show();
      this.$dlg.find("[name=timePenalty]")
      .parent().show();
      break;
    }
  }

  showPenaltyFields() {
    const type = this.$dlg.find("[name=challengePenalty]").val();
    switch (type) {
    default:
      this.$dlg.find("[name=penaltyPoints]")
      .parent().hide();
      break;
    case Game.Penalty.PER_TURN:
    case Game.Penalty.PER_WORD:
      this.$dlg.find("[name=penaltyPoints]")
      .parent().show();
      break;
    }
  }

  showFeedbackFields() {
    const dic = this.$dlg.find("[name=dictionary]").val();
    this.$dlg.find("[name=wordCheck]")
    .parent().toggle(dic !== "none");
  }

  createDialog() {
    function makeOptions(list, $sel) {
      for (const p of list)
        $sel.append(
          `<option value="${p ? p : 'none'}">${p ? $.i18n(p) : $.i18n("None")}</option>`);
    }

    return super.createDialog()
    .then(() => {
      const $pen = this.$dlg.find("[name=challengePenalty]");
      makeOptions(GameSetupDialog.Penalty_types, $pen);
      $pen.on("selectmenuchange", () => this.showPenaltyFields());
      this.showPenaltyFields();

      const $tim = this.$dlg.find("[name=timerType]");
      makeOptions(GameSetupDialog.Timer_types, $tim);
      $tim.on("selectmenuchange", () => this.showTimerFields());
      this.showTimerFields();

      const $wc = this.$dlg.find("[name=wordCheck]");
      makeOptions(GameSetupDialog.WordCheck_types, $wc);

      const ui = this.options.ui;
      return Promise.all([
        ui.promiseEditions()
        .then(editions => {
          const $eds = this.$dlg.find("[name=edition]");
          editions.forEach(e => $eds.append(`<option value="${e}">${e}</option>`));
          if (ui.getSetting("edition")) {
            $eds.val(ui.getSetting("edition"));
            $eds.selectmenu("refresh");
          }
        }),
        ui.promiseDictionaries()
        .then(dictionaries => {
          const $dics = this.$dlg.find("[name=dictionary]");
          dictionaries
          .forEach(d => $dics.append($(`<option value="${d}">${d}</option>`)));
          $dics.on("selectmenuchange", () => this.showFeedbackFields());
          const seldic = ui.getSetting("dictionary");
          if (seldic)
            $dics.val(seldic).selectmenu("refresh");
          this.showFeedbackFields();
        })
      ]);
    });
  }

  openDialog() {
    const ui = this.options.ui;
    return super.openDialog()
    .then(() => {
      this.$dlg.find(".dialog-row").show();
      const game = this.options.game;
      const $fields = this.$dlg.find("[name]");

      // Some game options are only tweakable if there are no turns
      // signed in the game. This is controlled by a "noturns" class on
      // the dialog-row
      if (game && game.turns.length > 0)
        this.$dlg.find(".noturns").hide();

      $fields.each((i, el) => {
        const $el = $(el);
        const field = $el.attr("name");
        let val = game ? game[field] : (
          ui.getSetting(field) || Game.DEFAULTS[field]);
        if (el.tagName === "INPUT" && el.type === "checkbox") {
          //console.debug("SET", field, "=", val);
          $el.prop("checked", val).checkboxradio("refresh");
        } else if (el.tagName === "SELECT") {
          if (typeof val === "undefined")
            val = this.options.ui.getSetting(field);
          //console.debug("SELECT", field, "=", val);
          $el.val(val || "none");
          $el.selectmenu("refresh");
        } else if (val) {
          //console.debug("SET", field, "=", val);
          $el.val(val);
        }
        return true;
      });
      this.showTimerFields();
      this.showPenaltyFields();
      this.showFeedbackFields();
    });
  }
}

export { GameSetupDialog }
