import WireTransferMoneyHtml from '../../../../html/modal/Funding/FirstTransferSetup/WireTransferMoney.html';
import FirstTransferSetupBase from "./FirstTransferSetupBase";
import {BankRelationship} from "../../../../dto/alpaca/BankRelationship";
import MoneyTransferred from "./MoneyTransferred";
import AUSDFund from "../AUSDFund";
import doc = Mocha.reporters.doc;
import FirstTransferSetup from "./FirstTransferSetup";


export default class WireTransferMoney extends FirstTransferSetupBase {

    constructor(aUsdFund: AUSDFund, bankRelationship: BankRelationship) {
        super(aUsdFund, bankRelationship);
    }

    public show() {
        let template = Handlebars.compile(WireTransferMoneyHtml);
        this.render(template({}));
        this.bindEvents();
    }

    public bindEvents() {
        let next = document.getElementById('next_wire_transfer_money');
        next?.addEventListener('click', (evt) => {
            evt.preventDefault();

            let moneyTransferred = new MoneyTransferred(this.aUsdFund, this.bankRelationship)
            moneyTransferred.show();
        })

        let prev = document.getElementById('prev_wire_transfer_money');
        prev?.addEventListener('click', (evt) => {
            evt.preventDefault();

            let transferSetup = new FirstTransferSetup(Moralis, this.aUsdFund);
            transferSetup.show(this.bankRelationship)
        })
    }
}