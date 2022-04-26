import SecuritiesService from "../services/broker/SecuritiesService";

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


const getAUsdAsset = function() {
	return {
		Logo: '../ausd.png'
	};
}

export const AddressZero = "0x0000000000000000000000000000000000000000";

export const addTokenToWallet = async function(address : string, symbol : string) {
	let assetService = await SecuritiesService.getInstance();

	const asset = (symbol == 'aUSD') ? getAUsdAsset() : await assetService.getSecurityBySymbol(symbol);
	// wasAdded is a boolean. Like any RPC method, an error may be thrown.
	const web3 = await Moralis.enableWeb3();
	if (!web3) return;

	console.log('web3', web3, web3.provider);
	if (!web3.provider.request) return;

	const wasAdded = await web3.provider.request({
	  method: 'wallet_watchAsset',
	  params: [{
		type: 'ERC20', // Initially only supports ERC20, but eventually more!
		options: {
		  address: address, // The address that the token is at.
		  symbol: symbol, // A ticker symbol or shorthand, up to 5 chars.
		  decimals: 18, // The number of decimals in the token
		  image: 'https://app.liminal.market/img/logos/' + asset.Logo, // A string url of the token logo
		},
	  }],
	});

	console.log('wasAdded:', wasAdded);
};

export const isJSON = function(str : string) {
	try {
		JSON.parse(str);
		return true;
	} catch (e) {
		return false;
	}
}


export const shortEth = function(ethAddress : string) {
	return ethAddress.substring(0, 6) + "..." + ethAddress.substring(ethAddress.length - 4);
};