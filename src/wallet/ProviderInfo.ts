import {WalletType} from "../enums/WalletType";
import Moralis from "moralis";

export default class ProviderInfo {

    walletConnectionInfo : any;

    ProviderName : string = 'unknown';
    WalletName : string = '';
    WalletUrl : string = '';
    WalletType : WalletType = WalletType.Unknown;
    ChainId : number = 0;
    UserAddress : string = '';

    static Instance : ProviderInfo;

    constructor(walletConnectionInfo : any) {
        if (!walletConnectionInfo || !walletConnectionInfo.provider) return;

        this.walletConnectionInfo = walletConnectionInfo;

        if (this.walletConnectionInfo.connection && this.walletConnectionInfo.connection.url == 'metamask') {
            this.loadMetamask(walletConnectionInfo);
        } else if (this.walletConnectionInfo.provider.wc) {
            this.loadWalletConnect(walletConnectionInfo);
        } else {
            console.error('Dont have provider for this', walletConnectionInfo);
        }
        ProviderInfo.Instance = this;

    }


    private loadMetamask(walletConnectionInfo : any) {
        this.ProviderName = 'metamask';
        this.WalletName = "Metamask";
        this.WalletUrl = 'https://metamask.io/';
        this.WalletType = WalletType.Metamask;
        this.ChainId = walletConnectionInfo.provider.chainId;
        this.UserAddress = walletConnectionInfo.provider.selectedAddress;
    }

    private loadWalletConnect(walletConnectionInfo : any) {
        let wc = walletConnectionInfo.provider.wc;

        this.ProviderName = "walletConnect";
        this.WalletName = wc._peerMeta.name;
        this.WalletUrl = wc._peerMeta.url ?? '';
        this.WalletType = WalletType.WalletConnect;
        this.ChainId = walletConnectionInfo.provider.chainId;
    }
}