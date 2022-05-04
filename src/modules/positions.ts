import  Render from "../ui/Render";
import { sellPageInit } from "./sell";
import {AddressZero } from '../util/Helper';
import LiminalMarketService from "../services/blockchain/LiminalMarketService";
import SecuritiesService from "../services/broker/SecuritiesService";
import WalletHelper from "../util/WalletHelper";


export const initPositionsPage = async function() {
    history.pushState(null, 'Positions', 'positions');

    let symbols = new Array<string>();
    let render = new Render(Moralis);

    const sellLinks = document.getElementsByClassName('sellAsset');
    for (let i = 0; i < sellLinks.length; i++) {
        let element = sellLinks[i] as HTMLElement;
        let symbol = element.dataset.symbol;
        if (!symbol) continue;

        symbols.push(symbol);

        sellLinks[i].addEventListener('click', async function (evt) {
            evt.preventDefault();

            let qty = element.dataset.qty;


            await render.renderWithMoralis('positions', '', 'sell', () => sellPageInit());
        });
    }

    const addToWalletLinks = document.getElementsByClassName('addToWallet');
    for (let i=0;i<addToWalletLinks.length;i++) {
        addToWalletLinks[i].addEventListener('click', async function (evt) {
            evt.preventDefault();
            console.log(evt.target);
            let element  = addToWalletLinks[i] as HTMLElement;
            let symbol = element.dataset.symbol!;

            let liminalMarketService = new LiminalMarketService(Moralis);
            let contractAddress = await liminalMarketService.getSymbolContractAddress(symbol);
            if (contractAddress.toString() != AddressZero) {
                let walletHelper = new WalletHelper();
                await walletHelper.addTokenToWallet(Moralis, contractAddress.toString(), symbol, () => {

                });
            }
        });
    }

    await renderSymbolLogos(symbols);
    await render.renderWithMoralis('documents', '', 'documents', initDocuments, 'documents')


}

const renderSymbolLogos = async function(symbols : Array<string>) {
    let securitiesService = await SecuritiesService.getInstance();
    const assets = await securitiesService.getSecurities();
    let asset;
    for (let i =0 ;i<symbols.length;i++) {
        asset = assets.get(symbols[i]);
        if (asset) {
            document.getElementById('symbol_logo_' + symbols[i])!.setAttribute('src', '/img/logos/' + asset.Logo);
        }
    }

}

export const initDocuments = async function() {

    const links = document.getElementsByClassName('downloadDoc');
    const user = Moralis.User.current();
    if (!user) return;

    const alpacaId = user.get('alpacaId');

    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('click', async function (evt) {
            evt.preventDefault();

            let docid = (links[i] as HTMLElement).dataset.docid;

            location.href = 'http://176.58.106.52:6674/document/?accountId=' + alpacaId + '&id=' + docid;
        });
    }
}