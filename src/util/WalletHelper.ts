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

        const wasAdded = await connector.provider.request({
            method: 'wallet_watchAsset',
            params: [{
                type: 'ERC20',
                options: {
                    address: address,
                    symbol: symbol,
                    decimals: 18,
                    image: 'https://app.liminal.market/img/logos/' + asset.Logo,
                },
            }]
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

    public async isMagic() {
        const walletInfo = App.User.providerInfo
        const walletType = walletInfo.walletType;
        return (walletType === "magic");
    }

    public async switchNetwork(network: Network): Promise<boolean> {
        NetworkInfo.setNetworkByChainId(network.ChainId);
        return true;
    }

    static hideMagicWallet() {
        let magicIframe = document.querySelector('.magic-iframe') as HTMLElement;
        if (magicIframe && magicIframe.style.display == 'block') magicIframe.style.display = 'none'
    }
}