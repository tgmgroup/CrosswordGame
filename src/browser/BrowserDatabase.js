/*Copyright (C) 2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/**
 * This is the browser implementation of common/Database.
 */
//import { Database } from "../common/Database.js";

/* global localStorage */

/**
 * Convert an Uint8Array containing arbitrary byte data into a Base64
 * encoded string, suitable for use in a Data-URI
 * @param {Uint8Array} a8 the Uint8Array to convert
 * @return {string} Base64 bytes (using MIME encoding)
 * @private
 */
function Uint8ArrayToBase64(a8) {
  let nMod3 = 2;
  let sB64Enc = "";
  const nLen = a8.length;

  // Convert a base 64 number to the charcode of the character used to
  // represent it
  function uint6ToB64(nUInt6) {
    return nUInt6 < 26 ?
    nUInt6 + 65 :
    nUInt6 < 52 ?
    nUInt6 + 71 :
    nUInt6 < 62 ?
    nUInt6 - 4 :
    nUInt6 === 62 ?
    43 :
    nUInt6 === 63 ?
    47 :
    65;
  }

  // For each byte in the buffer
  for (let nUInt24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
    nMod3 = nIdx % 3;
    nUInt24 |= a8[nIdx] << (16 >>> nMod3 & 24);
    if (nMod3 === 2 || nLen - nIdx === 1) {
      sB64Enc += String.fromCharCode(
        uint6ToB64(nUInt24 >>> 18 & 63),
        uint6ToB64(nUInt24 >>> 12 & 63),
        uint6ToB64(nUInt24 >>> 6 & 63),
        uint6ToB64(nUInt24 & 63));
      nUInt24 = 0;
    }
  }

  return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) +
  (nMod3 === 2 ? "" : nMod3 === 1 ? "=" : "==");
}

/**
 * Convert a MIME-Base64 string into an array of arbitrary
 * 8-bit data
 * @param {string} sB64Enc the String to convert
 * @return {Uint8Array}
 * @private
 */
function Base64ToUint8Array(sB64) {
  const sB64Enc = sB64.replace(/[^A-Za-z0-9+/]/g, ""); // == and =
  const nInLen = sB64Enc.length;
  const nOutLen = nInLen * 3 + 1 >> 2;
  const ta8 = new Uint8Array(nOutLen);
  // Convert Base64 char (as char code) to the number represented
  function b64ToUInt6(nChr) {
    return nChr > 64 && nChr < 91 ?
    nChr - 65 :
    nChr > 96 && nChr < 123 ?
    nChr - 71 :
    nChr > 47 && nChr < 58 ?
    nChr + 4 :
    nChr === 43 ?
    62 :
    nChr === 47 ?
    63 :
    0;
  }

  for (let nMod3, nMod4, nUInt24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUInt24 |= b64ToUInt6(sB64Enc.charCodeAt(nInIdx)) <<
    6 * (3 - nMod4);
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 &&
           nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        ta8[nOutIdx] = nUInt24 >>> (16 >>> nMod3 & 24) & 255;
      }
      nUInt24 = 0;
    }
  }
  return ta8;
}

/**
 * Simple implemention of {@linkcode Database} for use
 * in the browser, using localStorage.
 * @implements Database
 */
class BrowserDatabase /* extends Database */ {

  keys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let m;
      if ((m = /^xanado_(.*)$/.exec(key)))
        keys.push(m[1]);
    }
    return Promise.resolve(keys);
  }

  set(key, data) {
    localStorage.setItem(
      `xanado_${key}`,
      Uint8ArrayToBase64(data));
    return Promise.resolve();
  }

  get(key) {
    const data = localStorage.getItem(`xanado_${key}`);
    if (data === null)
      return Promise.reject(`"${key}" was not found`);
    try {
      return Promise.resolve(Base64ToUint8Array(data));
    } catch (e) {
      return Promise.reject(e);
    }
  }

  rm(key) {
    localStorage.removeItem(`xanado_${key}`);
    return Promise.resolve();
  }
}

export { BrowserDatabase }
