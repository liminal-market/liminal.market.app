import { render, renderWithMoralis } from "./render.js";
import { sellPageInit } from "./sell.js";

export const initPositionsPage = async function() {

    const sellLinks = document.getElementsByClassName('sellAsset');
    for (let i = 0; i < sellLinks.length; i++) {
        sellLinks[i].addEventListener('click', async function (evt) {
            evt.preventDefault();

            let symbol = sellLinks[i].dataset.symbol;
            let qty = sellLinks[i].dataset.qty;

            await renderWithMoralis('positions', null, 'sell', () => sellPageInit(symbol, qty));



        });
    }

}