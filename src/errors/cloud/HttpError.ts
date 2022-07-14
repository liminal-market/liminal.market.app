import ICloudError from "./ICloudError";
import ErrorInfo from "../ErrorInfo";
import GeneralError from "../GeneralError";

export default class HttpError implements ICloudError {
    method : string;
    url : string;
    body : string;
    serverError : any;

    constructor(obj : any) {
        this.method = obj.method;
        this.url = obj.url;
        this.body = obj.body;
        this.serverError = obj.serverError;
    }

    handle(): void {
        console.log(this);
        ErrorInfo.report(new GeneralError('Error doing request. Server response was:' + this.serverError.data.message))

    }

}