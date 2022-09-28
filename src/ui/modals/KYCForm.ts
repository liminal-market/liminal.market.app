import KYCFormHtml from '../../html/modal/KYCModal.html';
import Modal from "./Modal";
import KycContact from "./KYC/KycContact";
import KycIdentity from "./KYC/KycIdentity";
import KycDisclosures from "./KYC/KycDisclosures";
import KycAccountAgreement from "./KYC/KycAccountAgreement";
import KycTrustedContact from "./KYC/KycTrustedContact";

export default class KYCForm {
    modal: Modal;
    timeout?: any = undefined;
    onHide: () => void;

    kycContact: KycContact;
    kycIdentity: KycIdentity;
    kycDisclosures: KycDisclosures
    kycAccountAgreement: KycAccountAgreement;
    kycTrustedContact: KycTrustedContact;

    constructor(onHide: () => void) {
        this.modal = new Modal();
        this.onHide = onHide;

        this.kycContact = new KycContact(this);
        this.kycIdentity = new KycIdentity(this);
        this.kycDisclosures = new KycDisclosures(this);
        this.kycAccountAgreement = new KycAccountAgreement(this);
        this.kycTrustedContact = new KycTrustedContact(this);
    }

    public showKYCForm() {

        let template = Handlebars.compile(KYCFormHtml);
        let obj = {
            KycContactHtml: this.kycContact.render(),
            KycIdentityHtml: this.kycIdentity.render(),
            KycDisclosureHtml: this.kycDisclosures.render(),
            KycTrustedContactHtml: this.kycTrustedContact.render(),
            KycAccountAgreementHtml: this.kycAccountAgreement.render()
        }
        let content = template(obj);
        this.modal.showModal('KYC & AML', content, true, () => {
            this.clearTimeout()
        });

        this.kycContact.bindEvents();
        this.kycIdentity.bindEvents();
        this.kycDisclosures.bindEvents();
        this.kycTrustedContact.bindEvents();
        this.kycAccountAgreement.bindEvents();
    }


    public clearTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
    }


}