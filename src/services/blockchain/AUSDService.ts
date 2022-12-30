import BigNumber from "bignumber.js";
import DateHelper from '../../util/DateHelper';
import BlockchainService from "./BlockchainService";
import {ethers} from "ethers";

type ListenerAction = (...args: Array<any>) => void;


export default class AUSDService extends BlockchainService {
    private static AUSDInfo: any;
    public static lastUpdate?: Date;
    private static aUSDAmount?: BigNumber;
    static onAUsdLoad: Array<ListenerAction> = [];

    constructor() {
        super()

    }

    public async getAUSDBalanceOf(ethAddress: string): Promise<BigNumber> {
        if (AUSDService.lastUpdate && AUSDService.aUSDAmount &&
            !DateHelper.isOlderThen(AUSDService.lastUpdate, 5)) {
            return AUSDService.aUSDAmount;
        }

        let balanceOf = await this.getBalanceOf(this.contracts.AUSD_ADDRESS, ethAddress)

        let amount = ethers.utils.formatEther(balanceOf.toString())
        AUSDService.aUSDAmount = new BigNumber(amount);
        AUSDService.lastUpdate = new Date();
        for (let i = 0; i < AUSDService.onAUsdLoad.length; i++) {
            AUSDService.onAUsdLoad[i]();
        }
        return AUSDService.aUSDAmount;

    }

    public async transfer(symbolAddress: string, qty: BigNumber) {
        let result = await super.transferInner(this.contracts.AUSD_ADDRESS, symbolAddress, qty);

        AUSDService.aUSDAmount = undefined;
        AUSDService.lastUpdate = undefined;

        return result;
    }

    public async getAUsdAbi() {
        if (AUSDService.AUSDInfo) return AUSDService.AUSDInfo.abi;

        let response = await fetch('../abi/aUSD.json');
        AUSDService.AUSDInfo = await response.json();
        return AUSDService.AUSDInfo.abi;
    }


}