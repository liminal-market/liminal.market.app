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

			setCookieNetwork(this.Name);
		}
	}
}

