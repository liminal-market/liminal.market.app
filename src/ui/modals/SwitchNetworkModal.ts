import SwitchNetworkHtml from '../../html/modal/SwitchNetwork.html';
import NetworkInfo from "../../networks/NetworkInfo";
import Modal from "./Modal";
import WalletHelper from "../../util/WalletHelper";
import GeneralError from "../../errors/GeneralError";
import Network from "../../networks/Network";
import {NetworkType} from "../../networks/NetworkType";
import UserService from "../../services/backend/UserService";
import AuthenticateService from "../../services/backend/AuthenticateService";


export default class SwitchNetworkModal {
    selectedNetwork?: Network;

    constructor() {
    }

    public show() {
        let template = Handlebars.compile(SwitchNetworkHtml);
        let testNetworks = NetworkInfo.getNetworks(NetworkType.Testnet);
        let mainNetworks = NetworkInfo.getNetworks(NetworkType.Mainnet);
        let content = template({testNetworks, mainNetworks});

        let modal = new Modal();
        modal.showModal('Switch network', content, false, undefined, false);

        let setNetworkLinks = document.querySelectorAll('.setNetwork');
        setNetworkLinks.forEach(setNetworkLink => {
            setNetworkLink.addEventListener('click', async (evt) => {
                evt.preventDefault();

                let dataset = (evt.target as HTMLElement).dataset;
                this.selectedNetwork = NetworkInfo.getNetworkInfoByChainId(parseInt(dataset.chainid!));
                if (!this.selectedNetwork) throw new GeneralError('Could not find chainId:' + dataset.chainid);

                let walletHelper = new WalletHelper();
                let successAddingNetwork = await walletHelper.switchNetwork(this.selectedNetwork)
                    .catch((error: GeneralError) => {
                        let jsSwitchNetworkNotWorking = document.getElementById('jsSwitchNetworkNotWorking');
                        if (!jsSwitchNetworkNotWorking) throw error;

                        if (error.message.toLowerCase().indexOf('user rejected') != -1) return;

                        jsSwitchNetworkNotWorking.classList.remove('d-none');
                        let switchNetworkInfo = document.getElementById('switchNetworkInfo')!;
                        switchNetworkInfo.classList.add('d-none');

                        (document.getElementById('switchChainId') as HTMLInputElement).value = dataset.chainid! + ' or it might be: ' + '0x' + parseInt(dataset.chainid!).toString(16);
                        (document.getElementById('switchChainName')! as HTMLInputElement).value = this.selectedNetwork!.Name;
                        (document.getElementById('switchCurrencyName')! as HTMLInputElement).value = this.selectedNetwork!.NativeCurrencyName;
                        (document.getElementById('switchSymbol')! as HTMLInputElement).value = this.selectedNetwork!.NativeSymbol;
                        (document.getElementById('switchDecimal') ! as HTMLInputElement).value = this.selectedNetwork!.NativeDecimal.toString();
                        (document.getElementById('switchRpcUrl')! as HTMLInputElement).value = this.selectedNetwork!.RpcUrl;

                    });

                if (successAddingNetwork) {
                    modal.hideModal();

                    let authenticationService = new AuthenticateService();
                    await authenticationService.logOut();
                    setTimeout(() => {
                        location.reload();
                    }, 1000);

                }
            })
        })
    }
}