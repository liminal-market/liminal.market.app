import LoadingHelper from "../util/LoadingHelper";
import GeneralError from "./GeneralError";
import InfoBar from "../ui/elements/InfoBar";
import {InfoBarType} from "../ui/elements/InfoBarType";
import PredefinedErrorHandlers from "./PredefinedErrorHandlers";

export default class ErrorInfo {

    errorInfo : string;
    constructor(errorInfo : string) {
        this.errorInfo = errorInfo;
    }

    public getErrorInfo() {
        return this.errorInfo;
    }

    public static report(error : GeneralError) {
        LoadingHelper.removeLoading();

        let errorHandler = new PredefinedErrorHandlers();
        if (!errorHandler.handle(error.message)) {
            InfoBar.show(error.message, InfoBarType.Error);
        }
    }

    public static log(obj : any) {
       ErrorInfo.report(new GeneralError(obj));
    }
    public static info(obj : any) {
        ErrorInfo.report(new GeneralError(obj));
    }

    public static error(obj : any) {
        ErrorInfo.report(new GeneralError(obj));
    }
}