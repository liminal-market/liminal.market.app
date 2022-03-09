
import { Main }  from '../main';

export const sellPageInit = async function(symbol, qty) {

    history.pushState(null, 'Sell securities', '/sell');
	(document.getElementById('aUsdAddress') as HTMLInputElement).value = Main.ContractAddressesInfo.AUSD_ADDRESS;
}
