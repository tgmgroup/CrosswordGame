// Used in testing
import { assert } from "chai";

function sparseEqual(actual, expected, path) {
  if (!path) path = "";
  for (let f in expected) {
    const spath = `${path}->${f}`;
    if (typeof expected[f] === "object") {
      assert(typeof actual[f] === "object", `actual ${spath} missing`);
      sparseEqual(actual[f], expected[f], spath);
    } else
      assert.equal(actual[f], expected[f], spath);
  }
}

export default sparseEqual;
