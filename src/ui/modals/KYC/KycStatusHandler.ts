import KycStatus from "../../../dto/KycStatus";
import KycActionRequired from "./KycActionRequired";
import ExecuteTradeButton from "../../elements/tradepanel/ExecuteTradeButton";
import Modal from "../Modal";
import KYCForm from "../KYCForm";

export default class KycStatusHandler {

    /*
    SUBMITTED	/fixtures/status=SUBMITTED/fixtures/
ACTION_REQUIRED	/fixtures/status=ACTION_REQUIRED/fixtures/
APPROVAL_PENDING	/fixtures/status=APPROVAL_PENDING/fixtures/
APPROVED	/fixtures/status=APPROVED/fixtures/
REJECTED	/fixtures/status=REJECTED/fixtures/
ACTIVE	/fixtures/status=ACTIVE/fixtures/
DISABLED	/fixtures/status=DISABLED/fixtures/
ACCOUNT_CLOSED	/fixtures/status=ACCOUNT_CLOSED/fixtures/
     */

    kycResponse: KycStatus;
    executeTradeButton: ExecuteTradeButton;

    constructor(kycResponse: KycStatus, executeTradeButton: ExecuteTradeButton) {
        this.kycResponse = kycResponse;
        this.executeTradeButton = executeTradeButton;
    }

    public getButtonText() {
        let txt = 'Finish KYC';
        switch (this.kycResponse.status) {
            case 'SUBMITTED':
            case 'ONBOARDING':
            case 'INACTIVE':
            case 'APPROVED':
            case 'EDITED':
            case 'APPROVAL_PENDING':
                txt = 'Submitted to KYC processor';
                break;
            case 'ACTION_REQUIRED':
                txt = 'Action required. Click to continue';
                break;
            case 'REJECTED':
                txt = 'Your application was rejected';
                break;
            case 'DISABLED':
                txt = 'Your account has been disabled';
                break;
            case 'ACTIVE':
            case 'ACCOUNT_UPDATED':
                txt = 'You are approved. KYC is being sent to blockchain. Give it few minutes';
                break;
            case 'ACCOUNT_CLOSED':
                txt = 'Your account has been closed';
                break;
        }
        return txt + '<small>Click for more info</small>';
    }

    public getButtonClickEvent(executeTradeButton: ExecuteTradeButton) {
        switch (this.kycResponse.status) {
            case 'SUBMITTED':
            case 'ONBOARDING':
            case 'INACTIVE':
            case 'APPROVED':
            case 'EDITED':
            case 'APPROVAL_PENDING':
                return this.showModal('Application is being processed',
                    "You need to wait for KYC to be approved. Then you'll be able to do trades. " +
                    "This usually takes few minutes for the first submission, but can take longer for second submission. " +
                    "We will email you when you are approved or if there are problems<br /><br />" +
                    "If this status has been for more than 1 day, and you haven't gotten any email from us. Please email us at " +
                    "<a target='_blank' href='mailto:info@liminal.market?subject=My application is being processed for to long&body=Hi, can you help me to find out what the problem is, the KYC process has not changed for some time? My name is _______ and I used the email _______ to register at liminal.market'>info@liminal.market</a>");
            case 'ACTION_REQUIRED':
                return async () => {
                    let kycActionRequired = new KycActionRequired(executeTradeButton)
                    await kycActionRequired.show();
                };
            case 'REJECTED':
                return this.showModal('Application was rejected',
                    "Your application has been rejected during KYC process.<br /><br />" +
                    "We don't have the information on why that happened, but you can email us at " +
                    "<a target='_blank' href='mailto:info@liminal.market?subject=My application was rejected&body=Hi, can you help me to find out what the problem is? My name is _______ and I used the email _______ to register at liminal.market'>info@liminal.market</a>" +
                    " and we can find out, and we should be able to solve it together.");
            case 'DISABLED':
                return this.showModal('Application was disabled',
                    "Your account has been disabled.<br /><br />" +
                    "We don't have the information on why that happened, but you can email us at " +
                    "<a target='_blank' href='mailto:info@liminal.market?subject=My application was disabled&body=Hi, can you help me to find out what the problem is? My name is _______ and I used the email _______ to register at liminal.market'>info@liminal.market</a>" +
                    " and we can find out, and we should be able to solve it together.");

            case 'ACCOUNT_CLOSED':
                return this.showModal('Application was closed',
                    "Your account has been closed.<br /><br />" +
                    "We don't have the information on why that happened, but you can email us at " +
                    "<a target='_blank' href='mailto:info@liminal.market?subject=My application was closed&body=Hi, can you help me to find out what the problem is? My name is _______ and I used the email _______ to register at liminal.market'>info@liminal.market</a>" +
                    " and we can find out, and we should be able to solve it together.");
            case 'ACCOUNT_UPDATED':
            case 'ACTIVE':
                return this.showModal('Account soon ready', 'Your account has been approved...<br /><br/>' +
                    '..but, after we approve your account, we write the information to the blockchain.' +
                    ' This usually takes just few(2-3) minutes.<br /><br/> If this is taking longer, ' +
                    'please email us at <a target="_blank" href="mailto:info@liminal.market?subject=KYC is being written to blockchain&body=Hi, can you help me to find out what the problem is? My name is _______ and I used the email _______ to register at liminal.market">info@liminal.market</a>');

        }

        return () => {
            let kycForm = new KYCForm(async () => {
                await this.executeTradeButton.renderButton();
            });
            kycForm.showKYCForm();
        };
    }

    public showModal(title: string, content: string) {
        return () => {
            let modal = new Modal();
            modal.showModal(title, content);
        }
    }
}