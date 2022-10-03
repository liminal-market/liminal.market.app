import GeneralError from "./GeneralError";
import ErrorInfo from "./ErrorInfo";
import KycValidatorError from "./cloud/KycValidatorError";
import ICloudError from "./cloud/ICloudError";
import HttpError from "./cloud/HttpError";

export default class CloudError extends GeneralError {


    constructor(e: any) {
        super(e);
        try {
            let obj = JSON.parse(e.message);
            if (obj.name) {
                let errorHandler = CloudError.getActionInstance(obj.name, obj);
                if (errorHandler) {
                    errorHandler.handle();
                    return;
                }
            }

            ErrorInfo.error(obj);
        } catch (jsonError) {
            ErrorInfo.error(e);
        }
    }

    public static getActionInstance(action: string, obj: any): ICloudError {
        let tmp: any = undefined;
        for (let i=0;i<CloudError.Errors.length;i++) {
            if (CloudError.Errors[i].name === action) {
                let errorHandler = CloudError.Errors[i];
                return new errorHandler(obj);
            }
        }

        return tmp;
    }

    static Errors = [
        HttpError
    ]
}