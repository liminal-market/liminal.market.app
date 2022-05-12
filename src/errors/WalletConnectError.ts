import ErrorInfo from "./ErrorInfo";

export default class WalletConnectError extends ErrorInfo {
    description : string;
    constructor(reason : string) {
        super(reason);
        //"Request of type 'wallet_requestPermissions' already pending")

        this.description = 'show better description';
    }
}