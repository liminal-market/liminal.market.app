
import TradeInfo from "./TradeInfo";

export default class StockPriceService {
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async getSymbolPrice(symbol : string) : Promise<TradeInfo> {
        const params = {
            symbol: Symbol
        };
        let result = await this.moralis.Cloud.run("getSymbolPrice", params);
        let tradeInfo = new TradeInfo(result.trade.p, result.trade.t);
        return tradeInfo;

    }
}