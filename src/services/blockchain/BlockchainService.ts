import ErrorInfo from "../../errors/ErrorInfo";
import GeneralError from "../../errors/GeneralError";
import NetworkInfo from "../../networks/NetworkInfo";
import AuthenticateService from "../backend/AuthenticateService";
import BaseService from "../backend/BaseService";
import User from "../../dto/User";
import UserService from "../backend/UserService";
import App from "../../main";
import {ethers} from "ethers";
import ContractInfo from "../../contracts/ContractInfo";
import Network from "../../networks/Network";
import ContractAddresses from "../../contracts/ContractAddresses";
import BigNumber from "bignumber.js";
import EventService from "./EventService";

export default class BlockchainService extends BaseService {

    network: Network;
    contracts: ContractAddresses;

    constructor() {
        super();
        this.network = NetworkInfo.getInstance();
        this.contracts = ContractInfo.getContractInfo(this.network.Name);
    }

    protected async getBalanceOf(tokenAddress: any, ethAddress: string): Promise<BigNumber> {
        await this.loadEther();

        if (!App.User.ether) {
            return new BigNumber(0);
        }

        const contract = new ethers.Contract(tokenAddress, this.balanceOfAbi, App.User.ether);
        return await contract.balanceOf(ethAddress);
    }

    protected async transferInner(tokenAddress: string, to: string, qty: BigNumber) {
        await this.loadEther();

        let qtyWei = ethers.utils.parseUnits(qty.toString(), 'ether');

        console.log('transferInner', qtyWei.toString(), tokenAddress, to);
        const contract = new ethers.Contract(tokenAddress, this.transferAbi, App.User.signer);
        let result = await contract.transfer(to, qtyWei);

        let eventService = new EventService();
        if (tokenAddress == this.contracts.AUSD_ADDRESS) {
            eventService.subscribeToBuy(result.hash);
        } else {
            eventService.subscribeToSell(result.hash);
        }

        console.log('transfer result', result);
        return result;
    }

    protected async loadEther() {
        if (App.User.ether) return;
        await AuthenticateService.enableWeb3();
    }

    public async getNativeBalance() {
        const balanceInWei = await App.User.ether.getBalance(App.User.address);

        const balanceInEther = ethers.utils.formatEther(balanceInWei);
        return balanceInEther
    }

    balanceOfAbi = [{
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }]
    transferAbi = ["function transfer(address to, uint amount)"];
}