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

/***/ "./src/networks/mumbai-network.ts":
/*!****************************************!*\
  !*** ./src/networks/mumbai-network.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"mumbaiNetwork\": () => (/* binding */ mumbaiNetwork)\n/* harmony export */ });\n/* harmony import */ var _network__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./network */ \"./src/networks/network.ts\");\n\r\n//localhost\r\nclass mumbaiNetwork extends _network__WEBPACK_IMPORTED_MODULE_0__.Network {\r\n    constructor() {\r\n        super();\r\n        this.ServerUrl = \"https://5bgiedfv59dd.usemoralis.com:2053/server\";\r\n        this.AppId = \"bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79\";\r\n        this.ChainId = 80001;\r\n        this.Name = \"mumbai\";\r\n        this.ChainName = 'Polygon Mumbai';\r\n        this.NativeCurrencyName = \"Matic\";\r\n        this.NativeSymbol = \"MATIC\";\r\n        this.NativeDecimal = 18;\r\n        this.RpcUrl = 'https://matic-mumbai.chainstacklabs.com/';\r\n        this.BlockExplorer = 'https://mumbai.polygonscan.com/';\r\n    }\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbmV0d29ya3MvbXVtYmFpLW5ldHdvcmsudHMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFa0M7QUFFbEMsV0FBVztBQUNKLE1BQU0sYUFBYyxTQUFRLDZDQUFPO0lBQ3pDO1FBQ0MsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsU0FBUyxHQUFHLGlEQUFpRCxDQUFDO1FBQ25FLElBQUksQ0FBQyxLQUFLLEdBQUcsMENBQTBDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztRQUNsQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsMENBQTBDLENBQUM7UUFDekQsSUFBSSxDQUFDLGFBQWEsR0FBRyxpQ0FBaUMsQ0FBQztJQUN4RCxDQUFDO0NBSUQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9saW1pbmFsLWFwcC8uL3NyYy9uZXR3b3Jrcy9tdW1iYWktbmV0d29yay50cz81MjdkIl0sInNvdXJjZXNDb250ZW50IjpbIlxyXG5cclxuaW1wb3J0IHtOZXR3b3JrfSBmcm9tICcuL25ldHdvcmsnO1xyXG5cclxuLy9sb2NhbGhvc3RcclxuZXhwb3J0IGNsYXNzIG11bWJhaU5ldHdvcmsgZXh0ZW5kcyBOZXR3b3JrIHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5TZXJ2ZXJVcmwgPSBcImh0dHBzOi8vNWJnaWVkZnY1OWRkLnVzZW1vcmFsaXMuY29tOjIwNTMvc2VydmVyXCI7XHJcblx0XHR0aGlzLkFwcElkID0gXCJiaHZGVVJoQ3FOdktHZlZnZ3U1MGZrY2JtOWlqTUpxSzNIUm5mTTc5XCI7XHJcblx0XHR0aGlzLkNoYWluSWQgPSA4MDAwMTtcclxuXHRcdHRoaXMuTmFtZSA9IFwibXVtYmFpXCI7XHJcblx0XHR0aGlzLkNoYWluTmFtZSA9ICdQb2x5Z29uIE11bWJhaSc7XHJcblx0XHR0aGlzLk5hdGl2ZUN1cnJlbmN5TmFtZSA9IFwiTWF0aWNcIjtcclxuXHRcdHRoaXMuTmF0aXZlU3ltYm9sID0gXCJNQVRJQ1wiO1xyXG5cdFx0dGhpcy5OYXRpdmVEZWNpbWFsID0gMTg7XHJcblx0XHR0aGlzLlJwY1VybCA9ICdodHRwczovL21hdGljLW11bWJhaS5jaGFpbnN0YWNrbGFicy5jb20vJztcclxuXHRcdHRoaXMuQmxvY2tFeHBsb3JlciA9ICdodHRwczovL211bWJhaS5wb2x5Z29uc2Nhbi5jb20vJztcclxuXHR9XHJcblxyXG5cclxuXHJcbn1cclxuXHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/networks/mumbai-network.ts\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("d0c931944d3001b90dec")
/******/ })();
/******/ 
/******/ }
);