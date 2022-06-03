import InfoBar from "../ui/elements/InfoBar";
import {InfoBarType} from "../ui/elements/InfoBarType";
import WalletMissingHtml from '../html/modal/WalletMissing.html';
import MarketIsClosedHtml from '../html/modal/MarketIsClosed.html';
import Modal from "../ui/modals/Modal";

export default class PredefinedErrorHandlers {

    errorMessageMapping = new Map<string, any>();
    SentLoginRequest = "We have sent request to you wallet to login. Open your wallet to login";

    constructor() {
        this.errorMessageMapping.set('already processing eth_requestaccounts', this.SentLoginRequest);
        this.errorMessageMapping.set('request is already in progress', this.SentLoginRequest);
        this.errorMessageMapping.set('web3 instance', () => {
            let elements = document.querySelectorAll(".liminal_market_connect_wallet");
            if (elements.length > 0) {
                elements[0].dispatchEvent(new MouseEvent('click'))
                return;
            }
        });
        this.errorMessageMapping.set('user rejected the request', () => {
            Moralis.User.logOut();
            window.location.reload();
        });
        this.errorMessageMapping.set('Non ethereum enabled browser', () => {
            let modal = new Modal();
            let template = Handlebars.compile(WalletMissingHtml);
            modal.showModal('New to blockchain?', template(null), false, () => {
                window.location.reload();
            })
        });
    }

    public handle(message : string) {
        let handled = false;
        this.errorMessageMapping.forEach((value, key) => {
            if (!handled && message.toLowerCase().indexOf(key.toLowerCase()) != -1) {
                if (typeof value == 'string') {
                    InfoBar.show(value.toString(), InfoBarType.Warning, 10);
                } else {
                    value();
                }
                handled = true;
                return handled;
            }
        })
        return handled;
    }

}