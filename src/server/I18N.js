/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
License MIT. See README.md at the root of this distribution for full copyright
and license information. Author Crawford Currie http://c-dot.co.uk*/

import { promises as Fs } from "fs";
import Path from "path";
import { fileURLToPath } from 'url';
const __dirname = Path.dirname(fileURLToPath(import.meta.url));

/** @module */

let TX;

/**
 * Partial implementation of jquery i18n to support server-side
 * string translations using the same data files as browser-side.
 */
function I18N(s) {
  if (typeof s === "string") {
    if (typeof TX[s] !== "undefined")
      s = TX[s];
    s = s.replace(/{{PLURAL:\$(\d+)\|([^|]*)\|([^}]*)}}/g,
                  (m, index, sing, plur) =>
                  (arguments[index] === 1) ? sing : plur);

    return s.replace(
      /\$(\d+)/g,
      (m, index) => arguments[index]);
  }
  return {
    load(locale) {
      let langdir = Path.normalize(Path.join(__dirname, "..", "..", "i18n"));
      let langfile = Path.join(langdir, `${locale}.json`);
      // Try the full locale e.g. "en-US"
      return Fs.readFile(langfile)
      .catch(() => {
        // Try the first part of the locale i.e. "en"
        // from "en-US"
        langfile = Path.join(langdir,
                             `${locale.split("-")[0]}.json`);
        return Fs.readFile(langfile);
      })
      /* c8 ignore start */
      .catch(
        () => {
          // Fall back to "en"
          langfile = Path.join(langdir, "en.json");
          return Fs.readFile(langfile);
        })
      .then(buffer => {
        TX = JSON.parse(buffer.toString());
      });
      /* c8 ignore stop */
    }
  };
}

export { I18N }
