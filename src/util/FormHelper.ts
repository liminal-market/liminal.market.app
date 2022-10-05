import KycValidatorError from "../errors/cloud/KycValidatorError";
import StringHelper from "./StringHelper";

export default class FormHelper {

    public static getParams(selector: string) {
        let form = document.querySelector(selector) as HTMLFormElement;
        if (!form) return;

        let data = new FormData(form);
        return this.serialize(data);
    }


    private static serialize(data: any) {
        let obj: any = {};
        for (let [key, value] of data) {
            if (obj[key] !== undefined) {
                if (!Array.isArray(obj[key])) {
                    obj[key] = [obj[key]];
                }
                obj[key].push(value);
            } else {
                obj[key] = value;
            }
        }
        return obj;
    }


    public static fillInputs(properties: string[], item: any) {
        properties.forEach((value) => {

            let input = document.querySelector('input[name=' + value + ']') as HTMLInputElement;
            if (input) {
                if (input.type == 'radio') {
                    console.log('checkbox', input, item[value]);
                    input.value = item[value]
                } else {
                    input.value = item[value];
                }
                input.dispatchEvent(new Event('change'))

            } else {
                let select = document.querySelector('select[name=' + value + ']') as HTMLSelectElement;
                if (select) {
                    select.value = item[value];
                    select.dispatchEvent(new Event('change'))
                }
            }

        })
    }

    public static validate(selector: string) {
        let inputs = document.querySelectorAll(selector + ' input[required]');
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i] as HTMLInputElement;
            if (StringHelper.isNullOrEmpty(input.value)) {
                input.setAttribute('aria-invalid', 'true')
                input.focus();

                input.addEventListener('change', (evt) => {
                    if (!StringHelper.isNullOrEmpty(input.value)) {
                        input.setAttribute('aria-invalid', 'false');
                    }
                })
                return false;
            }
        }
        return true;
    }
}