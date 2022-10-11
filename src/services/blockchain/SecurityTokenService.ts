import ContractInfo from "../../contracts/ContractInfo";
import LiminalMarketService from "./LiminalMarketService";
import ErrorInfo from "../../errors/ErrorInfo";
import {AddressZero} from "../../util/Helper";
import BigNumber from "bignumber.js";
import BlockchainError from "../../errors/BlockchainError";
import BlockchainService from "./BlockchainService";

export default class SecurityTokenService extends BlockchainService {


    private static SecurityTokenInfo: any;

    constructor(moralis: typeof Moralis) {
        super(moralis);
    }


    public async getQuantityByAddress(symbol: string, ethAddress: string): Promise<BigNumber> {
        let liminalMarketService = new LiminalMarketService(this.moralis);
        let symbolAddress = await liminalMarketService.getSymbolContractAddress(symbol);
        if (symbolAddress === AddressZero) return new BigNumber(0);

        let options = await this.getOptions('balanceOf', symbolAddress, {
            account: ethAddress
        });

        return await this.executeFunction(options)
            .then(balanceOf => {
                let amount = this.moralis.Units.FromWei(balanceOf.toString(), 18);
                return new BigNumber(amount);
            }).catch(reason => {
                let blockchainError = new BlockchainError(reason);
                ErrorInfo.report(blockchainError);
                return new BigNumber(0);
            });
    }

    public async transfer(symbolAddress: string, qty: BigNumber) {
        let contractInfo = ContractInfo.getContractInfo();
        let options = await this.getOptions('transfer', symbolAddress, {
            recipient: contractInfo.AUSD_ADDRESS,
            amount: Moralis.Units.Token(qty.toString(), 18)
        });

        let result = await this.executeFunction(options)
            .then(result => {
                return result
            })
            .catch(reason => {
                let blockchainError = new BlockchainError(reason);
                throw ErrorInfo.report(blockchainError);
            });
        return result;
    }

    private async getOptions(functionName: string, symbolAddress: string, params: any) {
        let securitySymbolAbi = await this.getSecurityTokenAbi();
        const options = {
            contractAddress: symbolAddress,
            functionName: functionName,
            abi: securitySymbolAbi,
            params: params
        };
        return options;
    }

    public async getSecurityTokenAbi() {
        if (SecurityTokenService.SecurityTokenInfo) return SecurityTokenService.SecurityTokenInfo.abi;

        let response = await fetch('../abi/SecurityToken.json');
        SecurityTokenService.SecurityTokenInfo = await response.json();
        return SecurityTokenService.SecurityTokenInfo.abi;
    }
}