import UserService from "../../services/backend/UserService";
import Moralis from "Moralis";
import UserInfoElement from '../../html/elements/UserInfo.html'
import {roundBigNumber, roundNumber, shortEth} from "../../util/Helper";
import AUSDService from "../../services/blockchain/AUSDService";
import NetworkInfo from "../../networks/NetworkInfo";
import ProviderInfo from "../../wallet/ProviderInfo";
import AUSDFund from "../modals/AUSDFund";

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


    public async renderUserInfo(elementId: string) {
        if (!this.user) return;

        this.listenForWalletChanges();

        this.loadUserMenuUI(elementId);
        await this.loadAUSDBalanceUI();
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

    private toggleOffHours(e: MouseEvent) {
        let input = e.target as HTMLInputElement;
        let isOffHours = input.checked;

        this.userService.setOffHours(isOffHours);

        let executeTradeBtn = document.getElementById('execute-trade');
        if (!executeTradeBtn) return;

        if (input.checked) {
            executeTradeBtn.innerHTML = "Execute trade";
        } else {
            executeTradeBtn.innerHTML = 'TODO: Off hours text';
        }
    }

    public async loadAUSDBalanceUI() {
        if (!this.user) return;


        let aUSDService = new AUSDService(this.moralis);
        let aUsdValue = await aUSDService.getAUSDBalanceOf(this.user.get('ethAddress'));
        aUsdValue = roundBigNumber(aUsdValue);

        let frontpageAUSDBalance = document.getElementById('front_page_aUSD_balance');
        if (frontpageAUSDBalance) frontpageAUSDBalance.innerHTML = '$' + aUsdValue;

        let userInfoAUSDBalance = document.getElementById('user_info_ausd_balance')
        if (userInfoAUSDBalance) userInfoAUSDBalance.innerHTML = '$' + aUsdValue;

        let networkInfo = NetworkInfo.getInstance();
        let fund_accountBtns = document.querySelectorAll('.fund_account');
        fund_accountBtns.forEach(element => {
            let aUSDFundingModal = new AUSDFund(this.moralis);
            if (networkInfo.TestNetwork) {
                element.innerHTML = 'Click for some aUSD';
                element.addEventListener('click', (evt) => {
                    evt.preventDefault();
                    aUSDFundingModal.showAUSDFakeFund(() => {


                    });
                });

            } else {
                element.innerHTML = 'Fund your account';
                element.addEventListener('click', (evt) => {
                    evt.preventDefault();
                    aUSDFundingModal.showAUSDFund(() => {
                    });
                })
            }
        })
        if (aUsdValue.isLessThan(51)) {
            let frontpage_fund_account = document.getElementById('frontpage_fund_account');
            if (!frontpage_fund_account) return;
            frontpage_fund_account.classList.remove('d-none');
        }
    }

    private loadUserMenuUI(elementId : string) {
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
        if (userInfoAction) {
            userInfoAction.addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();

                let userInfoDropdown = document.getElementById('userInfoDropdown');
                if (!userInfoDropdown) return;

                userInfoDropdown.classList.toggle('d-none');
                userInfoDropdown.addEventListener('click', (evt) => {
                    evt.stopPropagation();
                })
            })
        }

        let disconnectFromNetwork = document.getElementById('disconnectFromNetwork');
        if (disconnectFromNetwork) {
            disconnectFromNetwork.addEventListener('click', (evt) => {
                evt.preventDefault();

                this.moralis.User.logOut();
                window.location.reload();
            })
        }
    }
}