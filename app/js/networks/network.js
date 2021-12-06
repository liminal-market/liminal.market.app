import {setCookieNetwork} from './network-info.js'

export class Network {
	constructor() {
		this.ServerUrl = "";
		this.AppId = "";
		this.ChainId = 0;
		this.Name = "";

		this.setNetwork = function(networkInfo) {

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
}

