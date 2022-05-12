import NetworkInfo from "../../networks/NetworkInfo";

export default class FundingService {
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async requestFakeFunding() {
        let networkInfo = NetworkInfo.getInstance();

        return await this.moralis.Cloud.run('fundUser', {chainId:networkInfo.ChainId});
    }

}