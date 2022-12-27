import AUSDService from "../../services/blockchain/AUSDService";
import {roundBigNumber} from "../../util/Helper";
import NetworkInfo from "../../networks/NetworkInfo";
import FakeAUSDFund from "../modals/Funding/FakeAUSDFund";
import AUSDFund from "../modals/Funding/AUSDFund";
import WithdrawModal from "../modals/Funding/WithdrawModal";
import UserService from "../../services/backend/UserService";
import WalletHelper from "../../util/WalletHelper";
import ContractInfo from "../../contracts/ContractInfo";
import Modal from "../modals/Modal";
import AddToWalletHtml from '../../html/elements/AddToWallet.html';
import User from "../../dto/User";
import App from "../../main";
import AuthenticateService from "../../services/backend/AuthenticateService";

export default class AUsdBalance {


    constructor() {

    }

    public static async forceLoadAUSDBalanceUI() {
        let ui = new AUsdBalance()
        AUSDService.lastUpdate = undefined;
        await ui.loadAUSDBalanceUI();
    }

    public async loadAUSDBalanceUI() {
        if (!App.User.ether) {
            await AuthenticateService.enableWeb3();
            if (!App.User.ether) return;
        }

        let userInfoAUsdBalance = document.getElementById('userInfoAUsdBalance');
        let frontpageAUsdBalance = document.getElementById('frontpageAUsdBalance');

        if (!App.User.alpacaId) {
            frontpageAUsdBalance?.classList.add('hidden');
            userInfoAUsdBalance?.classList.add('hidden');
            //return;
        } else {
            frontpageAUsdBalance?.classList.remove('hidden');
            userInfoAUsdBalance?.classList.remove('hidden');
        }

        let aUSDService = new AUSDService();
        let aUsdValueWei = await aUSDService.getAUSDBalanceOf(App.User.address);
        let aUsdValue = roundBigNumber(aUsdValueWei);

        let frontpageAUSDBalance = document.getElementById('front_page_aUSD_balance');
        if (frontpageAUSDBalance) frontpageAUSDBalance.innerHTML = '$' + aUsdValue;

        let user_info_ausd_balance = document.getElementById('user_info_ausd_balance')
        if (user_info_ausd_balance) user_info_ausd_balance.innerHTML = '$' + aUsdValue;
        this.bindEvents();

        let balance_value = document.querySelector('.balance_value') as HTMLElement;
        if (balance_value) {
            balance_value.innerHTML = '$' + aUsdValue.toFixed();
            balance_value.title = aUsdValueWei.toFixed();
            balance_value.dataset['tooltip'] = aUsdValueWei.toFixed();
        }

        if (aUsdValue.isLessThan(10)) {
            let frontpage_fund_account = document.getElementById('frontpage_fund_account');
            frontpage_fund_account?.classList.remove('hidden');
        }
    }

    private bindEvents() {
        let networkInfo = App.Network;
        let add_aUSD_to_wallet = document.querySelectorAll('.add_aUSD_to_wallet');
        add_aUSD_to_wallet.forEach(element => {
            element.addEventListener('click', async (evt) => {
                evt.preventDefault();

                let contractInfo = ContractInfo.getContractInfo(networkInfo.Name);
                let walletHelper = new WalletHelper();
                await walletHelper.addTokenToWallet(contractInfo.AUSD_ADDRESS, 'aUSD', () => {
                    let template = Handlebars.compile(AddToWalletHtml);
                    let obj = {symbol: 'aUSD', address: contractInfo.AUSD_ADDRESS};
                    let modal = new Modal();
                    modal.showModal('Add aUSD token', template(obj));
                })
            })

        })


        let fund_accountButtons = document.querySelectorAll('.fund_account');
        fund_accountButtons.forEach(element => {
            let aUSDFundingModal = new FakeAUSDFund();
            if (networkInfo.TestNetwork) {
                element.innerHTML = 'Click for some aUSD';
                element.addEventListener('click', (evt) => {
                    evt.preventDefault();
                    aUSDFundingModal.showAUSDFakeFund();
                });
            } else {
                element.addEventListener('click', async (evt) => {
                    evt.preventDefault();
                    let aUsdFund = new AUSDFund();
                    await aUsdFund.show();
                })
            }
        })

        let withdraw_from_account = document.getElementById('withdraw_from_account');
        withdraw_from_account?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let withdrawModal = new WithdrawModal();
            await withdrawModal.show()
        })
    }
}