import Modal from "../Modal";
import UserService from "../../../services/backend/UserService";
import KycActionRequiredHtml from '../../../html/modal/Kyc/KycActionRequired.html';
import WeDontKnowWhyHtml from '../../../html/modal/Kyc/ActionRequired/WeDontKnowWhy.html'
import KycResultMessage from "../../../dto/KycResultMessage";


import IDENTITY_VERIFICATION from '../../../html/modal/Kyc/ActionRequired/IDENTITY_VERIFICATION.html'
import ADDRESS_VERIFICATION from '../../../html/modal/Kyc/ActionRequired/ADDRESS_VERIFICATION.html'
import AFFILIATED from '../../../html/modal/Kyc/ActionRequired/AFFILIATED.html'
import CONTROL_PERSON from '../../../html/modal/Kyc/ActionRequired/CONTROL_PERSON.html'
import COUNTRY_NOT_SUPPORTED from '../../../html/modal/Kyc/ActionRequired/COUNTRY_NOT_SUPPORTED.html'
import DATE_OF_BIRTH from '../../../html/modal/Kyc/ActionRequired/DATE_OF_BIRTH.html'
import FAMILY_MEMBER_PEP from '../../../html/modal/Kyc/ActionRequired/FAMILY_MEMBER_PEP.html'
import INVALID_IDENTITY_PASSPORT from '../../../html/modal/Kyc/ActionRequired/INVALID_IDENTITY_PASSPORT.html'
import PEP from '../../../html/modal/Kyc/ActionRequired/PEP.html'
import SELFIE_VERIFICATION from '../../../html/modal/Kyc/ActionRequired/SELFIE_VERIFICATION.html'
import TAX_IDENTIFICATION from '../../../html/modal/Kyc/ActionRequired/TAX_IDENTIFICATION.html'
import VISA_TYPE_OTHER from '../../../html/modal/Kyc/ActionRequired/VISA_TYPE_OTHER.html'
import W8BEN_CORRECTION from '../../../html/modal/Kyc/ActionRequired/W8BEN_CORRECTION.html'
import FormHelper from "../../../util/FormHelper";
import FileUpload from "../../elements/FileUpload";
import KycValidatorError from "../../../errors/cloud/KycValidatorError";
import FormValidator from "../../../util/FormValidator";
import KYCService from "../../../services/blockchain/KYCService";
import LoadingHelper from "../../../util/LoadingHelper";
import ExecuteTradeButton from "../../elements/tradepanel/ExecuteTradeButton";


export default class KycActionRequired {
    modal: Modal;
    templates: Map<string, string>;
    executeTradeButton: ExecuteTradeButton;

    constructor(executeTradeButton: ExecuteTradeButton) {
        this.modal = new Modal();
        this.templates = new Map();
        this.executeTradeButton = executeTradeButton;

        this.templates.set('WeDontKnowWhyHtml', WeDontKnowWhyHtml);
        this.templates.set('ADDRESS_VERIFICATION', ADDRESS_VERIFICATION);
        this.templates.set('AFFILIATED', AFFILIATED);
        this.templates.set('CONTROL_PERSON', CONTROL_PERSON);
        this.templates.set('COUNTRY_NOT_SUPPORTED', COUNTRY_NOT_SUPPORTED);
        this.templates.set('DATE_OF_BIRTH', DATE_OF_BIRTH);
        this.templates.set('FAMILY_MEMBER_PEP', FAMILY_MEMBER_PEP);
        this.templates.set('IDENTITY_VERIFICATION', IDENTITY_VERIFICATION);
        this.templates.set('INVALID_IDENTITY_PASSPORT', INVALID_IDENTITY_PASSPORT);
        this.templates.set('PEP', PEP);
        this.templates.set('SELFIE_VERIFICATION', SELFIE_VERIFICATION);
        this.templates.set('TAX_IDENTIFICATION', TAX_IDENTIFICATION);
        this.templates.set('VISA_TYPE_OTHER', VISA_TYPE_OTHER);
        this.templates.set('W8BEN_CORRECTION', W8BEN_CORRECTION);

        FileUpload.registerHandler();
    }

    public async show() {
        let userService = new UserService();
        let kycResult = await userService.kycActionRequired()
        if (!kycResult) return;

        let kycInfo = this.getKycMessages(kycResult.messages);

        let template = Handlebars.compile(KycActionRequiredHtml);
        let content = template({
            json: JSON.stringify(kycResult),
            KycInfo: kycInfo,
            Other: kycResult.additional_information,
            SubmitData: kycInfo.indexOf('<input') != -1
        })

        this.modal.showModal('Action required', content, false, () => {
        }, false);

        let kycActionRequiredForm = document.getElementById('kycActionRequiredForm');
        kycActionRequiredForm?.addEventListener('submit', async (evt) => {
            evt.preventDefault();
            this.hideError();

            let submitBtn = document.getElementById('kycActionRequiredSubmit') as HTMLElement;
            LoadingHelper.setLoading(submitBtn);

            let formValidator = new FormValidator('#kycActionRequiredForm')
            if (!formValidator.validateRequiredFields()) return;

            let params = FormHelper.getParams('#kycActionRequiredForm');

            let kycService = new KYCService();
            await kycService.updateDocuments(params)
                .then(() => {
                    let kycActionRequiredDiv = document.getElementById('kycActionRequiredDiv') as HTMLElement;
                    kycActionRequiredDiv?.classList.add('hidden');

                    let kycActionRequiredSubmittedDiv = document.getElementById('kycActionRequiredSubmittedDiv') as HTMLElement;
                    kycActionRequiredSubmittedDiv?.classList.remove('hidden');
                    this.executeTradeButton.checkKycIsDone()
                    this.executeTradeButton.renderButton();
                })
                .catch(reason => {
                    this.showError(reason);
                }).finally(() => {
                    LoadingHelper.removeLoading();
                });

        })

        for (let i = 0; i < FileUpload.fileUploads.length; i++) {
            FileUpload.fileUploads[i].bindEvents();
        }
    }


    private getKycMessages(messages: KycResultMessage[]) {
        let kycInfo = '';
        for (let i = 0; i < messages.length; i++) {
            let htmlTemplate = this.templates.get(messages[i].key);
            if (!htmlTemplate) {
                //TODO: Here we should to logger, critical that we dont know why
                continue;
            }
            let template = Handlebars.compile(htmlTemplate)
            kycInfo += template({message: messages[i].message})
        }


        if (kycInfo == '') {
            let html = this.templates.get('WeDontKnowWhyHtml');
            let template = Handlebars.compile(html);
            kycInfo = template({});
        }

        return kycInfo;
    }

    private hideError() {
        let kycActionRequiredError = document.getElementById('kycActionRequiredError');
        if (!kycActionRequiredError) return;
        kycActionRequiredError.style.display = 'none'
    }

    private showError(reason: any) {
        let kycActionRequiredError = document.getElementById('kycActionRequiredError');
        if (!kycActionRequiredError) return;

        kycActionRequiredError.innerHTML = 'Error occurred while saving your documents. Reason:' + reason;
        kycActionRequiredError.style.display = 'block'
    }
}