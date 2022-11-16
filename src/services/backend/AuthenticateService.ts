import Moralis from "moralis";
import NetworkInfo from "../../networks/NetworkInfo";
import GeneralError from "../../errors/GeneralError";
import SwitchNetworkModal from "../../ui/modals/SwitchNetworkModal";
import MagicWeb3Connector from "../../wallet/MagicWeb3Connector";
import ProviderInfo from "../../wallet/ProviderInfo";
import MoralisWeb3Provider = Moralis.MoralisWeb3Provider;


export default class AuthenticateService {
    moralis: typeof Moralis

    public constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public static async enableWeb3(moralis: typeof Moralis) {
        if (moralis.isWeb3Enabled()) {
            return moralis.provider as MoralisWeb3Provider;
        }

        let options = {connector: MagicWeb3Connector} as any;
        let result = await moralis.enableWeb3(options);

        return result;
    }

    public async authenticateUser(enableWeb3Callback?: (walletConnectionInfo: any) => void,
                                  authenticatedCallback?: (user: Moralis.User) => void
    ) {
        let chainId = NetworkInfo.getInstance().ChainId;
        let web3Provider = await AuthenticateService.enableWeb3(this.moralis);
        if (enableWeb3Callback) {
            enableWeb3Callback(web3Provider);
        }

        let user = this.moralis.User.current();
        if (user) {
            if (authenticatedCallback) authenticatedCallback(user);
            return;
        }

        if (web3Provider.network.chainId != chainId) {
            let userNetwork = NetworkInfo.getNetworkInfoByChainId(web3Provider.network.chainId);
            if (userNetwork) {
                NetworkInfo.setNetworkByChainId(web3Provider.network.chainId);
            } else {
                let modal = new SwitchNetworkModal(this.moralis);
                modal.show();
                return;
            }
        }

        let obj: any = {signingMessage: "You are logging into Liminal.market.\n\n", connector: MagicWeb3Connector};
        user = await this.moralis.authenticate(obj)
            .then(result => {
                console.log(result);
                return result;
            })
            .catch((reason: any) => {
                console.log(reason);
                throw new GeneralError(reason);
            });

        if (authenticatedCallback) {
            authenticatedCallback(user);
        } else {
            location.reload();
        }
    }

    public getUser() {
        return this.moralis.User.current();
    }

    public getEthAddress(): string {
        let user = this.getUser();
        if (!user) return '';

        let ethAddress = user.get('ethAddress');
        return ethAddress;
    }

    public isWalletConnected() {
        return this.moralis.isWeb3Enabled();
    }

    public isUserLoggedIn() {
        return (this.moralis.User.current() !== null);
    }

    public getChainId(): number {
        if (!this.moralis.chainId) return 0;

        return parseInt(this.moralis.chainId, 16);
    }

}