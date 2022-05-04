import ContractInfo from "../../contracts/ContractInfo";
import NetworkInfo from "../../networks/NetworkInfo";
import ErrorInfo from "../../errors/ErrorInfo";
import BigNumber from "bignumber.js";

export default class AUSDService {
    private static AUSDInfo : any;
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async getAUSDBalanceOf(ethAddress : string) : Promise<BigNumber> {
        let options = await this.getOptions("balanceOf", {
            account: ethAddress
        });

        return await this.moralis.executeFunction(options).then(balanceOf => {
            let amount = this.moralis.Units.FromWei(balanceOf.toString(), 18);
            return new BigNumber(amount);
        }).catch((reason) => {
            ErrorInfo.report(reason);
            return new BigNumber(0);
        });
    }

    public async getAUsdAbi() {
        if (AUSDService.AUSDInfo) return AUSDService.AUSDInfo.abi;

        let response = await fetch('../abi/aUSD.json');
        AUSDService.AUSDInfo = await response.json();
        return AUSDService.AUSDInfo.abi;
    }

    public async transfer(symbolAddress : string, qty : BigNumber) {
        const options = await this.getOptions('transfer', {
            recipient: symbolAddress,
            amount: Moralis.Units.Token(qty.toString(), 18)
        });

        let result = await Moralis.executeFunction(options)
            .then(result => {return result;})
            .catch(reason => {
                throw ErrorInfo.report(reason);
            });
        return result;
    }

    public async getOptions(functionName : string, params : any) {
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
}