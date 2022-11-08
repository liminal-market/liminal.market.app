import NetworkInfo from "../../networks/NetworkInfo";
import MarketService from "../broker/MarketService";
import CookieHelper from "../../util/CookieHelper";
import AuthenticateService from "./AuthenticateService";
import ProviderInfo from "../../wallet/ProviderInfo";
import WalletHelper from "../../util/WalletHelper";
import ErrorInfo from "../../errors/ErrorInfo";
import KycResult from "../../dto/KycResult";
import {BankRelationship} from "../../dto/alpaca/BankRelationship";
import {Transfer} from "../../dto/alpaca/Transfer";
import {TransferDirectionEnum} from "../../enums/TransferDirectionEnum";
import Modal from "../../ui/modals/Modal";


export default class UserService {
    moralis: typeof Moralis;

    constructor(moralis?: typeof Moralis) {
        if (!moralis) moralis = Moralis

        this.moralis = moralis;
    }

    public logOut() {
        return this.moralis.User.logOut();
    }

    public async isLoggedIn(loadingMessage: HTMLElement) {
        let user = await this.moralis.User.currentAsync();

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

                let result = await this.moralis.enableWeb3({
                    provider: providerName as any,
                    appLogo: 'https://app.liminal.market/img/logos/default_logo.png'
                })
                    .catch(async reason => {

                        let html = 'Moralis.isWeb3Enabled():' + Moralis.isWeb3Enabled();
                        // @ts-ignore
                        html += '<br />Moralis.isEnablingWeb3():' + Moralis.isEnablingWeb3;
                        // @ts-ignore
                        html += '<br />Moralis.ensureWeb3IsInstalled():' + Moralis.ensureWeb3IsInstalled();
                        html += '<br />Moralis.isMetaMaskInstalled():' + await Moralis.isMetaMaskInstalled();
                        html += '<br />ethereum:' + typeof ethereum != 'undefined';
                        if (ethereum) {
                            html += '<br />ethereum.chainId:' + ethereum.chainId
                        }
                        let modal = new Modal();
                        modal.showModal('', html);
                        //ErrorInfo.report(reason);
                    });
                if (!result) return;
            }

            let providerInfo: ProviderInfo = new ProviderInfo(null);
            let authenticationService = new AuthenticateService(this.moralis);
            await authenticationService.authenticateUser(providerName, (walletConnectionInfo) => {
                providerInfo = new ProviderInfo(walletConnectionInfo);
            });
            (user as any).providerInfo = providerInfo;

            return user;
        }

        return undefined;
    }


    public async isMarketOpenOrUserOffHours(): Promise<boolean> {
        let marketService = new MarketService(this.moralis);
        let isOpen = await marketService.isMarketOpen();
        if (isOpen) return true;

        let networkInfo = NetworkInfo.getInstance();
        //TODO: Remove on mainnet launch
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

    getEthAddress(): string | undefined {
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

    public async createAchRelationship(public_token: string, accountId: string) {
        return await this.moralis.Cloud.run('createAchRelationship', {
            public_token: public_token,
            account_id: accountId
        });
    }

    async getPlaidLinkToken() {
        return await this.moralis.Cloud.run('createPlaidLinkToken')
    }

    public async getBankRelationship(): Promise<BankRelationship> {
        return await this.moralis.Cloud.run('getBankRelationship') as BankRelationship
    }

    public async getLatestTransfers(direction: TransferDirectionEnum) {
        return await this.moralis.Cloud.run('getTransfers', {direction: direction}) as Transfer[];
    }

    public async createTransfer(amount: string, direction: string) {
        return await this.moralis.Cloud.run('createTransfer',
            {amount: amount, direction: direction})
    }

    async deleteTransfer(id: string) {
        return await this.moralis.Cloud.run('deleteTransfer', {id: id});
    }

    public async registerWireTransferRelationship(params: any) {
        return await this.moralis.Cloud.run('createWireRelationship', params);
    }
}