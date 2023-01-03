/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/
/* eslint-env mocha */

import { assert } from "chai";
import { genKey, stringify } from "../../src/common/Utils.js";

describe("common/Utils", () => {

  it("genKey", () => {
    const miss = [ genKey() ];
    for (let i = 1; i < 1000; i++)
      miss.push(genKey(miss));
    assert.equal(miss.length, 1000);
  });

  it("stringify", () => {
    class Thing {
      stringify() { return "XYZZY"; }
    }

    let thing = new Thing();

    assert.equal(stringify(thing), "XYZZY");
    assert.equal(stringify("XYZZY"), '"XYZZY"');
    assert.equal(stringify(69), '69');
    assert.equal(stringify(true), 'true');
    assert.equal(stringify(null), 'null');
    assert.equal(stringify(), '?');
    const d = new Date(100000);
    assert.equal(stringify(d), d.toISOString());
  });
});
