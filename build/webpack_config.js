// Base webpack config, shared by all packed modules
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import { promises as fs } from "fs";

/**
 * Copy a file (or directory recursively) into the dist. Used for css etc.
 * that we want to copy but not bundle. I'm sure a webpack expert could do
 * this a lot better!
 * @param {string} from pathname to copy
 * @param {string} to where to copy to
 */
function copyFile(from, to) {
  const a_from = path.normalize(path.join(__dirname, from));
  const a_to = path.normalize(path.join(__dirname, to));
  fs.cp(a_from, a_to, {
    recursive: true,
    force: true,
//    filter: f => { console.debug("copy", f); return true; },
    dereference: true
  })
  .catch(e => {
    // cp works, but throws all sorts of wierd errors for no
    // apparent reason before completing.
    //console.error("wierd", from, e);
  });
}

/**
 * Rewrite a <link> in html
 * @param {string} from link to rewrite (can be a common preamble)
 * @param {string} to what to replace `from` with
 * @param {string} content the HTML to perform the replacement in
 * @return {string} the edited HTML
 */
function relink(from, to, content) {
  const re = new RegExp(`(<link[^>]*href=")${from}`, "g");
  return content.replace(
    re,
    (m, preamble) => `${preamble}${to}`);
}

/**
 * Copy files not handled by webpack (assets) and construct a
 * webpack configuration.
 * @param {string} html name of html source, assumed to be in the `html` dir
 * @param {string} js name of JS module, path relative to `src`
 * @return {object} webpack configuration
 */
function makeConfig(html, js) {

  fs.mkdir(`${__dirname}/../dist`, { recursive: true })
  .then(() => fs.readFile(`${__dirname}/../html/${html}`))
  .then(content => {
    content = content.toString();

    // Strip out the importmap, not needed any more
    content = content.replace(/<script type="importmap".*<\/script>/, "");

    // Reroute the code import to dist
    // There can be only one!
    content = content.replace(
      /(<script .*? src=").*?([^/]+\/_[^/]+.js")/,
      "$1../dist/$2");

    // Pull necessary CSS files out of node_modules; they may not be
    // installed on the target platform
    copyFile("../node_modules/normalize.css/normalize.css",
             "../dist/css/normalize.css");
    content = relink("../node_modules/normalize.css/normalize.css",
             "../dist/css/normalize.css",
            content);

    copyFile("../node_modules/jquery-ui/dist/themes",
             "../dist/css/themes");
    content = relink("../node_modules/jquery-ui/dist/themes",
            "../dist/css/themes",
            content);

    return fs.writeFile(`${__dirname}/../dist/${html}`, content);
  });

  // Webpacked code always has DISTRIBUTION
  const defines = {
    DISTRIBUTION: true
  };
  let mode;

  // -p will create an optimised production build.
	if (process.env.NODE_ENV === "production") {
    console.log(`Production build ${__dirname}/../src/${js}`);
    mode = "production";
		defines.PRODUCTION = true;
	}

  // otherwise this is a development build.
	else
    mode = "development";

  return {
    mode: mode,
    entry: {
      app: `${__dirname}/../src/${js}`
    },
    output: {
      filename: js,
      path: path.resolve(__dirname, "../dist"),
      globalObject: "window"
    },
    resolve: {
      extensions: [ '.js' ],
      alias: {
        // socket.io is normally the node.js version; we need the browser
        // version here.
        "socket.io": path.resolve(
          __dirname, "../node_modules/socket.io/client-dist/socket.io.js"),
        // Need to override the default node module with the dist
        jquery: path.resolve(
          __dirname, "../node_modules/jquery/dist/jquery.js"),
        "jquery-ui": path.resolve(
          __dirname, "../node_modules/jquery-ui/dist/jquery-ui.js")
      }
    },
    externals: {
      // Imported from findBestPlayWorker, but never actually imported
      // in the browser version
      "../server/ServerPlatform.js": "undefined"
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            // We have to keep class names because CBOR TypeMapHandler
            // uses them
            keep_classnames: true
          },
        }),
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      }),
      new webpack.DefinePlugin(defines)
    ]
  };
}

export { makeConfig }
