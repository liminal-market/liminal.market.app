import TransfersListHtml from '../../../html/modal/Funding/TransfersList.html'
import HandlebarHelpers from "../../../util/HandlebarHelpers";
import UserService from "../../../services/backend/UserService";
import Moralis from "moralis";
import {TransferDirectionEnum} from "../../../enums/TransferDirectionEnum";
import {Transfer} from "../../../dto/alpaca/Transfer";

export default class TransfersList {
    moralis: typeof Moralis;
    private userService: UserService;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
        this.userService = new UserService(this.moralis);
    }


    public async render(direction: TransferDirectionEnum, transfers: Transfer[]) {

        HandlebarHelpers.registerHelpers();

        let transfersTemplate = Handlebars.compile(TransfersListHtml);

        return transfersTemplate({Direction: direction, transfers: transfers})
    }

    public bindEvents() {
        let deleteTransfers = document.querySelectorAll('.deleteTransfer');
        for (let i = 0; i < deleteTransfers.length; i++) {
            deleteTransfers[i]?.addEventListener('click', async (evt) => {
                evt.preventDefault();

                if (!confirm('Are you sure you want to cancel this withdraw request?')) {
                    return;
                }

                let id = (deleteTransfers[i] as HTMLElement).dataset['id'];
                if (!id) return;

                let userService = new UserService(this.moralis);
                await userService.deleteTransfer(id)
                    .then(() => {
                        let statusTd = document.getElementById('status_' + id);
                        if (statusTd) {
                            statusTd.innerText = 'CANCELED';
                        }
                        let deleteTd = document.getElementById('delete_' + id);
                        deleteTd?.remove();
                    })
            })
        }

    }

}