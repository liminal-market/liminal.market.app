import LoadingHelper from "../util/LoadingHelper";
import GeneralError from "./GeneralError";
import PredefinedErrorHandlers from "./PredefinedErrorHandlers";

export default class ErrorInfo {

    errorInfo: string;

    constructor(errorInfo: string) {
        this.errorInfo = errorInfo;
    }

    public getErrorInfo() {
        return this.errorInfo;
    }

    public static report(error: GeneralError) {
        LoadingHelper.removeLoading();
        if (!error) return;

        let errorHandler = new PredefinedErrorHandlers();
        if (errorHandler.handle(error.message)) {
            return;
        }

        if (error.callback) {
            error.callback();
            return;
        }
        if (error) {
            console.error(error);
        }
        //InfoBar.show(error.message, InfoBarType.Error);
    }

    public static log(obj: any) {
        ErrorInfo.report(new GeneralError(obj));
    }

    public static info(obj: any) {
        ErrorInfo.report(new GeneralError(obj));
    }

    public static error(obj: any) {
        console.log(obj);
        ErrorInfo.report(new GeneralError(obj));
    }
}