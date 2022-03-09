import { render, renderWithMoralis } from "./render";
import { sellPageInit } from "./sell";
import { addTokenToWallet, getAssets} from './helper';
import { Main }  from '../main';
import Moralis from 'moralis';

let LiminalMarketInfo : any;

export const initPositionsPage = async function() {
    history.pushState(null, 'Positions', '/positions');
    let symbols = new Array();
    const sellLinks = document.getElementsByClassName('sellAsset');
    for (let i = 0; i < sellLinks.length; i++) {
        let element = sellLinks[i] as HTMLElement;

        symbols.push( element.dataset.symbol);

        sellLinks[i].addEventListener('click', async function (evt) {
            evt.preventDefault();

            let symbol = element.dataset.symbol;
            let qty = element.dataset.qty;

            await renderWithMoralis('positions', null, 'sell', () => sellPageInit(symbol, qty));
        });
    }

    const response = await fetch("../abi/LiminalMarket.json");
    LiminalMarketInfo = await response.json();

    const addToWalletLinks = document.getElementsByClassName('addToWallet');
    for (let i=0;i<addToWalletLinks.length;i++) {
        addToWalletLinks[i].addEventListener('click', async function (evt) {
            evt.preventDefault();
            console.log(evt.target);
            let element  = addToWalletLinks[i] as HTMLElement;
            let symbol = element.dataset.symbol;

            const securityTokenOptions = {
                contractAddress: Main.ContractAddressesInfo.LIMINAL_MARKET_ADDRESS,
                functionName: "getSecurityToken",
                abi: LiminalMarketInfo.abi,
                params: {
                    symbol: symbol
                }
            };

            Moralis.executeFunction(securityTokenOptions).then((contractAddress) => {
                //todo: validate that .value is correct here??
                if (contractAddress.toString() != "0x0000000000000000000000000000000000000000") {
                    addTokenToWallet(contractAddress.toString(), symbol);
                }

            });
        });
    }

    renderSymbolLogos(symbols);
    renderWithMoralis('documents', null, 'documents', initDocuments, 'documents')


}

const renderSymbolLogos = async function(symbols : Array<string>) {
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