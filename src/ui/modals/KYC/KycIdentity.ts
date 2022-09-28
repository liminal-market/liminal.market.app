import KYCForm from "../KYCForm";
import KycHelper from "./KycHelper";
import KycIdentityHtml from "../../../html/modal/Kyc/KycIdentity.html";
import CountryHelper from "../../../util/CountryHelper";
import KycValidatorError from "../../../errors/cloud/KycValidatorError";

export default class KycIdentity extends KycHelper {
    kycForm: KYCForm;

    constructor(kycForm: KYCForm) {
        super();

        this.kycForm = kycForm;
    }

    public render() {
        let template = Handlebars.compile(KycIdentityHtml);
        return template({countries: CountryHelper.Countries});
    }

    public show() {
        document.querySelector('.kycIdentity')!.classList.remove('hidden');

        if (this.kycForm.kycContact.usTaxResidence) {
            this.showElement('citizen_of_usa_question');
        } else {
            this.hideElement('citizen_of_usa_question');
            document.getElementById('tax_id_label')!.innerHTML = 'Tax Id (SSN)'
        }
    }

    public bindEvents() {

        this.bind('#citizen_yes', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.hideElement('tax_id_type_options')
                this.hideElement('citizen_no_type_options')
                this.hideElement('country_of_birth_option');
                this.hideElement('visa_type_option');
                document.getElementById('tax_id_label')!.innerHTML = 'SSN'
            }
        })


        this.bind('#citizen_no', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.showElement('citizen_no_type_options');
                this.showElement('country_of_birth_option');
                document.getElementById('tax_id_label')!.innerHTML = 'Tax Id (SSN)'
            }
        })


        this.bind('#citizen_no_type_options_1', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.showElement('country_of_birth_option');
                this.showElement('country_of_citizenship_option');
                this.hideElement('visa_type_option');
            }
        })

        this.bind('#citizen_no_type_options_2', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.showElement('visa_type_option');
                this.showElement('country_of_birth_option');
                this.showElement('country_of_citizenship_option');
            }
        })

        this.bind('#visa_type', 'change', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.value == 'B1' || input.value == 'B2') {
                this.showElement('date_of_departure_from_usa_option');
            } else {
                this.hideElement('date_of_departure_from_usa_option');
            }
        })

        this.bindButtons();
    }

    private bindButtons() {
        let showContactButtons = document.querySelectorAll('.showContact');
        for (let i = 0; i < showContactButtons.length; i++) {
            showContactButtons[i].addEventListener('click', (evt) => {

                this.hideFieldsets();
                document.querySelector('.kycContact')!.classList.remove('hidden')
            })
        }

        let showDisclosuresButtons = document.querySelectorAll('.showDisclosures');
        for (let i = 0; i < showDisclosuresButtons.length; i++) {
            showDisclosuresButtons[i].addEventListener('click', (evt) => {
                if (!this.validateInputs()) return;
                if (!this.validateRequiredFields('.kycIdentity')) return;

                this.hideFieldsets();
                document.querySelector('.kycDisclosures')!.classList.remove('hidden')
            })
        }
    }

    private validateInputs() {
        if (this.kycForm.kycContact.usTaxResidence) {
            let citizen_yes = document.getElementById('citizen_yes') as HTMLInputElement;
            let citizen_no = document.getElementById('citizen_no') as HTMLInputElement;

            if (!citizen_yes.checked && !citizen_no.checked) {
                let obj = {
                    message: 'You must select either option',
                    inputName: 'citizen_yes',
                    labelText: document.querySelector('label[for=citizen_yes]')!.innerHTML
                }

                let kycValidationError = new KycValidatorError(obj);
                kycValidationError.handle();
            }
        }

        return true;


    }
}