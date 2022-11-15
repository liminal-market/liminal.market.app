import AuthenticateService from "../services/backend/AuthenticateService";

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
    BuyUrl ='';

    constructor() {
    }

    public async addNetworkToWallet(moralis : typeof Moralis) {
        const web3 = await AuthenticateService.enableWeb3(moralis);
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

    public async hasEnoughNativeTokens(moralis : typeof Moralis) : Promise<boolean> {
        //TODO: remove later, Moralis doesnt support getNativeBalance on localhost so it's always true
        if (this.Name == 'localhost') {
            return true;
        } else {
            const options: any = {chain: '0x' + this.ChainId.toString(16)};
            const result = await moralis.Web3API.account.getNativeBalance(options);

            const balance = parseFloat(Moralis.Units.FromWei(result.balance, 18));
            if (balance < 0.005) {
                return false;
            }
        }

        return true;
    };
}

