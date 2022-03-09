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

/***/ "./src/networks/localhost-network.ts":
/*!*******************************************!*\
  !*** ./src/networks/localhost-network.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"localhostNetwork\": () => (/* binding */ localhostNetwork)\n/* harmony export */ });\n/* harmony import */ var _network__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./network */ \"./src/networks/network.ts\");\n\r\n//localhost\r\nclass localhostNetwork extends _network__WEBPACK_IMPORTED_MODULE_0__.Network {\r\n    constructor() {\r\n        super();\r\n        this.ServerUrl = \"https://om9bgoayltsu.usemoralis.com:2053/server\";\r\n        this.AppId = \"SMpXWAEXGEeH4jAmTYYs2UrnCSrYhdArY6hsCupc\";\r\n        this.ChainId = 31337;\r\n        this.Name = \"localhost\";\r\n        this.ChainName = 'localhost test';\r\n        this.NativeCurrencyName = \"Ethereum\";\r\n        this.NativeSymbol = \"ETH\";\r\n        this.NativeDecimal = 18;\r\n        this.RpcUrl = 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';\r\n        this.BlockExplorer = 'https://rinkeby.etherscan.io';\r\n    }\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbmV0d29ya3MvbG9jYWxob3N0LW5ldHdvcmsudHMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBa0M7QUFDbEMsV0FBVztBQUNKLE1BQU0sZ0JBQWlCLFNBQVEsNkNBQU87SUFDNUM7UUFDQyxLQUFLLEVBQUUsQ0FBQztRQUVSLElBQUksQ0FBQyxTQUFTLEdBQUcsaURBQWlELENBQUM7UUFDbkUsSUFBSSxDQUFDLEtBQUssR0FBRywwQ0FBMEMsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQztRQUV4QixJQUFJLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDO1FBQ2xDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxVQUFVLENBQUM7UUFDckMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRywrREFBK0QsQ0FBQztRQUM5RSxJQUFJLENBQUMsYUFBYSxHQUFHLDhCQUE4QixDQUFDO0lBRXJELENBQUM7Q0FJRCIsInNvdXJjZXMiOlsid2VicGFjazovL2xpbWluYWwtYXBwLy4vc3JjL25ldHdvcmtzL2xvY2FsaG9zdC1uZXR3b3JrLnRzPzkzY2IiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZXR3b3JrfSBmcm9tICcuL25ldHdvcmsnO1xyXG4vL2xvY2FsaG9zdFxyXG5leHBvcnQgY2xhc3MgbG9jYWxob3N0TmV0d29yayBleHRlbmRzIE5ldHdvcmsge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLlNlcnZlclVybCA9IFwiaHR0cHM6Ly9vbTliZ29heWx0c3UudXNlbW9yYWxpcy5jb206MjA1My9zZXJ2ZXJcIjtcclxuXHRcdHRoaXMuQXBwSWQgPSBcIlNNcFhXQUVYR0VlSDRqQW1UWVlzMlVybkNTclloZEFyWTZoc0N1cGNcIjtcclxuXHRcdHRoaXMuQ2hhaW5JZCA9IDMxMzM3O1xyXG5cdFx0dGhpcy5OYW1lID0gXCJsb2NhbGhvc3RcIjtcclxuXHJcblx0XHR0aGlzLkNoYWluTmFtZSA9ICdsb2NhbGhvc3QgdGVzdCc7XHJcblx0XHR0aGlzLk5hdGl2ZUN1cnJlbmN5TmFtZSA9IFwiRXRoZXJldW1cIjtcclxuXHRcdHRoaXMuTmF0aXZlU3ltYm9sID0gXCJFVEhcIjtcclxuXHRcdHRoaXMuTmF0aXZlRGVjaW1hbCA9IDE4O1xyXG5cdFx0dGhpcy5ScGNVcmwgPSAnaHR0cHM6Ly9yaW5rZWJ5LmluZnVyYS5pby92My85YWEzZDk1YjNiYzQ0MGZhODhlYTEyZWFhNDQ1NjE2MSc7XHJcblx0XHR0aGlzLkJsb2NrRXhwbG9yZXIgPSAnaHR0cHM6Ly9yaW5rZWJ5LmV0aGVyc2Nhbi5pbyc7XHJcblxyXG5cdH1cclxuXHJcblxyXG5cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/networks/localhost-network.ts\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("e91400b244d0484b1252")
/******/ })();
/******/ 
/******/ }
);