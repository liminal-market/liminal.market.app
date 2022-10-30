import TradePanel from "../elements/TradePanel";
import TradePageHtml from "../../html/pages/trade.html";
import ContractInfo from "../../contracts/ContractInfo";
import SecuritiesListModal from "../modals/SecuritiesListModal";
import AUSDService from "../../services/blockchain/AUSDService";
import UserService from "../../services/backend/UserService";
import WalletHelper from "../../util/WalletHelper";
import Modal from "../modals/Modal";
import CopyTokenAddressToAddToWallet from '../../html/modal/CopyTokenAddressToAddToWallet.html';
import BigNumber from "bignumber.js";

export default class TradePage {

    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async load(symbol?: string, name?: string, logo?: string, address?: string) {
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
        let ethAddress = user.getEthAddress();

        let aUSDService = new AUSDService(this.moralis);
        let ausdAmount = new BigNumber(0);
        if (ethAddress) {
            ausdAmount = await aUSDService.getAUSDBalanceOf(ethAddress);
        }

        let userWallet = document.getElementById('use_wallet_for_orders');
        let userWalletLink = document.getElementById('use_wallet_for_orders_link');
        if (ausdAmount.eq(0)) {
            userWallet?.classList.add('hidden');
            userWalletLink?.classList.add('not_visible');
        } else {
            userWallet?.classList.remove('hidden');
            userWalletLink?.classList.remove('not_visible');
        }

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

        let addAUSDToWallet = document.getElementById('addAUSDToWallet');
        addAUSDToWallet?.addEventListener('click', (evt) => {
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


