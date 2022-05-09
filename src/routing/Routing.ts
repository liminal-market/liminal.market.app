import StocksPage from "../ui/pages/StocksPage";
import TradePage from "../ui/pages/TradePage";
import PositionsPage from "../ui/pages/PositionsPage";


export default class Routing {

    settings : any = {
        show_trade: this.showTrade,
        show_positions: this.showPositions,
        show_stocks: this.showStocks,
    };
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async loadRoutes() {
        let path = window.location.pathname.replace('/', '');
        if (window.location.search !== '') path = window.location.search.replace('?', '');
        if (path === '') path = 'stocks';

        this.attachNavLinks();

        const fn = this.settings['show_' + path];
        if (typeof fn === 'function') {
            await fn(this);
        }
    }

    public async showTrade(routing : Routing, evt : MouseEvent) {
        if (evt) evt.preventDefault();

        let page = new TradePage(routing.moralis);
        await page.load();
    }

    public async showStocks(routing : Routing,evt : MouseEvent) {
        if (evt) evt.preventDefault();

        let page = new StocksPage(routing.moralis);
        await page.load();
    }
    public async showPositions(routing : Routing,evt : MouseEvent) {
        if (evt) evt.preventDefault();

        let page = new PositionsPage(routing.moralis);
        await page.load();
    }

    public attachNavLinks() {
        let router = this;


        let tradeNavLinks = document.querySelectorAll('.tradeNavLink');
        tradeNavLinks.forEach(link => {
            (link as HTMLElement).addEventListener('click', async function (evt : MouseEvent) {
                await router.showTrade(router, evt);
                link.parentElement!.parentElement!.parentElement!.removeAttribute('open');
            });
        });
        let investLinks = document.querySelectorAll('.investNavLink');
        investLinks.forEach(link => {
            (link as HTMLElement).addEventListener('click', async function (evt) {
                await router.showStocks(router, evt);
                link.parentElement!.parentElement!.parentElement!.removeAttribute('open');
            });
        });

        let positionLinks = document.querySelectorAll('.positionNavLink');
        positionLinks.forEach(link => {
            (link as HTMLElement).addEventListener('click', async function (evt) {
                await router.showPositions(router, evt);
                link.parentElement!.parentElement!.parentElement!.removeAttribute('open');
            });
        });
    }

}