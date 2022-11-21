import KYCFormHtml from '../../html/modal/KYCModal.html';
import Modal from "./Modal";
import KycContact from "./KYC/KycContact";
import KycIdentity from "./KYC/KycIdentity";
import KycDisclosures from "./KYC/KycDisclosures";
import KycAccountAgreement from "./KYC/KycAccountAgreement";
import KycTrustedContact from "./KYC/KycTrustedContact";
import KycUpload from "./KYC/KycUpload";


export default class KYCForm {
    moralis: typeof Moralis;
    steps = 5;
    modal: Modal;
    timeout?: any = undefined;
    onHide: () => void;
    activeFieldsetSelector = '.kycContact';

    kycContact: KycContact;
    kycIdentity: KycIdentity;
    kycDisclosures: KycDisclosures
    kycTrustedContact: KycTrustedContact;
    kycUpload: KycUpload;
    kycAccountAgreement: KycAccountAgreement;

    constructor(moralis: typeof Moralis, onHide: () => void) {
        this.moralis = moralis;
        this.modal = new Modal();
        this.onHide = onHide;

        this.kycContact = new KycContact(this);
        this.kycIdentity = new KycIdentity(this);
        this.kycTrustedContact = new KycTrustedContact(this);
        this.kycDisclosures = new KycDisclosures(this);
        this.kycUpload = new KycUpload(this);
        this.kycAccountAgreement = new KycAccountAgreement(this);
    }

    public show(className: string) {

        let kycForm = new KYCForm(this.moralis, () => {
        });
        type ObjectKey = keyof typeof kycForm;
        const ble = className as ObjectKey;
        (this[ble] as any).show();

        this.activeFieldsetSelector = className;
    }

    public showKYCForm(edit = false) {

        let template = Handlebars.compile(KYCFormHtml);
        let obj = {
            KycContactHtml: this.kycContact.render(),
            KycIdentityHtml: this.kycIdentity.render(),
            KycDisclosureHtml: this.kycDisclosures.render(),
            KycTrustedContactHtml: this.kycTrustedContact.render(),
            KycAccountAgreementHtml: this.kycAccountAgreement.render(),
            KycUploadHtml: this.kycUpload.render()
        }
        let content = template(obj);
        let newModal = this.modal.showModal('KYC & AML', content, true, () => {
            this.clearTimeout();
            this.onHide();
        }, false);

        let taxResidence = document.getElementById('country_of_tax_residence') as HTMLSelectElement;
        if (taxResidence) {
            this.steps = (taxResidence.value == 'USA') ? 5 : 6;
        }

        if (newModal) {
            this.kycContact.bindEvents();
            this.kycIdentity.bindEvents();
            this.kycTrustedContact.bindEvents();
            this.kycDisclosures.bindEvents();
            this.kycUpload.bindEvents();
            this.kycAccountAgreement.bindEvents();

            document.getElementById('kyc_wizard_form')!.addEventListener('keyup', (evt) => {
                if (evt.key == 'Enter') {
                    evt.preventDefault();
                    evt.stopPropagation();
                }
            })
        }
        this.kycContact.show();
    }

    public setSteps(steps: number) {
        this.steps = steps;
    }

    public clearTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
    }

}