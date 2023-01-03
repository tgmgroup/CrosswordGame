/*Copyright (C) 2023 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/
/* eslint-env browser,node */

/* global Platform */

import { assert } from "chai";

let setupPlatform = () => assert(false);
let setupBrowser = () => Promise.resolve();
let getTestGame = () => Promise.resolve();

if (typeof global === "undefined") {
  setupPlatform = () => {
    return import("../src/browser/BrowserPlatform.js")
    .then(mod => {
      window.Platform = mod.BrowserPlatform;
      return window.Platform;
    });
  };

} else {

  setupPlatform = () => {
    return import("../src/server/ServerPlatform.js")
    .then(mod => {
      global.Platform = mod.ServerPlatform;
      return global.Platform;
    });
  };

  setupBrowser = () => {
    return setupPlatform()

    .then(() => Promise.all([
      import("jsdom"),
      import("jquery")
    ]))
    .then(mods => {
      if (global.$) {
        // Re-use the existing document.
        $("head").empty();
        $("body").empty();
      } else {
        const jsdom = mods[0];

        class CustomResourceLoader extends jsdom.ResourceLoader {
          fetch(url, options) {
            // Override the contents of this script to do something unusual.
            console.log("FETCH", url);
            return super.fetch(url, options)
            .then(buff => {
              console.log("LOADED", url);
              return buff;
            });
          }
        }
        const JSDOM = jsdom.JSDOM;     
        const url = `${import.meta.url}/../../html/test.html`;
        const { window } = new JSDOM(
          `<!doctype html><html></html>"`,
          {
            runScripts: "dangerously",
            resources: "usable", //new CustomResourceLoader(),
            url: url
          });
        global.window = window;
        global.document = window.document;
        global.navigator = { userAgent: "node.js" };

        const jquery = mods[1].default;
        global.$ = global.jQuery = jquery(window);
      }
    })

    .then(() => import("jquery-ui/dist/jquery-ui.js"));
  };

  getTestGame = (name, Class) => {
    return Promise.all([
      import("path"),
      import("url"),
      import("../src/server/FileDatabase.js")
    ])
    .then(mods => {
      const Path = mods[0];
      const fileURLToPath = mods[1].fileURLToPath;
      const __dirname = Path.dirname(fileURLToPath(import.meta.url));
      const FileDatabase = mods[2].FileDatabase;
      const db = new FileDatabase({
        dir: `${__dirname}/data`, ext: "game"
      });
      return db.get(name)
      .then(data => Class.fromCBOR(data, Class.CLASSES))
      .then(game => game.onLoad(db));
    });
  };
}

const setupI18n = () => {
  return Promise.all([
    import("@wikimedia/jquery.i18n/src/jquery.i18n.js"),
    import("@wikimedia/jquery.i18n/src/jquery.i18n.language.js"),
    import("@wikimedia/jquery.i18n/src/jquery.i18n.messagestore.js"),
    import("@wikimedia/jquery.i18n/src/jquery.i18n.parser.js"),
    import("@wikimedia/jquery.i18n/src/jquery.i18n.fallbacks.js"),
    import("@wikimedia/jquery.i18n/src/jquery.i18n.emitter.js")
  ])
  .then(() => {
    //$.i18n.debug = true;
    $.i18n({ locale: "en" })
    .load( { en: `${import.meta.url}/../../i18n/en.json` });
  });
};

export { setupPlatform, setupBrowser, setupI18n, getTestGame }
