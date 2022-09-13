import KYCFormHtml from '../../html/modal/KYCModal.html';
import Modal from "./Modal";
import Progress from "../elements/Progress";
import KYCService from "../../services/blockchain/KYCService";
import NetworkInfo from "../../networks/NetworkInfo";
import {serialize} from "../../util/Helper";
import LoadingHelper from "../../util/LoadingHelper";
import CloudError from "../../errors/CloudError";
import CountryHelper from "../../util/CountryHelper";

import KycContactHtml from '../../html/modal/Kyc/KycContact.html';
import KycIdentityHtml from '../../html/modal/Kyc/KycIdentity.html';
import KycDisclosureHtml from '../../html/modal/Kyc/KycDisclosures.html';
import KycImmediateFamilyHtml from '../../html/modal/Kyc/KycImmediateFamily.html';
import KycAffiliateOrControlledHtml from '../../html/modal/Kyc/KycAffiliateOrControlled.html';
import KycAccountAgreementHtml from '../../html/modal/Kyc/KycAccountAgreement.html';
import StringHelper from "../../util/StringHelper";
import KycValidatorError from "../../errors/cloud/KycValidatorError";
import KycTrustedContactHtml from '../../html/modal/Kyc/KycTrustedContact.html'

export default class KYCForm {
    modal: Modal;
    timeout?: any = undefined;
    onHide: () => void;

    constructor(onHide: () => void) {
        this.modal = new Modal();
        this.onHide = onHide;
    }

    public showKYCForm() {

        let countries = {countries: CountryHelper.Countries};
        let kycFormTemplate = Handlebars.compile(KYCFormHtml);
        let kycContactTemplate = Handlebars.compile(KycContactHtml);
        let kycIdentityTemplate = Handlebars.compile(KycIdentityHtml);
        let kycDisclosureTemplate = Handlebars.compile(KycDisclosureHtml);
        let kycImmediateFamilyTemplate = Handlebars.compile(KycImmediateFamilyHtml);
        let kycAffiliateOrControlledTemplate = Handlebars.compile(KycAffiliateOrControlledHtml);
        let kycTrustedContactTemplate = Handlebars.compile(KycTrustedContactHtml);
        let disclosureHtml = kycDisclosureTemplate({
            ImmediateFamilyHtml: kycImmediateFamilyTemplate({}),
            AffiliateOrControlledHtml: kycAffiliateOrControlledTemplate({})
        });
        let KycAccountAgreementTemplate = Handlebars.compile(KycAccountAgreementHtml);

        let obj = {
            KycContactHtml: kycContactTemplate(countries),
            KycIdentityHtml: kycIdentityTemplate(countries),
            KycDisclosureHtml: disclosureHtml,
            KycAccountAgreementHtml: KycAccountAgreementTemplate,
            KycTrustedContactHtml: kycTrustedContactTemplate({})
        }
        let content = kycFormTemplate(obj);
        this.modal.showModal('KYC & AML', content, true, () => {
            this.clearTimeout()
        });

        this.bindListeners();
        this.showRequiredMarker();
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

    public clearTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
    }

    public async checkKycStatus() {
        let kycService = new KYCService(Moralis);
        let isValid = await kycService.hasValidKYC()

        if (isValid) {
            clearTimeout();
            this.modal.hideModal();
            this.onHide();
        } else {
            this.timeout = setTimeout(() => {
                this.checkKycStatus()
            }, 5 * 1000)
        }
    }


    private bindListeners() {
        this.bindNextButtons();
        this.bindSubmitButton();
        this.bindInputBoxes();

    }

    private discloseReaction(event: MouseEvent, elementId: string, show: boolean) {
        let input = event.target as HTMLInputElement;
        if (input?.checked) {
            let fieldset = document.getElementById(elementId) as HTMLElement;
            if (fieldset) {
                if (show) {
                    fieldset.classList.remove('hidden')
                } else {
                    fieldset.classList.add('hidden')
                }
            }
        }
    }

    private showFileRelatedInfo(text: string) {
        let fileRelatedInfo = document.getElementById('fileRelatedInfo')! as HTMLElement;

        fileRelatedInfo.innerHTML = text;
        fileRelatedInfo.classList.remove('hidden')
    }

    private hideFileRelatedInfo() {
        let fileRelatedInfo = document.getElementById('fileRelatedInfo')! as HTMLElement;
        fileRelatedInfo.classList.add('hidden');
    }

    private bindNextButtons() {
        let showContactButtons = document.querySelectorAll('.showContact');
        for (let i = 0; i < showContactButtons.length; i++) {
            showContactButtons[i].addEventListener('click', (evt) => {

                this.hideFieldsets();
                document.querySelector('.kycContact')!.classList.remove('hidden')
            })
        }

        let showIdentityButtons = document.querySelectorAll('.showIdentity');
        for (let i = 0; i < showIdentityButtons.length; i++) {
            showIdentityButtons[i].addEventListener('click', (evt) => {
                if (!this.validateRequiredFields('.kycContact')) return;

                this.hideFieldsets();
                document.querySelector('.kycIdentity')!.classList.remove('hidden')
            })
        }

        let showDisclosuresButtons = document.querySelectorAll('.showDisclosures');
        for (let i = 0; i < showDisclosuresButtons.length; i++) {
            showDisclosuresButtons[i].addEventListener('click', (evt) => {
                if (!this.validateRequiredFields('.kycIdentity')) return;

                this.hideFieldsets();
                document.querySelector('.kycDisclosures')!.classList.remove('hidden')
            })
        }

        let showAgreementsButtons = document.querySelectorAll('.showAgreements');
        for (let i = 0; i < showAgreementsButtons.length; i++) {
            showAgreementsButtons[i].addEventListener('click', (evt) => {
                this.hideFieldsets();
                document.querySelector('.kycAccountAgreement')!.classList.remove('hidden')
            })
        }
    }

    private hideFieldsets() {
        let fieldsets = document.querySelectorAll('#kyc_wizard_form > fieldset');
        for (let i = 0; i < fieldsets.length; i++) {
            fieldsets[i].classList.add('hidden');
        }
    }

    private bindSubmitButton() {
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

    private validateRequiredFields(className: string) {
        let inputs = document.querySelectorAll(className + ' input[required]');
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i] as HTMLInputElement;
            if (StringHelper.isNullOrEmpty(input.value)) {
                let obj = {
                    message: 'You must fill into this field',
                    inputName: input.id,
                    labelText: document.querySelector('label[for=' + input.id + ']')!.innerHTML,
                    pattern: input.pattern
                }

                let kycValidationError = new KycValidatorError(obj);
                kycValidationError.handle();
                return false;
            }

            if (input.pattern) {
                let pattern = input.pattern;
                let matches = input.value.match(pattern);
                if (matches == null) {
                    let obj = {
                        message: 'This is not valid date format, please use YYYY-MM-DD (year-month-date)',
                        inputName: input.id,
                        labelText: document.querySelector('label[for=' + input.id + ']')!.innerHTML,
                        pattern: input.pattern
                    }

                    let kycValidationError = new KycValidatorError(obj);
                    kycValidationError.handle();
                    return false;
                }
            }
        }
        return true;
    }

    private setRequired(inputId: string) {
        document.getElementById(inputId)!.setAttribute('required', 'required');
    }

    private removeRequired(inputId: string) {
        document.getElementById(inputId)!.removeAttribute('required');
    }

    private showElement(elementId: string) {
        document.getElementById(elementId)!.classList.remove('hidden');
    }

    private hideElement(elementId: string) {
        document.getElementById(elementId)!.classList.add('hidden');
    }

    private showRequiredMarker() {
        let inputs = document.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i] as HTMLInputElement;
            if (!input.id) continue;
            let label = document.querySelector('label[for=' + input.id + ']');
            if (!label) continue;

            if (input.required) {
                if (label.innerHTML.indexOf('*') == -1) {
                    label.innerHTML += '*';
                }
            } else {
                if (label.innerHTML.indexOf('*') != -1) {
                    label.innerHTML = label.innerHTML.replace('*', '');
                }
            }
        }
    }

    private bind(selector: string, eventName: string, action: (evt: Event) => void) {
        let elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener(eventName, (evt) => {
                action(evt);
            });
        }
    }

    private bindInputBoxes() {
        this.bind('#country_of_tax_residence', 'change', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.value.toUpperCase() == 'USA') {
                this.showElement('citizen_of_usa_question');
                this.hideElement('tax_id_type_options');
                this.setRequired('postal_code');
                this.setRequired('state');
            } else {
                this.hideElement('citizen_of_usa_question')
                this.showElement('tax_id_type_options');
                this.showElement('country_of_citizenship_option');
                this.removeRequired('postal_code');
                this.removeRequired('state')
            }

            this.showRequiredMarker();
        })


        this.bind('#citizen_yes', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.hideElement('tax_id_type_options')
                this.hideElement('citizen_no_type_options')
                this.hideElement('country_of_birth_option');
                this.hideElement('visa_type_option');
                document.getElementById('tax_id_label')!.innerHTML = 'SSN'
            } else {
                this.showElement('citizen_no_type_options')
                this.showElement('country_of_birth_option');
                document.getElementById('tax_id_label')!.innerHTML = 'Tax Id (SSN)'
            }
        })


        this.bind('#citizen_no', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.showElement('citizen_no_type_options');
            } else {
                this.hideElement('citizen_no_type_options')
            }
        })


        this.bind('#citizen_no_type_options_1', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.showElement('country_of_birth_option');
                this.showElement('country_of_citizenship_option');
            } else {
                this.hideElement('country_of_birth_option');
                this.hideElement('country_of_citizenship_option');
            }
        })

        this.bind('#citizen_no_type_options_2', 'click', (evt) => {
            let input = evt.target as HTMLInputElement;
            if (input.checked) {
                this.showElement('visa_type_option');
                this.showElement('country_of_birth_option');
                this.showElement('country_of_citizenship_option');
            } else {
                this.hideElement('visa_type_option');
                this.hideElement('country_of_birth_option');
                this.hideElement('country_of_citizenship_option');
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

        let immediate_family_exposed_yes = document.getElementById('immediate_family_exposed_yes') as HTMLInputElement;
        immediate_family_exposed_yes.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'immediate_family', true);
        })

        let immediate_family_exposed_no = document.getElementById('immediate_family_exposed_no') as HTMLInputElement;
        immediate_family_exposed_no.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'immediate_family', false);
        })


        let is_affiliated_exchange_or_finra_yes = document.getElementById('is_affiliated_exchange_or_finra_yes') as HTMLInputElement;
        is_affiliated_exchange_or_finra_yes.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'affiliate_or_controlled', true)
        })

        let is_affiliated_exchange_or_finra_no = document.getElementById('is_affiliated_exchange_or_finra_no') as HTMLInputElement;
        is_affiliated_exchange_or_finra_no.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'affiliate_or_controlled', false);
        })

        let is_control_person_yes = document.getElementById('is_control_person_yes') as HTMLInputElement;
        is_control_person_yes.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'affiliate_or_controlled', true)
        })

        let is_control_person_no = document.getElementById('is_control_person_no') as HTMLInputElement;
        is_control_person_no.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'affiliate_or_controlled', false);
        })

        let account_approval_letter_input = document.getElementById('account_approval_letter_input') as HTMLInputElement;
        account_approval_letter_input.addEventListener('change', (evt) => {
            evt.preventDefault();
            this.hideFileRelatedInfo();

            let files = account_approval_letter_input.files;
            if (!files) return;

            let file = files[0];
            if (!file) {
                this.showFileRelatedInfo('No file selected. Please select file.');
            }

            if (file.size > 8 * 1024 * 1024 * 10) {
                this.showFileRelatedInfo('File ' + file.name + ' is to large. Files cannot be larger then 10MB. You need to make it smaller before submitting your application');
                return;
            }

            let reader = new FileReader();
            reader.addEventListener('load', () => {
                let account_approval_letter = document.getElementById('account_approval_letter')! as HTMLInputElement;
                account_approval_letter.value = reader.result as string;
            });

            reader.addEventListener('error', () => {
                this.showFileRelatedInfo('Could not read file ' + file.name + '. Either the file is corrupt or your browser does not allow us to read it');
            });
            reader.readAsDataURL(file);
        })
    }
}