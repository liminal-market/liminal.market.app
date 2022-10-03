import KycBase from "./KycBase";
import KYCForm from "../KYCForm";
import KycImmediateFamilyHtml from "../../../html/modal/Kyc/KycImmediateFamily.html";

export default class KycImmediateFamily extends KycBase {
    constructor(kycForm: KYCForm) {
        super(kycForm);
    }

    public render() {
        let kycImmediateFamilyTemplate = Handlebars.compile(KycImmediateFamilyHtml);
        return kycImmediateFamilyTemplate({})
    }

    public bindEvents() {

    }

    validate() {
        let disclosure_given_name = document.getElementById('disclosure_given_name')
        if (!disclosure_given_name) return true;

        return this.validateRequiredFields('#immediate_family')
    }
}