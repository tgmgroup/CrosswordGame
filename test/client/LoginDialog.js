/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha, node */

/* global Platform */

import { assert } from "chai";
import { setupPlatform, setup$, setupI18n, StubServer } from "../TestPlatform.js";
import { LoginDialog } from "../../src/client/LoginDialog.js";

describe("client/LoginDialog", () => {

  let $ajax;
  before(
    () => setupPlatform()
    .then(() => setup$())
    .then(() => setupI18n()));

  beforeEach(() => {
    $("head").empty();
    $("body").empty();
   });

  it ("dialog", () => {
    global.location = {
      href: "html/test.html", hash: "#signin-tab" };
    const server = new StubServer({
      "/oauth2-providers": Promise.resolve([ { name: "google" }])
    });
    return new Promise(resolve => {
      new LoginDialog({
        onSubmit: (dlg, vals) => {},
        error: e => assert.fail(e),
        //debug: console.debug,
        onReady: dlg => {
          dlg.$dlg.dialog("close");
        },
        close: resolve
      });
    })
    .then(() => server.wait());
  });
});
