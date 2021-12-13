
import { Main }  from '../main.js';

export const sellPageInit = async function(symbol, qty) {

    history.pushState(null, 'Sell securities', '/sell');
	document.getElementById('aUsdAddress').value = Main.ContractAddressesInfo.AUSD_ADDRESS;
}
