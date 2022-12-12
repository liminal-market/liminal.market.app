import NetworkInfo from "../../networks/NetworkInfo";
import FakeNativeTokenNeededHtml from '../../html/modal/FakeNativeTokenNeeded.html';
import NativeTokenNeededHtml from '../../html/modal/NativeTokenNeeded.html';
import Modal from "./Modal";
import UserService from "../../services/backend/UserService";

export default class NativeTokenNeeded {
    onNativeTokenArrived : () => void;
    timeOut?: any = undefined;
    modal: Modal;

    constructor(onNativeTokenArrived: () => void) {
        this.onNativeTokenArrived = onNativeTokenArrived;
        this.modal = new Modal();
    }

    public show() {
        let networkInfo = NetworkInfo.getInstance();
        let userService = new UserService();
        let ethAddress = userService.getEthAddress();

        if (networkInfo.TestNetwork) {
            let template = Handlebars.compile(FakeNativeTokenNeededHtml);
            let content = template({symbol:networkInfo.NativeSymbol, faucetUrl:networkInfo.FaucetUrl, ethAddress:ethAddress})
            this.modal.showModal('Get some ' + networkInfo.NativeSymbol, content, false, () => {
                this.cancelTimer()
            });
        } else {
            let template = Handlebars.compile(NativeTokenNeededHtml);
            let content = template({symbol:networkInfo.NativeSymbol, buyUrl:networkInfo.BuyUrl, ethAddress:ethAddress})
            this.modal.showModal('Get some ' + networkInfo.NativeSymbol, content, false, () => {
                this.cancelTimer()
            });
        }

        let link = document.getElementById('getNativeTokens');
        if (!link) return;

        link.addEventListener('click', async () => {
            let waitingForNativeToken = document.getElementById('waitingForNativeToken');
            waitingForNativeToken?.classList.remove('d-none');

            await this.checkForNativeTokens();

        })
    }

    public cancelTimer() {
        if (this.timeOut) clearTimeout(this.timeOut);
    }

    public async checkForNativeTokens() {
        let networkInfo = NetworkInfo.getInstance();
        let hasEnoughNativeTokens = await networkInfo.hasEnoughNativeTokens();
        if (hasEnoughNativeTokens) {
            this.modal.hideModal();
            this.onNativeTokenArrived();
        } else {
            this.timeOut = setTimeout(() => this.checkForNativeTokens(), 5 * 1000);
        }
    }
}