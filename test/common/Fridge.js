/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
License MIT. See README.md at the root of this distribution for full copyright
and license information. Author Crawford Currie http://c-dot.co.uk*/
/* eslint-env mocha */

import { assert } from "chai";
import { Fridge } from "../../src/common/Fridge.js";

describe("common/Fridge", () => {

  class Wibble {
    constructor(wib) {
      this._ignore = 666;
      this.wibble = wib;
    }

    stringify() {
      return this.wibble;
    }
  }

  it('simple-object', () => {

    let simple = {
      number: 10,
      string: 'String',
      _ignore: 'ignore', // will make assert.deepEqual fail
      date: new Date(1234567890123),
      array: [ 1, 2, 3 ],
      classObject: new Wibble('wibble'),
      object: { data: 'lorem ipsum' }
    };
    let frozen = Fridge.freeze(simple);
    let thawed = Fridge.thaw(frozen, { Wibble: Wibble });
    assert(!thawed._ignore);
    assert.equal(thawed.number, simple.number);
    assert.equal(thawed.string, simple.string);
    assert.equal(thawed.date.toISOString(), simple.date.toISOString());
    assert.deepEqual(thawed.array, simple.array);
    assert.deepEqual(thawed.object, simple.object);
    assert(thawed.classObject instanceof Wibble);
    delete simple.classObject._ignore;
    assert.deepEqual(thawed.classObject,simple.classObject);
  });

  it('date', () => {

    let frood = new Date();
    let frozen = Fridge.freeze(frood);
    //console.log(JSON.stringify(frozen));
    let thawed = Fridge.thaw(frozen, { Wibble: Wibble });
    assert(thawed instanceof Date);
    assert.deepEqual(frood, thawed);
  });

  it('instance-ref', () => {

    let frood = new Wibble('frood');
    let simple = {
      obj1: frood,
      obj2: frood,
      obj3: new Wibble('not frood')
    };
    let frozen = Fridge.freeze(simple);
    let thawed = Fridge.thaw(frozen, { Wibble: Wibble });
    assert(thawed.obj1 instanceof Wibble);
    assert(thawed.obj2 instanceof Wibble);
    assert.equal(thawed.obj1, thawed.obj2);
  });

  it('array', () => {

    let frood = [ 1, 2, 3, 4];
    let frozen = Fridge.freeze(frood);
    //console.log(JSON.stringify(frozen));
    let thawed = Fridge.thaw(frozen, { Wibble: Wibble });
    //console.log(JSON.stringify(thawed));
    assert.deepEqual(frood, thawed);
  });

  it('array-ref', () => {

    let frood = [ 1, 2, 3, 4];
    let simple = {
      obj1: frood,
      obj2: frood
    };
    let frozen = Fridge.freeze(simple);
    //console.log(JSON.stringify(frozen));
    let thawed = Fridge.thaw(frozen, { Wibble: Wibble });
    //console.log(JSON.stringify(thawed));
    assert.deepEqual(thawed.obj1, thawed.obj2);
  });

  it('array-of', () => {

    let frood = [ { 1: 2, 3: 4} ];
    let frozen = Fridge.freeze(frood);
    //console.log(JSON.stringify(frozen));
    let thawed = Fridge.thaw(frozen, { Wibble: Wibble });
    //console.log(JSON.stringify(thawed));
    assert.deepEqual(frood, thawed);
  });

  it('object-ref', () => {

    let frood = { 1: 2, 3: 4 };
    let simple = {
      obj1: frood,
      obj2: frood
    };
    let frozen = Fridge.freeze(simple);
    //console.log(JSON.stringify(frozen));
    let thawed = Fridge.thaw(frozen, { Wibble: Wibble });
    //console.log(JSON.stringify(thawed));
    assert.equal(thawed.obj1, thawed.obj2);
  });

  it('self-referential', () => {

    let frood = new Wibble();
    frood.wibble = frood;
    let frozen = Fridge.freeze(frood);
    //console.log(JSON.stringify(frozen));
    let thawed = Fridge.thaw(frozen, { Wibble: Wibble });
    //console.log(JSON.stringify(thawed));
    assert.equal(thawed.obj1, thawed.obj2);
  });

  class Weeble extends Wibble {
    constructor(wib) {
      super(wib);
    }

    Freeze() {
      return `frozen ${this.wibble}`;
    }

    static Thaw(data) {
      return new Weeble(`thawed ${data}`);
    }
  }

  it('methods', () => {

    let frood = new Weeble("BLIB");
    let frozen = Fridge.freeze(frood);
    //console.log(JSON.stringify(frozen));
    let thawed = Fridge.thaw(frozen, { Weeble: Weeble });
    //console.log(JSON.stringify(thawed));
    assert.equal("thawed frozen BLIB", thawed.wibble);
  });

  it("mixins", () => {
    class Gibber {
      constructor() {}
      obj() { return true; }
    }
    // add a mixin
    const mix = {
      mixin() { return true; }
    };
    Object.assign(Gibber.prototype, mix);

    let mixedup = new Gibber();
    assert(mixedup.obj());
    assert(mixedup.mixin());
    let frozen = Fridge.freeze(mixedup);
    //let thawed = Object.create(Gibber.prototype);
    //assert(thawed.mixin());
    //assert(thawed.mixin());
    let thawed = Fridge.thaw(frozen, { Gibber: Gibber });
    assert(thawed.obj());
    assert(thawed.mixin());
  });

  class Unfreezable extends Wibble {
    static UNFREEZABLE = true;
    constructor(wib) {
      super(wib);
    }
  }

  it('unfreezable', () => {

    let frood = new Unfreezable();
    let frozen = Fridge.freeze(frood);
    let thawed = Fridge.thaw(frozen, { Wibble: Wibble });
    assert(thawed instanceof Wibble);
  });  
});
