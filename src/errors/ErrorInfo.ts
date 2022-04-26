
export default class ErrorInfo {

    errorInfo : string;
    constructor(errorInfo : string) {
        this.errorInfo = errorInfo;
    }

    public getErrorInfo() {
        return this.errorInfo;
    }
}