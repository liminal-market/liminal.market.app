import KYCEditFormHtml from '../../html/modal/KYCEditModal.html';
import Modal from "./Modal";
import Progress from "../elements/Progress";
import KYCService from "../../services/blockchain/KYCService";
import NetworkInfo from "../../networks/NetworkInfo";
import LoadingHelper from "../../util/LoadingHelper";
import CloudError from "../../errors/CloudError";
import CountryHelper from "../../util/CountryHelper";
import UserService from "../../services/backend/UserService";
import FormHelper from "../../util/FormHelper";

export default class KYCEditForm {
    modal: Modal;
    timeout?: any = undefined;
    onHide: () => void;

    constructor(onHide: () => void) {
        this.modal = new Modal();
        this.onHide = onHide;
    }

    public async showKYCForm() {
        let userService = new UserService(Moralis);
        let account = await userService.getAccount();
        if (!account) {
            this.modal.showModal('KYC & AML', 'You must be logged in.', false, () => {
            });
            return;
        }

        let template = Handlebars.compile(KYCEditFormHtml);
        let content = template({countries: CountryHelper.Countries});

        this.modal.showModal('KYC & AML', content, true, () => {
        });
        this.fillForm(account);


        this.bindListeners();
        let submitKYC = document.getElementById('submitKYC');
        if (!submitKYC) return;

        submitKYC.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let submitBtn = (evt.target as HTMLElement);
            LoadingHelper.setLoading(submitBtn);

            let progress = new Progress();
            progress.show('Register KYC with broker', 33, false, ['submitKYC']);

            let params = FormHelper.getParams('#kyc_wizard_form')

            let networkInfo = NetworkInfo.getInstance();
            params.chainId = networkInfo.ChainId;

            let kycService = new KYCService(Moralis);
            let result = await kycService.updateKYCInfo(params)
                .catch((reason: any) => {
                    let cloudError = new CloudError(reason);
                    LoadingHelper.removeLoading();
                });

            if (result) {
                LoadingHelper.removeLoading();
                await this.modal.hideModal();
            }

        })

    }


    private bindListeners() {

        let immediate_family_exposed_yes = document.getElementById('immediate_family_exposed_yes') as HTMLInputElement;
        immediate_family_exposed_yes.addEventListener('change', (evt) => {
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


    }

    private discloseReaction(event: Event, elementId: string, show: boolean) {
        let input = event.target as HTMLInputElement;
        if (input?.checked) {
            let fieldset = document.getElementById(elementId) as HTMLElement;
            if (fieldset) {
                if (show) {
                    fieldset.classList.remove('hidden')
                } else {
                    fieldset.classList.add('hidden')
                }
            }
        }
    }

    private fillForm(account: any) {
        this.findElement(account.contact);
        this.findElement(account.identity);
        this.findElement(account.disclosures);
    }

    private findElement(obj: any) {
        let properties = Object.getOwnPropertyNames(obj);
        for (let i = 0; i < properties.length; i++) {
            let element = document.getElementById(properties[i]) as HTMLInputElement;
            let value = obj[properties[i]];

            if (typeof value == "boolean") {
                if (value) {
                    element = document.getElementById(properties[i] + '_yes') as HTMLInputElement;
                } else {
                    element = document.getElementById(properties[i] + '_no') as HTMLInputElement;
                }
                if (element) {
                    element.checked = true;
                }
            } else if (element) {
                if (element.tagName == 'SELECT' && Array.isArray(value)) {
                    let select = document.getElementById(properties[i]) as HTMLSelectElement;
                    for (let b = 0; b < select.options.length; b++) {
                        if (value.includes(select.options[b].value)) {
                            select.options[b].selected = true;
                        }
                    }
                } else {
                    element.value = value;
                }
            }

        }
    }
}