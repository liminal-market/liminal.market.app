import Modal from "../Modal";
import KycEditContactFormHtml from '../../../html/modal/Kyc/KycEditContactForm.html'
import UserService from "../../../services/backend/UserService";
import FormHelper from "../../../util/FormHelper";
import KycValidatorError from "../../../errors/cloud/KycValidatorError";
import StringHelper from "../../../util/StringHelper";
import {AccountInfo} from "../../../dto/alpaca/AccountInfo";
import LoadingHelper from "../../../util/LoadingHelper";

export default class KycEditContactForm {
    modal: Modal;

    constructor() {
        this.modal = new Modal();
    }

    public async show() {
        let userService = new UserService();
        let account = await userService.getAccount();
        let usa = account.identity.country_of_tax_residence == 'USA'
        let template = Handlebars.compile(KycEditContactFormHtml);
        this.modal.showModal('Edit contact information', template({usa: usa}))

        let contactProperties = Object.getOwnPropertyNames(account.contact);
        FormHelper.fillInputs(contactProperties, account.contact);

        this.bindEvents();
    }


    private bindEvents() {
        let kycEditContactSave = document.getElementById('kycEditContactSave');
        kycEditContactSave?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            if (!this.validate()) return;

            LoadingHelper.setLoading(kycEditContactSave);

            let data = FormHelper.getParams('#kycEditContactForm');
            let userService = new UserService();
            await userService.updateContact(data).then((response: any) => {
                if (response.message) {
                    this.showError(response.message);
                    return;
                }
                let accountInfo = response as AccountInfo;
                let email_address = document.getElementById('email_address') as HTMLInputElement
                if (accountInfo.contact.email_address != email_address?.value) {
                    this.showError('Email was not changed. The email ' + email_address?.value + ' is already registered under different account.');
                    return;
                }
                this.modal.hideModal();
            }).catch(reason => {
                if (reason.message) {
                    this.showError(JSON.parse(reason.message).message);
                } else {
                    this.showError(reason);
                }
            }).finally(() => {
                LoadingHelper.removeLoading();
            });
        })
    }

    private showError(message: string) {
        let kycEditNameError = document.getElementById('kycEditContactError');
        if (!kycEditNameError) return;

        kycEditNameError.innerHTML = message;
        kycEditNameError.style.display = 'block';
    }

    private validate() {
        let inputs = document.querySelectorAll('#kycEditContactFieldset input[required]');
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i] as HTMLInputElement;
            if (StringHelper.isNullOrEmpty(input.value)) {
                input.setAttribute('aria-invalid', 'true')
                input.addEventListener('change', (evt) => {
                    if (!StringHelper.isNullOrEmpty(input.value)) {
                        input.setAttribute('aria-invalid', 'false')
                    }
                })
                return false;
            }
        }
        return true;
    }

}
