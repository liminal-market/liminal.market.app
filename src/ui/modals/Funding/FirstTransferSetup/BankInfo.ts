import BankInfoHtml from '../../../../html/modal/Funding/FirstTransferSetup/BankInfo.html'
import {BankRelationship} from "../../../../dto/alpaca/BankRelationship";
import WireTransferMoney from "./WireTransferMoney";
import ACHTransferAccountNumber from './ACHTransferAccountNumber';
import FirstTransferSetupBase from "./FirstTransferSetupBase";
import AUSDFund from "../AUSDFund";

export default class BankInfo extends FirstTransferSetupBase {


    constructor(aUsdFund: AUSDFund, bankRelationship: BankRelationship) {
        super(aUsdFund, bankRelationship);
    }

    public show() {
        let bankInfoTemplate = Handlebars.compile(BankInfoHtml);
        let bankInfoHtml = bankInfoTemplate({
            wire: this.bankRelationship.transfer_type == 'wire',
            account_number: this.bankRelationship.alpaca_account_number
        });

        this.render(bankInfoHtml);
        this.bindEvents();
    }

    public bindEvents() {
        let next = document.getElementById('bank_info_next');
        next?.addEventListener('click', (evt) => {
            evt.preventDefault();

            if (this.bankRelationship.transfer_type == 'wire') {
                let wireTransferMoney = new WireTransferMoney(this.aUsdFund, this.bankRelationship);
                wireTransferMoney.show();
            } else {
                let ach = new ACHTransferAccountNumber(this.aUsdFund, this.bankRelationship);
                ach.show();
            }
        })
    }
}