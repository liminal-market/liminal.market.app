import LoadingHelper from "../util/LoadingHelper";
import GeneralError from "./GeneralError";

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

        if (error.message.toLocaleLowerCase().indexOf('web3 instance')) {
            let elements = document.querySelectorAll(".liminal_market_connect_wallet");
            if (elements.length > 0) {
                elements[0].dispatchEvent(new MouseEvent('click'))
                return;
            }
        }

        let errorInfo = document.getElementById('error_info');
        if (!errorInfo) return;

        errorInfo.innerHTML = error.message;
        errorInfo.classList.remove('d-none');
        setTimeout(() => {
            errorInfo?.classList.add('d-none');
        }, 4*1000);
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