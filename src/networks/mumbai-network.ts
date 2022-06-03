

import Network from './Network';

//localhost
export default class mumbaiNetwork extends Network {
	constructor() {
		super();

		this.ServerUrl = "https://ddq3pnly8s7v.usemoralis.com:2053/server";
		this.AppId = "oz1K9rej0cQ7Y1W0PsjcvDESBXmKCP9eH2TFV8DD";
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

