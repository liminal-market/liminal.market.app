import { render, renderWithMoralis } from "./render.js";
import { sellPageInit } from "./sell.js";
import LiminalMarketInfo from "../abi/LiminalMarket.json" assert {	type: "json"};
import { addTokenToWallet, getAssets} from './helper.js';
import { Main }  from '../main.js';



export const initPositionsPage = async function() {
    history.pushState(null, 'Positions', '/positions');
    let symbols = new Array();
    const sellLinks = document.getElementsByClassName('sellAsset');
    for (let i = 0; i < sellLinks.length; i++) {

        symbols.push( sellLinks[i].dataset.symbol);

        sellLinks[i].addEventListener('click', async function (evt) {
            evt.preventDefault();

            let symbol = sellLinks[i].dataset.symbol;
            let qty = sellLinks[i].dataset.qty;

            await renderWithMoralis('positions', null, 'sell', () => sellPageInit(symbol, qty));
        });
    }

    const addToWalletLinks = document.getElementsByClassName('addToWallet');
    for (let i=0;i<addToWalletLinks.length;i++) {
        addToWalletLinks[i].addEventListener('click', async function (evt) {
            evt.preventDefault();
            console.log(evt.target);

            let symbol = addToWalletLinks[i].dataset.symbol;

            const securityTokenOptions = {
                contractAddress: Main.ContractAddressesInfo.LIMINAL_MARKET_ADDRESS,
                functionName: "getSecurityToken",
                abi: LiminalMarketInfo.abi,
                params: {
                    symbol: symbol
                }
            };

            Moralis.executeFunction(securityTokenOptions).then((contractAddress) => {
                if (contractAddress != "0x0000000000000000000000000000000000000000") {
                    addTokenToWallet(contractAddress, symbol);
                }

            });
        });
    }

    renderSymbolLogos(symbols);
    renderWithMoralis('documents', null, 'documents', initDocuments, 'documents')


}

const renderSymbolLogos = async function(symbols) {
    const assets = await getAssets();
    let asset;
    for (let i =0 ;i<symbols.length;i++) {
        asset = assets.get(symbols[i]);
        if (asset) {
            document.getElementById('symbol_logo_' + symbols[i]).setAttribute('src', '/img/logos/' + asset.Logo);
        }
    }

}

export const initDocuments = async function() {

    const links = document.getElementsByClassName('downloadDoc');
    const alpacaId = Moralis.User.current().get('alpacaId');


    console.log('alpacaId', alpacaId);
    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('click', async function (evt) {
            evt.preventDefault();

            let docid = links[i].dataset.docid;

            location.href = 'http://176.58.106.52:6674/document/?accountId=' + alpacaId + '&id=' + docid;
        });
    }
}