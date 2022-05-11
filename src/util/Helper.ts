import BigNumber from "bignumber.js";

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

export const roundNumber = function(number : number) {
	return Math.round(number * 100) / 100;
}

export const roundNumberDecimal = function(number : number, decimal : number) {
	let hundred = parseInt('1'+ '0'.repeat(decimal));
	return Math.round(number * hundred) / hundred;
}

export const roundBigNumber = function(number : BigNumber) : BigNumber {
	return new BigNumber(Math.round(number.toNumber() * 100) / 100);
}
export const roundBigNumberDecimal = function(number : BigNumber, decimal : number) : BigNumber {
	let hundred = parseInt('1'+ '0'.repeat(decimal));
	return new BigNumber(Math.round(number.toNumber() * hundred) / hundred);
}

export const AddressZero = "0x0000000000000000000000000000000000000000";

export const isJSON = function(str : string) {
	try {
		JSON.parse(str);
		return true;
	} catch (e) {
		return false;
	}
}


export const shortEth = function(ethAddress : string) {
	if (!ethAddress) return '';

	return ethAddress.substring(0, 6) + "..." + ethAddress.substring(ethAddress.length - 4);
};

export const upperFirstLetter = function(text : string) {
	return text[0].toUpperCase() + text.substring(1);
}


export const serialize = function(data : any) {
	let obj : any = {};
	for (let [key, value] of data) {
		if (obj[key] !== undefined) {
			if (!Array.isArray(obj[key])) {
				obj[key] = [obj[key]];
			}
			obj[key].push(value);
		} else {
			obj[key] = value;
		}
	}
	return obj;
}