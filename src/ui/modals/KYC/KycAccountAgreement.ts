import KycHelper from "./KycHelper";
import KYCForm from "../KYCForm";
import KycAccountAgreementHtml from "../../../html/modal/Kyc/KycAccountAgreement.html";
import LoadingHelper from "../../../util/LoadingHelper";
import Progress from "../../elements/Progress";
import {serialize} from "../../../util/Helper";
import NetworkInfo from "../../../networks/NetworkInfo";
import KYCService from "../../../services/blockchain/KYCService";
import CloudError from "../../../errors/CloudError";

export default class KycAccountAgreement extends KycHelper {

    kycForm: KYCForm;

    constructor(kycForm: KYCForm) {
        super();
        this.kycForm = kycForm;
    }

    public render() {
        let template = Handlebars.compile(KycAccountAgreementHtml);
        return template({});
    }

    public bindEvents() {

        let submitKYC = document.getElementById('submitKYC');
        if (!submitKYC) return;

        submitKYC.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let submitBtn = (evt.target as HTMLElement);
            LoadingHelper.setLoading(submitBtn);

            let progress = new Progress();
            progress.show('Register KYC with broker', 33, false, ['submitKYC']);

            const form = document.getElementById('kyc_wizard_form') as HTMLFormElement;
            let data = new FormData(form);
            let params = serialize(data);

            let networkInfo = NetworkInfo.getInstance();
            params.chainId = networkInfo.ChainId;

            let kycService = new KYCService(Moralis);
            let result = await kycService.saveKYCInfo(params)
                .catch((reason: any) => {
                    let cloudError = new CloudError(reason);
                    LoadingHelper.removeLoading();
                });

            if (result) {
                await this.showWaiting();
            }

        })
    }


    private async showWaiting() {
        let kyc_reg = document.getElementById('kyc_reg');
        if (!kyc_reg) return;
        let waiting_for_kyc_reg = document.getElementById('waiting_for_kyc_reg');
        if (!waiting_for_kyc_reg) return;

        kyc_reg.classList.add('d-none');
        waiting_for_kyc_reg.classList.remove('d-none');

        await this.checkKycStatus();

    }


    public async checkKycStatus() {
        let kycService = new KYCService(Moralis);
        let isValid = await kycService.hasValidKYC()

        if (isValid) {
            clearTimeout();
            this.kycForm.modal.hideModal();
            this.kycForm.onHide();
        } else {
            this.kycForm.timeout = setTimeout(() => {
                this.checkKycStatus()
            }, 5 * 1000)
        }
    }

}