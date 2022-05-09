import ContractInfo from "../../contracts/ContractInfo";
import {AddressZero} from "../../util/Helper";
import LoadingHelper from "../../util/LoadingHelper";
import ErrorInfo from "../../errors/ErrorInfo";
import BlockchainError from "../../errors/BlockchainError";

export default class LiminalMarketService {
    moralis: typeof Moralis;

    private static LiminalMarketInfo: any;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async getSymbolContractAddress(symbol: string): Promise<string> {
        const options = await this.getOptions("getSecurityToken", {
            symbol: symbol
        })
        let result = await this.moralis.executeFunction(options)
            .then((value) => {
                return value.toString();
            }).catch((reason) => {
                let blockchainError = new BlockchainError(reason);
                throw ErrorInfo.report(blockchainError);
            });
        return result;
    }


    private async getOptions(functionName: string, params: any) {
        let contractInfo = ContractInfo.getContractInfo();
        let abi = await this.getLiminalMarketAbi();

        const options = {
            contractAddress: contractInfo.LIMINAL_MARKET_ADDRESS,
            functionName: functionName,
            abi: abi,
            params: params
        };
        return options;
    }

    public async getLiminalMarketAbi() {
        if (LiminalMarketService.LiminalMarketInfo) return LiminalMarketService.LiminalMarketInfo.abi;

        let response = await fetch('../abi/LiminalMarket.json');
        LiminalMarketService.LiminalMarketInfo = await response.json();
        return LiminalMarketService.LiminalMarketInfo.abi;
    }

    public async createToken(symbol: string, creatingToken : () => void): Promise<string | BlockchainError> {
        const liminalOptions = await this.getOptions("createToken", {
            symbol: symbol
        });

        let result = await this.moralis.executeFunction(liminalOptions)
            .then(result => {
                return result as typeof ExecuteFunctionCallResult;
            }).catch(reason => {
                let blockchainError = new BlockchainError(reason);
                if (blockchainError.userDeniedTransactionSignature()) {
                    return blockchainError;
                }
                throw ErrorInfo.report(blockchainError);

            });

        if (result instanceof BlockchainError) return result;

        creatingToken();
        await (result as typeof ExecuteFunctionCallResult).wait();

        return await this.getSymbolContractAddress(symbol);
    }


}