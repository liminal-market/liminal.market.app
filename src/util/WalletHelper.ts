import SecuritiesService from "../services/broker/SecuritiesService";
import LoadingHelper from "./LoadingHelper";
import ErrorInfo from "../errors/ErrorInfo";

export default class WalletHelper {
    static addTokenFallbackLoaded?: boolean = undefined;

    public getAUsdAsset() {
        return {
            Logo: '../ausd.png'
        };
    }

    public async addTokenToWallet(moralis: typeof Moralis, address: string, symbol: string, fallbackTimeout: () => void) {
        let securitiesService = await SecuritiesService.getInstance();

        const asset = (symbol == 'aUSD') ? this.getAUsdAsset() : await securitiesService.getSecurityBySymbol(symbol);
        let web3 = moralis.web3 as any;
        if (!web3) {
            web3 = await moralis.enableWeb3().catch(reason => {
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
            console.log('addTokenToWallet result', result);
            return true;
        }).catch((error: any) => {
            LoadingHelper.removeLoading();
            return false;
        }).finally(() => {
            WalletHelper.addTokenFallbackLoaded = false;
        });

        console.log('addTokenToWallet wasAdded:', wasAdded);
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
}