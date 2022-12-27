import ExecuteOrderButton from "./tradepanel/ExecuteOrderButton";
import StockPriceService from "../../services/backend/StockPriceService";
import {TradeType} from "../../enums/TradeType";
import TradePanelInput from "./tradepanel/TradePanelInput";
import ContractInfo from "../../contracts/ContractInfo";
import TradeSwitch from "./tradepanel/TradeSwitch";
import SecuritiesListModal from "../modals/SecuritiesListModal";

export default class TradePanel {
    quantity : number;

    constructor() {
        this.quantity = 0;
    }

    public async render(elementId : string, symbol? : string, name? : string, logo? : string, address? : string) {
        let element = document.getElementById(elementId);
        if (!element) return;

        let contractInfo = ContractInfo.getContractInfo();

        let sellTradeInput = new TradePanelInput("aUSD", "aUSD at Broker", "/img/ausd.png", contractInfo.AUSD_ADDRESS, TradeType.Sell);
        let buyTradeInput: TradePanelInput;
        if (!symbol) {
            buyTradeInput = new TradePanelInput("Select stock", "", "", "", TradeType.Buy);
        } else {
            buyTradeInput = new TradePanelInput(symbol as string, name as string, logo as string, address as string, TradeType.Buy);
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

        let executeTradeButton = new ExecuteOrderButton(sellTradeInput, buyTradeInput);
        await executeTradeButton.renderButton();

        tradeSwitch.bindEvents(sellTradeInput, buyTradeInput, executeTradeButton);
        sellTradeInput.onUpdate = () => {
            if (buyTradeInput.isDirty) buyTradeInput.updatePanel();
            executeTradeButton.renderButton();
        }
        buyTradeInput.onUpdate = () => {
            if (sellTradeInput.isDirty) sellTradeInput.updatePanel();
            executeTradeButton.renderButton();
        }


    }
    public formatBuyPanel(symbol : string, name : string, logo : string, tradeType : TradeType, contractAddress : string) {
        document.getElementById('liminal_market_select_symbol')!.innerHTML = symbol;
    }


}