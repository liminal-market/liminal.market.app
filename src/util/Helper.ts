import BigNumber from "bignumber.js";
import {ethers} from "ethers";

export const showContainer = function(id : string) {
    let containers = document.querySelectorAll('.container');
    for (let i=0;i<containers.length;i++) {
		let element = containers[i] as HTMLElement;
        if (element.id == id) {
            element.classList.remove('d-none');
			element.style.display = 'block';
        } else {
			element.style.display = 'none';
        }
    }
}

export const roundNumber = function (number: number) {
	return Math.round(number * 100) / 100;
}

export const roundNumberDecimal = function (number: number, decimal: number) {
	let hundred = parseInt('1' + '0'.repeat(decimal));
	return Math.round(number * hundred) / hundred;
}
export const formatWeiAsCurrency = function (number: BigNumber): string {
	return '$' + ethers.utils.formatEther(number.toString())
}
export const formatWei = function (number: BigNumber): string {
	return ethers.utils.formatEther(number.toString())
}
export const roundBigNumber = function (number: BigNumber): BigNumber {
	return new BigNumber(Math.round(number.toNumber() * 100) / 100);
}
export const roundBigNumberDecimal = function (number: BigNumber, decimal: number): BigNumber {
	let hundred = parseInt('1' + '0'.repeat(decimal));
	return new BigNumber(Math.round(number.toNumber() * hundred) / hundred);
}

export const AddressZero = "0x0000000000000000000000000000000000000000";

export const isJSON = function (str: string): any {
	try {
		return JSON.parse(str);
	} catch (e) {
		return false;
	}
}

export const ethereumInstalled = function () {
	try {
		// @ts-ignore
		return (typeof window.ethereum !== 'undefined');
	} catch (e: any) {
		return false;
	}
}
export const shortEth = function (ethAddress: string) {
	if (!ethAddress) return '';

	return ethAddress.substring(0, 6) + "..." + ethAddress.substring(ethAddress.length - 4);
};

export const upperFirstLetter = function (text: string) {
	return text[0].toUpperCase() + text.substring(1);
}

export const showBar = function (text: string) {
	let header = document.querySelector('header');
	if (!header) return;
	let warningHtml = '<div class="errorBar">' + text + '</div>';
	header.insertAdjacentHTML('beforebegin', warningHtml);
}
