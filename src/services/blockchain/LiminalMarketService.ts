import ContractInfo from "../../contracts/ContractInfo";
import {AddressZero} from "../../util/Helper";

export default class LiminalMarketService {
    moralis : typeof Moralis;

    private static LiminalMarketInfo : any;


    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async getSymbolContractAddress(symbol : string) : Promise<string> {
        let contractInfo = ContractInfo.getContractInfo();
        let abi = await this.getLiminalMarketAbi();

        const securityTokenOptions = {
            contractAddress: contractInfo.LIMINAL_MARKET_ADDRESS,
            functionName: "getSecurityToken",
            abi: abi,
            params: {
                symbol: symbol
            }
        };
        return (await this.moralis.executeFunction(securityTokenOptions)).toString();
    }


    public async getLiminalMarketAbi() {
        if (LiminalMarketService.LiminalMarketInfo) return LiminalMarketService.LiminalMarketInfo.abi;

       let response = await fetch('../abi/LiminalMarket.json');
       LiminalMarketService.LiminalMarketInfo = await response.json();
       return LiminalMarketService.LiminalMarketInfo.abi;
    }

    public async createToken(symbol : string) : Promise<string> {
        let contractInfo = ContractInfo.getContractInfo()
        let abi = await this.getLiminalMarketAbi();

        const liminalOptions = {
            contractAddress: contractInfo.LIMINAL_MARKET_ADDRESS,
            functionName: "createToken",
            abi: abi,
            params: {
                symbol: symbol
            },
        };

        let txResult = (await this.moralis.executeFunction(liminalOptions)) as ExecuteFunctionCallResult;
        if (txResult.events.TokenCreated) {
            return txResult.events.TokenCreated.returnValues.tokenAddress;
        }
        return AddressZero;
    }


}