import TradeSwitchHtml from '../../../html/elements/tradepanel/TradeSwitch.html';
import TradePanelInput from "./TradePanelInput";
import ExecuteOrderButton from "./ExecuteOrderButton";

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

    public bindEvents(sellTradePanelInput: TradePanelInput, buyTradePanelInput: TradePanelInput, executeTradeButton: ExecuteOrderButton) {
        let dom = document.querySelector('.switchBtn');
        if (!dom) return;

        dom.addEventListener('click', async (evt) => {
            evt.preventDefault();

            [sellTradePanelInput, buyTradePanelInput] = await TradePanelInput.switchPanels(sellTradePanelInput, buyTradePanelInput);


        })
    }
}