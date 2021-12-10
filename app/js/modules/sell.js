
import { ContractAddressesInfo }  from '../main.js';

export const sellPageInit = async function(symbol, qty) {

    history.pushState(null, 'Sell securities', '/sell');
	document.getElementById('aUsdAddress').value = ContractAddressesInfo.AUSD_ADDRESS;
}
