import localhostContractAddresses from './localhost-contract-addresses';
import rinkebyContractAddresses from './rinkeby-contract-addresses';
import mumbaiContractAddresses from './mumbai-contract-addresses';
import fujiContractAddresses from './fuji-contract-addresses';
import ContractAddresses from "./ContractAddresses";
import NetworkInfo from "../networks/NetworkInfo";


export default class ContractInfo {


    public static getContractInfo(networkName?: string): ContractAddresses {
        let contractInfos: any = {
            localhostContractAddresses, rinkebyContractAddresses,
            mumbaiContractAddresses, fujiContractAddresses
        };

        if (!networkName) {
            networkName = NetworkInfo.getInstance().Name;
        }
        const contractInfoType = contractInfos[networkName + 'ContractAddresses'];
        return new contractInfoType();
    }


}
