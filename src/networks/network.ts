import {setCookieNetwork} from './network-info'

export class Network {
	ServerUrl = "https://5bgiedfv59dd.usemoralis.com:2053/server";
	AppId = "bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79";
	ChainId = 80001;
	Name = "mumbai";
	ChainName = 'Polygon Mumbai';
	NativeCurrencyName = "Matic";
	NativeSymbol = "MATIC";
	NativeDecimal = 18;
	RpcUrl = 'https://matic-mumbai.chainstacklabs.com/';
	BlockExplorer = 'https://mumbai.polygonscan.com/';

	constructor() {
	}

	setNetwork = function(networkInfo : Network) : void {

		this.ServerUrl = networkInfo.ServerUrl;
		this.AppId = networkInfo.AppId;
		this.ChainId = networkInfo.ChainId;
		this.Name = networkInfo.Name;

		this.ChainName = networkInfo.ChainName;
		this.NativeCurrencyName = networkInfo.NativeCurrencyName;
		this.NativeSymbol = networkInfo.NativeSymbol;
		this.NativeDecimal = networkInfo.NativeDecimal;
		this.RpcUrl = networkInfo.RpcUrl;
		this.BlockExplorer = networkInfo.BlockExplorer;

		setCookieNetwork(this.Name);
	}
}

