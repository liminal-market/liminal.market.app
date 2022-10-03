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


}