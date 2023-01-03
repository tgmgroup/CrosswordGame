/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/* global assert */

/**
 * Interface to a simple games database to allow for
 * plugging other database implementations. In the interests of
 * simplicity and portability:
 * 1. Keys starting with . are forbidden
 * 2. Key names must be valid file names
 * 3. null is not a valid item value
 * @interface
 */
class Database {

  /* c8 ignore start */

  /**
   * Promise to get a list of keys in the DB
   * @return {Promise} resolves to a `string[]` list of key names
   */
  keys() {}

  /**
   * Promise to set a key value
   * @param {string} key the entry key
   * @param {object} data the data to store
   * @return {Promise} resolves to undefined
   */
  set(key, data) { assert.fail(`Database.set ${key} ${data}`); }

  /**
   * Promise to get a key value
   * @param {string} key the entry key
   * @return {Promise} resolves to the key value
   */
  get(key) { assert.fail(`Database.get ${key}`); }

  /**
   * Remove a key and all associated data
   * @param {string} key the entry key
   * @return {Promise} resolves to undefined
   */
  rm(key) { assert.fail(`Database.rm ${key}`); }

  /* c8 ignore stop */
}

export { Database }
