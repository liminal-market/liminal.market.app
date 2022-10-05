

import Network from './Network';

//localhost
export default class mumbaiNetwork extends Network {
	constructor() {
        super();

        //this.ServerUrl = "https://f8t1vrrwtboa.usemoralis.com:2053/server";
        //this.AppId = "XZhp3wQobrKiCib0Bf4FPVKAUhbHM9SvTLKOKvBb";
        this.ServerUrl = "https://dqet8dfymvzj.usemoralis.com:2053/server";
        this.AppId = "TXR6YesK99VgRCxSecnySRMp1KI5rLnCfIetQuuU";
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

