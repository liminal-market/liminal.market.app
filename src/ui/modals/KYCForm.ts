import KYCFormHtml from '../../html/modal/KYCModal.html';
import Modal from "./Modal";
import Progress from "../elements/Progress";
import KYCService from "../../services/blockchain/KYCService";
import NetworkInfo from "../../networks/NetworkInfo";
import {serialize} from "../../util/Helper";
import LoadingHelper from "../../util/LoadingHelper";
import CloudError from "../../errors/CloudError";
import CountryHelper from "../../util/CountryHelper";

export default class KYCForm {
    modal : Modal;
    timeout? : any = undefined;
    onHide : () => void;
    constructor(onHide : () => void) {
        this.modal = new Modal();
        this.onHide = onHide;
    }

    public showKYCForm() {

        let countries = CountryHelper.Countries;
        let template = Handlebars.compile(KYCFormHtml);
        let content = template({countries: countries});


        this.modal.showModal('KYC & AML', content, true, () => {this.clearTimeout()});

        this.bindListeners();
        let submitKYC = document.getElementById('submitKYC');
        if (!submitKYC) return;

        submitKYC.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let submitBtn = (evt.target as HTMLElement);
            LoadingHelper.setLoading(submitBtn);

            let progress = new Progress();
            progress.show('Register KYC with broker', 33, false, ['submitKYC']);

            const form = document.getElementById('kyc_wizard_form') as HTMLFormElement;
            let data = new FormData(form);
            let params = serialize(data);

            let networkInfo = NetworkInfo.getInstance();
            params.chainId = networkInfo.ChainId;

            let kycService = new KYCService(Moralis);
            let result = await kycService.saveKYCInfo(params)
                .catch((reason : any) => {
                    let cloudError = new CloudError(reason);
                    LoadingHelper.removeLoading();
                });

            if (result) {
                await this.showWaiting();
            }

        })

    }

    private async showWaiting() {
        let kyc_reg = document.getElementById('kyc_reg');
        if (!kyc_reg) return;
        let waiting_for_kyc_reg = document.getElementById('waiting_for_kyc_reg');
        if (!waiting_for_kyc_reg) return;

        kyc_reg.classList.add('d-none');
        waiting_for_kyc_reg.classList.remove('d-none');

        await this.checkKycStatus();

    }

    public clearTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
    }

    public async checkKycStatus() {
        let kycService = new KYCService(Moralis);
        let isValid = await kycService.hasValidKYC()

        if (isValid) {
            clearTimeout();
            this.modal.hideModal();
            this.onHide();
        } else {
            this.timeout = setTimeout(() => {this.checkKycStatus()}, 5 * 1000)
        }
    }

    public loadNames() {
            let characters = [
                {given_name : 'Leslie', family_name : 'Knope', email_address:'leslie.knope' },
                {given_name : 'April', family_name : 'Ludgate', email_address:'april.ludgate' },
                {given_name : 'Jerry', family_name : 'Gergich', email_address:'jerry.gergich' },
                {given_name : 'Tom', family_name : 'Haverford', email_address:'tom.haverford' },
                {given_name : 'Donna', family_name : 'Meagle', email_address:'donna.meagle' },
                {given_name : 'Andy', family_name : 'Dwyer', email_address:'andy.dwyer' },
                {given_name : 'Ann', family_name : 'Perkins', email_address:'ann.perkins' },
                {given_name : 'Ben', family_name : 'Wyatt', email_address:'ben.wyatt' },
                {given_name : 'Chris', family_name : 'Traeger', email_address:'chris.traeger' },
                {given_name : 'Jean-Ralphio', family_name : 'Saperstein', email_address:'jean-ralphio.saperstein' },
                {given_name : 'Councilman', family_name : 'Jamm', email_address:'jamm' }
            ]

            let idx = Math.floor(Math.random() * characters.length) % characters.length;
            let character = characters[idx];
            (document.getElementById('given_name') as HTMLInputElement).value = character.given_name;
            (document.getElementById('family_name') as HTMLInputElement).value = character.family_name;
    }


    private bindListeners() {
        let country_of_tax_residence = document.getElementById('country_of_tax_residence') as HTMLInputElement;
        if (country_of_tax_residence) {
            country_of_tax_residence.addEventListener('keyup', () => {
                let div = document.getElementById('visa_type_div') as HTMLElement;
                if (!div) return;

                if (country_of_tax_residence.value.toUpperCase() == 'USA') {
                    div.style.display = 'block';
                } else {
                    div.style.display = 'none';
                }
            })
        }

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
            this.discloseReaction(evt,'affiliate_or_controlled', false);
        })

        let is_control_person_yes = document.getElementById('is_control_person_yes') as HTMLInputElement;
        is_control_person_yes.addEventListener('click', (evt) => {
            this.discloseReaction(evt, 'affiliate_or_controlled', true)
        })

        let is_control_person_no = document.getElementById('is_control_person_no') as HTMLInputElement;
        is_control_person_no.addEventListener('click', (evt) => {
            this.discloseReaction(evt,'affiliate_or_controlled', false);
        })


    }

    private discloseReaction(event : MouseEvent, elementId : string, show : boolean) {
        let input = event.target as HTMLInputElement;
        if (input?.checked) {
            let fieldset = document.getElementById(elementId) as HTMLElement;
            if (fieldset) {
                if (show) {
                    fieldset.classList.remove('hidden')
                } else {
                    fieldset.classList.add('hidden')                }
            }
        }
    }
}