import GeneralError from "./GeneralError";
import Modal from "../ui/modals/Modal";
import MarketIsClosedHtml from "../html/modal/MarketIsClosed.html";
import DateHelper from "../util/DateHelper";

export default class BlockchainError extends GeneralError {
    static ErrorFromContract = -1;
    static UserCancelled = 1;
    static AddressIsNotValidKYC = 2;
    static MarketIsClosed = 3;

    constructor(e : any) {
        super(e);
        this.message = e.toString();

        if (this.userDeniedTransactionSignature()) {
            this.code = BlockchainError.UserCancelled;
        } else if (this.addressIsNotValidKYC()) {
            this.code = BlockchainError.AddressIsNotValidKYC;
        } else if (this.isMarketClosed()) {
            this.code = BlockchainError.MarketIsClosed;
            this.callback = this.marketIsClosedModal;
        }

        if (e.data && e.data.message) {
            let msg : string = e.data.message;
            let searchStr = 'reverted with reason string';
            let idx = msg.indexOf(searchStr) + searchStr.length;
            if (idx != -1) {
                this.message = msg.substring(idx).trim().replace(/'/g, '');
                this.code = BlockchainError.ErrorFromContract;
            }
        }
    }

    public userDeniedTransactionSignature() {
        return this.message.indexOf('denied transaction signature') !== -1;
    }

    public addressIsNotValidKYC() {
        return this.message.indexOf('address is not kyc valid') !== -1;
    }

    public isMarketClosed() {
        let searchStr = 'Market is closed';
        return this.message.indexOf(searchStr) !== -1;
    }

    public marketIsClosedModal() {
        let [openHour, closeHour] = DateHelper.getOpenAndCloseHours();
        let time = new Date().toTimeString().split(' ');
        let obj = {
            currentTime: time[0],
            GMT: time[1],
            dayOfWeek : DateHelper.getWeekday(),
            openFrom : openHour,
            openTo : closeHour
        }

        let modal = new Modal();
        let template = Handlebars.compile(MarketIsClosedHtml);
        modal.showModal('Market is closed', template(obj))
    }
}