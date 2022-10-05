import AUSDService from "../../services/blockchain/AUSDService";
import {roundBigNumber} from "../../util/Helper";
import NetworkInfo from "../../networks/NetworkInfo";
import AUSDFund from "../modals/AUSDFund";
import Moralis from "moralis";

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

        let userInfoAUSDBalance = document.getElementById('user_info_ausd_balance')
        if (userInfoAUSDBalance) userInfoAUSDBalance.innerHTML = '$' + aUsdValue;


        let networkInfo = NetworkInfo.getInstance();
        let fund_accountButtons = document.querySelectorAll('.fund_account');
        fund_accountButtons.forEach(element => {
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
        if (aUsdValue.isLessThan(10)) {
            let frontpage_fund_account = document.getElementById('frontpage_fund_account');
            if (!frontpage_fund_account) return;
            frontpage_fund_account.classList.remove('hidden');
        }
    }
}