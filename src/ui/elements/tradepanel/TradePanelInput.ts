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
    tradeType: TradeType;
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

    public render(): void {
        let element = document.querySelector('.' + this.tradeType + 'Inputs') as HTMLElement;
        element.outerHTML = this.renderToString();

        this.bindEvents();
    }

    public bindEvents() {
        this.bindQuantityListener();
        this.bindSelectStockButton();
        this.bindMaxLink();
    }


    private bindSelectStockButton() {
        let selectStock = document.querySelector('.' + this.tradeType + 'Inputs .selectStock') as HTMLInputElement;
        if (!selectStock) return;

        selectStock.addEventListener('click', async (evt) => {
            evt.preventDefault();

            let securityList = new SecuritiesListModal();
            await securityList.showModal(async (symbol: string, name: string, logo: string) => {
                securityList.hideModal();

                this.symbol = symbol;
                this.name = name;
                this.logo = logo;

                let liminalMarketService = new LiminalMarketService(this.moralis);
                this.address = await liminalMarketService.getSymbolContractAddress(symbol);

                this.render();
                await this.loadBalance().then();
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
        maxBalanceDom.dataset.balance = this.balance.toString();
        maxBalanceDom.addEventListener('click', (evt) => {
            evt.preventDefault();

            let balance = (evt.target as HTMLElement).dataset.balance;
            if (!balance) return;

            let qtyInput = document.querySelector('.' + this.tradeType + 'Inputs .trade_input input') as HTMLInputElement;
            if (!qtyInput) return;

            qtyInput.value = balance;
            this.setQuantity(qtyInput.value);
            this.loadProgressbar();

            if (this.otherTradePanelInput) this.otherTradePanelInput.updateQuantity();
            if (this.onUpdate) this.onUpdate();
        })
    }

    public async loadBalance() {
        let userService = new UserService(this.moralis);
        let ethAddress = userService.getEthAddress();

        let balanceDom = document.querySelector('.' + this.tradeType + 'Inputs .balance_value') as HTMLElement;
        if (!balanceDom) return;

        if (this.symbol === 'aUSD') {
            let aUsdService = new AUSDService(this.moralis);
            this.balance = await aUsdService.getAUSDBalanceOf(ethAddress);
            balanceDom.innerHTML = '$' + roundBigNumber(this.balance).toString();
        } else if (this.name !== '') {
            let securityTokenService = new SecurityTokenService(this.moralis);
            this.balance = await securityTokenService.getQuantityByAddress(this.symbol, ethAddress);
            balanceDom.innerHTML = roundBigNumberDecimal(this.balance, 6).toString();
        }
        balanceDom.dataset.tooltip = this.balance.toString();
        balanceDom.title = this.balance.toString();

        this.loadProgressbar();
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
        let tradeInfo = await stockPriceService.getSymbolPrice(this.symbol);
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

    public static switchPanels(sellTradePanelInput : TradePanelInput, buyTradePanelInput : TradePanelInput) : [TradePanelInput, TradePanelInput] {
        let tmpSellObj = sellTradePanelInput.clone();
        sellTradePanelInput = buyTradePanelInput;
        sellTradePanelInput.tradeType = TradeType.Sell;
        if (sellTradePanelInput.otherTradePanelInput) sellTradePanelInput.otherTradePanelInput.tradeType = TradeType.Buy;

        buyTradePanelInput = tmpSellObj;
        buyTradePanelInput.tradeType = TradeType.Buy;
        if (buyTradePanelInput.otherTradePanelInput) buyTradePanelInput.otherTradePanelInput.tradeType = TradeType.Sell;

        sellTradePanelInput.render();
        buyTradePanelInput.render();

        return [sellTradePanelInput, buyTradePanelInput];
    }

    public clone(): any {
        let cloneObj = new TradePanelInput(this.moralis, this.symbol, this.name, this.logo, this.address, this.tradeType) as any;
        for (let attribut in this) {
            if (typeof this[attribut] === "object") {
                cloneObj[attribut] = (this[attribut] as any);
            } else {
                cloneObj[attribut] = this[attribut];
            }
        }
        return cloneObj;
    }

    public setQuantity(value : string) {
        this.quantity = new BigNumber(value);
        this.strQuantity = value;
    }
    public quantityFormatted() {
        return (this.symbol === 'aUSD') ? '$' + this.quantity : this.quantity;
    }
}