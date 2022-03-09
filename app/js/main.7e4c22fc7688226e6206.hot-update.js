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

/***/ "./src/networks/fuji-network.ts":
/*!**************************************!*\
  !*** ./src/networks/fuji-network.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"fujiNetwork\": () => (/* binding */ fujiNetwork)\n/* harmony export */ });\n/* harmony import */ var _network__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./network */ \"./src/networks/network.ts\");\n\r\nclass fujiNetwork extends _network__WEBPACK_IMPORTED_MODULE_0__.Network {\r\n    constructor() {\r\n        super();\r\n        this.ServerUrl = \"https://5bgiedfv59dd.usemoralis.com:2053/server\";\r\n        this.AppId = \"bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79\";\r\n        this.ChainId = 43113;\r\n        this.Name = \"fuji\";\r\n        this.ChainName = 'Avax test';\r\n        this.NativeCurrencyName = \"Avax\";\r\n        this.NativeSymbol = \"AVAX\";\r\n        this.NativeDecimal = 18;\r\n        this.RpcUrl = 'https://api.avax-test.network/ext/bc/C/rpc';\r\n        this.BlockExplorer = 'https://explorer.avax-test.network/';\r\n    }\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbmV0d29ya3MvZnVqaS1uZXR3b3JrLnRzLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQWtDO0FBRTNCLE1BQU0sV0FBWSxTQUFRLDZDQUFPO0lBQ3ZDO1FBQ0MsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsU0FBUyxHQUFHLGlEQUFpRCxDQUFDO1FBQ25FLElBQUksQ0FBQyxLQUFLLEdBQUcsMENBQTBDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7UUFDN0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQztRQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztRQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLDRDQUE0QyxDQUFDO1FBQzNELElBQUksQ0FBQyxhQUFhLEdBQUcscUNBQXFDLENBQUM7SUFDNUQsQ0FBQztDQUNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGltaW5hbC1hcHAvLi9zcmMvbmV0d29ya3MvZnVqaS1uZXR3b3JrLnRzPzNhYjkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZXR3b3JrfSBmcm9tICcuL25ldHdvcmsnO1xyXG5cclxuZXhwb3J0IGNsYXNzIGZ1amlOZXR3b3JrIGV4dGVuZHMgTmV0d29yayB7XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMuU2VydmVyVXJsID0gXCJodHRwczovLzViZ2llZGZ2NTlkZC51c2Vtb3JhbGlzLmNvbToyMDUzL3NlcnZlclwiO1xyXG5cdFx0dGhpcy5BcHBJZCA9IFwiYmh2RlVSaENxTnZLR2ZWZ2d1NTBma2NibTlpak1KcUszSFJuZk03OVwiO1xyXG5cdFx0dGhpcy5DaGFpbklkID0gNDMxMTM7XHJcblx0XHR0aGlzLk5hbWUgPSBcImZ1amlcIjtcclxuXHRcdHRoaXMuQ2hhaW5OYW1lID0gJ0F2YXggdGVzdCc7XHJcblx0XHR0aGlzLk5hdGl2ZUN1cnJlbmN5TmFtZSA9IFwiQXZheFwiO1xyXG5cdFx0dGhpcy5OYXRpdmVTeW1ib2wgPSBcIkFWQVhcIjtcclxuXHRcdHRoaXMuTmF0aXZlRGVjaW1hbCA9IDE4O1xyXG5cdFx0dGhpcy5ScGNVcmwgPSAnaHR0cHM6Ly9hcGkuYXZheC10ZXN0Lm5ldHdvcmsvZXh0L2JjL0MvcnBjJztcclxuXHRcdHRoaXMuQmxvY2tFeHBsb3JlciA9ICdodHRwczovL2V4cGxvcmVyLmF2YXgtdGVzdC5uZXR3b3JrLyc7XHJcblx0fVxyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/networks/fuji-network.ts\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("0c7c3f8b130eb5b8c2a4")
/******/ })();
/******/ 
/******/ }
);