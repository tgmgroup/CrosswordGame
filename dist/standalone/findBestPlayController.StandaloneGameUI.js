/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(window["webpackChunk_cdot_xanado"] = window["webpackChunk_cdot_xanado"] || []).push([["findBestPlayController"],{

/***/ "./node_modules/web-worker/cjs/browser.js":
/*!************************************************!*\
  !*** ./node_modules/web-worker/cjs/browser.js ***!
  \************************************************/
/***/ ((module) => {

eval("/**\n * Copyright 2020 Google LLC\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *     http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\nmodule.exports = Worker;\n\n//# sourceURL=webpack://@cdot/xanado/./node_modules/web-worker/cjs/browser.js?");

/***/ }),

/***/ "./src/backend/findBestPlayController.js":
/*!***********************************************!*\
  !*** ./src/backend/findBestPlayController.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"findBestPlay\": () => (/* binding */ findBestPlay)\n/* harmony export */ });\n/* harmony import */ var web_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! web-worker */ \"./node_modules/web-worker/cjs/browser.js\");\n/* harmony import */ var _BackendGame_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BackendGame.js */ \"./src/backend/BackendGame.js\");\n/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado\n  License MIT. See README.md at the root of this distribution for full copyright\n  and license information. Author Crawford Currie http://c-dot.co.uk*/\n\n/* global Platform */\n\n/* eslint-disable */\n// eslint (or more likely the import plugin) complains:\n// \"No default export found in imported module \"web-worker\"\"\n// but it works fine.\n\n/* eslint-enable */\n\n\n\n/** @module */\n\n/**\n * This is the controller side of a best play thread.\n * Interface is the same as for {@linkcode findBestPlay} so they\n * can be switched in and out.\n */\nfunction findBestPlay(\n  game, letters, listener, dictionary) {\n\n  return new Promise((resolve, reject) => {\n    const worker = new web_worker__WEBPACK_IMPORTED_MODULE_0__(\n      new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(\"src_backend_findBestPlayWorker_js\"), __webpack_require__.b),\n      { type: undefined });\n\n    // Apply the game time limit\n    let timer;\n    if (game.timerType === _BackendGame_js__WEBPACK_IMPORTED_MODULE_1__.BackendGame.Timer.TURN) {\n      timer = setTimeout(() => {\n        console.error(\"findBestPlay timed out\");\n        worker.terminate();\n      }, game.timeAllowed * 60000);\n    }\n\n    // Pass worker messages on to listener\n    worker.addEventListener(\"message\", data => {\n      const mess = _BackendGame_js__WEBPACK_IMPORTED_MODULE_1__.BackendGame.fromCBOR(data.data, _BackendGame_js__WEBPACK_IMPORTED_MODULE_1__.BackendGame.CLASSES);\n      switch (mess.type) {\n      case \"play\":\n        listener(mess.data);\n        break;\n      case \"exit\":\n        if (timer)\n          clearTimeout(timer);\n        resolve();\n        break;\n      }\n    });\n\n    /* c8 ignore start */\n    worker.addEventListener(\"error\", e => {\n      console.error(\"Worker:\", e.message, e.filename, e.lineno);\n      if (timer)\n        clearTimeout(timer);\n      reject();\n    });\n    /* c8 ignore stop */\n\n    worker.postMessage(_BackendGame_js__WEBPACK_IMPORTED_MODULE_1__.BackendGame.toCBOR({\n      Platform: Platform.name,\n      game: game,\n      rack: letters,\n      dictionary: dictionary\n    }));\n  });\n}\n\n\n\n\n\n//# sourceURL=webpack://@cdot/xanado/./src/backend/findBestPlayController.js?");

/***/ })

}]);