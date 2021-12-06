import {Network} from './network.js';

export class rinkebyNetwork extends Network {
	constructor() {
super();
		this.ServerUrl = "https://rucsd2xip9xc.usemoralis.com:2053/server";
		this.AppId = "WrszROWRp7oShP39MWHMLl4mMA6n2QMN8LDRD6gi";
		this.ChainId = 4;
		this.Name = "rinkeby";
	}
}