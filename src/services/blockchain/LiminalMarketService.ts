import ContractInfo from "../../contracts/ContractInfo";
import ErrorInfo from "../../errors/ErrorInfo";
import BlockchainError from "../../errors/BlockchainError";
import BlockchainService from "./BlockchainService";

export default class LiminalMarketService extends BlockchainService {

    private static LiminalMarketInfo: any;

    constructor(moralis: typeof Moralis) {
        super(moralis);
    }

    public async getSymbolContractAddress(symbol: string): Promise<string> {
        const options = await this.getOptions("getSecurityToken", {
            symbol: symbol
        })
        let result = await this.executeFunction(options)
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
            params: params,
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
        let salt = (new Date().getTime() + (Math.random() * 100000)).toString();
        salt = salt.substring(0, salt.indexOf('.'));
        const liminalOptions = await this.getOptions("createToken", {
            symbol: symbol,
            salt : salt
        });

        let result = await this.executeFunction(liminalOptions)
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