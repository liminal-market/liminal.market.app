import ContractInfo from "../../contracts/ContractInfo";
import NetworkInfo from "../../networks/NetworkInfo";

export default class AUSDService {
    private static AUSDInfo : any;
    moralis : typeof Moralis;

    constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public async getAUSDBalanceOf(ethAddress : string) : Promise<number> {
        let contractInfo = ContractInfo.getContractInfo();
        let abi = this.getAUsdAbi();

        const ausdOptions = {
            contractAddress: contractInfo.AUSD_ADDRESS,
            functionName: "balanceOf",
            abi: abi,
            params: {
                account: ethAddress
            }
        };

        return await this.moralis.executeFunction(ausdOptions).then(balanceOf => {
            let amount = this.moralis.Units.FromWei(balanceOf.toString(), 18);
            return parseFloat(amount);
        }).catch(function (err) {
            console.error(err);
            return 0;
        });
    }

    public async getAUsdAbi() {
        if (AUSDService.AUSDInfo) return AUSDService.AUSDInfo.abi;

        let response = await fetch('../abi/aUSD.json');
        AUSDService.AUSDInfo = await response.json();
        return AUSDService.AUSDInfo.abi;
    }

    public async fundUser() : Promise<boolean> {
        let networkInfo = NetworkInfo.getInstance();
        const params = {
            chainId: networkInfo.ChainId
        };

        this.moralis.Cloud.run('fundUser', params).then(function() {
            return true;

        }).catch(function(error) {
            console.error(error);
        });
        return false;
    }


    public async transfer(symbolAddress : string, qty : number) {
        let contractInfo = ContractInfo.getContractInfo();
        let abi = await this.getAUsdAbi();
            const liminalOptions = {
            contractAddress: contractInfo.AUSD_ADDRESS,
            functionName: "transfer",
            abi: abi,
            params: {
                recipient: symbolAddress,
                amount: Moralis.Units.Token(qty, 18)
            },
        };

        return await Moralis.executeFunction(liminalOptions);
    }
}