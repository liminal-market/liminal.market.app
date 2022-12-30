import AuthenticateService from "../services/backend/AuthenticateService";
import BlockchainService from "../services/blockchain/BlockchainService";
import {ethers} from "ethers";

export default class Network {
    ServerUrl = "";
    AppId = "";
    ChainId = 0;
    Name = "";
    ChainName = '';
    NativeCurrencyName = "";
    NativeSymbol = "";
    NativeDecimal = 18;
    RpcUrl = '';
    BlockExplorer = '';
    TestNetwork = true;
    FaucetUrl = '';
    BuyUrl = '';

    constructor() {
    }

    public get ChainIdHex() {
        return '0x' + this.ChainId.toString(16)
    }

    public async addNetworkToWallet() {
        const web3 = await AuthenticateService.enableWeb3();
        if (!web3 || !web3.provider.request) return;

        web3.provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x' + this.ChainId.toString(16),
                chainName: this.ChainName,
                nativeCurrency: {
                    name: this.NativeCurrencyName,
                    symbol: this.NativeSymbol,
                    decimals: this.NativeDecimal
                },
                rpcUrls: [this.RpcUrl],
                blockExplorerUrls: [this.BlockExplorer]
            }]
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public async hasEnoughNativeTokens(): Promise<boolean> {
        let blockchainService = new BlockchainService();
        let balanceNative = await blockchainService.getNativeBalance();

        const balance = parseFloat(balanceNative);
        if (balance < 0.005) {
            return false;
        }
        return true;

    };

}

