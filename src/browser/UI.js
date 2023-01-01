/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/
/* eslint-env browser, jquery */

import "jquery/dist/jquery.js";
import "@wikimedia/jquery.i18n/src/jquery.i18n.js";
import "@wikimedia/jquery.i18n/src/jquery.i18n.language.js";
import "@wikimedia/jquery.i18n/src/jquery.i18n.messagestore.js";
import "@wikimedia/jquery.i18n/src/jquery.i18n.parser.js";
import "@wikimedia/jquery.i18n/src/jquery.i18n.fallbacks.js";
import "@wikimedia/jquery.i18n/src/jquery.i18n.emitter.js";

import { stringify } from "../common/Utils.js";

/**
 * Base class of functionality shared between all browser UIs.
 */
class UI {

  /**
   * Debug function. Same signature as console.debug.
   * @member {function}
   */
  debug = () => {};

  /**
   * Communications channel which the backend will be sending and
   * receiving notifications on. In a client-server configuration,
   * this will be a WebSocket. For standalone, it will be a
   * {@linkcode Dispatcher}.
   * @member {Channel}
   */
  channel = undefined;

  /**
   * Report an error.
   * @param {string|Error|array|jqXHR} args This will either be a
   * simple i18n string ID, or an array containing an i18n ID and a
   * series of arguments, or a jqXHR.
   * @param {string?} title title for the error dialog
   * @return {jQuery} the dialog
   */
  alert(args, title) {
    debugger;
    console.error("ALERT", typeof args, args);

    // Handle a jqXHR
    if (typeof args === "object") {
      if (args.responseJSON)
        args = args.responseJSON;
      else if (args.responseText)
        args = args.responseText;
      else if (args.statusText)
        args = args.statusText;
    }

    let message;
    if (typeof(args) === "string") // simple string
      message = $.i18n(args);
    else if (args instanceof Error) // Error object
      message = stringify(args);
    else if (args instanceof Array) { // First element i18n code
      message = $.i18n.apply($.i18n, args);
    } else // something else
      message = stringify(args);

    return $("#alertDialog")
    .dialog({
      modal: true,
      title: title || $.i18n("XANADO problem")
    })
    .html(`<p>${message}</p>`);
  }

  /**
   * Cache of Audio objects, indexed by name of clip.
   * Empty until a clip is played.
   * @member {Object<string,Audio>}
   * @private
   */
  soundClips = {};

  /**
   * Send notifications to the backend.
   * In a client-server configuration, this will send a notification
   * over a WebSocket. In a standalone configuration, it will
   * invoke a Dispatcher.
   */
  notifyBackend(notification, data) {
    this.channel.emit(notification, data);
  }

  /**
   * Play an audio clip, identified by id. Clips must be
   * pre-loaded in the HTML. Note that most (all?) browsers require
   * some sort of user interaction before they will play audio
   * embedded in the page.
   * @instance
   * @memberof client/UIMixin
   * @param {string} id name of the clip to play (no extension). Clip
   * must exist as an mp3 file in the /audio directory.
   */
  playAudio(id) {
    let audio = this.soundClips[id];

    if (!audio) {
      audio = new Audio(`../audio/${id}.mp3`);
      this.soundClips[id] = audio;
    }

    if (audio.playing)
      audio.pause();

    audio.play()
    .catch(() => {
      // play() can throw if the audio isn't loaded yet. Catching
      // canplaythrough might help (though it's really a bit of
      // overkill, as none of Xanado's audio is "important")
      $(audio).on(
        "canplaythrough",
        () => {
          $(audio).off("canplaythrough");
          audio.play()
          .catch(() => {
            // Probably no interaction yet
          });
        });
    });
  }

  /**
   * Initialise CSS style cache
   * @return {Promise} a promise that resolves when the theme has changed.
   * Note this doesn't mean the CSS has actually changed - that is done
   * asynchronously, as link tags don't support onload reliably on all
   * browsers.
   */
  initTheme() {
    // Initialise jquery theme
    const jqTheme = this.getSetting("jqTheme");
    if (jqTheme)
      $("#jQueryTheme").each(function() {
        this.href = this.href.replace(/\/themes\/[^/.]+/, `/themes/${jqTheme}`);
      });

    const css = this.getSetting("xanadoCSS");
    if (css)
      $("#xanadoCSS").each(function() {
        this.href = this.href.replace(/\/css\/[^/.]+/, `/css/${css}`);
      });

    return Promise.resolve();
  }

  /**
   * Find the first CSS rule for the given selector.
   * @param {string} selector selector for the rule to search for
   * @private
   */
  findCSSRule(selector) {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSStyleRule
              && rule.selectorText == selector)
            return rule;
        }
      } catch(e) {
        // Not allowed to access cross-origin stylesheets
      }
    }
    return undefined;
  }

  /**
   * Modify a CSS rule. This is used for scaling elements such as tiles
   * when the display is resized.
   * @param {string} selector selector of rule to modify
   * @param {Object.<string,number>} changes map of css attribute
   * name to new pixel value.
   * @private
   */
  editCSSRule(selector, changes) {
    const rule = this.findCSSRule(selector);
    assert(rule, selector);
    let text = rule.style.cssText;
    $.each(changes, (prop, val) => {
      const re = new RegExp(`(^|[{; ])${prop}:[^;]*`);
      text = text.replace(re, `$1${prop}:${val}px`);
    });
    rule.style.cssText = text;
  }

  /**
   * Promise to initialise the locale.
   * @return {Promise}
   */
  initLocale() {
    return this.getLocales()
    .then(locales => {
      const ulang = this.getSetting("language") || "en";
      console.debug("User language", ulang);
      // Set up to load the language file
      const params = {};
      params[ulang] = `../i18n/${ulang}.json`;
      // Select the language and load
      return $.i18n({ locale: ulang })
      .load(params)
      .then(() => locales);
    })
    .then(locales => {
      console.debug("Locales available", locales.join(", "));
      // Expand/translate strings in the HTML
      return new Promise(resolve => {
        $(document).ready(() => {
          console.debug("Translating HTML to", $.i18n().locale);
          $("body").i18n();
          resolve(locales);
        });
      });
    })
    .then(() => {
      $("button").button();
      $(document)
      .tooltip({
        items: "[data-i18n-tooltip]",
        content: function() {
          return $.i18n($(this).data("i18n-tooltip"));
        },
        open: function(event, ui) {
          // Handle special case of a button that opens a dialog.
          // When the dialog closes, a focusin event is sent back
          // to the tooltip, that we want to ignore.
          if (event.originalEvent.type === "focusin")
            ui.tooltip.hide();
        }
      });
    });
  }

  /**
   * Get a user setting
   * @param {string} key setting to get
   */
  getSetting(key) {
    /* istanbul ignore next */
    return key;
  }

  /**
   * Set a user setting
   * @param {string} key setting to set
   * @param {string} value value to set
   * @return {Promise} resolves when setting is complete
   */
  setSetting(key, value) {
    /* istanbul ignore next */
    assert.fail(`UI.setSetting ${key}=${value}`);
  }

  /**
   * Set a groups of user setting
   * @param {object<string,object>} settings set of settings
   * @return {Promise} resolves when all settings are complete
   */
  setSettings(settings) {
    return Promise.all([
      Object.keys(settings).map(k => this.setSetting(k, settings[k]))
    ]);
  }

  /**
   * Identify the signed-in user. Override in subclasses.
   * @return {Promise} a promise that resolves to an simple
   * session object if someone is signed in, or throws otherwise.
   * The object is expected to define `key`, the signed-in player, and
   * may set `provider`.
   * @throws Error if there is no session active
   */
  getSession() {
    /* istanbul ignore next */
    assert.fail("UI.getSession");
  }

  /**
   * Get the available locales.
   * @return {Promise} promise resolves to list of available locale names
   */
  getLocales() {
    /* istanbul ignore next */
    assert.fail("UI.getLocales");
  }

  /**
   * Gets a list of the available css.
   * @return {Promise} promise that resolves to
   * a list of css name strings.
   */
  getCSS() {
    /* istanbul ignore next */
    assert.fail("UI.getCSS");
  }

  /**
   * Get a list of available dictionaries
   * @memberof GameUIMixin
   * @instance
   * @return {Promise} resolving to a list of available dictionary
   * name strings.
   */
  getDictionaries() {
    /* istanbul ignore next */
    assert.fail("UI.getDictionaries");
  }

  /**
   * Get a list of available editions.
   * Must be implemented by a sub-mixin or final class.
   * @memberof GameUIMixin
   * @instance
   * @return {Promise} resolving to a list of available edition
   * name strings.
   */
  getEditions() {
    /* istanbul ignore next */
    assert.fail("UI.getEditions");
  }

  /**
   * Attach handlers to document objects. Override in sub-mixin or final
   * class, calling super in the overriding method.
   */
  attachUIEventHandlers() {
    $("#personaliseButton")
    .on("click", () => {
      import(
        /* webpackMode: "lazy" */
        /* webpackChunkName: "SettingsDialog" */
        "../browser/SettingsDialog.js")
      .then(mod => new mod[Object.keys(mod)[0]]({
        ui: this,
        onSubmit: (dlg, vals) => {
          this.setSettings(vals)
          .then(() => window.location.reload());
        },
        error: console.error
      }));
    });
  }

  /**
   * Parse the URL to extract parameters. Arguments are returned
   * as keys in a map. Argument names are not decoded, but values
   * are. The portion of the URL before `?` is returned in the
   * argument map using the key `_URL`. Arguments in the URL that
   * have no value are set to boolean `true`. Repeated arguments are
   * not supported (the last value will be the one taken).
   * @return {Object<string,string>} key-value map
   */
  static parseURLArguments(url) {
    const bits = url.split("?");
    const urlArgs = { _URL: bits.shift() };
    const sargs = bits.join("?").split(/[;&]/);
    for (const sarg of sargs) {
      const kv = sarg.split("=");
      const key = kv.shift();
      urlArgs[decodeURIComponent(key)] =
      (kv.length === 0) ? true : decodeURIComponent(kv.join("="));
    }
    return urlArgs;
  }

  /**
   * Reassemble a URL that has been parsed into parts by parseURLArguments.
   * Argument are output sorted alphabetically.
   * @param {object} args broken down URL in the form created by
   * parseURLArguments
   * @return {string} a URL string
   */
  static makeURL(parts) {
    const args = Object.keys(parts)
          .filter(f => !/^_/.test(f)).sort()
          .map(k => parts[k] && typeof parts[k] === "boolean" ?
               k : `${k}=${encodeURIComponent(parts[k])}`);
    return `${parts._URL}?${args.join(";")}`;
  }

  /**
   * Format a time interval in seconds for display in a string e.g
   * `formatTimeInterval(601)` -> `"10:01"`
   * Maximum ordinal is days.
   * @param {number} t time period in seconds
   */
  static formatTimeInterval(t) {
    const neg = (t < 0) ? "-" : "";
    t = Math.abs(t);
    const s = `0${t % 60}`.slice(-2);
    t = Math.floor(t / 60);
    const m = `0${t % 60}`.slice(-2);
    t = Math.floor(t / 60);
    if (t === 0) return `${neg}${m}:${s}`;
    const h = `0${t % 24}`.slice(-2);
    t = Math.floor(t / 24);
    if (t === 0) return `${neg}${h}:${m}:${s}`;
    return `${neg}${t}:${h}:${m}:${s}`;
  }
}

export { UI }
