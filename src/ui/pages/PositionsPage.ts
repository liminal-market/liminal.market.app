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
import SyncStockHtml from '../../html/modal/SyncStock.html';
import PositionsService from "../../services/backend/PositionsService";
import HandlebarHelpers from "../../util/HandlebarHelpers";
import TradePage from "./TradePage";
import NetworkInfo from "../../networks/NetworkInfo";
import UserService from "../../services/backend/UserService";

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

        let userService = new UserService(this.moralis);
        let positionService = new PositionsService(this.moralis);
        let positions = await positionService.getPositions(userService.getEthAddress()!);
        if (!positions) positions = [];

        HandlebarHelpers.registerHelpers();

        let template = Handlebars.compile(PositionPageHtml);
        mainContainer.innerHTML = template({result:positions});

        let syncWalletBtn = document.getElementById('syncWallet');
        if (syncWalletBtn) {
            syncWalletBtn.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.syncAllTokens();
            })
        }


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

                let walletHelper = new WalletHelper(this.moralis);
                await walletHelper.addTokenToWallet(contractAddress.toString(), symbol, () => {
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

    public async syncAllTokens() {
        let networkInfo = NetworkInfo.getInstance();
        let costOfSync = await this.moralis.Cloud.run('costOfSync');
        let template = Handlebars.compile(SyncStockHtml);
        let content = template({
            shareCount: costOfSync.shareCount,
            costPerShare: Moralis.Units.FromWei(costOfSync.costPerShare, 18),
            priceInNativeToken: costOfSync.priceInNativeToken,
            totalCost: Moralis.Units.FromWei(costOfSync.cost, 18),
            NativeSymbol: networkInfo.NativeSymbol
        });

        let modal = new Modal();
        modal.showModal('Sync all stock to wallet', content)

        let syncAllPositions = document.getElementById('syncAllPositions');
        if (syncAllPositions) {
            syncAllPositions.addEventListener('click', async (evt) => {
                evt.preventDefault();

            })
        }
    }

    public async initDocuments() {

        const links = document.getElementsByClassName('downloadDoc');
        const user = this.moralis.User.current();
        if (!user) return;

        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', async (evt) => {
                evt.preventDefault();

                let documentId = (links[i] as HTMLElement).dataset.docid;
                if (!documentId) return;

                let locationUrl = await this.documentService.getDocument(documentId);
                if (locationUrl == '') {
                    alert('Could not find document. Please contact us if you should have gotten a document')
                    return;
                }
                window.location = locationUrl;
            });
        }
    }
}