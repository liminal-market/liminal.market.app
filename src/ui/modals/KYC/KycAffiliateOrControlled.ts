import KycBase from "./KycBase";
import KYCForm from "../KYCForm";
import KycAffiliateOrControlledHtml from "../../../html/modal/Kyc/KycAffiliateOrControlled.html";
import CountryHelper from "../../../util/CountryHelper";


export default class KycAffiliateOrControlled extends KycBase {

    constructor(kycForm: KYCForm) {
        super(kycForm);
    }

    public render() {
        let kycAffiliateOrControlledTemplate = Handlebars.compile(KycAffiliateOrControlledHtml)
        return kycAffiliateOrControlledTemplate({countries: CountryHelper.Countries});
    }

    public bindEvents() {
        this.bindFileUploads();

        let company_country = document.getElementById('company_country') as HTMLInputElement;
        company_country?.addEventListener('change', (evt) => {
            let select = evt.target as HTMLSelectElement;
            if (select.value === 'USA') {
                this.setRequired('company_state');
            } else {
                this.removeRequired('company_state');
            }
        })
    }

    public validate() {
        let company_name = document.getElementById('company_name');
        if (!company_name) return true;

        return this.validateRequiredFields('#affiliate_or_controlled')
    }
}