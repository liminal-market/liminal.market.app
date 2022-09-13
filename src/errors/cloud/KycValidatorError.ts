import ICloudError from "./ICloudError";

export default class KycValidatorError implements ICloudError {
    validValues: string | string[];
    inputName: string;
    labelText: string;
    message: string;
    pattern: string;
    onshow: any;

    constructor(obj: any) {
        this.message = obj.message;
        this.validValues = obj.validValues;
        this.inputName = obj.inputName;
        this.labelText = obj.labelText;
        this.pattern = obj.pattern;
        this.onshow = obj.onshow;
    }

    handle(): void {
        let input = document.getElementById(this.inputName);
        if (!input) return;

        let inputError = input.parentElement!.querySelector('.input_error');
        if (inputError) return;

        input.focus();
        input.setAttribute('aria-invalid', 'true');
        input.insertAdjacentHTML("beforebegin", '<div class="input_error" id="input_error_' + this.inputName + '">' + this.message + '</div>');
        input.setAttribute('pattern', this.pattern);
        input.addEventListener('blur', (evt) => {
            evt.preventDefault();
            let input = evt.target as HTMLInputElement;
            let pattern = input.getAttribute('pattern');

            if (pattern && input.value.match(pattern)) {
                input.removeAttribute('aria-invalid');
                let errorMessage = document.getElementById('input_error_' + this.inputName);
                if (errorMessage) errorMessage.remove();
            }
        })

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