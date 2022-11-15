import Modal from "../Modal";
import SelectFundingType from "./Relationship/SelectFundingType";
import ACHRelationship from "./Relationship/ACHRelationship";
import TransferNotification from "./TransferNotification";
import WireTransferRelationship from "./Relationship/WireTransferRelationship";
import UserService from "../../../services/backend/UserService";
import TransferNotified from "./TransferNotified";
import {TransferDirectionEnum} from "../../../enums/TransferDirectionEnum";
import FirstTransferSetup from "./FirstTransferSetup/FirstTransferSetup";

export default class AUSDFund {

    moralis: typeof Moralis;
    modal: Modal;

    selectFundingType: SelectFundingType;
    achRelationship: ACHRelationship;
    wireTransferRelationship: WireTransferRelationship;

    firstTransferSetup: FirstTransferSetup;
    transferNotification: TransferNotification;
    transferNotified: TransferNotified;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
        this.modal = new Modal();

        this.selectFundingType = new SelectFundingType(this);
        this.achRelationship = new ACHRelationship(this);
        this.wireTransferRelationship = new WireTransferRelationship(this);

        this.firstTransferSetup = new FirstTransferSetup(moralis, this);
        this.transferNotification = new TransferNotification(moralis, this);
        this.transferNotified = new TransferNotified(this);
    }

    public async show() {
        let userService = new UserService(this.moralis);
        let bankRelationship = await userService.getBankRelationship();
        if (bankRelationship) {
            let transfers = await userService.getLatestTransfers(TransferDirectionEnum.Incoming);
            if (transfers.length > 0) {
                await this.transferNotification.show(bankRelationship, transfers);
            } else {
                this.firstTransferSetup.show(bankRelationship);
            }
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