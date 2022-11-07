import Network from './Network';
import MainNetwork from "./MainNetwork";

export default class polygonNetwork extends MainNetwork {
    constructor() {
        super();

        this.ChainId = 137;
        this.Name = "polygon";
        this.ChainName = 'Polygon Mainnet';
        this.NativeCurrencyName = "Matic";
        this.NativeSymbol = "MATIC";
        this.NativeDecimal = 18;
        this.RpcUrl = 'https://polygon-rpc.com/';
        this.BlockExplorer = 'https://polygonscan.com/';
        this.FaucetUrl = 'https://faucet.polygon.technology/';
        this.BuyUrl = 'https://www.moonpay.com/buy/matic';
    }


}

