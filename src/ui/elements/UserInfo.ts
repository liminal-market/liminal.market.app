import UserService from "../../services/backend/UserService";
import Moralis from "Moralis";
import UserInfoElement from '../../html/elements/UserInfo.html'
import {shortEth} from "../../util/Helper";
import NetworkInfo from "../../networks/NetworkInfo";
import ProviderInfo from "../../wallet/ProviderInfo";
import KycEditNameForm from "../modals/KYC/KycEditNameForm";
import KycEditContactForm from "../modals/KYC/KycEditContactForm";
import KycEditTrustedContact from "../modals/KYC/KycEditTrustedContact";
import AUsdBalance from "./AUsdBalance";
import TestNetworkBannerHtml from "../../html/elements/TestNetworkBanner.html";
import SwitchNetworkModal from "../modals/SwitchNetworkModal";
import ExecuteTradeButton from "./tradepanel/ExecuteTradeButton";
import LoadingHelper from "../../util/LoadingHelper";

export default class UserInfo {
    moralis: typeof Moralis;
    user?: Moralis.Attributes;
    userService: UserService;
    providerInfo: ProviderInfo;

    public constructor(moralis: typeof Moralis, providerInfo: ProviderInfo, user?: Moralis.Attributes) {
        this.moralis = moralis;
        this.user = user;
        this.userService = new UserService(this.moralis);
        this.providerInfo = providerInfo;
    }

    public async render(elementId: string) {
        if (!this.user) return;

        this.listenForWalletChanges();
        this.loadUserMenuUI(elementId);
        this.loadIfTestNetwork();
        this.ifTradePage();

        let aUsdBalance = new AUsdBalance(this.moralis, this.user);
        await aUsdBalance.loadAUSDBalanceUI();

    }

    private listenForWalletChanges() {
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
    }


    private loadUserMenuUI(elementId: string) {
        if (!this.user) return;

        let userInfoDiv = document.getElementById(elementId);
        if (!userInfoDiv) return;

        let networkInfo = NetworkInfo.getInstance();
        let obj: any = {
            ethAddress: this.user.get('ethAddress'),
            shortEthAddress: shortEth(this.user.get('ethAddress')),
            walletName: this.providerInfo.WalletName,
            networkName: networkInfo.ChainName + ((networkInfo.TestNetwork) ? ' - (Test network)' : ''),
            blockchainExplorer: networkInfo.BlockExplorer + '/address/',
            internalWallet: this.providerInfo.InternalWallet,
            chainId: networkInfo.ChainId
        }

        let template = Handlebars.compile(UserInfoElement);
        let html = template(obj);

        userInfoDiv.innerHTML = html;

        this.bindEvents();
        this.bindUserActionEvents();
    }

    private bindUserActionEvents() {
        let editName = document.getElementById('editName');
        editName?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let kycModal = new KycEditNameForm(this.moralis);
            await kycModal.show();
        })

        let editContact = document.getElementById('editContact');
        editContact?.addEventListener('click', async (evt) => {
            evt.preventDefault();
            let kycModal = new KycEditContactForm(this.moralis);
            await kycModal.show();

        })

        let editTrustedContact = document.getElementById('editTrustedContact');
        editTrustedContact?.addEventListener('click', async (evt) => {
            evt.preventDefault();
            let kycModal = new KycEditTrustedContact(this.moralis);
            await kycModal.show();

        })
    }


    private loadIfTestNetwork() {
        if (!this.moralis.isWeb3Enabled()) return;
        if (!NetworkInfo.getInstance().TestNetwork) return;

        let header = document.querySelector('header');
        if (!header) return;

        let template = Handlebars.compile(TestNetworkBannerHtml)
        header.insertAdjacentHTML('beforebegin', template({}));

        let switch_from_test_network = document.getElementById('switch_from_test_network')
        switch_from_test_network?.addEventListener('click', (evt) => {
            let switchNetworkModal = new SwitchNetworkModal(this.moralis);
            switchNetworkModal.show();
        })
    }

    private ifTradePage() {
        let btn = document.getElementById('liminal_market_execute_trade');
        if (!btn) return;

        ExecuteTradeButton.Instance.renderButton();
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
        });

        let disconnectFromNetwork = document.getElementById('disconnectFromNetwork');
        disconnectFromNetwork?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let userService = new UserService(this.moralis);
            await userService.logOut()
            window.location.reload();
        });

        let wallet = document.getElementById('wallet');
        wallet?.addEventListener('click', async (evt) => {
            evt.preventDefault();
            LoadingHelper.setLoading(evt.target as HTMLElement);
            console.log(this.moralis.connector);
            this.moralis.connector.magicUser.connect.showWallet()
                .finally(() => {
                    LoadingHelper.removeLoading();
                    userInfoDropdown?.classList.add('d-none');
                });
        })

    }
}
