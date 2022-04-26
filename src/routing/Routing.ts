import {render, renderWithMoralis} from "../ui/Render";
import {sellPageInit} from "../modules/sell";
import {buyPageInit} from "../modules/buy";
import {loadSecurities} from "../modules/securities";
import {initPositionsPage} from "../modules/positions";

export default class Routing {

    settings = {
        show_sell: this.showSell,
        show_buy: this.showBuy,
        show_positions: this.showPositions,
        show_securities: this.showSecurities,
    };

    public async loadRoutes() {
        let path = window.location.pathname.replace('/', '');
        if (path === '') path = 'buy';

        this.attachNavLinks();

        const fn = this.settings['show_' + path];
        if (typeof fn === 'function') {
            await fn();
        }
    }


    public async showSell(evt : MouseEvent) {
        if (evt) evt.preventDefault();
        await renderWithMoralis('positions', null, 'sell', sellPageInit);
    }

    public async showBuy(evt : MouseEvent) {
        if (evt) evt.preventDefault();
        await render('buy', null, buyPageInit);
    }

    public async showSecurities(evt : MouseEvent) {
        if (evt) evt.preventDefault();
        await render('securities', null, loadSecurities);
    }
    public async showPositions(evt : MouseEvent) {
        if (evt) evt.preventDefault();
        await renderWithMoralis('positions', null, 'positions', initPositionsPage);
    }


    public attachNavLinks() {
        let router = this;

        document.getElementById('nav-sell')!.addEventListener('click', async function (evt) {
            await router.showSell(evt);
        });

        document.getElementById('nav-buy')!.addEventListener('click', async function (evt) {
            await router.showBuy(evt);
        });

        document.getElementById('nav-securities')!.addEventListener('click', async function (evt) {
            await router.showSecurities(evt);

        });
        document.getElementById('nav-positions')!.addEventListener('click', async function (evt) {
            await router.showPositions(evt);
        });
    }

}