

import Network from './Network';

export default class mumbaiNetwork extends Network {
	constructor() {
            super();

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

