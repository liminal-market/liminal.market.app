
export default class MarketService {
    moralis : typeof Moralis;

    public constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async isMarketOpen() : Promise<boolean> {
        return await this.moralis.Cloud.run('isOpen');
    }



}