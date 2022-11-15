import ACHTransferAccountNumberHtml
    from '../../../../html/modal/Funding/FirstTransferSetup/ACHTransferAccountNumber.html';
import FirstTransferSetupBase from "./FirstTransferSetupBase";
import {BankRelationship} from "../../../../dto/alpaca/BankRelationship";
import MoneyTransferred from "./MoneyTransferred";
import AUSDFund from "../AUSDFund";


export default class ACHTransferAccountNumber extends FirstTransferSetupBase {

    constructor(aUsdFund: AUSDFund, bankRelationship: BankRelationship) {
        super(aUsdFund, bankRelationship);
    }

    public show() {
        let template = Handlebars.compile(ACHTransferAccountNumberHtml);
        this.render(template({bank_account_number: this.bankRelationship.alpaca_account_number}));
        this.bindEvents();
    }

    public bindEvents() {
        let next = document.getElementById('next_ach_account_number');
        next?.addEventListener('click', (evt) => {
            evt.preventDefault();

            let moneyTransferred = new MoneyTransferred(this.aUsdFund, this.bankRelationship)
            moneyTransferred.show();
        })
    }
}