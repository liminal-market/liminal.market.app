import ErrorInfo from "../../errors/ErrorInfo";
import BlockchainError from "../../errors/BlockchainError";
import GeneralError from "../../errors/GeneralError";

export default class KYCService {
    moralis: typeof Moralis;
    private static KYCInfo: any;
    private static IsValidKYC: boolean = false;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async getKYCAbi() {
        if (KYCService.KYCInfo) return KYCService.KYCInfo.abi;

        const response = await fetch("../abi/KYC.json");
        KYCService.KYCInfo = await response.json();
        return KYCService.KYCInfo.abi;

    }

    public async hasValidKYC(): Promise<boolean> {
        if (KYCService.IsValidKYC) return KYCService.IsValidKYC;

        let alpacaId = await this.moralis.Cloud.run('isValidKyc', {chainId: this.moralis.chainId}).catch(reason => {
            let blockchainError = new BlockchainError(reason);
            if (blockchainError.addressIsNotValidKYC()) {
                return false;
            }
            ErrorInfo.report(blockchainError)
            return false;
        });

        if (alpacaId) {
            KYCService.IsValidKYC = true;

            let user = this.moralis.User.current();
            if (!user) return false;

            user.set('alpacaId', alpacaId);
        }

        return alpacaId;
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

}