import ErrorInfo from "../../errors/ErrorInfo";
import GeneralError from "../../errors/GeneralError";
import NetworkInfo from "../../networks/NetworkInfo";
import AuthenticateService from "../backend/AuthenticateService";

export default class BlockchainService {
    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async executeFunction(options: any) {
        if (typeof ethereum != 'undefined' && ethereum && ethereum.chainId) {
            let networkInfo = NetworkInfo.getNetworkInfoByChainId(ethereum.chainId);
            if (!networkInfo) {
                throw new GeneralError('chain not supported');
            }
        }

        return await this.moralis.executeFunction(options)
    }
}