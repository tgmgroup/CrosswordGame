/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/** @module */

/**
 * Generate a unique 16-character key using a-z0-9
 * @param {string[]?} miss optional array of pregenerated keys to miss
 * @return {string} a key not already in miss
 */
function genKey(miss) {
  const chs = "0123456789abcdef".split("");
  if (miss) {
    let key;
    do {
      key = genKey();
    } while (key in miss);
    return key;
  }
  const s = [];
  for (let i = 0; i < 16; i++)
    s.push(chs[Math.floor(Math.random() * 16)]);
  return s.join("");
}

/**
 * Generate readable (though not parseable) representation of object,
 * for use in debugging. Easier to read than JSON.stringify. Used instead
 * of toString() and valueOf() which are inconsistent between platforms.
 */
function stringify(value) {
  // Based on Crockford's polyfill for JSON.stringify.

  switch (typeof value) {
  case "undefined":
    return "?";
  case "string":
    return `"${value}"`;
  case "number":
  case "boolean":
  case "null":
    return String(value);
  }

  // Due to a specification blunder in ECMAScript,
  // typeof null is "object"
  if (!value)
    return "null";

  // Use the stringify function, if the object has one.
  if (typeof value === "object"
      && typeof value.stringify === "function")
    return value.stringify();

  const partial = [];

  // Built-in types
  if (value instanceof Date)
    return value.toISOString();

  // Is the value an array?
  if (Object.prototype.toString.apply(value) === "[object Array]") {
    for (const v of value)
      partial.push(stringify(v));

    return `[${partial.join(",")}]`;
  }

  // Otherwise this is an object
  for (const k in value) {
    if (Object.prototype.hasOwnProperty.call(value, k)) {
      const v = stringify(value[k]);
      if (v)
        partial.push(`${k}:${v}`);
    }
  }
  return `{${partial.join(",")}}`;
}

export { genKey, stringify }
