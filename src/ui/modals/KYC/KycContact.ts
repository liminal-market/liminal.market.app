import KycContactHtml from '../../../html/modal/Kyc/KycContact.html';
import KycHelper from "./KycHelper";
import KYCForm from "../KYCForm";
import CountryHelper from "../../../util/CountryHelper";


export default class KycContact extends KycHelper {

    kycForm: KYCForm;
    usTaxResidence = false;

    constructor(kycForm: KYCForm) {
        super();

        this.kycForm = kycForm;
    }

    public render() {
        let template = Handlebars.compile(KycContactHtml);

        return template({countries: CountryHelper.Countries});
    }

    public show() {
        document.querySelector('.kycContact')!.classList.remove('hidden');
    }

    public bindEvents() {
        this.bind('#country_of_tax_residence', 'change', (evt) => {
            let input = evt.target as HTMLInputElement;
            this.usTaxResidence = (input.value.toUpperCase() == 'USA');

            if (this.usTaxResidence) {
                this.setRequired('state')
            } else {
                this.removeRequired('state');
            }
        });

        let showIdentityButtons = document.querySelectorAll('.showIdentity');
        for (let i = 0; i < showIdentityButtons.length; i++) {
            showIdentityButtons[i].addEventListener('click', (evt) => {
                if (!this.validateRequiredFields('.kycContact')) return;

                this.hideFieldsets();
                this.kycForm.kycIdentity.show();
            })
        }

    }
}