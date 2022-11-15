import {BankRelationship} from "../../../../dto/alpaca/BankRelationship";
import AUSDFund from "../AUSDFund";

export default abstract class FirstTransferSetupBase {
    bankRelationship: BankRelationship;
    aUsdFund: AUSDFund;

    protected constructor(aUsdFund: AUSDFund, bankRelationship: BankRelationship) {
        this.aUsdFund = aUsdFund;
        this.bankRelationship = bankRelationship;
    }

    abstract show(): void;

    abstract bindEvents(): void;

    protected render(html: string) {
        let element = document.getElementById('html_to_fill');
        if (!element) return;

        element.innerHTML = html;
    }

}