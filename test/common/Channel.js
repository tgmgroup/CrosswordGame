/*Copyright (C) 2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/
/* eslint-env mocha */

import { assert } from "chai";
import { Channel } from "../../src/common/Channel.js";

describe("common/Channel", () => {

  it("talk to myself", () => {
    const chan = new Channel();
    let received = false;

    chan.on("message", (data, mess) => {
      assert.equal(mess, "message");
      assert.equal(data, "Data");
      received = true;
    });

    chan.emit("message", "Data");

    assert(received);
  });

  it("talk to myself myself", () => {
    const chan = new Channel();
    let received = 0;

    chan.on("message", (data, mess) => {
      assert.equal(mess, "message");
      assert.equal(data, "Data");
      received++;
    });

    chan.on("message", (data, mess) => {
      assert.equal(mess, "message");
      assert.equal(data, "Data");
      received++;
    });

    chan.emit("message", "Data");

    assert.equal(received, 2);
  });

  it("A and B", () => {
    const A = new Channel();
    const B = new Channel();

    A.receiver = B;
    B.receiver = A;

    let receivedA = false;
    let receivedB = false;

    A.on("fromB", (data, mess) => {
      assert.equal(mess, "fromB");
      assert.equal(data, "Data from B");
      assert(!receivedA);
      receivedA = true;
    });

    B.on("fromA", (data, mess) => {
      assert.equal(mess, "fromA");
      assert.equal(data, "Data from A");
      assert(!receivedB);
      receivedB = true;
    });

    A.emit("fromA", "Data from A");
    B.emit("fromB", "Data from B");

    assert(receivedA);
    assert(receivedB);
  });
});
