import AUSDFund from "../AUSDFund";
import WireTransferHtml from "../../../../html/modal/Funding/Relationship/WireTransferRelationship.html";
import FormHelper from "../../../../util/FormHelper";
import UserService from "../../../../services/backend/UserService";
import CountryHelper from "../../../../util/CountryHelper";
import RelationshipBase from "./RelationshipBase";
import {TransferDirectionEnum} from "../../../../enums/TransferDirectionEnum";
import {BankRelationship} from "../../../../dto/alpaca/BankRelationship";

export default class WireTransferRelationship extends RelationshipBase {

    constructor(aUsdFund: AUSDFund) {
        super(aUsdFund);
    }

    public show() {
        super.show('Create bank information', WireTransferHtml, {countries: CountryHelper.Countries});
    }

    public bindEvents() {
        let wire_transfer_previous = document.getElementById('wire_transfer_previous');
        wire_transfer_previous?.addEventListener('click', (evt) => {
            this.aUsdFund.selectFundingType.show();
        });

        let save_international_bank_information = document.getElementById('save_international_bank_information');
        save_international_bank_information?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            if (!this.validate()) return;

            let params = FormHelper.getParams('#wireTransferForm');
            let userService = new UserService(this.aUsdFund.moralis);
            await userService.registerWireTransferRelationship(params)
                .then(async (bankRelationship: BankRelationship) => {
                    let transfers = await userService.getLatestTransfers(TransferDirectionEnum.Incoming);
                    await this.aUsdFund.transferNotification.show(bankRelationship, transfers)
                })
                .catch(async (reason) => {
                    await this.handleErrorResponse(reason);
                });
        })
    }

    public validate() {
        let swift_error = document.getElementById('swift_error');
        if (swift_error) swift_error.style.display = 'none';
        let writeTransferError = document.getElementById('writeTransferError');
        if (writeTransferError) writeTransferError.style.display = 'none';

        if (!FormHelper.validate('#wireTransferForm')) return false;

        let bank_code = document.getElementById('bank_code') as HTMLInputElement;
        if (bank_code.value.length != 8 && bank_code.value.length != 11) {
            bank_code.setAttribute('aria-invalid', 'true');
            let swift_error = document.getElementById('swift_error');
            if (swift_error) swift_error.style.display = 'block';
            return false;
        }

        return true;
    }
}