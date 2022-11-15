import AUSDFund from "../AUSDFund";
import SelectFundingTypeHtml from '../../../../html/modal/Funding/Relationship/SelectFundingType.html';

export default class SelectFundingType {

    aUsdFund: AUSDFund

    constructor(aUsdFund: AUSDFund) {
        this.aUsdFund = aUsdFund;
    }

    public show() {
        let template = Handlebars.compile(SelectFundingTypeHtml);

        this.aUsdFund.modal.showModal('Select funding type', template({}));

        this.bindEvent();
    }

    private bindEvent() {
        let next_bank_information = document.getElementById('next_bank_information');
        next_bank_information?.addEventListener('click', (evt) => {
            this.aUsdFund.hideError('selectFundingTypeError');

            let ach_transfer = document.getElementById('ach_transfer') as HTMLInputElement;
            if (ach_transfer?.checked) {
                this.aUsdFund.achRelationship.show();
            }
            let wire_transfer = document.getElementById('wire_transfer') as HTMLInputElement;
            if (wire_transfer?.checked) {
                this.aUsdFund.wireTransferRelationship.show();
            }

            this.aUsdFund.showError('selectFundingTypeError', 'Please select funding type')

        })
    }
}