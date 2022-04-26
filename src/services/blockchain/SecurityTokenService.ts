import ContractInfo from "../../contracts/ContractInfo";
import LiminalMarketService from "./LiminalMarketService";

export default class SecurityTokenService {
    moralis: typeof Moralis;

    private static SecurityTokenInfo: any;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }


    public async getQuantityByAddress(symbol : string, ethAddress : string) : Promise<number>{
        let contractInfo = ContractInfo.getContractInfo();

        let liminalMarketService = new LiminalMarketService(this.moralis);
        let liminalMarketAbi = await liminalMarketService.getLiminalMarketAbi();

        const liminalMarketOptions = {
            contractAddress: contractInfo.LIMINAL_MARKET_ADDRESS,
            functionName: "getSecurityToken",
            abi: liminalMarketAbi,
            params: {
                symbol: symbol
            }
        };
        let symbolAddress = (await this.moralis.executeFunction(liminalMarketOptions)).toString();
        let securitySymbolAbi = this.getSecurityTokenAbi();

        const symbolTokenOptions = {
            contractAddress: symbolAddress,
            functionName: "balanceOf",
            abi: securitySymbolAbi,
            params: {
                account: ethAddress
            }
        };

        return await this.moralis.executeFunction(symbolTokenOptions).then(balanceOf => {
            let amount = this.moralis.Units.FromWei(balanceOf.toString(), 18);
            return parseFloat(amount);
        }).catch(function (err) {
            console.error(err);
            return 0;
        });
    }

    public async getSecurityTokenAbi() {
        if (SecurityTokenService.SecurityTokenInfo) return SecurityTokenService.SecurityTokenInfo.abi;

        let response = await fetch('../abi/SecurityToken.json');
        SecurityTokenService.SecurityTokenInfo = await response.json();
        return SecurityTokenService.SecurityTokenInfo.abi;
    }

    public async transfer(symbolAddress : string, qty : number) {

        let contractInfo = ContractInfo.getContractInfo();
        let abi = await this.getSecurityTokenAbi();
        const liminalOptions = {
            contractAddress: symbolAddress,
            functionName: "transfer",
            abi: abi,
            params: {
                recipient: contractInfo.AUSD_ADDRESS,
                amount: Moralis.Units.Token(qty, 18)
            },
        };

        return await Moralis.executeFunction(liminalOptions);
    }

}