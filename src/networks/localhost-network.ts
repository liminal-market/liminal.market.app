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
        this.RpcUrl = 'https://rinkeby.infura.io/';
        this.BlockExplorer = 'https://rinkeby.etherscan.io';

	}



}

