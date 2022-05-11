import {AddressZero} from '../../util/Helper';
import LiminalMarketService from "../../services/blockchain/LiminalMarketService";
import SecuritiesService from "../../services/broker/SecuritiesService";
import WalletHelper from "../../util/WalletHelper";
import DocumentsHtml from '../../html/elements/documents.html';
import DocumentService from "../../services/backend/DocumentService";
import Modal from "../../ui/modals/Modal";
import CreateToken from "../../ui/modals/CreateToken";
import AddressInfoHtml from '../../html/elements/AddressInfo.html';
import PositionPageHtml from '../../html/pages/positions.html';
import PositionsService from "../../services/backend/PositionsService";
import HandlebarHelpers from "../../util/HandlebarHelpers";
import TradePage from "./TradePage";

export default class PositionsPage {
    moralis : typeof Moralis;
    documentService : DocumentService;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
        this.documentService = new DocumentService(this.moralis);
    }

    public async load() {

        let mainContainer = document.getElementById('main_container');
        if (!mainContainer) return;

        history.pushState(null, 'Positions', 'positions');

        let positionService = new PositionsService(this.moralis);
        let positions = await positionService.getPositions();

        HandlebarHelpers.registerHelpers();

        let template = Handlebars.compile(PositionPageHtml);
        mainContainer.innerHTML = template({result:positions});

        let symbols = new Array<string>();

        const sellLinks = document.getElementsByClassName('tradeSecurity');
        for (let i = 0; i < sellLinks.length; i++) {
            let element = sellLinks[i] as HTMLElement;
            let symbol = element.dataset.symbol;
            if (!symbol) continue;

            symbols.push(symbol);

            sellLinks[i].addEventListener('click', async (evt) => {
                evt.preventDefault();

                let element = evt.target as HTMLElement;
                let symbol = element.dataset.symbol;
                if (!symbol) return;

                let liminalMarketService = new LiminalMarketService(this.moralis);
                let contractAddress = await liminalMarketService.getSymbolContractAddress(symbol);

                let securitiesService = await SecuritiesService.getInstance();
                let security = await securitiesService.getSecurityBySymbol(symbol);

                let tradePage = new TradePage(this.moralis);
                await tradePage.load(symbol, security.Name, security.LogoPath + security.Logo, contractAddress);
                window.scrollTo(0, 0);
            });
        }

        const addToWalletLinks = document.getElementsByClassName('addToWallet');
        for (let i = 0; i < addToWalletLinks.length; i++) {
            addToWalletLinks[i].addEventListener('click', async (evt) => {
                evt.preventDefault();
                console.log(evt.target);
                let element = addToWalletLinks[i] as HTMLElement;
                let symbol = element.dataset.symbol!;

                let liminalMarketService = new LiminalMarketService(this.moralis);
                let contractAddress = await liminalMarketService.getSymbolContractAddress(symbol);
                if (contractAddress.toString() == AddressZero) {
                    let createToken = new CreateToken(this.moralis);
                    createToken.show(symbol);
                    return;
                }

                let walletHelper = new WalletHelper();
                await walletHelper.addTokenToWallet(this.moralis, contractAddress.toString(), symbol, () => {
                    let modal = new Modal();
                    let template = Handlebars.compile(AddressInfoHtml);
                    let content = template({symbol: symbol, address: contractAddress});
                    modal.showModal('Import token to wallet', content);
                });


            });
        }

        await this.renderSymbolLogos(symbols);

        let docTemplate = Handlebars.compile(DocumentsHtml);
        let documents = await this.documentService.getDocuments();
        let documentDom = document.getElementById('documents');
        if (!documentDom) return;

        documentDom.innerHTML = docTemplate({result: documents});

        await this.initDocuments();

    }

    public async renderSymbolLogos(symbols: Array<string>) {
        let securitiesService = await SecuritiesService.getInstance();
        const assets = await securitiesService.getSecurities();
        let asset;
        for (let i = 0; i < symbols.length; i++) {
            asset = assets.get(symbols[i]);
            if (asset) {
                document.getElementById('symbol_logo_' + symbols[i])!.setAttribute('src', '/img/logos/' + asset.Logo);
            }
        }

    }

    public async initDocuments() {

        const links = document.getElementsByClassName('downloadDoc');
        const user = this.moralis.User.current();
        if (!user) return;

        const alpacaId = user.get('alpacaId');

        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', async (evt) => {
                evt.preventDefault();

                let documentId = (links[i] as HTMLElement).dataset.docid;
                if (!documentId) return;

                let locationUrl = await this.documentService.getDocument(documentId);
                window.location = locationUrl;
            });
        }
    }
}