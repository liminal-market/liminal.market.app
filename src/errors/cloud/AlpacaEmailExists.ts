import ICloudError from "./ICloudError";
import ErrorInfo from "../ErrorInfo";
import GeneralError from "../GeneralError";

export default class AlpacaEmailExists implements ICloudError {
    message : string;
    serverError : any;

    constructor(obj : any) {
        this.message = obj.message;
        this.serverError = obj.serverError;
    }

    handle(): void {
        console.log(this);
        ErrorInfo.info(this.message);

    }

}