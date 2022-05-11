import UserInfo from "../elements/UserInfo";
import AuthenticateService from "../../services/backend/AuthenticateService";
import walletButton from '../../html/elements/ConnectWalletButton.html';
import selectWalletProvider from '../../html/modal/SelectWalletProvider.html';
import Modal from "./Modal";
import NetworkInfo from "../../networks/NetworkInfo";
import {shortEth} from "../../util/Helper";
import CookieHelper from "../../util/CookieHelper";
import ProviderInfo from "../../wallet/ProviderInfo";
import WalletHelper from "../../util/WalletHelper";
import ErrorInfo from "../../errors/ErrorInfo";



export default class ConnectWallet {
    moralis: typeof Moralis;
    public static Provider: string;
    modal : Modal;
    providerInfo : ProviderInfo;

    public constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
        this.modal = new Modal();
        this.providerInfo = new ProviderInfo(null);
    }

    public renderButton(elementId: string): void {
        if (!document.getElementById(elementId)) return;

        document.getElementById(elementId)!.innerHTML = walletButton;

        let elements = document.querySelectorAll(".liminal_market_connect_wallet");
        elements.forEach(el => {
            el.removeEventListener('click', () => this.chooseWalletProvider());
            el.addEventListener('click', () => this.chooseWalletProvider())
        });
    }

    public chooseWalletProvider() {
        this.modal.showModal('Connect to a wallet', selectWalletProvider);

        this.setupCheckboxes();
        this.setupProviders();
    }

    private setupCheckboxes() {
        let checkboxes: any = {all:false, tos: false, pp: false, cookie: false};

        let cookieHelper = new CookieHelper(document);
        let tosConfirmed = cookieHelper.getCookieValue('tos');
        if (tosConfirmed) {

                checkboxes = {tos: true, pp: true}
                this.toggleProviders(checkboxes);
                document.getElementById('tos_pp_cookie_panel')!.classList.add('d-none');

            return;
        }


        let inputs = document.querySelectorAll('#tos_pp_cookie_panel input');
        inputs.forEach(input => {
            let checkbox = input as HTMLInputElement;

            checkbox.addEventListener('click', () => {
                let name = checkbox.getAttribute('name')!;
                if (name == 'all') {
                    let valueToSet = checkbox.checked;
                    inputs.forEach(tmp => {
                        let otherInput = tmp as HTMLInputElement;
                        checkboxes[otherInput.name] = valueToSet;
                        otherInput.checked = valueToSet;

                    })
                } else {
                    checkboxes[name] = checkbox.checked;
                }

                this.toggleProviders(checkboxes);
            })
        })
    }

    private setupProviders() {
        let anchors = document.querySelectorAll('#wallet_connector_panel .provider');
        anchors.forEach(element => {
            element.addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();

                let provider = (evt.currentTarget as HTMLAnchorElement).dataset.provider!;
                this.connectWallet(provider)
            }, {capture:true})
        })

    }

    public toggleProviders(checkboxes: any) {
        let cookieHelper = new CookieHelper(document);

        if (checkboxes.tos && checkboxes.pp) {
            cookieHelper.setCookie('tos', new Date().toDateString());

            let walletHelper = new WalletHelper();
            if (walletHelper.isWebview(window.navigator.userAgent)) {
                this.modal.hideModal();
                this.connectWallet('');
            } else {
                document.getElementById('wallet_connector_panel')!.classList.remove('d-none')
            }
        } else {
            cookieHelper.deleteCookie('tos');
            document.getElementById('wallet_connector_panel')!.classList.add('d-none')
        }
    }

    private showUnsupportedNetworkMessage(connectionInfo : HTMLElement) {
        let str = 'The network you are connecting to is not supported.';
        str += 'Following networks are supported. '
        let networks = NetworkInfo.getNetworks();
        for (let i=0;i<networks.length;i++) {
            if (i != 0) str += ', ';
            str += networks[i].Name;
        }
        connectionInfo.innerHTML = str;
    }

    private connectWallet(providerName : string) {
        let authenticationService = new AuthenticateService(this.moralis);

        let cookieHelper = new CookieHelper(document);
        cookieHelper.setCookieProvider(providerName);

        authenticationService.authenticateUser(
            providerName,
            (walletConnectionInfo : any) => {
                this.web3EnabledResult(providerName, walletConnectionInfo);
            },
            async (user) => {
                let userInfo = new UserInfo(this.moralis, this.providerInfo, user);
                await userInfo.renderUserInfo('user_header_info');

                this.modal.hideModal();
            })
            .catch((reason) => {
                ErrorInfo.report(reason);
            });
    }

    private web3EnabledResult(providerName : string, walletConnectionInfo : any) {
        this.providerInfo = new ProviderInfo(walletConnectionInfo);

        let connectionInfo = document.getElementById(providerName + 'ConnectionInfo');
        if (!connectionInfo) return;

        connectionInfo.classList.replace('alert-warning', 'alert-info');
        let networkInfo = NetworkInfo.getInstance();
        if (this.providerInfo.ChainId != networkInfo.ChainId) {
            let userNetwork = NetworkInfo.getNetworkInfoByChainId(this.providerInfo.ChainId);
            if (userNetwork === null) {
                this.showUnsupportedNetworkMessage(connectionInfo);
            } else {
                NetworkInfo.setNetworkByChainId(this.providerInfo.ChainId)
            }
        }

        let str = 'Connecting to you wallet "' + this.providerInfo.WalletName + '" to address ' + shortEth(this.providerInfo.UserAddress);
        str += '. Open ' + this.providerInfo.WalletName + ' and <strong>Confirm</strong> the sign in.';
        connectionInfo.innerHTML = str;
        connectionInfo.classList.remove('d-none');
    }
}