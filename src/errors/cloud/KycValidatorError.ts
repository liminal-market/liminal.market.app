import ICloudError from "./ICloudError";
import KYCForm from "../../ui/modals/KYCForm";
import KycBase from "../../ui/modals/KYC/KycBase";

export default class KycValidatorError {
    validValues: string | string[];
    inputName: string;
    labelText: string;
    message: string;
    pattern: string;
    onshow: any;
    kycForm: KYCForm;

    constructor(obj: any, kycForm: KYCForm) {
        this.message = obj.message;
        this.validValues = obj.validValues;
        this.inputName = obj.inputName;
        this.labelText = obj.labelText;
        this.pattern = obj.pattern;
        this.onshow = obj.onshow;
        this.kycForm = kycForm;
    }

    handle(): void {
        let input = document.getElementById(this.inputName);
        if (!input) return;

        let inputError = input.parentElement!.querySelector('.input_error') as HTMLElement;
        if (inputError) {
            inputError.scrollIntoView({block: 'center'});
            return;
        }
        input.setAttribute('aria-invalid', 'true');
        input.insertAdjacentHTML("beforebegin", '<div class="input_error" style="display: block" id="input_error_' + this.inputName + '">' + this.message + '</div>');
        input.focus();
        if (this.pattern) {
            input.setAttribute('pattern', this.pattern);
        }

        input.addEventListener('blur', (evt) => {
            evt.preventDefault();
            setTimeout(() => {
                let input = evt.target as HTMLInputElement;
                let pattern = input.getAttribute('pattern');

                if ((pattern && input.value.match(pattern)) || (input.required && input.value) || input.checked) {
                    input.removeAttribute('aria-invalid');
                    let errorMessage = document.getElementById('input_error_' + this.inputName);
                    if (errorMessage) errorMessage.remove();
                }
            }, 800);
        })

        let fieldsetElement = input.closest('fieldset[data-form="1"]');
        if (fieldsetElement) {
            let className = fieldsetElement.className.replace('hidden', '').trim();
            this.kycForm.show(className);

            input.scrollIntoView(false)
        }

        if (this.onshow) {
            let link = document.getElementById(this.onshow.id);
            if (!link) return;

            link.addEventListener('click', async (evt) => {
                evt.preventDefault();
                await Moralis.Cloud.run(this.onshow.functionName, this.onshow.params);

                document.getElementById('input_error_' + this.inputName)!.innerHTML = 'Email has been sent to ' + this.onshow.params.email;
            })

        }

    }


}