import Network from './Network';

export default class rinkebyNetwork extends Network {
	constructor() {
super();
		this.ServerUrl = "https://rucsd2xip9xc.usemoralis.com:2053/server";
		this.AppId = "WrszROWRp7oShP39MWHMLl4mMA6n2QMN8LDRD6gi";
		this.ChainId = 4;
		this.Name = "rinkeby";
		this.ChainName = 'Rinkeby test';
		this.NativeCurrencyName = "Ethereum";
		this.NativeSymbol = "ETH";
		this.NativeDecimal = 18;
		this.RpcUrl = 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
		this.BlockExplorer = 'https://rinkeby.etherscan.io';
	}
}