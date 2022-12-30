import FirstTransferSetupPage from "./FirstTransferSetupBase";
import {BankRelationship} from "../../../../dto/alpaca/BankRelationship";
import MoneyTransferredHtml from "../../../../html/modal/Funding/FirstTransferSetup/MoneyTransferred.html";
import AUSDFund from "../AUSDFund";
import StringHelper from "../../../../util/StringHelper";
import LoadingHelper from "../../../../util/LoadingHelper";
import UserService from "../../../../services/backend/UserService";

export default class MoneyTransferred extends FirstTransferSetupPage {

    constructor(aUsdFund: AUSDFund, bankRelationship: BankRelationship) {
        super(aUsdFund, bankRelationship);
    }

    show(): void {
        let template = Handlebars.compile(MoneyTransferredHtml);
        super.render(template({}));
        this.bindEvents();
    }

    render(): string {
        let template = Handlebars.compile(MoneyTransferredHtml);
        return template({
            transfer_type: this.bankRelationship.transfer_type,
            relationshipId: this.bankRelationship.id
        });
    }

    bindEvents(): void {

        let notifyTransfer = document.getElementById('notifyTransfer');
        notifyTransfer?.addEventListener('click', async (evt) => {
            evt.preventDefault();
            this.aUsdFund.hideError('transferError');

            let amount = document.getElementById('amount') as HTMLInputElement;
            if (StringHelper.isNullOrEmpty(amount.value) || parseFloat(amount.value) < 10) {
                this.aUsdFund.showError('amountError', 'Amount cannot be empty or below $10')
            }
            LoadingHelper.setLoading(notifyTransfer);

            let userService = new UserService();
            await userService.createTransfer(amount.value, 'INCOMING')
                .then(() => {
                    this.aUsdFund.transferNotified.show(this.bankRelationship!, amount.value);
                })
                .catch(reason => {
                    let httpError = JSON.parse(reason.message);
                    this.aUsdFund.showError('transferError', httpError.serverError.message)
                })
                .finally(() => {
                    LoadingHelper.removeLoading();
                });

        })
    }


}