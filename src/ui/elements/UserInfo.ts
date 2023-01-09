import UserService from "../../services/backend/UserService";
import UserInfoElement from '../../html/elements/UserInfo.html'
import {shortEth} from "../../util/Helper";
import ProviderInfo from "../../wallet/ProviderInfo";
import KycEditNameForm from "../modals/KYC/KycEditNameForm";
import KycEditContactForm from "../modals/KYC/KycEditContactForm";
import KycEditTrustedContact from "../modals/KYC/KycEditTrustedContact";
import AUsdBalance from "./AUsdBalance";
import TestNetworkBannerHtml from "../../html/elements/TestNetworkBanner.html";
import SwitchNetworkModal from "../modals/SwitchNetworkModal";
import ExecuteOrderButton from "./tradepanel/ExecuteOrderButton";
import LoadingHelper from "../../util/LoadingHelper";
import WalletHelper from "../../util/WalletHelper";
import App from "../../main";
import AuthenticateService from "../../services/backend/AuthenticateService";

type ListenerAction = (...args: Array<any>) => void;

export default class UserInfo {
    authenticationService: AuthenticateService;
    userService: UserService;
    providerInfo: ProviderInfo;
    walletHelper: WalletHelper;
    walletLoaded = false;
    static onUserLoggedIn: Array<ListenerAction> = [];

    public constructor(providerInfo: ProviderInfo) {
        this.authenticationService = new AuthenticateService();
        this.userService = new UserService();
        this.providerInfo = providerInfo;
        this.walletHelper = new WalletHelper();
    }

    public async render(elementId: string) {


        this.listenForWalletChanges();
        this.loadUserMenuUI(elementId);
        this.loadIfTestNetwork();
        this.ifTradePage();

        LoadingHelper.removeLoading();

        let aUsdBalance = new AUsdBalance();
        await aUsdBalance.loadAUSDBalanceUI();


    }

    private listenForWalletChanges() {
        /*
        TODO: need fixing
        this.moralis.onChainChanged(function () {
            location.reload();
        });
        this.moralis.onAccountChanged(function () {
            location.reload();
        });
        this.moralis.onDisconnect(function () {
            location.reload();
        });
        this.moralis.onConnect(function () {
            location.reload();
        });

         */
    }

    private async loadUserMenuUI(elementId: string) {
        let userInfoDiv = document.getElementById(elementId);
        if (!userInfoDiv) return;

        let networkInfo = App.Network;
        let obj: any = {
            ethAddress: App.User.address,
            shortEthAddress: shortEth(App.User.address),
            walletName: this.providerInfo.WalletName,
            networkName: networkInfo.ChainName + ((networkInfo.TestNetwork) ? ' - (Test network)' : ''),
            blockchainExplorer: networkInfo.BlockExplorer + '/address/',
            isMagic: await this.walletHelper.isMagic(),
            chainId: networkInfo.ChainId
        }

        let template = Handlebars.compile(UserInfoElement);
        let html = template(obj);

        userInfoDiv.innerHTML = html;

        this.bindEvents();
        this.bindUserActionEvents();

        for (let i = 0; i < UserInfo.onUserLoggedIn.length; i++) {
            UserInfo.onUserLoggedIn[i]();
        }

        if (networkInfo.TestNetwork) {
            let edit_account = document.querySelector('.edit_account');
            edit_account?.classList.add('hidden');
        }
    }

    private bindUserActionEvents() {
        let editName = document.getElementById('editName');
        editName?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let kycModal = new KycEditNameForm();
            await kycModal.show();
        })

        let editContact = document.getElementById('editContact');
        editContact?.addEventListener('click', async (evt) => {
            evt.preventDefault();
            let kycModal = new KycEditContactForm();
            await kycModal.show();

        })

        let editTrustedContact = document.getElementById('editTrustedContact');
        editTrustedContact?.addEventListener('click', async (evt) => {
            evt.preventDefault();
            let kycModal = new KycEditTrustedContact();
            await kycModal.show();

        })
    }

    private bindEvents() {
        let userInfoDropdown = document.getElementById('userInfoDropdown');
        if (!userInfoDropdown) return;

        document.body.addEventListener('click', (evt) => {
            if (userInfoDropdown && !userInfoDropdown.classList.contains('d-none')) {
                userInfoDropdown.classList.add('d-none');
                evt.stopPropagation();
                evt.preventDefault();
            }
        })


        let userInfoAction = document.getElementById('userInfoAction');
        userInfoAction?.addEventListener('click', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();

            userInfoDropdown?.classList.toggle('d-none');
            userInfoDropdown?.addEventListener('click', (evt) => {
                evt.stopPropagation();
            })

            WalletHelper.hideMagicWallet();
        });

        let disconnectFromNetwork = document.getElementById('disconnectFromNetwork');
        disconnectFromNetwork?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            await this.authenticationService.logOut()
            window.location.reload();
        });

        let wallet = document.getElementById('wallet');

        wallet?.addEventListener('click', async (evt) => {
            evt.preventDefault();
            LoadingHelper.setLoading(evt.target as HTMLElement);

            if (this.walletLoaded) {
                let magicIframe = document.querySelector('.magic-iframe') as HTMLElement;
                if (magicIframe) magicIframe.style.display = 'block'
                LoadingHelper.removeLoading();
                userInfoDropdown?.classList.add('d-none');
                return;
            }

            App.User.provider.magic.connect.showWallet()
                .catch(async (e: any) => {
                    this.walletLoaded = false;
                    if (e.message.indexOf('User denied account access') != -1) {
                        await this.authenticationService.logOut()
                        alert('You have been logged out of you wallet and need to log back in. We will now reload the page and you can log in.');
                        location.reload();
                        return;
                    }
                    throw e;
                });

            let closeMenuInterval = setInterval(() => {
                let magicIframe = document.querySelector('.magic-iframe') as HTMLElement;
                if (!magicIframe) clearInterval(closeMenuInterval);

                if (magicIframe && magicIframe.style.display == 'block') {
                    LoadingHelper.removeLoading();
                    userInfoDropdown?.classList.add('d-none');
                    this.walletLoaded = true;
                    clearInterval(closeMenuInterval);
                }
            }, 1000);


        })


        let switch_network = document.getElementById('switch_network');
        switch_network?.addEventListener('click', (evt) => {
            evt.preventDefault();

            let switchNetworkModal = new SwitchNetworkModal();
            switchNetworkModal.show();
        })

    }


    private loadIfTestNetwork() {
        if (!App.User.provider) return;
        if (!App.Network.TestNetwork) return;

        let header = document.querySelector('header');
        if (!header) return;

        let template = Handlebars.compile(TestNetworkBannerHtml)
        header.insertAdjacentHTML('beforebegin', template({}));

        let switch_from_test_network = document.getElementById('switch_from_test_network')
        switch_from_test_network?.addEventListener('click', (evt) => {
            let switchNetworkModal = new SwitchNetworkModal();
            switchNetworkModal.show();
        })
    }

    private ifTradePage() {
        let btn = document.getElementById('liminal_market_execute_trade');
        if (!btn) return;

        ExecuteOrderButton.Instance.renderButton();
    }
}
