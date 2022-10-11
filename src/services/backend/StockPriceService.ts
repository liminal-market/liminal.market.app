import TradeInfo from "./TradeInfo";
import CloudError from "../../errors/CloudError";
import {TradeType} from "../../enums/TradeType";

export default class StockPriceService {
    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async getSymbolPrice(symbol: string, tradeType: TradeType): Promise<TradeInfo> {
        const params = {
            symbol: symbol
        };
        let result = await this.moralis.Cloud.run("getSymbolPrice", params)
            .catch((e: any) => {
                throw new CloudError(e);
            });
        let quote = result.quote;
        let price = (tradeType == TradeType.Sell) ? quote.ap : quote.bp;
        let tradeInfo = new TradeInfo(price, quote.t);
        return tradeInfo;

    }
}