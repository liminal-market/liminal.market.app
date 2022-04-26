import CookieHelper from "../util/CookieHelper";
import mumbaiNetwork from "./mumbai-network";

export default class Network {
	ServerUrl = "https://5bgiedfv59dd.usemoralis.com:2053/server";
	AppId = "bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79";
	ChainId = 80001;
	Name = "mumbai";
	ChainName = 'Polygon Mumbai';
	NativeCurrencyName = "Matic";
	NativeSymbol = "MATIC";
	NativeDecimal = 18;
	RpcUrl = 'https://matic-mumbai.chainstacklabs.com/';
	BlockExplorer = 'https://mumbai.polygonscan.com/';
	TestNetwork = true;

	constructor() {
	}

	setNetwork = (networkInfo: Network): void => {

		this.ServerUrl = networkInfo.ServerUrl;
		this.AppId = networkInfo.AppId;
		this.ChainId = networkInfo.ChainId;
		this.Name = networkInfo.Name;

		this.ChainName = networkInfo.ChainName;
		this.NativeCurrencyName = networkInfo.NativeCurrencyName;
		this.NativeSymbol = networkInfo.NativeSymbol;
		this.NativeDecimal = networkInfo.NativeDecimal;
		this.RpcUrl = networkInfo.RpcUrl;
		this.BlockExplorer = networkInfo.BlockExplorer;
		this.TestNetwork = networkInfo.TestNetwork;

		let cookieHelper = new CookieHelper(document);
		cookieHelper.setCookieNetwork(this.Name);
	}

	public async addNetworkToWallet(moralis : typeof Moralis) {
		const web3 = await moralis.enableWeb3();
		if (!web3 || !web3.provider.request) return;

		web3.provider.request({
			method: 'wallet_addEthereumChain',
			params: [{
				chainId: this.ChainId,
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
		const options : any = { chain: this.Name };
		const result = await moralis.Web3API.account.getNativeBalance(options);

		const balance = parseFloat(Moralis.Units.FromWei(result.balance, 18));
		if (balance < 0.005) {
			return false;
		}

		return true;
	};
}

