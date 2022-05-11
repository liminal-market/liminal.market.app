import InfoBar from "../ui/elements/InfoBar";
import {InfoBarType} from "../ui/elements/InfoBarType";

export default class PredefinedErrorHandlers {

    errorMesssageMapping = new Map<string, any>();
    SentLoginRequest = "We have sent request to you wallet to login. Open your wallet to login";

    constructor() {
        this.errorMesssageMapping.set('already processing eth_requestaccounts', this.SentLoginRequest);
        this.errorMesssageMapping.set('web3 instance', () => {
            let elements = document.querySelectorAll(".liminal_market_connect_wallet");
            if (elements.length > 0) {
                elements[0].dispatchEvent(new MouseEvent('click'))
                return;
            }
        });
        this.errorMesssageMapping.set('user rejected the request', () => {
            Moralis.User.logOut();
            window.location.reload();
        })
    }

    public handle(message : string) {
        let handled = false;
        this.errorMesssageMapping.forEach((value, key) => {
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