

export default class PositionsService {
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async getPositions() {
        return await this.moralis.Cloud.run('positions');
    }
}