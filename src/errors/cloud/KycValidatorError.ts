import KYCForm from "../../ui/modals/KYCForm";
import StringHelper from "../../util/StringHelper";

export default class KycValidatorError {
    validValues: string | string[] = '';
    inputName: string = '';
    labelText: string = '';
    message: string;
    pattern: string = '';
    onshow: any;
    kycForm: KYCForm;

    constructor(error: any, kycForm: KYCForm) {
        let obj: any = {};

        this.kycForm = kycForm;
        try {
            if (error.serverError) {
                this.message = error.serverError;
                if (this.message.indexOf('account with the requested email address already exists') != -1) {
                    this.inputName = 'email_address';
                    this.labelText = 'Email';
                }
            } else if (!error.inputName && typeof error == 'string') {
                obj = JSON.parse(error);
            } else {
                obj = error;
            }

            this.message = obj.message?.replace(/_/g, ' ');
            this.validValues = obj.validValues?.replace(/_/g, ' ');
            this.inputName = obj.inputName;
            this.labelText = obj.labelText;
            this.pattern = obj.pattern;
            this.onshow = obj.onshow;
        } catch (e: any) {
            this.message = error.messsage;
        }


    }

    handle(): void {
        if (StringHelper.isNullOrEmpty(this.inputName)) {
            let activeFieldset = document.querySelector(this.kycForm.activeFieldsetSelector) as HTMLElement;
            let inputError = activeFieldset.querySelector('.input_error') as HTMLElement;
            if (inputError) {
                if (this.validValues) {
                    inputError.innerHTML = this.validValues.toString();
                } else {
                    if (this.message && this.message.indexOf('Invalid function') != -1 || this.message.indexOf('Unable to connect to the Parse API') != -1) {
                        inputError.innerHTML = 'We just deployed new version of our website. This can cause interruption. Please wait 30 seconds and submit again';
                    } else {
                        inputError.innerHTML = this.message;
                    }
                }
                inputError.style.display = 'block';
                inputError.scrollIntoView()
            }
            return;
        }
        let input = document.getElementById(this.inputName);
        if (!input) return;

        let inputError = input.parentElement!.querySelector('.input_error') as HTMLElement;
        if (inputError) {
            inputError.scrollIntoView({block: 'center'});
            return;
        }
        input.setAttribute('aria-invalid', 'true');
        let errorInput = '<div class="input_error" style="display: block" id="input_error_' + this.inputName + '">' + this.message + '</div>';
        if (input.clientWidth < 300) {
            let div = this.getDivToDisplayErrorMessage(input);
            div.insertAdjacentHTML("beforebegin", errorInput);
        } else {
            input.insertAdjacentHTML("beforebegin", errorInput);
        }
        input.focus();
        if (this.pattern) {
            input.setAttribute('pattern', this.pattern);
        }

        input.addEventListener('blur', (evt) => {
            evt.preventDefault();
            setTimeout(() => {
                let input = evt.target as HTMLInputElement;
                let pattern = input.getAttribute('pattern');

                if ((pattern && input.value.match(pattern)) || (input.type != 'checkbox' && input.type != 'radio' && input.required && input.value) || input.checked) {
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
                //await this(this.onshow.functionName, this.onshow.params);
                //TODO: fix send email

                document.getElementById('input_error_' + this.inputName)!.innerHTML = 'Email has been sent to ' + this.onshow.params.email;
            })

        }

    }


    private getDivToDisplayErrorMessage(input: HTMLElement, counter = 1): HTMLElement {

        let div = input.parentElement!.closest('div');
        if (!div) return input;

        if (div.clientWidth > 300 || counter > 5) {
            return div;
        }

        return this.getDivToDisplayErrorMessage(div, ++counter);

    }
}