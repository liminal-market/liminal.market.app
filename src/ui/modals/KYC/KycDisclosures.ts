import KycBase from "./KycBase";
import KYCForm from "../KYCForm";
import KycDisclosureHtml from "../../../html/modal/Kyc/KycDisclosures.html";
import KycAffiliateOrControlled from "./KycAffiliateOrControlled";
import KycImmediateFamily from "./KycImmediateFamily";


export default class KycDisclosures extends KycBase {
    kycAffiliatedOrControlled: KycAffiliateOrControlled;
    kycImmediateFamily: KycImmediateFamily;

    constructor(kycForm: KYCForm) {
        super(kycForm);

        this.kycAffiliatedOrControlled = new KycAffiliateOrControlled(this.kycForm);
        this.kycImmediateFamily = new KycImmediateFamily(this.kycForm);
    }

    public render(edit = false) {
        let template = Handlebars.compile(KycDisclosureHtml);
        return template({edit: edit});
    }

    public show() {
        if (this.kycForm.steps == 5) {
            document.getElementById('disclosures_next')!.innerText = 'Next: Agreements';
        } else {
            document.getElementById('disclosures_next')!.innerText = 'Next: Upload documents';
        }
        this.showFieldset('.kycDisclosures', 'Disclosures');
    }

    public bindEvents() {

        let is_affiliated_exchange_or_finra = document.getElementById('is_affiliated_exchange_or_finra') as HTMLInputElement;
        is_affiliated_exchange_or_finra?.addEventListener('click', (evt) => {
            this.loadAffiliatedOrControlComponent('is_affiliated_exchange_or_finra');
        });

        let is_control_person = document.getElementById('is_control_person') as HTMLInputElement;
        is_control_person?.addEventListener('click', (evt) => {
            this.loadAffiliatedOrControlComponent('is_control_person');
        });

        let immediate_family_exposed = document.getElementById('immediate_family_exposed') as HTMLInputElement;
        immediate_family_exposed?.addEventListener('click', (evt) => {
            this.loadPep('immediate_family_exposed')
        });
        let is_politically_exposed = document.getElementById('is_politically_exposed') as HTMLInputElement;
        is_politically_exposed?.addEventListener('click', (evt) => {
            this.uncheck('immediate_family_exposed')
        });
        let none_above = document.getElementById('none_above') as HTMLInputElement;
        none_above?.addEventListener('click', (evt) => {
            this.removeMissingInfo('none_above_error');
            none_above.removeAttribute('aria-invalid');
        })

        let prev = document.getElementById('disclosures_prev');
        prev?.addEventListener('click', (evt) => {
            this.kycForm.kycTrustedContact.show();
        });

        let next = document.getElementById('disclosures_next');
        next?.addEventListener('click', (evt) => {
            if (!this.validateFields()) return;
            if (this.kycForm.steps == 5) {
                this.kycForm.kycAccountAgreement.show();
            } else {
                this.kycForm.kycUpload.show();
            }
        })

    }

    private loadAffiliatedOrControlComponent(elementId: string) {
        if (elementId == 'is_affiliated_exchange_or_finra') {
            this.uncheck('is_control_person')
        } else {
            this.uncheck('is_affiliated_exchange_or_finra')
        }

        let element = document.getElementById(elementId) as HTMLInputElement;
        let extra = document.getElementById(elementId + '_extra');
        if (!extra) return;

        if (element.checked) {
            extra.innerHTML = this.kycAffiliatedOrControlled.render();
            this.kycAffiliatedOrControlled.bindEvents();
        } else {
            extra.innerHTML = '';
        }
    }

    private loadPep(elementId: string) {
        if (elementId == 'immediate_family_exposed') {
            this.uncheck('is_politically_exposed')
        } else {
            this.uncheck('immediate_family_exposed')
        }

        let element = document.getElementById(elementId) as HTMLInputElement;
        let extra = document.getElementById(elementId + '_extra');
        if (!extra) return;

        if (element.checked) {
            extra.innerHTML = this.kycImmediateFamily.render();
            this.kycImmediateFamily.bindEvents();
        } else {
            extra.innerHTML = '';
        }
    }

    private uncheck(elementId: string) {
        let element = document.getElementById(elementId) as HTMLInputElement;
        element.checked = false;
        let extra = document.getElementById(elementId + '_extra')!;
        extra.innerHTML = '';
    }

    private validateFields() {
        if (!this.validateRequiredFields('.kycDisclosures')) return false;
        if (!this.kycImmediateFamily.validate()) return false;
        if (!this.kycAffiliatedOrControlled.validate()) return false;

        let is_affiliated_exchange_or_finra = document.getElementById('is_affiliated_exchange_or_finra') as HTMLInputElement;
        let is_control_person = document.getElementById('is_control_person') as HTMLInputElement;
        let is_politically_exposed = document.getElementById('is_politically_exposed') as HTMLInputElement;
        let immediate_family_exposed = document.getElementById('immediate_family_exposed') as HTMLInputElement;
        let none_above = document.getElementById('none_above') as HTMLInputElement;

        if (!none_above.checked && !is_affiliated_exchange_or_finra.checked && !is_control_person.checked
            && !is_politically_exposed.checked && !immediate_family_exposed.checked
        ) {
            this.setMissingInfo('none_above_error', 'You must select, "None of the above apply to me or my family." if nothing is selected', 'none_above');
            return false;
        }

        if (none_above.checked && (is_affiliated_exchange_or_finra.checked || is_control_person.checked
            || is_politically_exposed.checked || immediate_family_exposed.checked
        )) {
            this.setMissingInfo('none_above_error', 'You cannot have "None of the above apply to me or my family." selected and other options selected. Please select only one', 'none_above');
            return false;
        }

        return true;
    }
}