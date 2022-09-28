import KycHelper from "./KycHelper";
import KYCForm from "../KYCForm";
import KycTrustedContactHtml from '../../../html/modal/Kyc/KycTrustedContact.html';


export default class KycTrustedContact extends KycHelper {

    kycForm: KYCForm;

    constructor(kycForm: KYCForm) {
        super();
        this.kycForm = kycForm;
    }

    public render() {
        let template = Handlebars.compile(KycTrustedContactHtml);
        return template({});
    }

    public bindEvents() {
        let showAgreementsButtons = document.querySelectorAll('.showAgreements');
        for (let i = 0; i < showAgreementsButtons.length; i++) {
            showAgreementsButtons[i].addEventListener('click', (evt) => {
                this.hideFieldsets();
                document.querySelector('.kycAccountAgreement')!.classList.remove('hidden')
            })
        }
    }

}