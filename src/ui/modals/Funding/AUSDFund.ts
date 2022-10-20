import Modal from "../Modal";
import SelectFundingType from "./SelectFundingType";
import ACHRelationship from "./ACHRelationship";
import Transfer from "./Transfer";
import WireTransfer from "./WireTransfer";
import UserService from "../../../services/backend/UserService";
import ACHTransferInfo from "./ACHTransferInfo";
import WireTransferInfo from "./WireTransferInfo";

export default class AUSDFund {

    moralis: typeof Moralis;
    modal: Modal;

    selectFundingType: SelectFundingType;
    achRelationship: ACHRelationship;
    wireTransfer: WireTransfer;
    transfer: Transfer;
    achTransferInfo: ACHTransferInfo;
    wireTransferInfo: WireTransferInfo;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
        this.modal = new Modal();

        this.selectFundingType = new SelectFundingType(this);
        this.achRelationship = new ACHRelationship(this);
        this.transfer = new Transfer(moralis, this);
        this.wireTransfer = new WireTransfer(this);
        this.achTransferInfo = new ACHTransferInfo(this);
        this.wireTransferInfo = new WireTransferInfo(this);
    }

    public async show() {
        let userService = new UserService(this.moralis);
        let bankRelationship = await userService.getBankRelationship();
        if (bankRelationship) {
            await this.transfer.show(bankRelationship);
        } else {
            this.selectFundingType.show();
        }

    }

    public showError(elementId: string, reason: string) {
        let element = document.getElementById(elementId);
        if (element) {
            element.innerText = reason;
            element.style.display = 'block';
        }
    }

    public hideError(elementId: string) {
        let element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }
}