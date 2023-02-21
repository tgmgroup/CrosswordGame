/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/**
 * Dialog for user settings.
 */
import { Dialog } from "./Dialog.js";

class UserSettingsDialog extends Dialog {

  constructor(options) {
    super("UserSettingsDialog", $.extend({
      title: $.i18n("Options")
    }, options));

    // Known users, got afresh from /users each time the
    // dialog is opened
    this.users = [];
  }

  // @override
  createDialog() {
    return super.createDialog()
    .then(() => {
      const curlan = $.i18n.locale();
      //console.log("Curlan",curlan);

      const ui = this.options.ui;
      const $css = this.$dlg.find('[name=xanadoCSS]');
      const $jqt = this.$dlg.find("[name=jqTheme]");
      const $locale = this.$dlg.find('[name=language]');

      return Promise.all([ ui.promiseCSS(), ui.promiseLocales() ])
      .then(all => {
        all[0].forEach(css => $css.append(`<option>${css}</option>`));
        all[1]
        .filter(d => d !== "qqq")
        .sort((a, b) => new RegExp(`^${a}`,"i").test(curlan) ? -1 :
              new RegExp(`^${b}`,"i").test(curlan) ? 1 : 0)
        .forEach(d => $locale.append(`<option>${d}</option>`));
      });
    });
  }

  // @override
  openDialog() {
    return super.openDialog()
    .then(() => {
      const ui = this.options.ui;

      this.$dlg.find("select[name=language]")
      .val(ui.getSetting("language"))
      .selectmenu("refresh");

      this.$dlg.find("select[name=xanadoCSS]")
      .val(ui.getSetting('theme'))
      .selectmenu("refresh");

      this.$dlg.find("select[name=jqTheme]")
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

export { UserSettingsDialog }
