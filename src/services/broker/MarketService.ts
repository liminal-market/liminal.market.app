import BaseService from "../backend/BaseService";

export default class MarketService extends BaseService {

    public constructor() {
        super();
    }

    public async isMarketOpen(): Promise<any> {
        return await this.get('isOpen');
    }


}