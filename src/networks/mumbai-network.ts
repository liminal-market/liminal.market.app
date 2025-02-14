import Network from './Network';
import TestNetwork from "./TestNetwork";

export default class mumbaiNetwork extends TestNetwork {
    constructor() {
        super();

        this.ChainId = 80001;
        this.Name = "mumbai";
        this.ChainName = 'Polygon Mumbai';
        this.NativeCurrencyName = "Matic";
        this.NativeSymbol = "MATIC";
        this.NativeDecimal = 18;
        this.RpcUrl = 'https://polygon-mumbai.g.alchemy.com/v2/FILTBk8FT9RzcRVxkMXIg7Ipl8JCNdK2';
        this.BlockExplorer = 'https://mumbai.polygonscan.com/';
        this.FaucetUrl = 'https://faucet.polygon.technology/';
        this.BuyUrl = 'https://www.moonpay.com/buy/matic';
    }


}

