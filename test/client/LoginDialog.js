/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env mocha, node */

/* global Platform */

import { assert } from "chai";
import { setupPlatform, setup$, setupI18n,
         expectDialog, StubServer } from "../TestPlatform.js";
import { LoginDialog } from "../../src/client/LoginDialog.js";

describe("client/LoginDialog", () => {

  let $ajax;
  before(
    () => setupPlatform()
    .then(() => setup$())
    .then(() => setupI18n()));

  beforeEach(() => {
    $("head").html("");
    $("body").html("");
   });

  it ("dialog", () => {
    global.location = {
      href: "html/test.html", hash: "#signin-tab" };
    const server = new StubServer({
      "/oauth2-providers": Promise.resolve([ { name: "google" }])
    });
    return new Promise(resolve => {
      const dlg = new LoginDialog({
        onSubmit: (dlg, vals) => {},
        error: e => assert.fail(e),
        onReady: () => {
          dlg.$dlg.dialog("close");
          resolve();
          dlg.$dlg.dialog("destroy");
        }
      });
    })
    .then(() => server.wait());
  });
});
