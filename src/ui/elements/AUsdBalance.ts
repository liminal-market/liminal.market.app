import AUSDService from "../../services/blockchain/AUSDService";
import {roundBigNumber} from "../../util/Helper";
import NetworkInfo from "../../networks/NetworkInfo";
import FakeAUSDFund from "../modals/Funding/FakeAUSDFund";
import AUSDFund from "../modals/Funding/AUSDFund";
import WithdrawModal from "../modals/Funding/WithdrawModal";
import UserService from "../../services/backend/UserService";

export default class AUsdBalance {
    user: any;
    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis, user: any) {
        this.user = user;
        this.moralis = moralis;
    }

    public static async forceLoadAUSDBalanceUI() {
        let userService = new UserService(Moralis);
        let user = userService.getUser();
        let ui = new AUsdBalance(Moralis, user)
        AUSDService.lastUpdate = undefined;
        await ui.loadAUSDBalanceUI();
    }

    public async loadAUSDBalanceUI() {
        if (!this.user) return;

        let userInfoAUsdBalance = document.getElementById('userInfoAUsdBalance');
        let frontpageAUsdBalance = document.getElementById('frontpageAUsdBalance');

        if (!userInfoAUsdBalance) return;

        if (!this.user.get('alpacaId')) {
            frontpageAUsdBalance?.classList.add('hidden');
            userInfoAUsdBalance?.classList.add('hidden');
            return;
        } else {
            frontpageAUsdBalance?.classList.remove('hidden');
            userInfoAUsdBalance?.classList.remove('hidden');
        }

        let aUSDService = new AUSDService(this.moralis);
        let aUsdValueWei = await aUSDService.getAUSDBalanceOf(this.user.get('ethAddress'));
        let aUsdValue = roundBigNumber(aUsdValueWei);

        let frontpageAUSDBalance = document.getElementById('front_page_aUSD_balance');
        if (frontpageAUSDBalance) frontpageAUSDBalance.innerHTML = '$' + aUsdValue;

        let user_info_ausd_balance = document.getElementById('user_info_ausd_balance')
        if (user_info_ausd_balance) user_info_ausd_balance.innerHTML = '$' + aUsdValue;
        this.bindEvents();

        let balance_value = document.querySelector('.balance_value') as HTMLElement;
        if (balance_value) {
            balance_value.innerHTML = '$' + aUsdValue;
            balance_value.title = aUsdValueWei.toString();
            balance_value.dataset['tooltip'] = aUsdValueWei.toString();
        }

        if (aUsdValue.isLessThan(10)) {
            let frontpage_fund_account = document.getElementById('frontpage_fund_account');
            frontpage_fund_account?.classList.remove('hidden');
        }
    }

    private bindEvents() {
        let networkInfo = NetworkInfo.getInstance();
        let fund_accountButtons = document.querySelectorAll('.fund_account');
        fund_accountButtons.forEach(element => {
            let aUSDFundingModal = new FakeAUSDFund(this.moralis);
            if (networkInfo.TestNetwork) {
                element.innerHTML = 'Click for some aUSD';
                element.addEventListener('click', (evt) => {
                    evt.preventDefault();
                    aUSDFundingModal.showAUSDFakeFund(() => {
                    });
                });
            } else {
                element.addEventListener('click', async (evt) => {
                    evt.preventDefault();
                    let aUsdFund = new AUSDFund(this.moralis);
                    await aUsdFund.show();
                })
            }
        })

        let withdraw_from_account = document.getElementById('withdraw_from_account');
        withdraw_from_account?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let withdrawModal = new WithdrawModal(this.moralis);
            await withdrawModal.show()
        })
    }
}