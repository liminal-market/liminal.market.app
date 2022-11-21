import StocksPage from "../ui/pages/StocksPage";
import TradePage from "../ui/pages/TradePage";
import PositionsPage from "../ui/pages/PositionsPage";
import FakeAUSDFund from "../ui/modals/Funding/FakeAUSDFund";
import NetworkInfo from "../networks/NetworkInfo";
import WalletHelper from "../util/WalletHelper";


export default class Routing {

    settings: any = {
        show_trade: this.showTrade,
        show_positions: this.showPositions,
        show_stocks: this.showStocks,
        show_kyc_action_required: this.showKycActionRequired,
        show_funding: this.showFunding,
        show_kyc: this.showKyc
    };
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async loadRoutes() {
        let path = window.location.hash.replace('#', '').replace('/', '');
        if (path === '') path = 'stocks';

        this.attachNavLinks();

        let fn = this.settings['show_' + path] ?? this.settings['show_stocks'];

        if (typeof fn === 'function') {
            await fn(this);
        } else {
            await fn(this.settings['show_stocks']);
        }
    }

    public async showKycActionRequired(routing: Routing, evt: MouseEvent) {
        if (evt) evt.preventDefault();

        let page = new TradePage(routing.moralis);
        await page.load();

        history.pushState(null, 'Buy stocks', '#/kyc_action_required');

        let button = document.getElementById('liminal_market_execute_trade')
        button?.dispatchEvent(new MouseEvent('click'));
    }

    public async showKyc(routing: Routing, evt: MouseEvent) {
        if (evt) evt.preventDefault();

        let page = new TradePage(routing.moralis);
        await page.load();

        history.pushState(null, 'Buy stocks', '#/kyc');

        let button = document.getElementById('liminal_market_execute_trade')
        button?.dispatchEvent(new MouseEvent('click'));
    }

    public async showFunding(routing: Routing, evt: MouseEvent) {
        if (evt) evt.preventDefault();

        let page = new TradePage(routing.moralis);
        await page.load();

        history.pushState(null, 'Buy stocks', '#/funding');

        let aUSDFundingModal = new FakeAUSDFund(this.moralis);
        let networkInfo = NetworkInfo.getInstance();
        if (networkInfo.TestNetwork) {
            aUSDFundingModal.showAUSDFakeFund()
        } else {
            aUSDFundingModal.showAUSDFund()
        }
    }


    public async showTrade(routing: Routing, evt: MouseEvent) {
        if (evt) evt.preventDefault();

        let page = new TradePage(routing.moralis);
        await page.load();

        history.pushState(null, 'Buy stocks', '#/trade');
    }

    public async showStocks(routing : Routing,evt : MouseEvent) {
        if (evt) evt.preventDefault();

        let page = new StocksPage(routing.moralis);
        await page.load();

        history.pushState(null, 'Stocks', '#/stocks');

    }
    public async showPositions(routing : Routing,evt : MouseEvent) {
        if (evt) evt.preventDefault();

        let page = new PositionsPage(routing.moralis);
        await page.load();

        history.pushState(null, 'Positions', '#/positions');
    }

    public attachNavLinks() {
        let router = this;


        let tradeNavLinks = document.querySelectorAll('.tradeNavLink');
        tradeNavLinks.forEach(link => {
            (link as HTMLElement).addEventListener('click', async (evt) => {
                WalletHelper.hideMagicWallet();
                await router.showTrade(router, evt);
                link.parentElement!.parentElement!.parentElement!.removeAttribute('open');
            });
        });
        let investLinks = document.querySelectorAll('.investNavLink');
        investLinks.forEach(link => {
            (link as HTMLElement).addEventListener('click', async (evt) => {
                WalletHelper.hideMagicWallet();
                await router.showStocks(router, evt);
                link.parentElement!.parentElement!.parentElement!.removeAttribute('open');
            });
        });

        let positionLinks = document.querySelectorAll('.positionNavLink');
        positionLinks.forEach(link => {
            (link as HTMLElement).addEventListener('click', async (evt) => {
                WalletHelper.hideMagicWallet();
                await router.showPositions(router, evt);
                link.parentElement!.parentElement!.parentElement!.removeAttribute('open');
            });
        });
    }

}