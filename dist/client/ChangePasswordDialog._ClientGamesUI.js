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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ChangePasswordDialog\": () => (/* binding */ ChangePasswordDialog)\n/* harmony export */ });\n/* harmony import */ var _browser_Dialog_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../browser/Dialog.js */ \"./src/browser/Dialog.js\");\n/* harmony import */ var _PasswordMixin_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PasswordMixin.js */ \"./src/client/PasswordMixin.js\");\n/* provided dependency */ var $ = __webpack_require__(/*! jquery */ \"./node_modules/jquery/dist/jquery.js\");\n/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado\n  License MIT. See README.md at the root of this distribution for full copyright\n  and license information. Author Crawford Currie http://c-dot.co.uk*/\n\n\n\n\nclass ChangePasswordDialog extends (0,_PasswordMixin_js__WEBPACK_IMPORTED_MODULE_1__.PasswordMixin)(_browser_Dialog_js__WEBPACK_IMPORTED_MODULE_0__.Dialog) {\n\n  constructor(options) {\n    super(\"ChangePasswordDialog\", $.extend({\n      title: $.i18n(\"Change password\")\n    }, options));\n  }\n\n  createDialog() {\n    return super.createDialog()\n    .then(() => {\n      const $las = this.$dlg.find(\".signed-in-as\");\n      if ($las.length > 0) {\n        $.get(\"/session\") // asynchronous is OK\n        .then(user => $las.text(\n          $.i18n(\"signed-in-as\", user.name)));\n      }\n    });\n  }\n}\n\n\n\n\n//# sourceURL=webpack://@cdot/xanado/./src/client/ChangePasswordDialog.js?");

/***/ })

}]);