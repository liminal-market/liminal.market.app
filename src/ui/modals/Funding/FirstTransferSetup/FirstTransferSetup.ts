import AUSDFund from "../AUSDFund";
import {BankRelationship} from "../../../../dto/alpaca/BankRelationship";
import FirstTransferSetupHtml from '../../../../html/modal/Funding/FirstTransferSetup/FirstTransferSetup.html'
import BankInfo from "../FirstTransferSetup/BankInfo";

export default class FirstTransferSetup {

    moralis: typeof Moralis;
    aUsdFund: AUSDFund
    bankRelationship?: BankRelationship;

    constructor(moralis: typeof Moralis, aUsdFund: AUSDFund) {
        this.moralis = moralis;
        this.aUsdFund = aUsdFund;
    }

    public show(bankRelationship: BankRelationship) {
        this.bankRelationship = bankRelationship;

        let template = Handlebars.compile(FirstTransferSetupHtml);
        this.aUsdFund.modal.showModal('Setup transfer', template({}));

        let bankInfo = new BankInfo(this.aUsdFund, bankRelationship);
        bankInfo.show();
    }

}