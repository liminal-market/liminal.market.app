

import {Network} from './network.js';

//localhost
export class mumbaiNetwork extends Network {
	constructor() {
		super();

		this.ServerUrl = "https://5bgiedfv59dd.usemoralis.com:2053/server";
		this.AppId = "bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79";
		this.ChainId = 80001;
		this.Name = "mumbai";
	}



}

