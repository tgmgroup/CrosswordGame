/*Copyright (C) 2022 The Xanado Project https://github.com/cdot/Xanado
License MIT. See README.md at the root of this distribution for full copyright
and license information. Author Crawford Currie http://c-dot.co.uk*/
/* eslint-env mocha */

import { Channel } from "../src/common/Channel.js";
import { stringify } from "../src/common/Utils.js";
import { assert } from "chai";

/**
 * Simulator for socket.io, replaces the socket functionality with a
 * simple callback that can be used in tests to monitor expected
 * events. Pattern:
 * ```
 * tr.addTest("example", () => {
 *   const socket = new TestSocket("a socket");
 *   socket.on("event", (data, event) => {
 *     // Handle expected events.
 *     // When last event seen, call socket.done()
 *   }
 *   return new Promise((resolve, reject) => {
 *     ... code that generates events ...
 *   })
 *   .then(() => socket.wait());
 * });
 * ```
 * Once `done` has been called the socket will accept no more emits.
 */

class TestSocket extends Channel {
  resolve;
  reject;
  finished;
  sawError;
  id;
  seqNo = 0;

  constructor(id) {
    super();
    this.id = id || "anonymous";
  }

  // @override
  emit(event, data, nomore) {
    if (this.finished) {
      if (event === "connections")
        return;
      throw Error(`'${this.id}' is done(), but received #${this.seqNo} ${event} ${stringify(data)}`);
    }
    if (this.connection && !nomore) { // connection to another socket?
      //console.log(this.id,"passing",event,data,"to",this.connection.id);
      this.connection.emit(event, data, true);
    } else {
      //console.log(this.id,"handling", event, this.seqNo, data);
      try {
        if (this.handlers[event] && this.handlers[event].length > 0)
          this.handlers[event].forEach(l => l(data, event, this.seqNo));
        else if (this.handlers["*"] && this.handlers['*'].length > 0)
          this.handlers["*"].forEach(l => l(data, event, this.seqNo));
        this.seqNo++;
      } catch (e) {
        console.error("ERROR", e);
        this.sawError = e;
        this.done();
        throw e;
      }
    }
  }

  // Couple to another TestSocket
  connect(endPoint) {
    assert(!this.connection);
    assert(!endPoint.connection);
    this.connection = endPoint;
    endPoint.connection = this;
  }

  /**
   * Wait for the socket to be marked as `done()`. This will normally
   * be after all the expected messages have been received. If done()
   * is never called, then mocha will eventually time out.
   */
  wait() {
    if (this.finished)
      return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  /**
   * Mark the socket as `done`. The socket must be sitting in `wait()`
   * when done() is called, or it will error out.
   */
  done() {
    if (this.finished)
      return;
    //console.log(`Socket ${this.id} is done`);
    this.finished = true;
    this.id = `finished ${this.id}`;
    if (this.connection) {
      this.connection.connection = undefined;
      this.connection = undefined;
    }
    if (this.sawError) {
      if (this.reject)
        this.reject(this.sawError);
      else
        throw this.sawError;
    } else if (this.resolve)
      this.resolve();
  }

}

export { TestSocket }
