import {localhostNetwork} from './localhost-network.js';
import { rinkebyNetwork } from './rinkeby-network.js';


const contractInfos = { localhostNetwork, rinkebyNetwork };

export const getNetworkInfo = async function() {

	let networkName = getCookieValue('network');
	if (!networkName) networkName = 'localhost';

	let networkInfoType = contractInfos[networkName + 'Network']
	if (!networkInfoType) {
		console.error('Network name ' + networkName + ' not found. Setting rinkeby as default');
		setCookieNetwork('rinkeby');
		networkName = 'rinkeby';
		networkInfoType = contractInfos[networkName + 'Network']
	}
	return new networkInfoType();
}

export const setCookieNetwork = (name) => {
	document.cookie = "network=" + name + "; expires=Mon, 2 Dec 2024 12:00:00 UTC;path=/";
}

const getCookieValue = (name) => (
	document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)