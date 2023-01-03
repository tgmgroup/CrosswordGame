/*Copyright (C) 2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

import { Database } from "../src/common/Database.js";

const database = {};

/**
 * Implementation of common/Database for use in tests. Data only persists
 * in memory.
 */
class MemoryDatabase extends Database {

  keys() {
    return Object.keys(database);
  }

  set(key, data) {
    database[key] = data;
    return Promise.resolve();
  }

  get(key) {
    return Promise.resolve(database[key]);
  }

  rm(key) {
    delete database[key];
    return Promise.resolve();
  }
}

export { MemoryDatabase }
