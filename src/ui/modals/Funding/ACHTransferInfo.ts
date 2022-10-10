import AUSDFund from "./AUSDFund";
import ACHTransferInfoHtml from "../../../html/modal/Funding/ACHTransferInfo.html"

export default class ACHTransferInfo {

    aUsdFund: AUSDFund;

    constructor(aUsdFund: AUSDFund) {
        this.aUsdFund = aUsdFund;
    }

    public show(amount: string) {
        let template = Handlebars.compile(ACHTransferInfoHtml);
        this.aUsdFund.modal.showModal('Transfer information', template({amount: amount}), false, () => {
        }, false);

    }
}