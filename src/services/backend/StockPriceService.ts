
import TradeInfo from "./TradeInfo";
import CloudError from "../../errors/CloudError";

export default class StockPriceService {
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async getSymbolPrice(symbol : string) : Promise<TradeInfo> {
        const params = {
            symbol: symbol
        };
        let result = await this.moralis.Cloud.run("getSymbolPrice", params)
            .catch(e => {
                throw new CloudError(e);
            });
        ;
        let tradeInfo = new TradeInfo(result.trade.p, result.trade.t);
        return tradeInfo;

    }
}