import Modal from "../Modal";
import FakeAUSDFund from "../Funding/FakeAUSDFund";
import KycApprovedHtml from '../../../html/modal/Kyc/KycApproved.html';
import ExecuteOrderButton from "../../elements/tradepanel/ExecuteOrderButton";

export default class KycApproved {

    public show() {
        let template = Handlebars.compile(KycApprovedHtml);
        let modal = new Modal();
        modal.showModal('Account approved', template({}));

        let fundAccount = document.getElementById('kycApprovedFund');
        fundAccount?.addEventListener('click', (evt) => {
            modal.hideModal();

            let ausdFund = new FakeAUSDFund();
            ausdFund.showAUSDFakeFund()
        })

        if (ExecuteOrderButton.Instance) {
            clearInterval(ExecuteOrderButton.Instance.kycIdDoneTimeout);
            ExecuteOrderButton.Instance.renderButton();
        }
    }

}