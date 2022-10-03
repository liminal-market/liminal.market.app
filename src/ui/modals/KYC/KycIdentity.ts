import KYCForm from "../KYCForm";
import KycBase from "./KycBase";
import KycIdentityHtml from "../../../html/modal/Kyc/KycIdentity.html";
import CountryHelper from "../../../util/CountryHelper";
import KycValidatorError from "../../../errors/cloud/KycValidatorError";

export default class KycIdentity extends KycBase {
    constructor(kycForm: KYCForm) {
        super(kycForm);
    }

    public render() {
        let template = Handlebars.compile(KycIdentityHtml);
        return template({countries: CountryHelper.Countries});
    }

    public show() {

        if (this.kycForm.kycContact.usTaxResidence) {
            this.showElement('citizen_of_usa_question');
        } else {
            this.hideElement('citizen_of_usa_question');
            document.getElementById('tax_id_label')!.innerHTML = 'SSN'
        }
        this.showFieldset('.kycIdentity', 'Identity');
        this.showElement('country_of_citizenship_option');
        let country_of_citizenship = document.getElementById('country_of_citizenship') as HTMLSelectElement;
        country_of_citizenship.options[1].disabled = false;
    }

    public bindEvents() {

        this.bind('#citizen_yes', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                let taxIdType = document.getElementById('tax_id_type') as HTMLSelectElement;
                if (taxIdType) taxIdType.value = 'USA_SSN';

                let country_of_citizenship = document.getElementById('country_of_citizenship') as HTMLSelectElement;
                country_of_citizenship.options[1].disabled = false;
                country_of_citizenship.value = 'USA';

                this.hideElement('tax_id_type_options')
                this.hideElement('citizen_no_type_options');
                this.hideElement('visa_type_option');
                this.hideElement('country_of_citizenship_option');
                this.removeRequired('country_of_birth');
                this.removeRequired('visa_type');
                this.removeRequired('visa_expiration_date');
                this.removeRequired('date_of_departure_from_usa');
                document.getElementById('tax_id_label')!.innerHTML = 'SSN'
                this.hideCitizenErrorMessage();

            }
        })


        this.bind('#citizen_no', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.showElement('citizen_no_type_options');
                this.showElement('country_of_citizenship_option');
                this.setRequired('country_of_birth');
                document.getElementById('tax_id_label')!.innerHTML = 'SSN'
                let country_of_citizenship = document.getElementById('country_of_citizenship') as HTMLSelectElement;
                country_of_citizenship.options[0].selected = true;
                country_of_citizenship.options[1].disabled = true;

                this.hideCitizenErrorMessage();

            }
        })


        this.bind('#citizen_no_type_options_1', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.showElement('country_of_citizenship_option');
                this.hideElement('visa_type_option');
                this.setRequired('country_of_birth');
                this.removeRequired('visa_type')
                this.removeRequired('visa_expiration_date')
                this.removeRequired('date_of_departure_from_usa')
            }
        })

        this.bind('#citizen_no_type_options_2', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.showElement('visa_type_option');
                this.showElement('country_of_citizenship_option');
                this.setRequired('country_of_birth');
                this.setRequired('country_of_citizenship');
                this.setRequired('visa_type')
                this.setRequired('visa_expiration_date')
                this.setRequired('date_of_departure_from_usa')
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

    private hideCitizenErrorMessage() {
        document.getElementById('citizen_yes')!.removeAttribute('aria-invalid');
        let errorMessage = document.getElementById('input_error_citizen_yes');
        if (errorMessage) errorMessage.remove();
    }

    private bindButtons() {
        let showContactButton = document.getElementById('identity_prev');
        showContactButton?.addEventListener('click', (evt) => {
            this.kycForm.kycContact.show();
        })

        let showDisclosuresButton = document.getElementById('identity_next');
        showDisclosuresButton?.addEventListener('click', (evt) => {
            if (!this.validateInputs()) return;
            if (!this.validateRequiredFields('.kycIdentity')) return;

            this.kycForm.kycTrustedContact.show();

        })
    }

    private validateInputs() {
        let citizen_yes = document.getElementById('citizen_yes') as HTMLInputElement;
        let citizen_no = document.getElementById('citizen_no') as HTMLInputElement;

        if (!this.kycForm.kycContact.usTaxResidence) {
            citizen_yes.checked = false;
            citizen_no.checked = false;
            return true;
        }

        if (!citizen_yes.checked && !citizen_no.checked) {
            let obj = {
                message: 'You must select either option',
                inputName: 'citizen_yes',
                labelText: document.querySelector('label[for=citizen_yes]')!.innerHTML
            }

            let kycValidationError = new KycValidatorError(obj, this.kycForm);
            kycValidationError.handle();
            return false;
        }

        let greenCardOption = document.getElementById('citizen_no_type_options_1') as HTMLInputElement;
        let visaOption = document.getElementById('citizen_no_type_options_2') as HTMLInputElement;
        if (citizen_no.checked && !greenCardOption.checked && !visaOption.checked) {
            let obj = {
                message: 'You must select either option, "Green Card / Permanent Resident" or "Visa"',
                inputName: 'citizen_no',
                labelText: ''
            }

            let kycValidationError = new KycValidatorError(obj, this.kycForm);
            kycValidationError.handle();
            return false;
        }


        return true;


    }
}