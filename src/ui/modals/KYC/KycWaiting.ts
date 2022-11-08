import KycBase from "./KycBase";
import KYCForm from "../KYCForm";
import KYCService from "../../../services/blockchain/KYCService";

export default class KycWaiting extends KycBase {

    constructor(kycForm: KYCForm) {
        super(kycForm);
    }

    public show() {
        document.getElementById('kyc_reg')?.classList.add('hidden')
        document.getElementById('waiting_for_kyc_reg')?.classList.remove('hidden');
        document.querySelector('#liminal_market_modal_div > article > header > span')!.innerHTML = 'Waiting for KYC to be approved'
        this.kycForm.timeout = setTimeout(async () => {
            await this.checkKycStatus()
        }, 5 * 1000)
    }

    public async checkKycStatus() {
        let kycService = new KYCService(Moralis);
        let kycResponse = await kycService.hasValidKYC()

        if (kycResponse.isValidKyc || kycResponse.status == "ACTION_REQUIRED") {
            clearTimeout(this.kycForm.timeout);

            this.kycForm.modal.hideModal();
        } else {
            this.kycForm.timeout = setTimeout(() => {
                this.checkKycStatus()
            }, 5 * 1000)

        }
    }

}