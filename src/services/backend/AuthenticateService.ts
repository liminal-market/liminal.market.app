import ErrorInfo from "../../errors/ErrorInfo";
import WalletConnectError from "../../errors/WalletConnectError";

export default class AuthenticateService {
    moralis : typeof Moralis

    public constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async authenticateUser(provider : Moralis.Web3ProviderType) : Promise<Moralis.User | ErrorInfo> {
        let moralis = this.moralis;
        await moralis.enableWeb3({provider:provider}).then(async function(provider) {

            await moralis.authenticate({
                signingMessage: "You are logging into Liminal.market.\n\n"
            }).then(function(user) {
                return user;
            }).catch(function(reason) {
                return new WalletConnectError(reason);
            });

        }).catch(function(reason) {


            return new WalletConnectError(reason);
        })
        return new ErrorInfo("hello");

    }

    public getUser() {
        return this.moralis.User.current();
    }

    public getEthAddress() : string {
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

    public getChainId() {
        return this.moralis.chainId;
    }

}