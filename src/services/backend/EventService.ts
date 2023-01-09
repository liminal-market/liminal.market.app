import ExecuteOrderButton from "../../ui/elements/tradepanel/ExecuteOrderButton";
import App from "../../main";
import NetworkInfo from "../../networks/NetworkInfo";
import AuthenticateService from "./AuthenticateService";
import UserInfo from "../../ui/elements/UserInfo";
import {isJSON, roundBigNumber, roundNumber} from "../../util/Helper";
import KycApproved from "../../ui/modals/KYC/KycApproved";
import {Exception} from "handlebars";
import OrderExecutedModal from "../../ui/elements/tradepanel/OrderExecutedModal";
import OrderProgress from "../../ui/elements/tradepanel/OrderProgress";
import FakeAUSDFund from "../../ui/modals/Funding/FakeAUSDFund";
import AUsdBalance from "../../ui/elements/AUsdBalance";
import BigNumber from "bignumber.js";
import {ethers} from "ethers";

export default class EventService {

    public static register() {
        UserInfo.onUserLoggedIn.push(async () => {
            let eventService = new EventService();
            eventService.listen();
        });
    }

    public listen() {
        let network = App.Network;
        let eventSource = new EventSource(network.ServerUrl + '/listenForChanges?jwt=' + App.User.token);
        eventSource.onmessage = async (e: any) => {
            let data = e.data;
            console.log(e);
            if (!data || data == 'ok') return;

            let obj = isJSON(data);
            if (!obj) {
                console.log('data is not json:', data)
                return;
            }

            if (obj.methodName == 'OrderExecuted') {
                let orderExecutedModal = new OrderExecutedModal();
                orderExecutedModal.show(obj);
            } else if (obj.methodName == 'SendingToExchange') {
                await OrderProgress.getInstance().setProgressText(1, 'Received order, sending to stock exchange', obj.hash);
            } else if (obj.methodName == 'OrderExecutedWritingBlockchain') {
                await OrderProgress.getInstance().setProgressText(1, 'Order executed, writing to blockchain', '');

            } else if (obj.methodName == 'UpdateAUsdOnChain') {
                FakeAUSDFund.writingToChain();
            } else if (obj.methodName == 'BalanceSet') {

                if (App.Network.TestNetwork) {
                    let sandbox_registration_waiting = document.getElementById('sandbox_registration_waiting')
                    if (sandbox_registration_waiting) {
                        let sandbox_funding_status = document.getElementById('sandbox_funding_status')
                        if (sandbox_funding_status) sandbox_funding_status.innerHTML = 'Funding done 🎉 - Reloading page'

                        location.reload();
                        return;
                    }
                }
                let aUsdBalance = new AUsdBalance();
                let balance = ethers.utils.formatEther(obj.balance)
                aUsdBalance.updateUIBalance(new BigNumber(balance));
                ExecuteOrderButton.Instance?.renderButton();

            } else if (obj.methodName == 'AccountValidated') {
                if (App.Network.TestNetwork) {
                    let li_sandbox_account_status = document.getElementById('li_sandbox_account_status');
                    if (li_sandbox_account_status) {
                        li_sandbox_account_status.setAttribute('aria-busy', 'false');
                        let sandbox_account_status = document.getElementById('sandbox_account_status')
                        if (sandbox_account_status) sandbox_account_status.innerHTML = 'Account created 🎉'
                        let li_sandbox_funding_status = document.getElementById('li_sandbox_funding_status')
                        if (li_sandbox_funding_status) {
                            li_sandbox_funding_status.setAttribute('aria-busy', 'true');
                        }
                    }

                    clearInterval(ExecuteOrderButton.Instance.kycIdDoneTimeout);
                    ExecuteOrderButton.Instance.renderButton();

                    return;
                }

                let hasBuyingPower = obj.hasBuyingPower;
                if (!hasBuyingPower) {
                    let kycApproved = new KycApproved();
                    kycApproved.show();
                } else if (ExecuteOrderButton.Instance) {
                    ExecuteOrderButton.Instance.hasBuyingPower = obj.hasBuyingPower;
                    clearInterval(ExecuteOrderButton.Instance.kycIdDoneTimeout);
                    ExecuteOrderButton.Instance.renderButton();
                }
            }


        }
    }
}