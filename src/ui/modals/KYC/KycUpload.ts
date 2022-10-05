import KycBase from "./KycBase";
import KycUploadHtml from '../../../html/modal/Kyc/KycUpload.html';
import KYCForm from "../KYCForm";


export default class KycUpload extends KycBase {


    constructor(kycForm: KYCForm) {
        super(kycForm);
    }

    public render() {
        let template = Handlebars.compile(KycUploadHtml);
        return template({});
    }

    public show() {
        this.showFieldset('.kycUpload', 'Upload documents')
    }

    public bindEvents() {
        this.bindFileUploads();

        let upload_prev = document.getElementById('upload_prev');
        upload_prev?.addEventListener('click', (evt) => {
            this.kycForm.kycDisclosures.show();
        })
        let upload_next = document.getElementById('upload_next');
        upload_next?.addEventListener('click', (evt) => {
            if (!this.validateRequiredFields('.kycUpload')) return;

            this.kycForm.kycAccountAgreement.show();
        })

    }


}