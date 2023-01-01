"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(window["webpackChunk_cdot_xanado"] = window["webpackChunk_cdot_xanado"] || []).push([["ChangePasswordDialog"],{

/***/ "./src/client/ChangePasswordDialog.js":
/*!********************************************!*\
  !*** ./src/client/ChangePasswordDialog.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ChangePasswordDialog\": () => (/* binding */ ChangePasswordDialog)\n/* harmony export */ });\n/* harmony import */ var _browser_Dialog_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../browser/Dialog.js */ \"./src/browser/Dialog.js\");\n/* harmony import */ var _PasswordMixin_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PasswordMixin.js */ \"./src/client/PasswordMixin.js\");\n/* provided dependency */ var $ = __webpack_require__(/*! jquery */ \"./node_modules/jquery/dist/jquery.js\");\n/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado\r\n  License MIT. See README.md at the root of this distribution for full copyright\r\n  and license information. Author Crawford Currie http://c-dot.co.uk*/\r\n/* eslint-env browser, jquery */\r\n\r\n\r\n\r\n\r\nclass ChangePasswordDialog extends (0,_PasswordMixin_js__WEBPACK_IMPORTED_MODULE_1__.PasswordMixin)(_browser_Dialog_js__WEBPACK_IMPORTED_MODULE_0__.Dialog) {\r\n\r\n  constructor(options) {\r\n    super(\"ChangePasswordDialog\", $.extend({\r\n      title: $.i18n(\"Change password\")\r\n    }, options));\r\n  }\r\n\r\n  createDialog() {\r\n    const $las = this.$dlg.find(\".signed-in-as\");\r\n    if ($las.length > 0) {\r\n      $.get(\"/session\")\r\n      .then(user => $las.text(\r\n        $.i18n(\"signed-in-as\", user.name)));\r\n    }\r\n    return super.createDialog();\r\n  }\r\n}\r\n\r\n\r\n\n\n//# sourceURL=webpack://@cdot/xanado/./src/client/ChangePasswordDialog.js?");

/***/ })

}]);