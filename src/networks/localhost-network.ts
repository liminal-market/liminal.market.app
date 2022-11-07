import Network from './Network';
import TestNetwork from "./TestNetwork";
//localhost
export default class localhostNetwork extends TestNetwork {
    constructor() {
        super();

        this.ChainId = 31337;
        this.Name = "localhost";
        this.ChainName = 'localhost test';
        this.NativeCurrencyName = "Ethereum";
        this.NativeSymbol = "ETH";
        this.NativeDecimal = 18;
        this.RpcUrl = 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
		this.BlockExplorer = 'https://rinkeby.etherscan.io';

	}



}

