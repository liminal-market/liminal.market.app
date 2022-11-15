import NetworkInfo from "../../networks/NetworkInfo";
import MarketService from "../broker/MarketService";
import AuthenticateService from "./AuthenticateService";
import ProviderInfo from "../../wallet/ProviderInfo";
import KycResult from "../../dto/KycResult";
import {BankRelationship} from "../../dto/alpaca/BankRelationship";
import {Transfer} from "../../dto/alpaca/Transfer";
import {TransferDirectionEnum} from "../../enums/TransferDirectionEnum";


export default class UserService {
    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async logOut() {
        try {
            await this.moralis.connector.magicUser.connect.disconnect();
        } catch (e: any) {
            console.error('logout magicUser', e);
        }
        try {
            return await this.moralis.User.logOut();
        } catch (e: any) {
            console.error('logout moralisUser', e);
        }
    }

    public async isLoggedIn() {
        let user = await this.moralis.User.currentAsync();
        console.log('user', user);
        if (!user) {
            return;
        }

        if (!this.moralis.isWeb3Enabled()) {
            let result = await AuthenticateService.enableWeb3(this.moralis)
                .catch(reason => {
                    this.logOut();
                })

            if (!result) return;
        }

        let authenticationService = new AuthenticateService(this.moralis);
        await authenticationService.authenticateUser((web3Provider) => {
            (user as any).providerInfo = new ProviderInfo(web3Provider)
        }, (loggedInUser) => {
            user = loggedInUser;
        });

        return user;

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

    public async createAchRelationship(account_owner_name: string, bank_account_type: string, bank_account_number: string, bank_routing_number: string) {
        return await this.moralis.Cloud.run('createAchRelationship', {
            account_owner_name, bank_account_type, bank_account_number, bank_routing_number
        });
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