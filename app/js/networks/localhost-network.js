import {Network} from './network.js';
//localhost
export class localhostNetwork extends Network {
	constructor() {
		super();

		this.ServerUrl = "https://om9bgoayltsu.usemoralis.com:2053/server";
		this.AppId = "SMpXWAEXGEeH4jAmTYYs2UrnCSrYhdArY6hsCupc";
		this.ChainId = 31337;
		this.Name = "localhost";
	}



}

