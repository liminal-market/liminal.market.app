import ErrorInfo from "../../errors/ErrorInfo";
import BlockchainError from "../../errors/BlockchainError";
import GeneralError from "../../errors/GeneralError";
import KycStatus from "../../dto/KycStatus";
import AUsdBalance from "../../ui/elements/AUsdBalance";
import BlockchainService from "./BlockchainService";

export default class KYCService extends BlockchainService {
    private static KYCInfo: any;
    private static KycResponse: KycStatus;

    constructor(moralis: typeof Moralis) {
        super(moralis)
    }

    public async getKYCAbi() {
        if (KYCService.KYCInfo) return KYCService.KYCInfo.abi;

        const response = await fetch("../abi/KYC.json");
        KYCService.KYCInfo = await response.json();
        return KYCService.KYCInfo.abi;

    }

    public async hasValidKYC(): Promise<KycStatus> {
        if (KYCService.KycResponse && KYCService.KycResponse.isValidKyc) return KYCService.KycResponse;

        KYCService.KycResponse = await this.moralis.Cloud.run('isValidKyc', {chainId: this.moralis.chainId})
            .catch(reason => {
                let blockchainError = new BlockchainError(reason);
                if (blockchainError.addressIsNotValidKYC()) {
                    return false;
                }
                ErrorInfo.report(blockchainError)
                return false;
            }) as KycStatus;

        if (KYCService.KycResponse.alpacaId) {
            let user = this.moralis.User.current();
            user?.set('alpacaId', KYCService.KycResponse.alpacaId);

            let aUsdBalance = new AUsdBalance(this.moralis, user!);
            await aUsdBalance.loadAUSDBalanceUI();
        }
        return KYCService.KycResponse;
    }

    public async saveKYCInfo(data: any): Promise<string> {
        let user = this.moralis.User.current();
        if (!user) throw new GeneralError("You need to be logged in to do KYC. Please login again.")

        return await this.moralis.Cloud.run("kycRegistration", data);
    }

    public async updateKYCInfo(data: any): Promise<string> {
        let user = this.moralis.User.current();
        if (!user) throw new GeneralError("You need to be logged in to do KYC. Please login again.")

        return await this.moralis.Cloud.run("updateAccount", data);
    }

    public isValidAccountId(str: string) {
        const regex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$');
        return regex.test(str);
    }

    async updateDocuments(params: any) {
        let user = this.moralis.User.current();
        if (!user) throw new GeneralError("You need to be logged in to do KYC. Please login again.")

        return await this.moralis.Cloud.run("kycActionRequiredUpdate", params);
    }
}