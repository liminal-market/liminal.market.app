import {ethers} from "ethers";
import App from "../../main";
import ContractAddresses from "../../contracts/ContractAddresses";
import ContractInfo from "../../contracts/ContractInfo";

export default class EventService {
    contracts: ContractAddresses;

    constructor() {
        this.contracts = ContractInfo.getContractInfo(App.Network.Name);
    }

    public subscribeToBuy(hash: string) {
        this.listen(hash, 'BuyWithAUsd')
    }

    public subscribeToSell(hash: string) {
        this.listen(hash, 'SellSecurityToken')
    }

    private listen(hash: string, event: string) {
        this.store(hash);

        const lmContract = new ethers.Contract(this.contracts.LIMINAL_MARKET_ADDRESS, this.lmAbi, App.User.signer);
        console.log('subscribe to event ' + event);
        let listeners = lmContract.listeners('BuyWithAUsd');
        if (listeners.length > 0) {
            return;
        }

        lmContract.on(event, (a, b, c) => {
            console.log(event + ' event', a, b, c);
            lmContract.off(event, App.User.provider);
            this.remove(hash);
        });

    }

    private store(hash: string) {
        if (!window.localStorage) return;

        let hashes: string[] = [];
        let obj = window.localStorage.getItem('hashes');
        if (obj) {
            hashes = JSON.parse(obj) as string[];
        }
        hashes.push(hash);
        window.localStorage.setItem('hashes', JSON.stringify(hashes))
    }

    public remove(hash: string) {
        if (!window.localStorage) return;

        let json = window.localStorage.getItem('hashes');
        if (!json) return;

        let hashes = JSON.parse(json) as string[];
        let idx = hashes.indexOf(hash);
        hashes.splice(idx, 1);
        if (hashes.length == 0) {
            window.localStorage.removeItem('hashes');
        } else {
            window.localStorage.setItem('hashes', JSON.stringify(hashes))
        }
    }

    lmAbi = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "walletAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "accountId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "tokenAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "BuyWithAUsd",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "accountId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "walletAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "aUsdAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "SellSecurityToken",
            "type": "event"
        }
    ]


}