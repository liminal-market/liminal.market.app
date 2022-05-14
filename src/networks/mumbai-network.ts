

import Network from './Network';

//localhost
export default class mumbaiNetwork extends Network {
	constructor() {
		super();

		//this.ServerUrl = "https://5bgiedfv59dd.usemoralis.com:2053/server";
		//this.AppId = "bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79";
		this.ServerUrl = "https://tus1jdvu8ctd.usemoralis.com:2053/server";
		this.AppId = "XrvReLWa7bDpxZaq4tqJMxQdiFxC0sFCLlGVdHWE";
		this.ChainId = 80001;
		this.Name = "mumbai";
		this.ChainName = 'Polygon Mumbai';
		this.NativeCurrencyName = "Matic";
		this.NativeSymbol = "MATIC";
		this.NativeDecimal = 18;
		this.RpcUrl = 'https://matic-mumbai.chainstacklabs.com/';
		this.BlockExplorer = 'https://mumbai.polygonscan.com/';
		this.FaucetUrl = 'https://faucet.polygon.technology/';
		this.BuyUrl = 'https://www.moonpay.com/buy/matic';
	}



}

