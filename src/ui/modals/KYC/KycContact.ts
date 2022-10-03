import KycContactHtml from '../../../html/modal/Kyc/KycContact.html';
import KycBase from "./KycBase";
import KYCForm from "../KYCForm";
import CountryHelper from "../../../util/CountryHelper";


export default class KycContact extends KycBase {

    usTaxResidence = false;

    constructor(kycForm: KYCForm) {
        super(kycForm);

    }

    public render() {
        let template = Handlebars.compile(KycContactHtml);

        return template({countries: CountryHelper.Countries});
    }

    public show() {
        this.showFieldset('.kycContact', 'Contact information');
    }

    public bindEvents() {
        this.bind('#country_of_tax_residence', 'change', (evt) => {
            let input = evt.target as HTMLInputElement;
            this.usTaxResidence = (input.value.toUpperCase() == 'USA');

            if (this.usTaxResidence) {
                this.kycForm.steps = 5;
                this.setRequired('state')
                document.getElementById('state_div')?.classList.remove('hidden')
            } else {
                this.kycForm.steps = 6;
                this.removeRequired('state');
                document.getElementById('state_div')?.classList.add('hidden')
            }
        });

        let showIdentityButton = document.getElementById('contact_next');
        if (showIdentityButton) {
            showIdentityButton.addEventListener('click', (evt) => {
                if (!this.validateRequiredFields('.kycContact')) return;

                this.kycForm.kycIdentity.show();
            })
        }

    }


}