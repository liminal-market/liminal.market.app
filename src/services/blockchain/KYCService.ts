import ErrorInfo from "../../errors/ErrorInfo";
import BlockchainError from "../../errors/BlockchainError";
import GeneralError from "../../errors/GeneralError";
import KycStatus from "../../dto/KycStatus";
import AUsdBalance from "../../ui/elements/AUsdBalance";
import BlockchainService from "./BlockchainService";
import UserService from "../backend/UserService";
import App from "../../main";

export default class KYCService extends BlockchainService {
    private static KYCInfo: any;
    private static KycResponse: KycStatus;

    constructor() {
        super()
    }

    public async getKYCAbi() {
        if (KYCService.KYCInfo) return KYCService.KYCInfo.abi;

        const response = await fetch("../abi/KYC.json");
        KYCService.KYCInfo = await response.json();
        return KYCService.KYCInfo.abi;

    }

    public async hasValidKYC(): Promise<KycStatus> {
        if (KYCService.KycResponse && KYCService.KycResponse.isValidKyc) return KYCService.KycResponse;

        KYCService.KycResponse = await this.get('isValidKyc')
            .catch(reason => {
                let blockchainError = new BlockchainError(reason);
                if (blockchainError.addressIsNotValidKYC()) {
                    return false;
                }
                ErrorInfo.report(blockchainError)
                return false;
            }) as KycStatus;

        if (KYCService.KycResponse.alpacaId) {
            App.User.alpacaId = KYCService.KycResponse.alpacaId;

            let aUsdBalance = new AUsdBalance();
            await aUsdBalance.loadAUSDBalanceUI();
        }
        return KYCService.KycResponse;
    }

    public async sandboxCreateAccount(firstName: string, lastName: string, email: string) {
        return await this.post("sandboxCreateAccount", {
            given_name: firstName,
            family_name: lastName,
            email_address: email
        });
    }

    public async saveKYCInfo(data: any): Promise<string> {
        return await this.post("kycRegistration", data);
    }

    public async updateKYCInfo(data: any): Promise<string> {
        return await this.post("updateAccount", data);
    }

    public isValidAccountId(str: string) {
        const regex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$');
        return regex.test(str);
    }

    async updateDocuments(params: any) {
        return await this.post("kycActionRequiredUpdate", params);
    }
}