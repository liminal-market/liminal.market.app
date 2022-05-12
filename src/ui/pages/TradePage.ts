import TradePanel from "../elements/TradePanel";
import TradePageHtml from "../../html/pages/trade.html";
import ContractInfo from "../../contracts/ContractInfo";
import SecuritiesListModal from "../modals/SecuritiesListModal";
import AUSDService from "../../services/blockchain/AUSDService";
import UserService from "../../services/backend/UserService";
import doc = Mocha.reporters.doc;
import WalletHelper from "../../util/WalletHelper";
import Modal from "../modals/Modal";
import CopyTokenAddressToAddToWallet from '../../html/modal/CopyTokenAddressToAddToWallet.html';

export default class TradePage {

    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async load(symbol?: string, name?: string, logo?: string, address?: string) {
        history.pushState(null, 'Buy stocks', '/trade');

        let mainContainer = document.getElementById('main_container');
        if (!mainContainer) return;

        let contractInfo = ContractInfo.getContractInfo();


        let template = Handlebars.compile(TradePageHtml);
        mainContainer.innerHTML = template({AUSDAddress: contractInfo.AUSD_ADDRESS});

        let tradePanel = new TradePanel(this.moralis);
        await tradePanel.render('liminal_market_trade_panel');

        if (symbol) {
            await this.selectSymbol(symbol, name!, logo!, address!)
        }

        let user = new UserService(this.moralis);
        let aUSDService = new AUSDService(this.moralis);
        let ausdAmount = await aUSDService.getAUSDBalanceOf(user.getEthAddress());

        if (ausdAmount.eq(0)) {
            let userWallet = document.getElementById('use_wallet_for_orders');
            if (!userWallet) return;

            userWallet.classList.add('d-none');
            return;
        }

        let findSymbols = document.querySelectorAll('.findSymbol');
        if (!findSymbols) return;
        findSymbols.forEach(findSymbol => {
            findSymbol.addEventListener('click', (evt) => {
                evt.preventDefault();

                let securitiesModal = new SecuritiesListModal();
                securitiesModal.showModal(() => {
                    securitiesModal.hideModal();
                })
            });
        });

        let addAUSDToWallet = document.getElementById('addAUSDToWallet');
        if (!addAUSDToWallet) return;

        addAUSDToWallet.addEventListener('click', (evt) => {
            evt.preventDefault();

            let walletHelper = new WalletHelper(this.moralis);
            walletHelper.addTokenToWallet(contractInfo.AUSD_ADDRESS, 'aUSD', () => {
                let modal = new Modal();
                let template = Handlebars.compile(CopyTokenAddressToAddToWallet);
                let content = template({symbol: 'aUSD', tokenAddress: contractInfo.AUSD_ADDRESS});
                modal.showModal('Add aUSD to wallet', content);
            })
        })
    };

    public async selectSymbol(symbol: string, name: string, logo: string, address: string) {
        let tradePanel = new TradePanel(this.moralis);
        await tradePanel.render('liminal_market_trade_panel', symbol, name, logo, address);
    }

}


