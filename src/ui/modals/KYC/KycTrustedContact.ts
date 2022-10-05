import KycBase from "./KycBase";
import KYCForm from "../KYCForm";
import KycTrustedContactHtml from '../../../html/modal/Kyc/KycTrustedContact.html';
import StringHelper from "../../../util/StringHelper";
import CountryHelper from "../../../util/CountryHelper";

import KycAccountAgreement from "./KycAccountAgreement";


export default class KycTrustedContact extends KycBase {
    edit = false;

    constructor(kycForm: KYCForm) {
        super(kycForm);
    }

    public render(edit = false) {
        this.edit = edit;

        let template = Handlebars.compile(KycTrustedContactHtml);
        return template({edit: edit, countries: CountryHelper.Countries});
    }

    public show() {
        this.showFieldset('.kycTrustedContact', 'Trusted contact')
    }

    public bindEvents() {
        let showPrev = document.getElementById('trustedContact_prev');
        showPrev?.addEventListener('click', (evt) => {
            this.kycForm.kycIdentity.show();
        })

        let showNext = document.getElementById('trustedContact_next');
        showNext?.addEventListener('click', (evt) => {
            if (!this.validate()) return;
            this.kycForm.kycDisclosures.show();
        })

        if (this.edit) {
            let kycAccount = new KycAccountAgreement(this.kycForm);
            if (!this.validate()) return;

            kycAccount.bindSubmitKyc(this.edit);
        }
    }

    private validate() {
        this.setMissingInfo('trusted_contact_missing_info', '');

        let trusted_first_name = document.getElementById('trusted_first_name') as HTMLInputElement;
        if (trusted_first_name && !StringHelper.isNullOrEmpty(trusted_first_name.value)) {
            let trusted_email = document.getElementById('trusted_email') as HTMLInputElement;
            let trusted_phone = document.getElementById('trusted_phone') as HTMLInputElement;
            let trusted_street_address = document.getElementById('trusted_street_address') as HTMLInputElement;
            let trusted_city = document.getElementById('trusted_city') as HTMLInputElement;
            let trusted_postal_code = document.getElementById('trusted_postal_code') as HTMLInputElement;
            let trusted_country = document.getElementById('trusted_country') as HTMLInputElement;

            if (StringHelper.isNullOrEmpty(trusted_email.value) && StringHelper.isNullOrEmpty(trusted_phone.value)
                && StringHelper.isNullOrEmpty(trusted_street_address.value)) {
                this.setMissingInfo('trusted_contact_missing_info', 'You need to fill in either email, phone or address');
                return;
            }

            if (!StringHelper.isNullOrEmpty(trusted_email.value) && trusted_email.value.indexOf('@') == -1) {
                this.setMissingInfo('trusted_contact_missing_info', 'Email is not valid. It must contain @ sign');
                return;
            }

            if (!StringHelper.isNullOrEmpty(trusted_street_address.value) &&
                (
                    StringHelper.isNullOrEmpty(trusted_city.value) ||
                    StringHelper.isNullOrEmpty(trusted_postal_code.value) ||
                    StringHelper.isNullOrEmpty(trusted_country.value)
                )
            ) {
                this.setMissingInfo('trusted_contact_missing_info', 'You need fill inn into City, Postal code and Country when filling the street address');
                return;
            }


        }

        return true;
    }

}