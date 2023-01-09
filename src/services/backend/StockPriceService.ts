import TradeInfo from "./TradeInfo";
import CloudError from "../../errors/CloudError";
import {TradeType} from "../../enums/TradeType";
import BaseService from "./BaseService";

export default class StockPriceService extends BaseService {

    constructor() {
        super();
    }

    public async getSymbolPrice(symbol: string, tradeType: TradeType): Promise<TradeInfo> {
        const params = {
            symbol: symbol
        };
        let result = await this.get("getSymbolPrice", params)
            .catch((e: any) => {
                throw new CloudError(e);
            });
        if (!result.quote) throw new Error('Quote could not be provided')

        let quote = result.quote;
        let price = (tradeType == TradeType.Sell) ? quote.ap : quote.bp;
        let tradeInfo = new TradeInfo(price, quote.t);
        return tradeInfo;

    }
}