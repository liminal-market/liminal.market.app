import {IsMarketOpen} from "../modules/market";
import UserService from "../backend/UserService";
import NetworkInfo from "../../networks/NetworkInfo";

export default class MarketService {
    moralis : typeof Moralis;

    public constructor(moralis : typeof Moralis) {
        if (!moralis) moralis = Moralis;
        this.moralis = moralis;
    }

    public async isMarketOpen() : Promise<boolean> {
        return await this.moralis.Cloud.run('isOpen');
    }



}