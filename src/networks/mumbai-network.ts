

import Network from './Network';

//localhost
export default class mumbaiNetwork extends Network {
	constructor() {
		super();

		//this.ServerUrl = "https://5bgiedfv59dd.usemoralis.com:2053/server";
		//this.AppId = "bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79";
		this.ServerUrl = "https://vddgndqknj3a.usemoralis.com:2053/server";
		this.AppId = "arV9tpkbp9wx7WG1HAm7sibgaWapPoSCzBfHYhOk";
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

