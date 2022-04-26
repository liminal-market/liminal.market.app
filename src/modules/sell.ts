
import ContractInfo from "../contracts/ContractInfo";

export const sellPageInit = async function() {

    history.pushState(null, 'Sell securities', '/sell');
    let contractAddress = ContractInfo.getContractInfo();

	(document.getElementById('aUsdAddress') as HTMLInputElement).value = contractAddress.AUSD_ADDRESS;
}
