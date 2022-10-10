import AUSDService from "../../services/blockchain/AUSDService";
import {roundBigNumber} from "../../util/Helper";
import NetworkInfo from "../../networks/NetworkInfo";
import FakeAUSDFund from "../modals/Funding/FakeAUSDFund";
import Moralis from "moralis";
import AUSDFund from "../modals/Funding/AUSDFund";
import WithdrawModal from "../modals/Funding/WithdrawModal";

export default class AUsdBalance {
    user: Moralis.Attributes;
    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis, user: Moralis.Attributes) {
        this.user = user;
        this.moralis = moralis;
    }

    public async loadAUSDBalanceUI() {
        if (!this.user) return;

        let userInfoAUsdBalance = document.getElementById('userInfoAUsdBalance');
        let frontpageAUsdBalance = document.getElementById('frontpageAUsdBalance');

        if (userInfoAUsdBalance && !userInfoAUsdBalance.classList.contains('hidden')) {
            return;
        }

        if (!this.user.get('alpacaId')) {
            frontpageAUsdBalance?.classList.add('hidden');
            userInfoAUsdBalance?.classList.add('hidden');
            return;
        } else {
            frontpageAUsdBalance?.classList.remove('hidden');
            userInfoAUsdBalance?.classList.remove('hidden');
        }

        let aUSDService = new AUSDService(this.moralis);
        let aUsdValue = await aUSDService.getAUSDBalanceOf(this.user.get('ethAddress'));
        aUsdValue = roundBigNumber(aUsdValue);

        let frontpageAUSDBalance = document.getElementById('front_page_aUSD_balance');
        if (frontpageAUSDBalance) frontpageAUSDBalance.innerHTML = '$' + aUsdValue;

        let user_info_ausd_balance = document.getElementById('user_info_ausd_balance')
        if (user_info_ausd_balance) user_info_ausd_balance.innerHTML = '$' + aUsdValue;
        this.bindEvents();

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