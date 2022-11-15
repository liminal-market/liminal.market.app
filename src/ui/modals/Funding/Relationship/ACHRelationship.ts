import AUSDFund from "../AUSDFund";
import ACHRelationshipHtml from '../../../../html/modal/Funding/Relationship/ACHRelationship.html';
import FormHelper from "../../../../util/FormHelper";
import UserService from "../../../../services/backend/UserService";
import LoadingHelper from "../../../../util/LoadingHelper";
import RelationshipBase from "./RelationshipBase";

export default class ACHRelationship extends RelationshipBase {

    constructor(aUsdFund: AUSDFund) {
        super(aUsdFund)
    }

    show() {
        super.show('Bank information', ACHRelationshipHtml);
    }

    public bindEvents() {
        let ach_next = document.getElementById('ach_next');
        ach_next?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            if (!this.validate()) return;

            let params = FormHelper.getParams('#achForm');
            let userService = new UserService(this.aUsdFund.moralis);
            userService.createAchRelationship(params.account_owner_name, params.bank_account_type, params.bank_account_number, params.bank_routing_number)
                .then(result => {
                    this.aUsdFund.firstTransferSetup.show(result)
                })
                .catch(async (reason) => {
                    await this.handleErrorResponse(reason);
                });
        });

        let ach_previous = document.getElementById('ach_previous');
        ach_previous?.addEventListener('click', (evt) => {
            evt.preventDefault();

            this.aUsdFund.selectFundingType.show();
        })
    }

    public validate() {
        if (!FormHelper.validate('#achForm')) return false;
        return true;
    }

}