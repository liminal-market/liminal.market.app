import ContractInfo from "../../contracts/ContractInfo";
import ErrorInfo from "../../errors/ErrorInfo";

export default class KYCService {
    moralis : typeof  Moralis;
    private static KYCInfo : any;
    private static IsValidKYC : boolean = false;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async getKYCAbi() {
        if (KYCService.KYCInfo) return KYCService.KYCInfo.abi;

        const response = await fetch("../abi/KYC.json");
        KYCService.KYCInfo = await response.json();
        return KYCService.KYCInfo.abi;

    }

    public async hasValidKYC(ethAddress : string) : Promise<boolean> {
        if (KYCService.IsValidKYC) return KYCService.IsValidKYC;

        let kycOptions = await this.getKYCIsValidOptions(ethAddress);
        let isValid = await this.moralis.executeFunction(kycOptions).then(async (result) => {
            if (!this.isValidAccountId(result.toString())) return false;
            KYCService.IsValidKYC = true;

            let user = this.moralis.User.current();
            if (!user) return false;

            if (!user.get('alpacaId')) {
                await user.save({alpacaId : result.toString()});
                await user.fetch();
            }
            return true;

        }).catch(reason => {
            ErrorInfo.report(reason)
            return false;
        });
        return isValid;
    }

    public async saveKYCInfo(data : any) {
        let user = this.moralis.User.current();
        if (!user) return;

        let alpacaId = await this.moralis.Cloud.run("kycRegistration", data);
        user.set('alpacaId', alpacaId);
        user.save();
    }

    public async getKYCIsValidOptions(ethAddress : string) : Promise<any> {
        let contractInfo = ContractInfo.getContractInfo();
        let abi = await this.getKYCAbi();

        return {
            contractAddress: contractInfo.KYC_ADDRESS,
            functionName: "isValid",
            abi: abi,
            params: {
                userAddress: ethAddress
            }
        };
    }

    public isValidAccountId(str : string) {
        const regex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$');
        return regex.test(str);
    }

}