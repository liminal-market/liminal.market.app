
export default class FundingService {
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async requestFakeFunding() {
        return await this.moralis.Cloud.run('fundUser');
    }

}