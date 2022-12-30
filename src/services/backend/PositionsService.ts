import BaseService from "./BaseService";


export default class PositionsService extends BaseService {


    constructor() {
        super();
    }

    public async getPositions(address: string) {
        let userPosition = await this.get('positions', {address});
        return userPosition?.positions;
    }

    public async getUserPositions(address: string) {
        return await this.get('positions', {address});
    }
}