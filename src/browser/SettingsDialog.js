/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/**
 * Dialog for user settings.
 */
import { Dialog } from "./Dialog.js";

class SettingsDialog extends Dialog {

  constructor(options) {
    super("SettingsDialog", $.extend({
      title: $.i18n("Options")
    }, options));

    // Known users, got afresh from /users each time the
    // dialog is opened
    this.users = [];
  }

  // @override
  createDialog() {
    const curlan = $.i18n().locale;
    //console.log("Curlan",curlan);

    this.$dlg.find('input[type=checkbox]').checkboxradio();
    const ui = this.options.ui;
    const $css = this.$dlg.find('[name=xanadoCSS]');
    const $jqt = this.$dlg.find("[name=jqTheme]");
    const $locale = this.$dlg.find('[name=language]');

    return Promise.all([ ui.getCSS(), ui.getLocales() ])
    .then(all => {
      all[0].forEach(css => $css.append(`<option>${css}</option>`));
      all[1]
      .filter(d => d !== "qqq")
      .sort((a, b) => new RegExp(`^${a}`,"i").test(curlan) ? -1 :
            new RegExp(`^${b}`,"i").test(curlan) ? 1 : 0)
      .forEach(d => $locale.append(`<option>${d}</option>`));
      $css.selectmenu();
      $jqt.selectmenu();
      $locale.selectmenu();
      this.enableSubmit();
      super.createDialog();
    });
  }

  // @override
  openDialog() {
    return super.openDialog()
    .then(() => {
      const ui = this.options.ui;

      this.$dlg.find('[name=theme]')
      .val(ui.getSetting('theme'))
      .selectmenu("refresh");

      this.$dlg.find("[name=jqTheme]")
      .val(ui.getSetting('jqTheme'))
      .selectmenu("refresh");

      this.$dlg.find('input[type=checkbox]')
      .each(function() {
        $(this).prop('checked', ui.getSetting(this.name) === "true")
        .checkboxradio("refresh");
      });
      // Notification requires https
      this.$dlg.find(".require-https").toggle(ui.usingHttps === true);
    });
  }
}

export { SettingsDialog }
