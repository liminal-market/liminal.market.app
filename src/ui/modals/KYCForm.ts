import KYCFormHtml from '../../html/modal/KYCModal.html';
import Modal from "./Modal";
import Progress from "../elements/Progress";
import KYCService from "../../services/blockchain/KYCService";
import NetworkInfo from "../../networks/NetworkInfo";
import {serialize} from "../../util/Helper";
import ErrorInfo from "../../errors/ErrorInfo";
import UserService from "../../services/backend/UserService";

export default class KYCForm {
    modal : Modal;
    timeout? : any = undefined;
    onHide : () => void;
    constructor(onHide : () => void) {
        this.modal = new Modal();
        this.onHide = onHide;
    }

    public showKYCForm() {

        let template = Handlebars.compile(KYCFormHtml);
        let content = template(null);


        this.modal.showModal('KYC & AML', content, true, () => {this.clearTimeout()});

        let networkInfo = NetworkInfo.getInstance();
        if (networkInfo.TestNetwork) {
            this.loadNames();
        }

        let submitKYC = document.getElementById('submitKYC');
        if (!submitKYC) return;

        submitKYC.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let submitBtn = (evt.target as HTMLElement);
            submitBtn.setAttribute('aria-busy', 'true');

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
                    ErrorInfo.report(reason);
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
        let userService = new UserService(Moralis);
        let ethAddress = userService.getEthAddress();

        let kycService = new KYCService(Moralis);
        let isValid = await kycService.hasValidKYC(ethAddress)

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
            (document.getElementById('email_address') as HTMLInputElement).value = character.email_address + '.' + (new Date().getTime()) + '@parks-and-rec-example.com';


    }


}