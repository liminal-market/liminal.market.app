import TradePanel from "../elements/TradePanel";
import TradePageHtml from "../../html/pages/trade.html";
import ContractInfo from "../../contracts/ContractInfo";
import SecuritiesListModal from "../modals/SecuritiesListModal";
import AUSDService from "../../services/blockchain/AUSDService";
import UserService from "../../services/backend/UserService";
import WalletHelper from "../../util/WalletHelper";
import Modal from "../modals/Modal";
import CopyTokenAddressToAddToWallet from '../../html/modal/CopyTokenAddressToAddToWallet.html';
import ContractAddresses from "../../contracts/ContractAddresses";

export default class TradePage {

    contractInfo: ContractAddresses;

    constructor() {
        this.contractInfo = ContractInfo.getContractInfo();
    }

    public async load(symbol?: string, name?: string, logo?: string, address?: string) {
        let mainContainer = document.getElementById('main_container');
        if (!mainContainer) return;

        let template = Handlebars.compile(TradePageHtml);
        mainContainer.innerHTML = template({AUSDAddress: this.contractInfo.AUSD_ADDRESS});

        let tradePanel = new TradePanel();
        await tradePanel.render('liminal_market_trade_panel');

        if (symbol) {
            await this.selectSymbol(symbol, name!, logo!, address!)

        }

        AUSDService.onAUsdLoad.push(() => {
            this.loadBuyWithWallet();
        })


        let findSymbols = document.querySelectorAll('.findSymbol');
        findSymbols?.forEach(findSymbol => {
            findSymbol.addEventListener('click', (evt) => {
                evt.preventDefault();

                let securitiesModal = new SecuritiesListModal();
                securitiesModal.showModal(() => {
                    securitiesModal.hideModal();
                })
            });
        });

    };

    public async selectSymbol(symbol: string, name: string, logo: string, address: string) {
        let tradePanel = new TradePanel();
        await tradePanel.render('liminal_market_trade_panel', symbol, name, logo, address);
    }

    private async loadBuyWithWallet() {
        let user = new UserService();
        let ethAddress = user.getEthAddress();
        if (!ethAddress) {
            return;
        }
        let aUSDService = new AUSDService();
        let ausdAmount = await aUSDService.getAUSDBalanceOf(ethAddress);

        let userWallet = document.getElementById('use_wallet_for_orders');
        let userWalletLink = document.getElementById('use_wallet_for_orders_link');
        if (ausdAmount.eq(0)) {
            userWallet?.classList.add('hidden');
            userWalletLink?.classList.add('not_visible');
        } else {
            userWallet?.classList.remove('hidden');
            userWalletLink?.classList.remove('not_visible');
        }

        let addAUSDToWallet = document.getElementById('addAUSDToWallet');
        addAUSDToWallet?.addEventListener('click', (evt) => {
            evt.preventDefault();

            let walletHelper = new WalletHelper();
            walletHelper.addTokenToWallet(this.contractInfo.AUSD_ADDRESS, 'aUSD', () => {
                let modal = new Modal();
                let template = Handlebars.compile(CopyTokenAddressToAddToWallet);
                let content = template({symbol: 'aUSD', tokenAddress: this.contractInfo.AUSD_ADDRESS});
                modal.showModal('Add aUSD to wallet', content);
            })
        })
    }
}


