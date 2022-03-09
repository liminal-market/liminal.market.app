import {localhostNetwork} from './localhost-network';
import { rinkebyNetwork } from './rinkeby-network';
import {mumbaiNetwork} from './mumbai-network';
import {fujiNetwork} from './fuji-network';


const networkInfos = [ localhostNetwork, rinkebyNetwork, mumbaiNetwork, fujiNetwork ];

export const getNetworkInfo = function(networkName? : string) {

	if (!networkName) networkName = getCookieValue('network');
	if (!networkName) networkName = 'mumbai';

	let networkInfo = null;
	networkInfos.forEach(networkInfoType => {
		let tmp = new networkInfoType();
		if (tmp.Name == networkName) {
			networkInfo = tmp;
		}
	});
	return (networkInfo != null) ? networkInfo : getNetworkInfo('mumbai');
}

export const tryGetNetwork = function(chainId : number) {
	let networkInfo = null;
	networkInfos.forEach(tmpType => {
		let tmp = new tmpType();
		if (tmp.ChainId == chainId) networkInfo = tmp;
	});
	return (networkInfo != null) ? networkInfo : getNetworkInfo();
}


export const setCookieNetwork = (name : string) => {
	document.cookie = "network=" + name + "; expires=Mon, 2 Dec 2024 12:00:00 UTC;path=/";
}

const getCookieValue = (name : string) => (
	document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)