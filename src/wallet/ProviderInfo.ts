import {WalletType} from "../enums/WalletType";
import NetworkInfo from "../networks/NetworkInfo";

export default class ProviderInfo {

    web3Provider: any;

    ProviderName: string = 'unknown';
    WalletName: string = '';
    WalletUrl: string = '';
    WalletType: WalletType = WalletType.Unknown;
    UserAddress: string = '';
    InternalWallet: boolean = false;

    static Instance: ProviderInfo;

    constructor(web3Provider: any) {
        if (!web3Provider || !web3Provider.provider) return;

        this.web3Provider = web3Provider;

        if (this.web3Provider.connection && this.web3Provider.connection.url == 'metamask') {
            this.loadMetamask(web3Provider);
        } else if (this.web3Provider.provider.wc) {
            this.loadWalletConnect(web3Provider);
        } else if (this.web3Provider.provider.isMagic) {
            this.loadMagicConnect(web3Provider);
        } else {
            this.loadCustom(web3Provider);
        }
        ProviderInfo.Instance = this;

    }


    private loadMetamask(walletConnectionInfo : any) {
        this.ProviderName = 'metamask';
        this.WalletName = "Metamask";
        this.WalletUrl = 'https://metamask.io/';
        this.WalletType = WalletType.Metamask;
        this.UserAddress = walletConnectionInfo.provider.selectedAddress;
    }

    private loadWalletConnect(walletConnectionInfo: any) {
        let wc = walletConnectionInfo.provider.wc;

        this.ProviderName = "walletConnect";
        this.WalletName = wc._peerMeta.name;
        this.WalletUrl = wc._peerMeta.url ?? '';
        this.WalletType = WalletType.WalletConnect;
    }

    private loadCustom(provider: any) {
        this.ProviderName = 'web3auth';
        this.WalletName = 'Torus';
        this.WalletUrl = 'https://app.tor.us/';
        this.WalletType = WalletType.Web3Auth;
    }

    private loadMagicConnect(walletConnectionInfo: any) {
        this.ProviderName = 'MagicLink';
        this.WalletName = 'MagicLink'
        this.WalletType = WalletType.MagicLink;
        this.InternalWallet = true;
    }
}