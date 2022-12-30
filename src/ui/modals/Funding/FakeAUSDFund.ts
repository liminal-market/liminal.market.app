import FakeFundingHtml from '../../../html/modal/funding/FakeFunding.html';
import Modal from "../Modal";
import WalletHelper from "../../../util/WalletHelper";
import ContractInfo from "../../../contracts/ContractInfo";
import FundingService from "../../../services/broker/FundingService";
import AUSDService from "../../../services/blockchain/AUSDService";
import UserService from "../../../services/backend/UserService";
import {roundBigNumber} from "../../../util/Helper";
import BigNumber from "bignumber.js";
import AUSDFund from "./AUSDFund";
import NetworkInfo from "../../../networks/NetworkInfo";
import App from "../../../main";


export default class FakeAUSDFund {
    currentBalance: BigNumber;
    modal: Modal;

    constructor() {
        this.currentBalance = new BigNumber(-1);
        this.modal = new Modal();
    }

    public showAUSDFund() {
        let aUsdFund = new AUSDFund();
        aUsdFund.show();
    }

    public showAUSDFakeFund() {
        let networkInfo = App.Network;
        if (!networkInfo.TestNetwork) {
            this.showAUSDFund()
            return;
        }

        let template = Handlebars.compile(FakeFundingHtml);

        let contractInfo = ContractInfo.getContractInfo();
        let content = template({aUSDAddress: contractInfo.AUSD_ADDRESS});


        this.modal.showModal('Fund my account (Fake money)', content);

        let addToWallet = document.getElementById('addTokenToWallet');
        if (!addToWallet) return;

        addToWallet.addEventListener('click', async (evt) => {
            let contractInfo = ContractInfo.getContractInfo();

            let walletHelper = new WalletHelper();
            let result = await walletHelper.addTokenToWallet(contractInfo.AUSD_ADDRESS, 'aUSD', () => {
                this.showCopyField();
            })
            if (!result) this.showCopyField();

        })

        let registerBankInfo = document.getElementById('registerBankInfo');
        registerBankInfo?.addEventListener('click', (evt) => {
            this.modal.hideModal();

            let aUsdFund = new AUSDFund();
            aUsdFund.show();
        })


        let requestFakeAUSD = document.getElementById('requestFakeAUSD');
        requestFakeAUSD?.addEventListener('click', async (evt) => {
            requestFakeAUSD!.setAttribute('aria-busy', 'true');

            let fundingService = new FundingService();
            let result = await fundingService.requestFakeFunding()
                .catch((reason) => {
                    this.errorWhileFunding({})
                });
            if (!result) return;

            if (!result.success) {
                let fundingError = document.getElementById('fundingError');
                if (fundingError) {
                    requestFakeAUSD!.removeAttribute('aria-busy');
                    fundingError.classList.remove('d-none');
                    fundingError.innerHTML = result.message;
                    setTimeout(() => {
                        fundingError!.classList.add('d-none')
                    }, 10 * 1000)
                }
            } else if (result.success) {
                let beforeFunding = document.getElementById('beforeFunding');
                let afterFunding = document.getElementById('afterFunding');
                if (!beforeFunding || !afterFunding) return;

                await this.loadAUSDBalance();
                beforeFunding.classList.add('d-none');
                afterFunding.classList.remove('d-none');
            } else {
                this.errorWhileFunding(result);

            }
            //callback();
        })
    }

    private async loadAUSDBalance() {
        let currentAUSDBalance = document.getElementById('currentAUSDBalance')
        if (!currentAUSDBalance) return;

        let aUSDService = new AUSDService();
        let userService = new UserService();
        let ethAddress = userService.getEthAddress();

        let amount = new BigNumber(0);
        if (ethAddress) {
            AUSDService.lastUpdate = undefined;
            amount = await aUSDService.getAUSDBalanceOf(ethAddress);
        }
        currentAUSDBalance.innerHTML = '$' + roundBigNumber(amount).toString();

        if (this.currentBalance.eq(-1)) {
            this.currentBalance = amount;
        }

        if (this.currentBalance.eq(amount)) {
            setTimeout(async () => {
                await this.loadAUSDBalance();
            }, 5 * 1000);
        } else {
            window.location.reload();
        }
    }

    private showCopyField() {

        let needToCopy = document.getElementById('needToCopy');
        if (!needToCopy) return;

        needToCopy.classList.remove('d-none');
    }

    private errorWhileFunding(result: any) {
        let beforeFunding = document.getElementById('beforeFunding');
        let errorAfterFunding = document.getElementById('errorAfterTryFunding');
        if (!beforeFunding || !errorAfterFunding) return;

        if (result.message) {
            errorAfterFunding.innerHTML = result.message;
        }
        beforeFunding.classList.add('d-none');
        errorAfterFunding.classList.remove('d-none');
    }
}