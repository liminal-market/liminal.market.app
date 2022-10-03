import TradePanel from "../elements/TradePanel";
import TradePageHtml from "../../html/pages/trade.html";
import ContractInfo from "../../contracts/ContractInfo";
import SecuritiesListModal from "../modals/SecuritiesListModal";
import AUSDService from "../../services/blockchain/AUSDService";
import UserService from "../../services/backend/UserService";
import WalletHelper from "../../util/WalletHelper";
import Modal from "../modals/Modal";
import CopyTokenAddressToAddToWallet from '../../html/modal/CopyTokenAddressToAddToWallet.html';

export default class TradePage {

    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async load(symbol?: string, name?: string, logo?: string, address?: string) {


        let mark1 = 'start';
        let mark2 = 'template';
        let mark3 = 'render tradePanel';
        let mark4 = 'selectSymbol';
        let mark5 = 'aUsd';
        let mark6 = 'bindEvents';
        performance.mark(mark1)
        let mainContainer = document.getElementById('main_container');
        if (!mainContainer) return;

        let contractInfo = ContractInfo.getContractInfo();


        let template = Handlebars.compile(TradePageHtml);
        mainContainer.innerHTML = template({AUSDAddress: contractInfo.AUSD_ADDRESS});
        performance.mark(mark2)
        let tradePanel = new TradePanel(this.moralis);
        await tradePanel.render('liminal_market_trade_panel');
        performance.mark(mark3)
        if (symbol) {
            await this.selectSymbol(symbol, name!, logo!, address!)

        }
        performance.mark(mark4)
        let user = new UserService(this.moralis);
        let aUSDService = new AUSDService(this.moralis);
        let ausdAmount = await aUSDService.getAUSDBalanceOf(user.getEthAddress());
        performance.mark(mark5)
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

        performance.mark(mark6)

        performance.measure("start to template", mark1, mark2);
        performance.measure("template to render", mark2, mark3);
        performance.measure("render to selectSymbol", mark3, mark4);
        performance.measure("selectSymbol to ausd", mark4, mark5);
        performance.measure("ausd to bind", mark5, mark6);

        // Pull out all of the measurements.
        console.log(performance.getEntriesByType("measure"));

        // Finally, clean up the entries.
        performance.clearMarks();
        performance.clearMeasures();
    };

    public async selectSymbol(symbol: string, name: string, logo: string, address: string) {
        let tradePanel = new TradePanel(this.moralis);
        await tradePanel.render('liminal_market_trade_panel', symbol, name, logo, address);
    }

}


