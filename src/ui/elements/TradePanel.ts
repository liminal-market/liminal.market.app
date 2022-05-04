import ExecuteTradeButton from "./tradepanel/ExecuteTradeButton";
import StockPriceService from "../../services/backend/StockPriceService";
import {TradeType} from "../../enums/TradeType";
import TradePanelInput from "./tradepanel/TradePanelInput";
import ContractInfo from "../../contracts/ContractInfo";
import TradeSwitch from "./tradepanel/TradeSwitch";
import BigNumber from "bignumber.js";

export default class TradePanel {
    moralis : typeof Moralis;
    quantity : number;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
        this.quantity = 0;
    }

    public async render(elementId : string, symbol? : string, name? : string, logo? : string, address? : string) {
        let element = document.getElementById(elementId);
        if (!element) return;

        let contractInfo = ContractInfo.getContractInfo();

        let sellTradeInput = new TradePanelInput(this.moralis, "aUSD", "aUSD at Broker", "/img/ausd.png", contractInfo.AUSD_ADDRESS, TradeType.Sell);
        let buyTradeInput;
        if (!symbol) {
            buyTradeInput = new TradePanelInput(this.moralis, "Select stock", "", "", "", TradeType.Buy);
        } else {
            buyTradeInput = new TradePanelInput(this.moralis, symbol as string, name as string,logo as string,address as string, TradeType.Buy);
        }

        sellTradeInput.setOtherTradePanelInput(buyTradeInput);
        buyTradeInput.setOtherTradePanelInput(sellTradeInput);


        let tradeSwitch = new TradeSwitch();

        let sellInput = sellTradeInput.renderToString();
        let buyInput = buyTradeInput.renderToString();
        let switchHtml = tradeSwitch.renderToString();

        element.innerHTML = sellInput + switchHtml + buyInput;

        await sellTradeInput.loadBalance();
        await buyTradeInput.loadBalance();
        if (symbol) {
            await buyTradeInput.loadLastTrade();
        }
        sellTradeInput.bindEvents();
        buyTradeInput.bindEvents();

        let executeTradeButton = new ExecuteTradeButton(this.moralis, sellTradeInput, buyTradeInput);
        await executeTradeButton.renderButton();

        tradeSwitch.bindEvents(sellTradeInput, buyTradeInput, executeTradeButton);
        sellTradeInput.onUpdate = () => {
            executeTradeButton.renderButton();
        }
        buyTradeInput.onUpdate = () => {
            executeTradeButton.renderButton();
        }
    }
    public formatBuyPanel(symbol : string, name : string, logo : string, tradeType : TradeType, contractAddress : string) {
        document.getElementById('liminal_market_select_symbol')!.innerHTML = symbol;
    }

    public getSellAmount() : number {
        let sellInput = document.getElementById('liminal_market_sell_quantity') as HTMLInputElement;
        if (!sellInput) return 0;

        return parseFloat(sellInput.value);
    }

    public async updateBuyInfo(Symbol : string) {
        let buyQuantityInput = document.getElementById('liminal_market_buy_quantity') as HTMLInputElement;
        if (!buyQuantityInput) return;

        let stockPriceService = new StockPriceService(this.moralis);
        let tradeInfo = await stockPriceService.getSymbolPrice(Symbol);
        let sellAmount = this.getSellAmount();

        let buyQuantity = sellAmount / tradeInfo.price;

        buyQuantityInput.value = buyQuantity.toString();
    }

}