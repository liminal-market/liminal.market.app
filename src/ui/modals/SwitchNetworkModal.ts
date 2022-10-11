import WrongNetworkHtml from '../../html/modal/WrongNetwork.html';
import NetworkInfo from "../../networks/NetworkInfo";
import Modal from "./Modal";
import WalletHelper from "../../util/WalletHelper";
import GeneralError from "../../errors/GeneralError";
import ErrorInfo from "../../errors/ErrorInfo";
import Network from "../../networks/Network";


export default class SwitchNetworkModal {
    moralis: typeof Moralis;
    selectedNetwork? : Network;
    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public show() {
        let template = Handlebars.compile(WrongNetworkHtml);
        let networks = NetworkInfo.getNetworks();
        let content = template({networks: networks});

        let modal = new Modal();
        modal.showModal('Switch network', content, false, async () => {
            if (!this.selectedNetwork) return;

            let walletHelper = new WalletHelper(this.moralis);
            await walletHelper.switchNetwork(this.selectedNetwork)
        });

        let setNetworkLinks = document.querySelectorAll('.setNetwork');
        setNetworkLinks.forEach(setNetworkLink => {
            setNetworkLink.addEventListener('click', async (evt) => {
                evt.preventDefault();

                let dataset = (evt.target as HTMLElement).dataset;
                this.selectedNetwork = NetworkInfo.getNetworkInfoByChainId(parseInt(dataset.chainid!));
                if (!this.selectedNetwork) throw new GeneralError('Could not find chainId:' + dataset.chainid);

                let walletHelper = new WalletHelper(this.moralis);
                let successAddingNetwork = await walletHelper.switchNetwork(this.selectedNetwork)
                    .catch((error : GeneralError) => {
                        let jsSwitchNetworkNotWorking = document.getElementById('jsSwitchNetworkNotWorking');
                        if (!jsSwitchNetworkNotWorking) throw error;

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

                    let elements = document.querySelectorAll(".liminal_market_connect_wallet");
                    if (elements.length > 0) {
                        elements[0].dispatchEvent(new MouseEvent('click'))
                        return;
                    }
                }
            })
        })
    }
}