import Modal from "../Modal";
import WaitingHtml from '../../../html/modal/Sandbox/Waiting.html'
import ContractInfo from "../../../contracts/ContractInfo";
import WalletHelper from "../../../util/WalletHelper";

export default class Waiting {
    modal: Modal;

    constructor() {
        this.modal = new Modal();
    }

    public show() {
        let contractInfo = ContractInfo.getContractInfo();
        let template = Handlebars.compile(WaitingHtml);

        this.modal.showModal('Sandbox registration - waiting', template({aUSDAddress: contractInfo.AUSD_ADDRESS}), false, undefined, false);

        let addToWallet = document.getElementById('addTokenToWallet');
        addToWallet?.addEventListener('click', async (evt) => {
            let walletHelper = new WalletHelper();
            let result = await walletHelper.addTokenToWallet(contractInfo.AUSD_ADDRESS, 'aUSD', () => {
                this.showCopyField();
            })
            if (!result) this.showCopyField();

        })
    }

    private showCopyField() {

        let needToCopy = document.getElementById('needToCopy');
        if (!needToCopy) return;

        needToCopy.classList.remove('d-none');
    }
}