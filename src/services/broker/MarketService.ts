
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