import ICloudError from "./ICloudError";
import ErrorInfo from "../ErrorInfo";
import GeneralError from "../GeneralError";

export default class KycValidatorError implements ICloudError {
    validValues: string | string[];
    inputName: string;
    labelText: string;
    message : string;

    constructor(obj : any) {
        this.message = obj.message;
        this.validValues = obj.validValues;
        this.inputName = obj.inputName;
        this.labelText = obj.labelText;
    }

    handle(): void {
        let input = document.getElementById(this.inputName);
        if (input) {
            input.focus();
        }
        ErrorInfo.report(new GeneralError(this.message));
    }



}