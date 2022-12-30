import LiminalMarketService from "./LiminalMarketService";
import {AddressZero} from "../../util/Helper";
import BigNumber from "bignumber.js";
import BlockchainService from "./BlockchainService";
import {ethers} from "ethers";

export default class SecurityTokenService extends BlockchainService {


    private static SecurityTokenInfo: any;

    constructor() {
        super();
    }


    public async getQuantityByAddress(symbol: string, ethAddress: string): Promise<BigNumber> {
        let liminalMarketService = new LiminalMarketService();
        let symbolAddress = await liminalMarketService.getSymbolContractAddress(symbol);
        if (symbolAddress === AddressZero) return new BigNumber(0);

        let qty = await this.getBalanceOf(symbolAddress, ethAddress);
        return new BigNumber(ethers.utils.formatEther(qty.toString()));
    }

    public async transfer(symbolAddress: string, qty: BigNumber) {
        let result = super.transferInner(symbolAddress, this.contracts.AUSD_ADDRESS, qty);
        return result;
    }

}