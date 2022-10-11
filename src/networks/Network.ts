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
        if (window.location.host.indexOf('localhost') != -1) {
            this.ServerUrl = "https://dqet8dfymvzj.usemoralis.com:2053/server";
            this.AppId = "TXR6YesK99VgRCxSecnySRMp1KI5rLnCfIetQuuU";
        } else {
            this.ServerUrl = "https://f8t1vrrwtboa.usemoralis.com:2053/server";
            this.AppId = "XZhp3wQobrKiCib0Bf4FPVKAUhbHM9SvTLKOKvBb";
        }
    }

	public async addNetworkToWallet(moralis : typeof Moralis) {
		const web3 = await moralis.enableWeb3();
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
		}).catch((error) => {
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

