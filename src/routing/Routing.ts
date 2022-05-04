import Render from "../ui/Render";
import {sellPageInit} from "../modules/sell";
import {tradePageInit} from "../modules/trade";
import {loadInvest} from "../modules/invest";
import {initPositionsPage} from "../modules/positions";
import {initKYC} from "../modules/kyc";
import doc = Mocha.reporters.doc;


export default class Routing {

    settings : any = {
        show_trade: this.showTrade,
        show_positions: this.showPositions,
        show_invest: this.showInvest,
    };
    render : Render;

    constructor(moralis : typeof Moralis) {
        this.render = new Render(moralis);
    }

    public async loadRoutes() {
        let path = window.location.pathname.replace('/', '');
        if (path === '') path = 'invest';

        this.attachNavLinks();

        const fn = this.settings['show_' + path];
        if (typeof fn === 'function') {
            await fn(this);
        }
    }

    public async showTrade(routing : Routing, evt : MouseEvent) {
        if (evt) evt.preventDefault();
        await routing.render.render('trade', '', tradePageInit);
    }

    public async showInvest(routing : Routing,evt : MouseEvent) {
        if (evt) evt.preventDefault();
        await routing.render.render('invest', '', loadInvest);
    }
    public async showPositions(routing : Routing,evt : MouseEvent) {
        if (evt) evt.preventDefault();
        await routing.render.renderWithMoralis('positions', '', 'positions', initPositionsPage);
    }

    public init() {
        this.render.render('buy', '', initKYC);
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
                await router.showInvest(router, evt);
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