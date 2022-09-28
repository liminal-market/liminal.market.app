import KycHelper from "./KycHelper";
import KYCForm from "../KYCForm";
import KycDisclosureHtml from "../../../html/modal/Kyc/KycDisclosures.html";
import KycImmediateFamilyHtml from "../../../html/modal/Kyc/KycImmediateFamily.html";
import KycAffiliateOrControlledHtml from "../../../html/modal/Kyc/KycAffiliateOrControlled.html";
import KycTrustedContactHtml from "../../../html/modal/Kyc/KycTrustedContact.html";
import CountryHelper from "../../../util/CountryHelper";

export default class KycDisclosures extends KycHelper {

    kycForm: KYCForm;

    constructor(kycForm: KYCForm) {
        super();
        this.kycForm = kycForm;
    }

    public render() {

        let template = Handlebars.compile(KycDisclosureHtml);
        let kycImmediateFamilyTemplate = Handlebars.compile(KycImmediateFamilyHtml);
        let kycAffiliateOrControlledTemplate = Handlebars.compile(KycAffiliateOrControlledHtml);
        let kycTrustedContactTemplate = Handlebars.compile(KycTrustedContactHtml);
        return template({
            ImmediateFamilyHtml: kycImmediateFamilyTemplate({}),
            AffiliateOrControlledHtml: kycAffiliateOrControlledTemplate({countries: CountryHelper.Countries}),
            KycTrustedContactHtml: kycTrustedContactTemplate({})
        });

    }

    public bindEvents() {

        let immediate_family_exposed_yes = document.getElementById('immediate_family_exposed_yes') as HTMLInputElement;
        immediate_family_exposed_yes.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'immediate_family', true);
        })

        let immediate_family_exposed_no = document.getElementById('immediate_family_exposed_no') as HTMLInputElement;
        immediate_family_exposed_no.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'immediate_family', false);
        })


        let is_affiliated_exchange_or_finra_yes = document.getElementById('is_affiliated_exchange_or_finra_yes') as HTMLInputElement;
        is_affiliated_exchange_or_finra_yes.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'affiliate_or_controlled', true)
        })

        let is_affiliated_exchange_or_finra_no = document.getElementById('is_affiliated_exchange_or_finra_no') as HTMLInputElement;
        is_affiliated_exchange_or_finra_no.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'affiliate_or_controlled', false);
        })

        let is_control_person_yes = document.getElementById('is_control_person_yes') as HTMLInputElement;
        is_control_person_yes.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'affiliate_or_controlled', true)
        })

        let is_control_person_no = document.getElementById('is_control_person_no') as HTMLInputElement;
        is_control_person_no.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'affiliate_or_controlled', false);
        })

        let account_approval_letter_input = document.getElementById('account_approval_letter_input') as HTMLInputElement;
        account_approval_letter_input.addEventListener('change', (evt) => {
            evt.preventDefault();
            this.hideFileRelatedInfo();

            let files = account_approval_letter_input.files;
            if (!files) return;

            let file = files[0];
            if (!file) {
                this.showFileRelatedInfo('No file selected. Please select file.');
            }

            if (file.size > 8 * 1024 * 1024 * 10) {
                this.showFileRelatedInfo('File ' + file.name + ' is to large. Files cannot be larger then 10MB. You need to make it smaller before submitting your application');
                return;
            }

            let reader = new FileReader();
            reader.addEventListener('load', () => {
                let account_approval_letter = document.getElementById('account_approval_letter')! as HTMLInputElement;
                account_approval_letter.value = reader.result as string;
            });

            reader.addEventListener('error', () => {
                this.showFileRelatedInfo('Could not read file ' + file.name + '. Either the file is corrupt or your browser does not allow us to read it');
            });
            reader.readAsDataURL(file);
        })
    }


    private discloseReaction(event: MouseEvent, elementId: string, show: boolean) {
        let input = event.target as HTMLInputElement;
        if (input?.checked) {
            let fieldset = document.getElementById(elementId) as HTMLElement;
            if (!fieldset) return;

            if (show) {
                fieldset.classList.remove('hidden')
            } else {
                fieldset.classList.add('hidden')
            }

        }
    }

    private showFileRelatedInfo(text: string) {
        let fileRelatedInfo = document.getElementById('fileRelatedInfo')! as HTMLElement;

        fileRelatedInfo.innerHTML = text;
        fileRelatedInfo.classList.remove('hidden')
    }

    private hideFileRelatedInfo() {
        let fileRelatedInfo = document.getElementById('fileRelatedInfo')! as HTMLElement;
        fileRelatedInfo.classList.add('hidden');
    }

}