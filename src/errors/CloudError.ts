import GeneralError from "./GeneralError";

export default class CloudError extends GeneralError{
    constructor(e : any) {
        super(e);
    }
}