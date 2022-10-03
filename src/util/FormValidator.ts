import KycValidatorError from "../errors/cloud/KycValidatorError";
import StringHelper from "./StringHelper";

export default class FormValidator {
    selector: string;


    constructor(selector: string) {
        this.selector = selector;
    }


    public validateRequiredFields() {
        let inputs = document.querySelectorAll(this.selector + ' input[required], ' + this.selector + ' select[required]');
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i] as HTMLInputElement;

            if (this.isMissingInputFromUser(input)) {
                let obj = {
                    message: 'You must fill into this field',
                    inputName: input.id,
                    labelText: document.querySelector('label[for=' + input.id + ']')!.innerHTML,
                    pattern: input.pattern
                }

                this.handle(obj);
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

                    this.handle(obj);
                    return false;
                }
            }
        }
        return true;
    }


    private isMissingInputFromUser(input: HTMLInputElement) {
        return ((input.type == 'checkbox' && !input.checked) || StringHelper.isNullOrEmpty(input.value));
    }

    protected removeMissingInfo(errorDivId: string, focusElementId?: string) {
        let element = document.getElementById(errorDivId);
        if (!element) return;
        element.style.display = 'none';

        if (!focusElementId) return;

        let focusElement = document.getElementById(focusElementId);
        if (focusElement) {
            focusElement.removeAttribute('aria-invalid');
        }
    }

    protected setMissingInfo(errorDivId: string, text: string, focusElementId?: string) {
        let element = document.getElementById(errorDivId);
        if (!element) return;

        element.innerHTML = text;
        if (text == '') {
            element.style.display = 'none'
        } else {
            element.style.display = 'block'
            if (focusElementId) {
                document.getElementById(focusElementId)?.focus();
                document.getElementById(focusElementId)?.setAttribute('aria-invalid', 'true');
            }
        }
    }

    private handle(obj: { labelText: string; message: string; pattern: string; inputName: string }) {
        let input = document.getElementById(obj.inputName);
        if (!input) return;

        let inputError = input.parentElement!.querySelector('.input_error') as HTMLElement;
        if (inputError) {
            inputError.scrollIntoView({block: 'center'});
            return;
        }
        input.setAttribute('aria-invalid', 'true');
        input.insertAdjacentHTML("beforebegin", '<div class="input_error" style="display: block" id="input_error_' + obj.inputName + '">' + obj.message + '</div>');
        input.focus();
        if (obj.pattern) {
            input.setAttribute('pattern', obj.pattern);
        }

        input.addEventListener('blur', (evt) => {
            evt.preventDefault();
            setTimeout(() => {
                let input = evt.target as HTMLInputElement;
                let pattern = input.getAttribute('pattern');

                if ((pattern && input.value.match(pattern)) || (input.required && input.value) || input.checked) {
                    input.removeAttribute('aria-invalid');
                    let errorMessage = document.getElementById('input_error_' + obj.inputName);
                    if (errorMessage) errorMessage.remove();
                }
            }, 800);
        })

    }
}