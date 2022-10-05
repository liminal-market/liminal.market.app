import NetworkInfo from "../../networks/NetworkInfo";
import MarketService from "../broker/MarketService";
import CookieHelper from "../../util/CookieHelper";
import AuthenticateService from "./AuthenticateService";
import ProviderInfo from "../../wallet/ProviderInfo";
import WalletHelper from "../../util/WalletHelper";
import ErrorInfo from "../../errors/ErrorInfo";
import KycResult from "../../dto/KycResult";


export default class UserService {
    moralis: typeof Moralis;

    constructor(moralis?: typeof Moralis) {
        if (!moralis) moralis = Moralis

        this.moralis = moralis;
    }

    async logIn() {
        try {

            await this.moralis.enableWeb3();

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

            let walletHelper = new WalletHelper(this.moralis);
            if (walletHelper.isWebview(window.navigator.userAgent)) providerName = ' ';

            if (!providerName) {
                return undefined;
            }

            if (!this.moralis.isWeb3Enabled()) {
                let str = 'We are sending login request to your wallet. If you cancel we will simply log you out. You can always log again in.';
                str += '<button id="logoutButton">Logout</button>'
                loadingMessage.innerHTML = str;

                let logoutButton = document.getElementById('logoutButton');
                if (logoutButton) {
                    logoutButton.addEventListener('click', () => {
                        this.moralis.User.logOut();
                    })
                }

                let result = await this.moralis.enableWeb3({provider:providerName as any})
                    .catch(async reason => {
                        ErrorInfo.report(reason);
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


    public async isMarketOpenOrUserOffHours() : Promise<boolean> {
        let marketService = new MarketService(this.moralis);
        let isOpen = await marketService.isMarketOpen();
        if (isOpen) return true;

        let networkInfo = NetworkInfo.getInstance();
        if (!networkInfo.TestNetwork) return false;

        return false;
    }

    public getUser() {
        return this.moralis.User.current();
    }

    public async getAlpacaId(): Promise<string> {
        let user = this.getUser();
        if (!user) return '';

        return (await user.fetch()).get('alpacaId').toString();
    }

    public async getAccount() {
        let user = this.getUser();
        if (!user) return;

        return await this.moralis.Cloud.run('account');
    }

    getEthAddress() {
        return this.getUser()?.get('ethAddress');
    }

    public async kycActionRequired(): Promise<KycResult> {
        let kycResults = await this.moralis.Cloud.run('kycActionRequired') as KycResult;
        return kycResults;
    }

    public async updateName(given_name: string, middle_name: string, family_name: string) {
        return await this.moralis.Cloud.run('updateName', {
            given_name: given_name,
            middle_name: middle_name,
            family_name: family_name
        })
    }

    public async updateContact(data: any) {
        return await this.moralis.Cloud.run('updateContact', data);
    }

    public async updateTrustedContact(data: any) {
        return await this.moralis.Cloud.run('updateTrustedContact', data);
    }
}