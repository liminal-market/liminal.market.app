import AUSDFund from "./AUSDFund";
import TransferHtml from '../../../html/modal/Funding/Transfer.html'
import {BankRelationship} from "../../../dto/alpaca/BankRelationship";
import StringHelper from "../../../util/StringHelper";
import UserService from "../../../services/backend/UserService";
import LoadingHelper from "../../../util/LoadingHelper";
import {TransferDirectionEnum} from "../../../enums/TransferDirectionEnum";
import TransfersList from "./TransfersList";

export default class Transfer {

    moralis: typeof Moralis;
    aUsdFund: AUSDFund
    bankRelationship?: BankRelationship;
    private transfersList: TransfersList;

    constructor(moralis: typeof Moralis, aUsdFund: AUSDFund) {
        this.moralis = moralis;
        this.aUsdFund = aUsdFund;
        this.transfersList = new TransfersList(this.moralis);
    }

    public async show(bankRelationship: BankRelationship) {
        if (!bankRelationship) {
            this.aUsdFund.modal.showModal('No bank relationship exists', 'No bank relationship exists. You need to create this before you can transfer money. Close the window and try again.');
            return;
        }

        this.bankRelationship = bankRelationship;

        let template = Handlebars.compile(TransferHtml);
        let transfersListHtml = await this.transfersList.render(TransferDirectionEnum.Incoming);

        let transfer_type = (StringHelper.isNullOrEmpty(bankRelationship.bank_account_number)) ? 'wire' : 'ach';
        this.aUsdFund.modal.showModal('Create transfer notification', template({
            transfers: transfersListHtml,
            transfer_type: transfer_type,
            relationshipId: bankRelationship.id
        }));

        this.bindEvents();

    }

    public bindEvents() {
        this.transfersList.bindEvents();

        let notifyTransfer = document.getElementById('notifyTransfer');
        notifyTransfer?.addEventListener('click', async (evt) => {
            evt.preventDefault();
            this.aUsdFund.hideError('transferError');

            let amount = document.getElementById('amount') as HTMLInputElement;
            if (StringHelper.isNullOrEmpty(amount.value) || parseFloat(amount.value) < 10) {
                this.aUsdFund.showError('amountError', 'Amount cannot be empty or below $10')
            }
            LoadingHelper.setLoading(notifyTransfer);

            let relationship_id = document.getElementById('relationship_id') as HTMLInputElement;
            let transfer_type = document.getElementById('transfer_type') as HTMLInputElement;

            let userService = new UserService(this.moralis);
            await userService.createTransfer(amount.value, 'INCOMING', relationship_id.value, transfer_type.value)
                .then((response) => {
                    console.log(response);
                    if (StringHelper.isNullOrEmpty(this.bankRelationship!.processor_token)) {
                        this.aUsdFund.wireTransferInfo.show(amount.value);
                    } else {
                        this.aUsdFund.achTransferInfo.show(amount.value);
                    }
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