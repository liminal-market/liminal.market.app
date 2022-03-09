"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdateliminal_app"]("main",{

/***/ "./src/networks/rinkeby-network.ts":
/*!*****************************************!*\
  !*** ./src/networks/rinkeby-network.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"rinkebyNetwork\": () => (/* binding */ rinkebyNetwork)\n/* harmony export */ });\n/* harmony import */ var _network__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./network */ \"./src/networks/network.ts\");\n\r\nclass rinkebyNetwork extends _network__WEBPACK_IMPORTED_MODULE_0__.Network {\r\n    constructor() {\r\n        super();\r\n        this.ServerUrl = \"https://rucsd2xip9xc.usemoralis.com:2053/server\";\r\n        this.AppId = \"WrszROWRp7oShP39MWHMLl4mMA6n2QMN8LDRD6gi\";\r\n        this.ChainId = 4;\r\n        this.Name = \"rinkeby\";\r\n        this.ChainName = 'Rinkeby test';\r\n        this.NativeCurrencyName = \"Ethereum\";\r\n        this.NativeSymbol = \"ETH\";\r\n        this.NativeDecimal = 18;\r\n        this.RpcUrl = 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';\r\n        this.BlockExplorer = 'https://rinkeby.etherscan.io';\r\n    }\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbmV0d29ya3Mvcmlua2VieS1uZXR3b3JrLnRzLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQWtDO0FBRTNCLE1BQU0sY0FBZSxTQUFRLDZDQUFPO0lBQzFDO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDTixJQUFJLENBQUMsU0FBUyxHQUFHLGlEQUFpRCxDQUFDO1FBQ25FLElBQUksQ0FBQyxLQUFLLEdBQUcsMENBQTBDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUM7UUFDaEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFVBQVUsQ0FBQztRQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLCtEQUErRCxDQUFDO1FBQzlFLElBQUksQ0FBQyxhQUFhLEdBQUcsOEJBQThCLENBQUM7SUFDckQsQ0FBQztDQUNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGltaW5hbC1hcHAvLi9zcmMvbmV0d29ya3Mvcmlua2VieS1uZXR3b3JrLnRzP2ZiYjEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZXR3b3JrfSBmcm9tICcuL25ldHdvcmsnO1xyXG5cclxuZXhwb3J0IGNsYXNzIHJpbmtlYnlOZXR3b3JrIGV4dGVuZHMgTmV0d29yayB7XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcbnN1cGVyKCk7XHJcblx0XHR0aGlzLlNlcnZlclVybCA9IFwiaHR0cHM6Ly9ydWNzZDJ4aXA5eGMudXNlbW9yYWxpcy5jb206MjA1My9zZXJ2ZXJcIjtcclxuXHRcdHRoaXMuQXBwSWQgPSBcIldyc3pST1dScDdvU2hQMzlNV0hNTGw0bU1BNm4yUU1OOExEUkQ2Z2lcIjtcclxuXHRcdHRoaXMuQ2hhaW5JZCA9IDQ7XHJcblx0XHR0aGlzLk5hbWUgPSBcInJpbmtlYnlcIjtcclxuXHRcdHRoaXMuQ2hhaW5OYW1lID0gJ1JpbmtlYnkgdGVzdCc7XHJcblx0XHR0aGlzLk5hdGl2ZUN1cnJlbmN5TmFtZSA9IFwiRXRoZXJldW1cIjtcclxuXHRcdHRoaXMuTmF0aXZlU3ltYm9sID0gXCJFVEhcIjtcclxuXHRcdHRoaXMuTmF0aXZlRGVjaW1hbCA9IDE4O1xyXG5cdFx0dGhpcy5ScGNVcmwgPSAnaHR0cHM6Ly9yaW5rZWJ5LmluZnVyYS5pby92My85YWEzZDk1YjNiYzQ0MGZhODhlYTEyZWFhNDQ1NjE2MSc7XHJcblx0XHR0aGlzLkJsb2NrRXhwbG9yZXIgPSAnaHR0cHM6Ly9yaW5rZWJ5LmV0aGVyc2Nhbi5pbyc7XHJcblx0fVxyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/networks/rinkeby-network.ts\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("e85d1f13480b34063f45")
/******/ })();
/******/ 
/******/ }
);