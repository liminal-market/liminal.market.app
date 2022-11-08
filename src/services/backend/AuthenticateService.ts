import Moralis from "moralis";
import NetworkInfo from "../../networks/NetworkInfo";
import GeneralError from "../../errors/GeneralError";
import SwitchNetworkModal from "../../ui/modals/SwitchNetworkModal";
import MoralisWeb3Provider = Moralis.MoralisWeb3Provider;

export default class AuthenticateService {
    moralis: typeof Moralis

    public constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async authenticateUser(provider: any,
                                  enableWeb3Callback?: (walletConnectionInfo: MoralisWeb3Provider) => void,
                                  authenticatedCallback?: (user: Moralis.Attributes) => void
    ) {
        let moralis = this.moralis;
        let chainId = NetworkInfo.getInstance().ChainId;

        let web3Result = await moralis.enableWeb3({
            provider: provider,
            chainId: chainId, appLogo: 'https://app.liminal.market/img/logos/default_logo.png'
        })
            .catch(async (reason) => {
                throw new GeneralError(reason);
            });

        if (enableWeb3Callback) {
            enableWeb3Callback(web3Result);
        }

        let user = this.moralis.User.current();
        if (user) {
            if (authenticatedCallback) authenticatedCallback(user);
            return;
        }

        if (web3Result.network.chainId != chainId) {
            let userNetwork = NetworkInfo.getNetworkInfoByChainId(web3Result.network.chainId);
            if (userNetwork) {
                NetworkInfo.setNetworkByChainId(web3Result.network.chainId)
            } else {
                let modal = new SwitchNetworkModal(this.moralis);
                modal.show();
                return;
            }
        }

        let result = await moralis.authenticate({
            signingMessage: "You are logging into Liminal.market.\n\n",
            provider: provider,
            chainId: chainId
        }).catch((reason: any) => {
            console.log(reason);
            throw new GeneralError(reason);
        });

        if (authenticatedCallback) {
            authenticatedCallback(result);
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