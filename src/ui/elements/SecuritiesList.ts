import SecuritiesService from "../../services/broker/SecuritiesService";
import SecuritiesListHtml from '../../html/elements/SecuritiesList.html'
import SecurityHtml from '../../html/elements/Securities.html';
import Security from "../../services/broker/Security";
import LiminalMarketService from "../../services/blockchain/LiminalMarketService";
import CopyHelper from "../../util/CopyHelper";
import AddressInfoHtml from '../../html/elements/AddressInfo.html';
import ContractAddressNotFound from '../../html/elements/ContractAddressNotFound.html';
import {AddressZero} from "../../util/Helper";
import WalletHelper from "../../util/WalletHelper";
import AddToWalletHtml from '../../html/elements/AddToWallet.html';
import HTML = Mocha.reporters.HTML;
import LoadingHelper from "../../util/LoadingHelper";

export default class SecuritiesList {
    page: number;
    tbodyId = 'liminal_market_securities_list';
    loadmore: boolean;

    constructor() {
        this.page = 0;
        this.loadmore = true;

    }

    public async render() {
        let securitiesService = await SecuritiesService.getInstance();

        let securitiesCount = await securitiesService.securitiesArray.length;
        let securities = await securitiesService.getPaginatingSecurities(this.page++);

        Handlebars.registerPartial(
            "securities",
            SecurityHtml
        )

        let template = Handlebars.compile(SecuritiesListHtml);
        let obj: any = {
            tbodyId: this.tbodyId,
            securities: securities,
            securitiesCount: securitiesCount
        }
        return template(obj);
    }

    public async bindEvents(onSelectSymbol: (symbol: string, name: string, logo: string) => void) {
        this.bindOnClickEvent(onSelectSymbol);
        await this.bindSearchEvent();
        this.bindLoadMore();
    }

    private bindOnClickEvent(onSelectSymbol: (symbol: string, name: string, logo: string) => void) {


        document.getElementById('liminal_market_securities_table')!.addEventListener('click', async (evt) => {
            let element = (evt.target! as HTMLElement);
            if (element.tagName.toLocaleLowerCase() === 'a') {
                await this.addToWalletOrGetAddress(evt, element);

                return;
            }
            let parentTr = element.parentElement;
            if (!parentTr) return;


            if (parentTr.tagName.toLocaleLowerCase() !== 'tr') {
                parentTr = parentTr.parentElement!;
            }
            parentTr.setAttribute('aria-busy', 'true');
            let symbol = parentTr.dataset.symbol;
            if (!symbol) return;

            let name = parentTr.dataset.name!
            let logo = parentTr.dataset.logo!;

            onSelectSymbol(symbol, name, logo);
            parentTr.removeAttribute('aria-busy');
        });
    }

    public async bindSearchEvent() {
        let searchForSymbol = document.getElementById('search_for_symbol');
        if (!searchForSymbol) return;

        let securitiesService = await SecuritiesService.getInstance();

        let timeout: any = null;
        searchForSymbol.addEventListener('keyup', async (evt) => {
            if (timeout != null) clearTimeout(timeout);

            timeout = setTimeout(async () => {

                let search = (evt.target as HTMLInputElement).value;
                if (!search || search.length < 2) {
                    this.loadmore = true;
                    await this.showTopSecurities(securitiesService);
                    return;
                }
                this.loadmore = false;

                let securities = await securitiesService.find(search);
                this.loadSecuritiesToDom(securities);
            }, 500);

        })
    }

    public async showTopSecurities(securitiesService: SecuritiesService) {
        let securities = await securitiesService.getTopSecurities();
        this.loadSecuritiesToDom(securities);
    }

    private loadSecuritiesToDom(securities: Array<Security>) {
        let tbody = document.getElementById(this.tbodyId);
        if (!tbody) return;

        let template = Handlebars.compile(SecurityHtml);
        let obj: any = {
            securities: securities
        }
        let content = template(obj);
        tbody.innerHTML = content;
    }

    private bindLoadMore() {

        const el = document.querySelector('#liminal_market_load_more')!;
        const observer = new window.IntersectionObserver(async ([entry]) => {
            if (entry.isIntersecting) {
                await this.loadMore();
            }
        }, {
            root: null,
            threshold: 0.1, // set offset 0.1 means trigger if atleast 10% of element in viewport
        });
        observer.observe(el);
    }

    public async loadMore(this: SecuritiesList): Promise<void> {
        if (!this.loadmore) return;

        let tbody = document.getElementById(this.tbodyId);
        if (!tbody) return;

        let securitiesService = await SecuritiesService.getInstance();
        let securities = await securitiesService.getPaginatingSecurities(this.page++);

        let template = Handlebars.compile(SecurityHtml);
        let obj: any = {
            securities: securities
        }
        let content = template(obj);

        tbody.insertAdjacentHTML('beforeend', content);
    }

    private async addToWalletOrGetAddress(event: MouseEvent, element: HTMLElement) {
        let className = element.className;
        if (className != 'getAddress' && className != 'addToWallet') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        let symbol = element.dataset.symbol;
        if (!symbol) return;

        LoadingHelper.setLoading(element);

        let liminalMarketService = new LiminalMarketService(Moralis);
        let address = await liminalMarketService.getSymbolContractAddress(symbol);

        if (className == 'getAddress') {
            await this.showGetAddress(element, symbol, address);
        } else {
            await this.showAddToWallet(element, symbol, address);
        }
        LoadingHelper.removeLoading();
    }

    private async showGetAddress(element: HTMLElement, symbol: string, address: string) {
        if (address !== AddressZero) {
            let copyHelper = new CopyHelper();
            let success = await copyHelper.copyTextToClipboard(address);
            if (success) {
                element.innerText = 'Copied';
                return;
            }
        }
        this.renderContractInfoToString(element, address, symbol, AddressInfoHtml)
    }

    public async showAddToWallet(element: HTMLElement, symbol: string, address: string) {
        if (address !== AddressZero) {
            let walletHelper = new WalletHelper();

            let added = await walletHelper.addTokenToWallet(Moralis, address, symbol, () => {
               LoadingHelper.removeLoading();
               this.renderContractInfoToString(element, address, symbol, AddToWalletHtml);
            });
            if (added) {
                return '';
            }

        }
        this.renderContractInfoToString(element, address, symbol, AddToWalletHtml);


    }

    private renderContractInfoToString(element: HTMLElement, address: string, symbol: string, template: string) {
        let symbolInfoToCopy = document.getElementById('symbolInfoToCopy');
        if (symbolInfoToCopy) symbolInfoToCopy.remove();

        let content = '';
        if (address === AddressZero) {
            let template = Handlebars.compile(ContractAddressNotFound);
            content = template(null);
        } else {
            let template = Handlebars.compile(AddressInfoHtml);
            let obj: any = {
                symbol: symbol,
                address: address
            }
            content = template(obj);
        }
        element.parentElement!.parentElement!.parentElement!.insertAdjacentHTML('afterend', content);
    }
}