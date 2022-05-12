import SecuritiesService from "../services/broker/SecuritiesService";
import LoadingHelper from "./LoadingHelper";
import ErrorInfo from "../errors/ErrorInfo";
import GeneralError from "../errors/GeneralError";
import Network from "../networks/Network";
import * as net from "net";

export default class WalletHelper {
    static addTokenFallbackLoaded?: boolean = undefined;
    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public getAUsdAsset() {
        return {
            Logo: '../ausd.png'
        };
    }

    public async addTokenToWallet(address: string, symbol: string, fallbackTimeout: () => void) {
        let securitiesService = await SecuritiesService.getInstance();

        const asset = (symbol == 'aUSD') ? this.getAUsdAsset() : await securitiesService.getSecurityBySymbol(symbol);
        let web3 = this.moralis.web3 as any;
        if (!web3) {
            web3 = await this.moralis.enableWeb3().catch(reason => {
                ErrorInfo.report(reason);
            }) as any;
            if (!web3) {
                return;
            }
        }
        if (!web3.provider.request) return;
        let timeout = (WalletHelper.addTokenFallbackLoaded === undefined) ? 2 * 1000 : 200;
        setTimeout(() => {
            if (WalletHelper.addTokenFallbackLoaded !== false) {
                WalletHelper.addTokenFallbackLoaded = true;
                if (fallbackTimeout) fallbackTimeout();
            }

        }, timeout);

        const wasAdded = await web3.provider.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: address,
                    symbol: symbol,
                    decimals: 18,
                    image: 'https://app.liminal.market/img/logos/' + asset.Logo,
                },
            },
        }).then((result: any) => {
            return true;
        }).catch((error: any) => {
            LoadingHelper.removeLoading();
            return false;
        }).finally(() => {
            WalletHelper.addTokenFallbackLoaded = false;
        });

        return wasAdded;
    };

    public isWebview(ua: string): boolean {
        // if it says it's a webview, let's go with that
        let rules = ['WebView',
            // iOS webview will be the same as safari but missing "Safari"
            '(iPhone|iPod|iPad)(?!.*Safari)',
            // Android Lollipop and Above: webview will be the same as native but it will contain "wv"
            // Android KitKat to lollipop webview will put {version}.0.0.0
            'Android.*(wv|.0.0.0)',
            // old chrome android webview agent
            'Linux; U; Android',
            'SDK'
        ]
        let webviewRegExp = new RegExp('(' + rules.join('|') + ')', 'ig');
        return !!ua.match(webviewRegExp)
    }

    public async switchNetwork(network: Network) : Promise<boolean> {
        let web3 = this.moralis.web3 as any;

        return await web3.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{chainId: '0x' + network.ChainId.toString(16)}]
        })
            .then((result: any) => {
                console.log('switch result:', result);
                return true;
            })
            .catch(async (err: any) => {
                // This error code indicates that the chain has not been added to MetaMask
                if (err.code === 4902) {
                    return await web3.provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainName: network.ChainName,
                                chainId: '0x' + network.ChainId.toString(16),
                                nativeCurrency: {
                                    name: network.NativeCurrencyName,
                                    decimals: network.NativeDecimal,
                                    symbol: network.NativeSymbol
                                },
                                rpcUrls: [network.RpcUrl]
                            }
                        ]
                    })
                        .then((result: any) => {
                            console.log('addChain result:' + result);
                            return true;
                        }).catch((error: any) => {
                            console.log('error on addNetwork:', error);
                            throw new GeneralError(error);
                        });
                } else {
                    throw new GeneralError(err);
                }

            });

    }
}