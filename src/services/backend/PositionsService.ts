

export default class PositionsService {
    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async getPositions(address: string) {
        let userPosition = await this.moralis.Cloud.run('positions', {address});
        return userPosition?.positions;
    }

    public async getUserPositions(address: string) {
        return await this.moralis.Cloud.run('positions', {address});
    }
}