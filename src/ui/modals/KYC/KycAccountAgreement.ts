import KycBase from "./KycBase";
import KYCForm from "../KYCForm";
import KycAccountAgreementHtml from "../../../html/modal/Kyc/KycAccountAgreement.html";
import LoadingHelper from "../../../util/LoadingHelper";
import NetworkInfo from "../../../networks/NetworkInfo";
import KYCService from "../../../services/blockchain/KYCService";
import KycValidatorError from "../../../errors/cloud/KycValidatorError";
import FormHelper from "../../../util/FormHelper";
import ExecuteTradeButton from "../../elements/tradepanel/ExecuteTradeButton";
import FakeAUSDFund from "../Funding/FakeAUSDFund";

export default class KycAccountAgreement extends KycBase {


    constructor(kycForm: KYCForm) {
        super(kycForm)
    }

    public render(edit = false) {
        let template = Handlebars.compile(KycAccountAgreementHtml);
        return template({edit: edit});
    }

    public show() {
        this.showFieldset('.kycAccountAgreement', 'Agreements');

        if (this.kycForm.steps == 5) {
            document.getElementById('account_agreement_prev')!.innerText = 'Previous: Disclosure';
        } else {
            document.getElementById('account_agreement_prev')!.innerText = 'Previous: Upload documents';
        }
        if (this.kycForm.kycContact.usTaxResidence) {
            document.getElementById('w8disclosure_div')?.classList.add('hidden')
        } else {
            document.getElementById('w8disclosure_div')?.classList.remove('hidden')
        }
    }

    public bindEvents() {

        let account_agreement_prev = document.getElementById('account_agreement_prev')
        account_agreement_prev?.addEventListener('click', (evt) => {
            if (this.kycForm.steps == 5) {
                this.kycForm.kycDisclosures.show();
            } else {
                this.kycForm.kycUpload.show();
            }
        })

        this.bindSubmitKyc();
    }


    public bindSubmitKyc(edit = false) {
        let submitKYC = document.getElementById('submitKYC');
        if (!submitKYC) return;

        submitKYC.addEventListener('click', async (evt) => {
            evt.preventDefault();

            if (!edit && !this.validate()) return;

            let account_agreement_prev = document.getElementById('account_agreement_prev');
            //if (account_agreement_prev) account_agreement_prev.classList.add('hidden');

            let liminal_market_modal_close = document.getElementById('liminal_market_modal_close');
            // if (liminal_market_modal_close) liminal_market_modal_close.style.display = 'none';

            let submitBtn = (evt.target as HTMLElement);
            LoadingHelper.setLoading(submitBtn);

            let params = FormHelper.getParams('#kyc_wizard_form');

            let networkInfo = NetworkInfo.getInstance();
            params.chainId = networkInfo.ChainId;

            let kycService = new KYCService();
            let result = await kycService.saveKYCInfo(params)
                .catch((reason: any) => {
                    if (account_agreement_prev) account_agreement_prev.classList.remove('hidden');
                    LoadingHelper.removeLoading();

                    if (reason.message) {
                        let kycError = new KycValidatorError(JSON.parse(reason.message), this.kycForm);
                        kycError.handle();
                    } else {
                        console.log(reason);
                    }
                });

            if (result) {
                let ausdFund = new FakeAUSDFund();
                ausdFund.showAUSDFakeFund();
                ExecuteTradeButton.Instance.renderButton();
            } else {
                if (account_agreement_prev) account_agreement_prev.classList.remove('hidden');
                LoadingHelper.removeLoading();
            }

        })
    }

    private validate() {
        let account_agreement = document.getElementById('account_agreement') as HTMLInputElement;
        if (!account_agreement?.checked) {
            this.setMissingInfo('account_agreement_error', 'You need to agree to agreements', 'account_agreement')
            return false;
        } else {
            this.removeMissingInfo('account_agreement_error', 'account_agreement');
        }

        let customer_agreement = document.getElementById('customer_agreement') as HTMLInputElement;
        if (!customer_agreement?.checked) {
            this.setMissingInfo('customer_agreement_error', 'You need to agree to customer agrement', 'customer_agreement')
            return false;
        } else {
            this.removeMissingInfo('customer_agreement_error', 'customer_agreement');
        }
        let digital_signature = document.getElementById('digital_signature') as HTMLInputElement;
        if (!digital_signature?.checked) {
            this.setMissingInfo('digital_signature_error', 'You need to sign', 'digital_signature')
            return false;
        } else {
            this.removeMissingInfo('digital_signature_error', 'digital_signature');
        }
        return true;

    }

}