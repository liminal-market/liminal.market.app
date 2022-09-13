import Network from './Network';

export default class fujiNetwork extends Network {
	constructor() {
		super();

		this.ServerUrl = "https://f8t1vrrwtboa.usemoralis.com:2053/server";
		this.AppId = "XZhp3wQobrKiCib0Bf4FPVKAUhbHM9SvTLKOKvBb";
		this.ChainId = 43113;
		this.Name = "fuji";
		this.ChainName = 'Avax test';
		this.NativeCurrencyName = "Avax";
		this.NativeSymbol = "AVAX";
		this.NativeDecimal = 18;
		this.RpcUrl = 'https://api.avax-test.network/ext/bc/C/rpc';
		this.BlockExplorer = 'https://explorer.avax-test.network/';
		this.FaucetUrl = 'https://faucet.avax-test.network/';
		this.BuyUrl = 'https://www.moonpay.com/buy/avax'
	}
}