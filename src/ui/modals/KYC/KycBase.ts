import StringHelper from "../../../util/StringHelper";
import KycValidatorError from "../../../errors/cloud/KycValidatorError";
import KYCForm from "../KYCForm";
import FileUpload from "../../elements/FileUpload";


export default class KycBase {
    kycForm: KYCForm;

    constructor(kycForm: KYCForm) {
        this.kycForm = kycForm;

        FileUpload.registerHandler();
    }

    public showFieldset(selector: string, header: string) {
        this.hideFieldsets();

        document.querySelector(selector)?.classList.remove('hidden');
        document.querySelector('#liminal_market_modal_div > article > header > span')!.innerHTML = header
        document.querySelector('#liminal_market_modal_div > article')!.scrollTop = 0
        this.kycForm.activeFieldsetSelector = selector;
    }

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
        document.getElementById(inputId)?.setAttribute('required', 'required');
    }

    public removeRequired(inputId: string) {
        document.getElementById(inputId)?.removeAttribute('required');
    }

    public bind(selector: string, eventName: string, action: (evt: Event) => void) {
        let elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener(eventName, (evt) => {
                action(evt);
            });
        }
    }

    public bindFileUploads() {
        for (let i = 0; i < FileUpload.fileUploads.length; i++) {
            FileUpload.fileUploads[i].bindEvents();
        }
    }

    public hideFieldsets() {
        let fieldsets = document.querySelectorAll('#kyc_wizard_form > fieldset');
        for (let i = 0; i < fieldsets.length; i++) {
            fieldsets[i].classList.add('hidden');
        }
    }


    public validateRequiredFields(selector: string) {
        let inputs = document.querySelectorAll(selector + ' input[required], ' + selector + ' select[required]');
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i] as HTMLInputElement;

            if (this.isMissingInputFromUser(input)) {
                let obj = {
                    message: 'You must fill into this field',
                    inputName: input.id,
                    labelText: document.querySelector('label[for=' + input.id + ']')!.innerHTML,
                    pattern: input.pattern
                }

                let kycValidationError = new KycValidatorError(obj, this.kycForm);
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

                    let kycValidationError = new KycValidatorError(obj, this.kycForm);
                    kycValidationError.handle();
                    return false;
                }
            }
        }
        return true;
    }


    public showElement(elementId: string) {
        document.getElementById(elementId)?.classList.remove('hidden');
    }

    public hideElement(elementId: string) {
        document.getElementById(elementId)?.classList.add('hidden');
    }

    protected setLabel(elementId: string, text: string) {
        let element = document.getElementById('tax_id_label');
        if (!element) return;

        element.innerHTML = text;
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


}