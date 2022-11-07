import Network from './Network';
import TestNetwork from "./TestNetwork";

export default class fujiNetwork extends TestNetwork {
    constructor() {
        super();

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