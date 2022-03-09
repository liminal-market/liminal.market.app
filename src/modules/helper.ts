import Handlebars from "handlebars/runtime";
import Moralis from "moralis";

export const showContainer = function(id : string) {
    var containers = document.querySelectorAll('.container');
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

Handlebars.registerHelper('perc', function (number : string) {
    return Math.round(parseFloat(number) * 10000) / 100 + '%';
});
Handlebars.registerHelper('round', function (number : string) {
    return Math.round(parseFloat(number) * 100) / 100;
});

Handlebars.registerHelper('round2', function (number : string) {
    return Math.round(parseFloat(number) * 10000) / 10000;
});
Handlebars.registerHelper('classColor', function (number : number) {
    return (number > 0) ? "green" : "red";
});

const getAUsdAsset = function() {
	let asset = {
		Logo : '../ausd.png'
	}
	return asset;
}

export const AddressZero = "0x0000000000000000000000000000000000000000";

export const addTokenToWallet = async function(address : string, symbol : string) {
	const asset = (symbol == 'aUSD') ? getAUsdAsset() : await getAssetBySymbol(symbol);
	// wasAdded is a boolean. Like any RPC method, an error may be thrown.
	const web3 = await Moralis.enableWeb3();
	console.log('web3', web3, web3.provider);
	/*
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
	*/
	web3.provider.request({
		method: 'wallet_watchAsset',
		params: {
		  type: 'ERC20',
		  options: {
			address: address,
			symbol: symbol,
			decimals: 18,
			image: 'https://app.liminal.market/img/logos/' + asset.Logo
		  },
		},
	  })
	  .then((success) => {
		if (success) {
		  console.log('FOO successfully added to wallet!');
		} else {
		  throw new Error('Something went wrong.');
		}
	  })
	  .catch(console.error);
	//console.log('wasAdded:', wasAdded);
};

export const isJSON = function(str : string) {
	try {
		JSON.parse(str);
		return true;
	} catch (e) {
		return false;
	}
}


export let Assets = new Map();
export const getAssets = async function() {
    if (Assets.size != 0) return Assets;

    const response = await fetch('/assets/assets.json');
    const results = await response.json();
    for (let i=0;i<results.length;i++) {
        Assets.set(results[i].Symbol, results[i]);
    }
    return Assets;
}

export const getAssetBySymbol = async function(symbol : string) {
	let assets = await getAssets();
	return assets.get(symbol);
}
