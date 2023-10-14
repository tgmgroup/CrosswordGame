/*Copyright (C) 2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/**
 * Provides a simplex communications channel within a process.
 * Provides the same API as client-side
 * {@link https://github.com/socketio/socket.io|socket.io} where
 * there is no server (events are handled entirely within the
 * browser).
 *
 * Each Channel has a reference to a receiver, which must also be a
 * Channel. By default, the receiver is `this`, which means calls to
 * `emit` will invoke handlers added to the same Channel by calls to
 * `on`.
 *
 * `this.receiver` can be set to a different channel (call it B), in
 * which case calls to `this.emit` will invoke handlers added to B by
 * calls to B.on().
 *
 * Two channels that are set to receive from each other provide a full
 * duplex solution for end-to-end comms.
 *
 * Note that we could have used the browser event queue for this, but
 * that wouldn't buy us anything, and this implementation keeps event
 * handling strictly synchronous which is easier to debug.
 */
class Channel {

  constructor() {
    /**
     * Receiver object. We only keep a weak reference so
     * garbage collection doesn't get tangled up.
     * @member {Channel}
     */
    this._receiver = new WeakRef(this);

    /**
     * Handlers for events
     * @member {Object<string,function>}
     */
    this.handlers = {};
  }

  /**
   * Register a handler for an event. See {@link }
   * @param {string} event the event name
   * @param {function} fun the handler function, passed data
   */
  on(event, fun) {
    if (!this.handlers[event])
      this.handlers[event] = [];
    this.handlers[event].push(fun);
    return this;
  }

  /**
   * Assign a new receiver for messages emitted on this channel
   */
  set receiver(channel) {
    this._receiver = new WeakRef(channel);
  }

  /**
   * Emit the given event with associated data.
   * The event is sent to all handlers.
   * @param {string} event the event name
   * @param {object} data data to pass
   */
  emit(event, data) {
    const rx = this._receiver.deref();
    if (rx.handlers[event])
      rx.handlers[event].forEach(l => l(data, event));
  }
}

export { Channel }
