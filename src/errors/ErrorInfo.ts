import LoadingHelper from "../util/LoadingHelper";
import Moralis from "Moralis";

export default class ErrorInfo {

    errorInfo : string;
    constructor(errorInfo : string) {
        this.errorInfo = errorInfo;
    }

    public getErrorInfo() {
        return this.errorInfo;
    }

    public static report(reason : any) {
        console.info('ErrorInfo', reason);
        LoadingHelper.removeLoading();
        let errorMessage = (reason.message) ? reason.message : reason.toString();
        if (errorMessage.toLocaleLowerCase().indexOf('web3 instance')) {
            let elements = document.querySelectorAll(".liminal_market_connect_wallet");
            if (elements.length > 0) {
                elements[0].dispatchEvent(new MouseEvent('click'))
                return;
            }
        }

        let errorInfo = document.getElementById('error_info');
        if (!errorInfo) return;

        errorInfo.innerHTML = reason;
        errorInfo.classList.remove('d-none');
        setTimeout(() => {
            errorInfo?.classList.add('d-none');
        }, 4*1000);
    }

    public static log(obj : any) {
        try {
            ErrorInfo.report(JSON.stringify(obj));
        } catch (e : any) {
            ErrorInfo.report('Cant serialize:' + obj);
        }
    }

    public static error(obj : any) {
        try {
            ErrorInfo.report(JSON.stringify(obj));
        } catch (e : any) {
            ErrorInfo.report('Cant serialize:' + obj);
        }
    }
}