import NetworkInfo from "../../networks/NetworkInfo";
import BaseService from "../backend/BaseService";

export default class FundingService extends BaseService {

    constructor() {
        super()
    }

    public async requestFakeFunding() {
        return await this.post('fundUser');
    }

}