

import {Network} from './network.js';

//localhost
export class mumbaiNetwork extends Network {
	constructor() {
		super();

		this.ServerUrl = "https://5bgiedfv59dd.usemoralis.com:2053/server";
		this.AppId = "bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79";
		this.ChainId = 80001;
		this.Name = "mumbai";
		this.ChainName = 'Polygon Mumbai';
		this.NativeCurrencyName = "Matic";
		this.NativeSymbol = "MATIC";
		this.NativeDecimal = 18;
		this.RpcUrl = 'https://matic-mumbai.chainstacklabs.com/';
		this.BlockExplorer = 'https://mumbai.polygonscan.com/';
	}



}

