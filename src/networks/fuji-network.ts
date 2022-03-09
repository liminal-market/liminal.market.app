import {Network} from './network';

export class fujiNetwork extends Network {
	constructor() {
		super();

		this.ServerUrl = "https://5bgiedfv59dd.usemoralis.com:2053/server";
		this.AppId = "bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79";
		this.ChainId = 43113;
		this.Name = "fuji";
		this.ChainName = 'Avax test';
		this.NativeCurrencyName = "Avax";
		this.NativeSymbol = "AVAX";
		this.NativeDecimal = 18;
		this.RpcUrl = 'https://api.avax-test.network/ext/bc/C/rpc';
		this.BlockExplorer = 'https://explorer.avax-test.network/';
	}
}