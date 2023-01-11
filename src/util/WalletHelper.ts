import SecuritiesService from "../services/broker/SecuritiesService";
import LoadingHelper from "./LoadingHelper";
import GeneralError from "../errors/GeneralError";
import Network from "../networks/Network";
import AuthenticateService from "../services/backend/AuthenticateService";
import NetworkInfo from "../networks/NetworkInfo";
import ProviderInfo from "../wallet/ProviderInfo";
import {WalletType} from "../enums/WalletType";
import UserService from "../services/backend/UserService";
import App from "../main";

export default class WalletHelper {
    static addTokenFallbackLoaded?: boolean = undefined;


    constructor() {
    }

    public getAUsdAsset() {
        return {
            Logo: '../ausd.png'
        };
    }

    public async addTokenToWallet(address: string, symbol: string, fallbackTimeout: () => void) {
        let securitiesService = await SecuritiesService.getInstance();

        const asset = (symbol == 'aUSD') ? this.getAUsdAsset() : await securitiesService.getSecurityBySymbol(symbol);
        let connector = await AuthenticateService.enableWeb3();
        if (!connector || !connector.provider || !connector.provider.request) {
            fallbackTimeout();
            return;
        }
        let timeout = (WalletHelper.addTokenFallbackLoaded === undefined) ? 2 * 1000 : 200;
        setTimeout(() => {
            if (WalletHelper.addTokenFallbackLoaded !== false) {
                WalletHelper.addTokenFallbackLoaded = true;
                if (fallbackTimeout) fallbackTimeout();
            }

        }, timeout);

        // @ts-ignore
        let eth = (window.ethereum) ? window.ethereum : connector.provider;

        const wasAdded = await eth.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: address,
                    symbol: symbol,
                    decimals: 18,
                    image: 'https://app.liminal.market/img/logos/' + asset.Logo,
                },
            }
        }).then((result: any) => {
            WalletHelper.addTokenFallbackLoaded = false;
            return true;
        }).catch((error: any) => {
            console.log(error);
            return false;
        }).finally(() => {
            LoadingHelper.removeLoading();
        });

        return wasAdded;
    };

    public static isWebview(): boolean {
        let ua = navigator.userAgent;
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

    public async isMagic() {
        if (!App.User.magic || !App.User.magic.connect) return false;
        let walletInfo = await App.User.magic.connect.getWalletInfo();
        if (walletInfo) {
            return (walletInfo.walletType == 'magic');
        }
        return false;
    }

    public async switchNetwork(network: Network): Promise<boolean> {
        // @ts-ignore
        let eth = window.ethereum;

        if (!eth || await this.isMagic()) {
            NetworkInfo.setNetworkByChainId(network.ChainId);
            return true;
        }

        return await eth.request({
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
                    return await eth.request({
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

    static hideMagicWallet() {
        let magicIframe = document.querySelector('.magic-iframe') as HTMLElement;
        if (magicIframe && magicIframe.style.display == 'block') magicIframe.style.display = 'none'

        let liminal_market_connect_wallet = document.querySelectorAll('.liminal_market_connect_wallet')
        if (!liminal_market_connect_wallet) return;

        liminal_market_connect_wallet.forEach(item => {
            item.setAttribute('aria-busy', 'false')
        });
    }
}