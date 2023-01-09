import RegistrationHtml from '../../../html/modal/Sandbox/Registration.html';
import Modal from "../Modal";
import KYCService from "../../../services/blockchain/KYCService";
import StringHelper from "../../../util/StringHelper";
import FormValidator from "../../../util/FormValidator";
import Waiting from "./Waiting";
import App from "../../../main";
import LoadingHelper from "../../../util/LoadingHelper";

export default class Registration {

    modal: Modal;

    constructor() {
        this.modal = new Modal();
    }

    public show() {
        if (App.User.alpacaId) {
            let waiting = new Waiting();
            waiting.show();
            return;
        }

        let template = Handlebars.compile(RegistrationHtml);
        this.modal.showModal('Sandbox registration', template({}));

        this.bindEvents();
    }

    private bindEvents() {
        let register_and_fund = document.getElementById('register_and_fund')
        register_and_fund?.addEventListener('click', async () => {
            this.hideError();
            LoadingHelper.setLoading(register_and_fund);

            let formValidator = new FormValidator('#sandbox_registration');
            if (!formValidator.validateRequiredFields()) {
                LoadingHelper.removeLoading();
                return;
            }

            let firstName = document.querySelector('#given_name') as HTMLInputElement;
            let lastName = document.querySelector('#family_name') as HTMLInputElement;
            let email = document.querySelector('#email_address') as HTMLInputElement;

            let kycService = new KYCService();
            let alpacaId = await kycService.sandboxCreateAccount(firstName.value, lastName.value, email.value)
                .catch((reason) => {

                    let error = JSON.parse(reason.message);
                    if (error.serverError) {
                        this.showError(error.serverError)
                    } else {
                        this.showError(error);
                    }
                    LoadingHelper.removeLoading();
                })
            if (alpacaId) {
                App.User.alpacaId = alpacaId;

                let waiting = new Waiting();
                waiting.show();
            }
        })
    }

    public hideError() {
        let sandbox_reg_error = document.getElementById('sandbox_reg_error')
        if (sandbox_reg_error) sandbox_reg_error.style.display = 'none'
    }

    public showError(message: string) {
        let sandbox_reg_error = document.getElementById('sandbox_reg_error')
        if (!sandbox_reg_error) {
            alert(message)
            return;
        }
        sandbox_reg_error.style.display = 'block'
        sandbox_reg_error.innerHTML = message;
    }
}