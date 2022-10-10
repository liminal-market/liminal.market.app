import AUSDFund from "./AUSDFund";
import WireTransferHtml from "../../../html/modal/Funding/WireTransfer.html";
import FormHelper from "../../../util/FormHelper";
import UserService from "../../../services/backend/UserService";
import CountryHelper from "../../../util/CountryHelper";

export default class WireTransfer {

    aUsdFund: AUSDFund

    constructor(aUsdFund: AUSDFund) {
        this.aUsdFund = aUsdFund;
    }

    public async show() {
        let template = Handlebars.compile(WireTransferHtml);

        this.aUsdFund.modal.showModal('Create bank information', template({countries: CountryHelper.Countries}));

        this.bindEvents();
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
                .then(response => {
                    this.aUsdFund.transfer.show(response)
                })
                .catch(async (reason) => {
                    let obj = JSON.parse(reason.message);
                    let writeTransferError = document.getElementById('writeTransferError');
                    if (writeTransferError) {
                        if (obj.serverError.message.indexOf('only one bank association') != -1) {
                            let bankRelationships = await userService.getBankRelationships();

                            if (bankRelationships.length == 0) {
                                writeTransferError.innerText = 'We cannot create the bank connection. Something is not working as it should. Please contact us at <a href="mailto:info@liminal.market">info@liminal.market</a>';
                                writeTransferError.style.display = 'block'
                            } else {
                                await this.aUsdFund.transfer.show(bankRelationships[0]);
                            }
                        } else {
                            writeTransferError.innerText = obj.serverError.message;
                            writeTransferError.style.display = 'block'
                        }
                    }
                });
        })
    }

    private validate() {
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