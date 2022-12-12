import BlockchainError from "../../errors/BlockchainError";
import BlockchainService from "./BlockchainService";
import {ethers} from "ethers";
import App from "../../main";

export default class LiminalMarketService extends BlockchainService {

    private static LiminalMarketInfo: any;

    constructor() {
        super();
    }

    public async getSymbolContractAddress(symbol: string): Promise<string> {
        await this.loadEther();

        const contract = new ethers.Contract(this.contracts.LIMINAL_MARKET_ADDRESS, this.getSecurityTokenAbi, App.User.ether);
        return await contract.getSecurityToken(symbol);
    }


    public async createToken(symbol: string, creatingToken: () => void): Promise<string | BlockchainError> {
        const contract = new ethers.Contract(this.contracts.LIMINAL_MARKET_ADDRESS, this.createTokenAbi, App.User.signer);
        let result = await contract.createToken(symbol);

        creatingToken();

        console.log('createToken result:', result)
        await result.wait();

        return await this.getSymbolContractAddress(symbol);
    }

    getSecurityTokenAbi = [{
        "inputs": [
            {
                "internalType": "string",
                "name": "symbol",
                "type": "string"
            }
        ],
        "name": "getSecurityToken",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }]
    createTokenAbi = [{
        "inputs": [
            {
                "internalType": "string",
                "name": "symbol",
                "type": "string"
            }
        ],
        "name": "createToken",
        "outputs": [
            {
                "internalType": "contract SecurityToken",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }]
}