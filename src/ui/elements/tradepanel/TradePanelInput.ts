import TradeInputHtml from '../../../html/elements/tradepanel/TradeInput.html';
import {TradeType} from "../../../enums/TradeType";
import SecuritiesListModal from "../../modals/SecuritiesListModal";
import LiminalMarketService from "../../../services/blockchain/LiminalMarketService";
import SecurityTokenService from "../../../services/blockchain/SecurityTokenService";
import AUSDService from "../../../services/blockchain/AUSDService";
import UserService from "../../../services/backend/UserService";
import {roundBigNumber, roundBigNumberDecimal, roundNumberDecimal} from "../../../util/Helper";
import StockPriceService from "../../../services/backend/StockPriceService";
import BigNumber from "bignumber.js";
import PricePerShareHtml from '../../../html/elements/tradepanel/PricePerShare.html'
import Moralis from "moralis";


export default class TradePanelInput {
    moralis: typeof Moralis;
    symbol: string;
    name: string;
    logo: string;
    address: string;
    readonly tradeType: TradeType;
    quantity: BigNumber;
    strQuantity : string;
    balance: BigNumber;
    lastPrice: number;
    lastTraded: string;
    qtyPerDollar: number;
    template: any;
    pricePerShareTemplate: any;
    otherTradePanelInput: TradePanelInput | undefined;
    onUpdate : (() => void) | undefined;
    isDirty : boolean = false;

    constructor(moralis: typeof Moralis, symbol: string, name: string, logo: string, address: string, tradeType: TradeType) {
        this.moralis = moralis;
        this.symbol = symbol;
        this.name = name;
        this.logo = logo;
        this.address = address;
        this.tradeType = tradeType;
        this.quantity = new BigNumber(0);
        this.strQuantity = '';
        this.balance = new BigNumber(0);
        this.lastPrice = 0;
        this.qtyPerDollar = 0;
        this.lastTraded = '';
        this.template = Handlebars.compile(TradeInputHtml);
        this.pricePerShareTemplate = Handlebars.compile(PricePerShareHtml);

    }

    public setOtherTradePanelInput(tradePanelInput: TradePanelInput) {
        this.otherTradePanelInput = tradePanelInput;
    }

    public renderToString(): string {
        return this.template(this);
    }

    public render(bindEvents : boolean = true): void {
        let element = document.querySelector('.' + this.tradeType + 'Inputs') as HTMLElement;
        element.outerHTML = this.renderToString();
        if (bindEvents) {
            this.bindEvents();
        }
    }

    public bindEvents() {
        this.bindQuantityListener();
        this.bindSelectStockButton();
        this.bindMaxLink();
    }

    public setSymbol(symbol: string, name: string, logo: string) {
        this.symbol = symbol;
        this.name = name;
        this.logo = logo;

        this.isDirty = true;
    }

    private bindSelectStockButton() {
        let selectStock = document.querySelector('#' + this.tradeType + 'SelectStock') as HTMLInputElement;
        if (!selectStock) return;

        selectStock.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let securityList = new SecuritiesListModal(this.moralis);
            await securityList.showModal(async (symbol: string, name: string, logo: string) => {
                securityList.hideModal();

                if (this.otherTradePanelInput && this.symbol == 'aUSD' && symbol != this.symbol) {
                    this.otherTradePanelInput.setSymbol(this.symbol, this.name, this.logo)
                }

                this.symbol = symbol;
                this.name = name;
                this.logo = logo;

                let liminalMarketService = new LiminalMarketService(this.moralis);
                this.address = await liminalMarketService.getSymbolContractAddress(symbol);

                this.render();
                this.loadBalance().then();
                await this.loadLastTrade();

                if (this.onUpdate) this.onUpdate();
            });
        })
    }
    private bindQuantityListener() {
        let qtyInput = document.querySelector('.' + this.tradeType + 'Inputs .trade_input input') as HTMLInputElement;
        if (!qtyInput) return;

        let inputTimer : any;
        qtyInput.addEventListener('keyup', (evt) => {
            if (inputTimer) clearTimeout(inputTimer);

            inputTimer = setTimeout(() => {
                let inputValue = (evt.target as HTMLInputElement).value;
                this.setQuantity(inputValue);
                this.loadProgressbar();

                if (this.otherTradePanelInput) this.otherTradePanelInput.updateQuantity();
                if (this.onUpdate) this.onUpdate();
            }, 300);
        })
    }

    private bindMaxLink() {
        let maxBalanceDom = document.querySelector('.' + this.tradeType + 'Inputs .balance_max') as HTMLElement;
        if (!maxBalanceDom) return;

        maxBalanceDom.addEventListener('click', (evt) => {
            evt.preventDefault();

            let qtyInput = document.querySelector('.' + this.tradeType + 'Inputs .trade_input input') as HTMLInputElement;
            if (!qtyInput) return;

            qtyInput.value = this.balance.toFixed();
            this.setQuantity(qtyInput.value);
            this.loadProgressbar();

            if (this.otherTradePanelInput) this.otherTradePanelInput.updateQuantity();
            if (this.onUpdate) this.onUpdate();
        })
    }

    public async loadBalance() {
        this.balance = new BigNumber(0);

        let userService = new UserService(this.moralis);
        let ethAddress = userService.getEthAddress();

        let balanceDom = document.querySelector('.' + this.tradeType + 'Inputs .balance_value') as HTMLElement;
        if (!balanceDom) return;

        if (this.symbol === 'aUSD') {
            if (ethAddress) {
                let aUsdService = new AUSDService(this.moralis);
                this.balance = await aUsdService.getAUSDBalanceOf(ethAddress);
            }
            balanceDom.innerHTML = '$' + roundBigNumber(this.balance).toString();
        } else if (this.name !== '') {
            this.balance = new BigNumber(0);
            if (ethAddress) {
                let securityTokenService = new SecurityTokenService(this.moralis);
                this.balance = await securityTokenService.getQuantityByAddress(this.symbol, ethAddress);
            }
            balanceDom.innerHTML = roundBigNumberDecimal(this.balance, 6).toString();
        }
        balanceDom.dataset.tooltip = this.balance.toString();
        balanceDom.title = this.balance.toString();

        this.loadProgressbar();
        this.toggleMaxBalanceLink();
    }

    public async loadLastTrade() {
        if (this.symbol === 'aUSD') {
            this.lastPrice = 1;
            this.qtyPerDollar = 1;
            return;
        }
        if (!this.otherTradePanelInput || this.name == '') return;

        let aUsdPricePerShare = document.querySelector('.' + this.otherTradePanelInput.tradeType + 'Inputs .price_per_share') as HTMLElement;
        if (!aUsdPricePerShare) return;

        let pricePerShare = document.querySelector('.' + this.tradeType + 'Inputs .price_per_share') as HTMLElement;
        if (!pricePerShare) return;

        aUsdPricePerShare.setAttribute('aria-busy', 'true');
        pricePerShare.setAttribute('aria-busy', 'true');

        let stockPriceService = new StockPriceService(this.moralis);
        let tradeInfo = await stockPriceService.getSymbolPrice(this.symbol, this.otherTradePanelInput.tradeType);

        this.lastPrice = tradeInfo.price;
        this.lastTraded = tradeInfo.lastTrade.toString();
        this.qtyPerDollar = 1 / this.lastPrice;

        let pricePerShareHtml: any = {
            lastTraded: this.lastTraded,
            text: '≈ $' + this.lastPrice + ' per share'
        };
        pricePerShare.innerHTML = this.pricePerShareTemplate(pricePerShareHtml);

        let pricePerAUsdHtml: any = {
            lastTraded: this.lastTraded,
            text: '1 aUSD ≈ ' + roundNumberDecimal(this.qtyPerDollar, 6) + ' ' + this.symbol
        };
        aUsdPricePerShare.innerHTML = this.pricePerShareTemplate(pricePerAUsdHtml);
        this.updateQuantity();

        aUsdPricePerShare.removeAttribute('aria-busy');
        pricePerShare.removeAttribute('aria-busy');
    }

    public updateQuantity() {
        if (!this.otherTradePanelInput) return;

        let qtyInput = document.querySelector('.' + this.tradeType + 'Inputs .trade_input input') as HTMLInputElement;
        if (!qtyInput) return;
        if (this.symbol === 'aUSD') {
            qtyInput.value = this.otherTradePanelInput.quantity.div(this.otherTradePanelInput.qtyPerDollar).toString();
        } else {
            qtyInput.value = this.otherTradePanelInput.quantity.multipliedBy(this.qtyPerDollar).toString();
        }
        this.setQuantity(qtyInput.value);
        this.loadProgressbar();
    }

    private loadProgressbar() {
        if (this.quantity.eq(0) || this.balance.eq(0) || this.tradeType == TradeType.Buy) return;

        let progressDom = document.querySelector('.' + this.tradeType + 'Inputs .progress') as HTMLProgressElement;
        if (!progressDom) return;

        let percentage = this.quantity.div(this.balance).toNumber();
        progressDom.value = percentage;
        progressDom.classList.remove('d-none');

        let exceedsBalance = document.querySelector('.' + this.tradeType + 'Inputs .exceeds_wallet_balance') as HTMLElement;
        if (percentage > 1) {
            exceedsBalance.classList.remove('d-none');
            progressDom.setAttribute('aria-invalid', 'true');
        } else {
            exceedsBalance.classList.add('d-none');
        }
    }

    public static async switchPanels(sellTradePanelInput: TradePanelInput, buyTradePanelInput: TradePanelInput): Promise<[TradePanelInput, TradePanelInput]> {
        let sellSymbol = sellTradePanelInput.symbol;
        let sellName = sellTradePanelInput.name;
        let sellLogo = sellTradePanelInput.logo;
        let sellQuantity = sellTradePanelInput.quantity;
        sellTradePanelInput.setSymbol(buyTradePanelInput.symbol, buyTradePanelInput.name, buyTradePanelInput.logo)
        sellTradePanelInput.quantity = buyTradePanelInput.quantity;
        buyTradePanelInput.setSymbol(sellSymbol, sellName, sellLogo)
        buyTradePanelInput.quantity = sellQuantity;

        await sellTradePanelInput.updatePanel();
        await buyTradePanelInput.updatePanel();

        return [sellTradePanelInput, buyTradePanelInput];
    }

    public setQuantity(value : string) {
        if (value == '' || value == '0') return;
        this.quantity = new BigNumber(value);
        this.strQuantity = value;
    }
    public quantityFormatted() {
        return (this.symbol === 'aUSD') ? '$' + this.quantity : this.quantity;
    }

    public async updatePanel() {
        this.updateQuantity();
        this.render(true);

        await this.loadBalance();
        await this.loadLastTrade();


    }

    private toggleMaxBalanceLink() {
        let maxBalanceDom = document.querySelector('.' + this.tradeType + 'Inputs .balance_max') as HTMLElement;
        if (!maxBalanceDom) return;

        if (this.balance.eq(0)) {
            maxBalanceDom.classList.add('d-none');
        } else {
            maxBalanceDom.classList.remove('d-none');
        }
    }
}