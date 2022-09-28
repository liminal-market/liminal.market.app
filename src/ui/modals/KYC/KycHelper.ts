import StringHelper from "../../../util/StringHelper";
import KycValidatorError from "../../../errors/cloud/KycValidatorError";

export default class KycHelper {


    public showRequiredMarker() {
        let inputs = document.querySelectorAll('input, select');
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

    public setRequired(inputId: string) {
        document.getElementById(inputId)!.setAttribute('required', 'required');
    }

    public removeRequired(inputId: string) {
        document.getElementById(inputId)!.removeAttribute('required');
    }

    public bind(selector: string, eventName: string, action: (evt: Event) => void) {
        let elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener(eventName, (evt) => {
                action(evt);
            });
        }
    }

    public hideFieldsets() {
        let fieldsets = document.querySelectorAll('#kyc_wizard_form > fieldset');
        for (let i = 0; i < fieldsets.length; i++) {
            fieldsets[i].classList.add('hidden');
        }
    }


    public validateRequiredFields(className: string) {
        let inputs = document.querySelectorAll(className + ' input[required], ' + className + ' select[required]');
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


    public showElement(elementId: string) {
        document.getElementById(elementId)!.classList.remove('hidden');
    }

    public hideElement(elementId: string) {
        document.getElementById(elementId)!.classList.add('hidden');
    }


}