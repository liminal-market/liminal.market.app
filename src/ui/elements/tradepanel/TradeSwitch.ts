import TradeSwitchHtml from '../../../html/elements/tradepanel/TradeSwitch.html';
import TradePanelInput from "./TradePanelInput";
import ExecuteTradeButton from "./ExecuteTradeButton";

export default class TradeSwitch {

    template : any = undefined;

    constructor() {
        this.template = Handlebars.compile(TradeSwitchHtml);
    }


    public renderToString() {
        return this.template();
    }

    public render() {
        let dom = document.querySelector('.tradeSwitch');
        if (!dom) return;

        dom.outerHTML = this.renderToString()
    }

    public bindEvents(sellTradePanelInput : TradePanelInput, buyTradePanelInput : TradePanelInput, executeTradeButton : ExecuteTradeButton) {
        let dom = document.querySelector('.swithBtn');
        if (!dom) return;

        dom.addEventListener('click', async (evt) => {
            evt.preventDefault();

            [sellTradePanelInput, buyTradePanelInput] = TradePanelInput.switchPanels(sellTradePanelInput, buyTradePanelInput);

            /*
            await sellTradePanelInput.loadBalance();
            await buyTradePanelInput.loadBalance();

            sellTradePanelInput.updateQuantity();
            buyTradePanelInput.updateQuantity();

            if (sellTradePanelInput.symbol == 'aUSD') {
                await buyTradePanelInput.loadLastTrade();
            } else {
                await sellTradePanelInput.loadLastTrade();
            }
*/

        })
    }
}