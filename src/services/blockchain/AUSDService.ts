import ContractInfo from "../../contracts/ContractInfo";
import ErrorInfo from "../../errors/ErrorInfo";
import BigNumber from "bignumber.js";
import BlockchainError from "../../errors/BlockchainError";
import DateHelper from '../../util/DateHelper';
import BlockchainService from "./BlockchainService";

type ListenerAction = (...args: Array<any>) => void;


export default class AUSDService extends BlockchainService {
    private static AUSDInfo: any;
    public static lastUpdate?: Date;
    private static aUSDAmount?: BigNumber;
    static onAUsdLoad: Array<ListenerAction> = [];

    constructor(moralis: typeof Moralis) {
        super(moralis)
    }

    public async getAUSDBalanceOf(ethAddress: string): Promise<BigNumber> {
        if (AUSDService.lastUpdate && AUSDService.aUSDAmount &&
            !DateHelper.isOlderThen(AUSDService.lastUpdate, 5)) {
            return AUSDService.aUSDAmount;
        }

        if (!this.moralis.isWeb3Enabled()) {
            return new BigNumber(0);
        }

        let options = await this.getOptions("balanceOf", {
            account: ethAddress
        });

        let result = await this.executeFunction(options).then(balanceOf => {
            let amount = this.moralis.Units.FromWei(balanceOf.toString(), 18);
            AUSDService.aUSDAmount = new BigNumber(amount);
            AUSDService.lastUpdate = new Date();

            return AUSDService.aUSDAmount;
        }).catch((reason) => {
            let blockchainError = new BlockchainError(reason);
            ErrorInfo.report(blockchainError);
            return new BigNumber(0);
        });

        for (let i = 0; i < AUSDService.onAUsdLoad.length; i++) {
            AUSDService.onAUsdLoad[i]();
        }
        return result;
    }

    public async transfer(symbolAddress: string, qty: BigNumber) {
        const options = await this.getOptions('transfer', {
            to: symbolAddress,
            amount: Moralis.Units.Token(qty.toString(), 18)
        });


        let result = await this.executeFunction(options)
            .then(result => {
                return result;
            })
            .catch(reason => {
                let blockchainError = new BlockchainError(reason);
                throw ErrorInfo.report(blockchainError);
            });

        AUSDService.aUSDAmount = undefined;
        AUSDService.lastUpdate = undefined;

        return result;
    }

    public async getOptions(functionName: string, params: any) {
        let contractInfo = ContractInfo.getContractInfo();
        let abi = await this.getAUsdAbi();

        const options = {
            contractAddress: contractInfo.AUSD_ADDRESS,
            functionName: functionName,
            abi: abi,
            params: params,
        };
        return options;
    }

    public async getAUsdAbi() {
        if (AUSDService.AUSDInfo) return AUSDService.AUSDInfo.abi;

        let response = await fetch('../abi/aUSD.json');
        AUSDService.AUSDInfo = await response.json();
        return AUSDService.AUSDInfo.abi;
    }
}