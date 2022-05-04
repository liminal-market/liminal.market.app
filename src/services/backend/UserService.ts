import NetworkInfo from "../../networks/NetworkInfo";
import MarketService from "../broker/MarketService";
import CookieHelper from "../../util/CookieHelper";
import AuthenticateService from "./AuthenticateService";
import ProviderInfo from "../../wallet/ProviderInfo";
import WalletHelper from "../../util/WalletHelper";


export default class UserService {
    moralis: typeof Moralis;

    constructor(moralis?: typeof Moralis) {
        if (!moralis) moralis = Moralis

        this.moralis = moralis;
    }

    async logIn() {
        try {

            let web3 = await this.moralis.enableWeb3();
            console.log('account', this.moralis.account)
            let user = this.moralis.User.current();
            if (user) return Promise.resolve(user);

            return this.moralis.authenticate();
        } catch (e) {
            console.log(e);
        }
    }

    public logOut() {
        return this.moralis.User.logOut();
    }

    public async isLoggedIn(loadingMessage : HTMLElement) {
        let user = this.moralis.User.current();
        if (user) {
            let cookieHelper = new CookieHelper(document);
            let providerName = cookieHelper.getCookieValue('provider');

            let walletHelper = new WalletHelper();
            if (walletHelper.isWebview(window.navigator.userAgent)) providerName = ' ';

            if (!providerName) {
                return undefined;
            }

            if (!this.moralis.isWeb3Enabled()) {
                loadingMessage.innerHTML = 'We are sending login request to your wallet. If you cancel we will simply log you out. You can always log again in.';

                let result = await this.moralis.enableWeb3({provider:providerName as any})
                    .catch(async reason => {
                        if (reason.message && reason.message.toLowerCase().indexOf('user rejected the request') != -1) {
                            await this.moralis.User.logOut();
                            //window.location.reload();
                            return false;
                        }
                        console.log('not login', providerName, reason);
                    });
                if (!result) return;
            }

            let providerInfo : ProviderInfo = new ProviderInfo(null);
            let authenticationService = new AuthenticateService(this.moralis);
            await authenticationService.authenticateUser(providerName, (walletConnectionInfo) => {
                providerInfo = new ProviderInfo(walletConnectionInfo);
            } );
            (user as any).providerInfo = providerInfo;

            return user;
        }

        return undefined;
    }

    public setOffHours(isOffHours: boolean): void {
        let user = this.moralis.User.current();
        if (!user) return;

        user.set('offHours', isOffHours); // do stuff with your user
        user.save();
    }

    public isOffHours() : boolean {
        let user = Moralis.User.current();
        if (!user) return false;

        return user.get('offHours') as boolean;
    }

    public async isMarketOpenOrUserOffHours() : Promise<boolean> {
        let marketService = new MarketService(this.moralis);
        let isOpen = await marketService.isMarketOpen();
        if (isOpen) return true;

        let networkInfo = NetworkInfo.getInstance();
        if (!networkInfo.TestNetwork) return false;

        let isOffHours = this.isOffHours();
        if (isOffHours) return true;

        return false;
    }
    public getUser() {
        return this.moralis.User.current();
    }
    public async getAlpacaId() : Promise<string> {
        let user = this.getUser();
        if (!user) return '';

        return (await user.fetch()).get('alpacaId').toString();
    }

    getEthAddress() {
        return this.getUser()?.get('ethAddress');
    }
}