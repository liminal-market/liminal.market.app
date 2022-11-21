import Modal from "../Modal";
import KycEditNameHtml from '../../../html/modal/Kyc/KycEditName.html';
import UserService from "../../../services/backend/UserService";
import StringHelper from "../../../util/StringHelper";
import LoadingHelper from "../../../util/LoadingHelper";

export default class KycEditNameForm {
    moralis: typeof Moralis;
    modal: Modal;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
        this.modal = new Modal();
    }

    public async show() {
        let kycEditNameError = document.getElementById('kycEditNameError');
        if (kycEditNameError) kycEditNameError.style.display = 'none';

        let userService = new UserService(this.moralis);
        let account = await userService.getAccount()

        let given_name = account.identity.given_name as string;
        let middle_name = account.identity.middle_name as string;
        let family_name = account.identity.family_name;

        let template = Handlebars.compile(KycEditNameHtml)
        let content = template({given_name: given_name, middle_name: middle_name, family_name: family_name});

        this.modal.showModal('Edit name', content);

        this.bindEvents();
    }

    private bindEvents() {

        let kycEditNameConfirm = document.getElementById('kycEditNameConfirm');
        kycEditNameConfirm?.addEventListener('click', async (evt) => {

            let given_name = document.getElementById('given_name') as HTMLInputElement;
            let middle_name = document.getElementById('middle_name') as HTMLInputElement;
            let family_name = document.getElementById('family_name') as HTMLInputElement;


            if (StringHelper.isNullOrEmpty(given_name.value)) {
                this.showError('Given name cannot be empty');
                return;
            }

            if (StringHelper.isNullOrEmpty(family_name.value)) {
                this.showError('Family name cannot be empty')
                return;
            }

            let full_name = this.getFullName();
            let label_confirm_name = document.getElementById('label_confirm_name');
            if (!label_confirm_name) {
                //TODO: report error in form
                return;
            }

            label_confirm_name.innerHTML = 'Please type in the full name "' + full_name + '" in the box below to confirm. You WILL NOT be able to change it again.';

            document.getElementById('confirmNameFieldset')?.classList.remove('hidden')
            document.getElementById('kycEditName')?.classList.add('hidden')
        })

        let kycEditNameBack = document.getElementById('kycEditNameBack');
        kycEditNameBack?.addEventListener('click', (evt) => {
            document.getElementById('confirmNameFieldset')?.classList.add('hidden')
            document.getElementById('kycEditName')?.classList.remove('hidden')
        })

        let confirm_name = document.getElementById('confirm_name') as HTMLInputElement;
        if (!confirm_name) {
            //TODO: report error in form
            return;
        }

        let kycEditNameSave = document.getElementById('kycEditNameSave') as HTMLButtonElement;
        kycEditNameSave.disabled = true;
        confirm_name.setAttribute('aria-invalid', 'true');
        confirm_name.addEventListener('keyup', (evt) => {
            if (confirm_name.value == this.getFullName()) {
                confirm_name.setAttribute('aria-invalid', 'false');
                kycEditNameSave.disabled = false;
            } else {
                confirm_name.setAttribute('aria-invalid', 'true');
                kycEditNameSave.disabled = true;
            }
        })

        kycEditNameSave?.addEventListener('click', async (evt) => {
            let confirm_name = document.getElementById('confirm_name') as HTMLInputElement;
            if (confirm_name && confirm_name.value != this.getFullName()) {
                alert(confirm_name.value + ' is not same as ' + this.getFullName() + '. Go over the name and make sure it is identical');
                return;
            }

            let given_name = document.getElementById('given_name') as HTMLInputElement;
            let middle_name = document.getElementById('middle_name') as HTMLInputElement;
            let family_name = document.getElementById('family_name') as HTMLInputElement;
            LoadingHelper.setLoading(kycEditNameSave);
            let userService = new UserService(this.moralis);
            await userService.updateName(given_name.value, middle_name.value, family_name.value)
                .then((response) => {
                    if (response.message) {
                        this.showError(response.message);
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
        let kycEditNameError = document.getElementById('kycEditNameError');
        if (!kycEditNameError) return;

        kycEditNameError.innerHTML = message;
        kycEditNameError.style.display = 'block';
    }

    private getFullName() {
        let given_name = document.getElementById('given_name') as HTMLInputElement;
        let middle_name = document.getElementById('middle_name') as HTMLInputElement;
        let family_name = document.getElementById('family_name') as HTMLInputElement;

        return given_name.value + ' ' + (!StringHelper.isNullOrEmpty(middle_name.value) ? middle_name.value + ' ' : '') + family_name.value;
    }
}