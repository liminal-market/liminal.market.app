import AUSDFund from "../AUSDFund";
import UserService from "../../../../services/backend/UserService";
import {TransferDirectionEnum} from "../../../../enums/TransferDirectionEnum";

export default abstract class RelationshipBase {
    protected aUsdFund: AUSDFund

    protected constructor(aUsdFund: AUSDFund) {
        this.aUsdFund = aUsdFund;
    }

    abstract bindEvents(): void;

    abstract validate(): boolean;

    public show(title: string, html: string, param?: any) {
        let template = Handlebars.compile(html);

        this.aUsdFund.modal.showModal(title, template(param));
        this.bindEvents();
    }

    public async handleErrorResponse(reason: any) {
        if (!reason.message) {
            alert(reason)
            return;
        }

        let obj = JSON.parse(reason.message);
        let errorElement = document.getElementById('relationshipError');
        if (!errorElement) {
            let message = (obj.serverError) ? obj.serverError.message : reason.message
            alert(message);
            return;
        }

        if (obj.serverError.message.indexOf('only one bank association') != -1) {
            let userService = new UserService(this.aUsdFund.moralis);
            let bankRelationship = await userService.getBankRelationship();

            if (!bankRelationship) {
                errorElement.innerText = 'We cannot create the bank connection. Something is not working as it should. Please contact us at <a href="mailto:info@liminal.market">info@liminal.market</a>';
                errorElement.style.display = 'block'
            } else {
                let transfers = await userService.getLatestTransfers(TransferDirectionEnum.Incoming)
                await this.aUsdFund.transferNotification.show(bankRelationship, transfers);
            }
        } else {
            errorElement.innerText = obj.serverError.message;
            errorElement.style.display = 'block';
        }
    }
}