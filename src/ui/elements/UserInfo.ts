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
            provider: ''
        }

        let template = Handlebars.compile(UserInfoElement);
        let html = template(obj);

        userInfoDiv.innerHTML = html;

        let userInfoAction = document.getElementById('userInfoAction');
        userInfoAction?.addEventListener('click', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();

            let userInfoDropdown = document.getElementById('userInfoDropdown');
            if (!userInfoDropdown) return;

            userInfoDropdown.classList.toggle('d-none');
            userInfoDropdown.addEventListener('click', (evt) => {
                evt.stopPropagation();
            })
        });

        let disconnectFromNetwork = document.getElementById('disconnectFromNetwork');
        disconnectFromNetwork?.addEventListener('click', (evt) => {
            evt.preventDefault();

            this.moralis.User.logOut();
            window.location.reload();
        });

        this.bindUserActionEvents();
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
}