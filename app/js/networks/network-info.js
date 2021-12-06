import {localhostNetwork} from './localhost-network.js';
import { rinkebyNetwork } from './rinkeby-network.js';
import {mumbaiNetwork} from './mumbai-network.js';


const networkInfos = [ localhostNetwork, rinkebyNetwork, mumbaiNetwork ];

export const getNetworkInfo = function(networkName) {

	if (!networkName) networkName = getCookieValue('network');
	if (!networkName) networkName = 'rinkeby';

	let networkInfo = null;
	networkInfos.forEach(networkInfoType => {
		let tmp = new networkInfoType();
		if (tmp.Name == networkName) {
			networkInfo = tmp;
		}
	});
	return (networkInfo != null) ? networkInfo : getNetworkInfo('rinkeby');
}

export const tryGetNetwork = function(chainId) {
	let networkInfo = null;
	networkInfos.forEach(tmpType => {
		let tmp = new tmpType();
		if (tmp.ChainId == chainId) networkInfo = tmp;
	});
	return (networkInfo != null) ? networkInfo : getNetworkInfo();
}


export const setCookieNetwork = (name) => {
	document.cookie = "network=" + name + "; expires=Mon, 2 Dec 2024 12:00:00 UTC;path=/";
}

const getCookieValue = (name) => (
	document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)