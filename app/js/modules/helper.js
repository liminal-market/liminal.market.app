export const showContainer = function(id) {
    var containers = $('.container');
    for (let i=0;i<containers.length;i++) {
        if (containers[i].id == id) {
            $(containers[i]).removeClass('d-none').show();
        } else {
            $(containers[i]).hide();
        }
    }
  }

export const roundNumber = function(number) {
	return Math.round(number * 100) / 100;
}

Handlebars.registerHelper('perc', function (number) {
    return Math.round(parseFloat(number) * 10000) / 100 + '%';
});
Handlebars.registerHelper('round', function (number) {
    return Math.round(parseFloat(number) * 100) / 100;
});

Handlebars.registerHelper('round2', function (number) {
    return Math.round(parseFloat(number) * 10000) / 10000;
});
Handlebars.registerHelper('classColor', function (number) {
    return (number > 0) ? "green" : "red";
});

const getAUsdAsset = function() {
	let asset = {
		Logo : '../ausd.png'
	}
	return asset;
}

export const AddressZero = "0x0000000000000000000000000000000000000000";

export const addTokenToWallet = async function(address, symbol) {
	const asset = (symbol == 'aUSD') ? getAUsdAsset() : await getAssetBySymbol(symbol);
	// wasAdded is a boolean. Like any RPC method, an error may be thrown.
	const wasAdded = await ethereum.request({
	  method: 'wallet_watchAsset',
	  params: {
		type: 'ERC20', // Initially only supports ERC20, but eventually more!
		options: {
		  address: address, // The address that the token is at.
		  symbol: symbol, // A ticker symbol or shorthand, up to 5 chars.
		  decimals: 18, // The number of decimals in the token
		  image: 'https://app.liminal.market/img/logos/' + asset.Logo, // A string url of the token logo
		},
	  },
	});
};

export const isJSON = function(str) {
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

export const getAssetBySymbol = async function(symbol) {
	let assets = await getAssets();
	return assets.get(symbol);
}

export const ChainId = function() {
	return 4;
}