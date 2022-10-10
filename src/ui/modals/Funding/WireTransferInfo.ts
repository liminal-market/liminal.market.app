import AUSDFund from "./AUSDFund";
import WireTransferInfoHtml from "../../../html/modal/Funding/WireTransferInfo.html"

export default class WireTransferInfo {

    aUsdFund: AUSDFund;

    constructor(aUsdFund: AUSDFund) {
        this.aUsdFund = aUsdFund;
    }

    public show(amount: string) {
        let template = Handlebars.compile(WireTransferInfoHtml);
        this.aUsdFund.modal.showModal('Transfer information', template({amount: amount}));

    }
}