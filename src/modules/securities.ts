
import {
	addTokenToWallet,
	AddressZero
} from '../util/Helper';
import {updateBuyInfo, setSelectedSymbolAndAddress, getSymbolContractAddress,
	hideModalSecurities, selectSymbol} from './buy';
import Render from '../ui/Render';
import SecuritiesService from "../services/broker/SecuritiesService";


export const loadSecurities = async function(dontChangeUrl : boolean = false) {
	if (!dontChangeUrl) {
		history.pushState(null, 'List of securities', '/securities');
	}

	let timer : any = null;
	document.getElementById('search_securities')!.addEventListener('keyup', function() {
		clearTimeout(timer);
		timer = setTimeout(findAssets, 500);
	});
	showTop();
};

let table = '<table id="securities_table" class="table table-hover mt-2">';
let head = '<thead><tr><th colspan="3">Name</th><th colspan="3">Symbol</th></tr></thead>';

async function showTop() {
	let assets = await SecuritiesService.getInstance();

	let tbody = '';
	let symbols = ["MSFT", "AAPL", "AMZN", "TSLA", "GOOGL", "GOOG", "GME", "FB", "NVDA", "BRK.B", "JPM", "HD", "JNJ", "UNH", "PG", "BAC", "V", "ADBE", "NFLX", "CRM", "PFE", "DIS", "MA", "XOM", "TMO", "COST"]
	for (const symbol of symbols) {
		let asset = await assets.getSecurityBySymbol(symbol);
		tbody += createTrForSymbol(asset);
	}
	document.getElementById('list_of_securities')!.innerHTML = table + head + tbody + '</table>';
	bindButtonEvents();
}

const bindButtonEvents = function() {

	document.querySelectorAll('.select_security').forEach(box =>
		box.addEventListener('click', function(evt) {
			selectToken(evt.target as HTMLButtonElement).then();
		}));
	document.querySelectorAll('.getAddress').forEach(box =>
		box.addEventListener('click', function(evt : Event) {
			evt.preventDefault();
			getAddress(evt.target as HTMLButtonElement).then();
		}));
	document.querySelectorAll('.addToWallet').forEach(box =>
		box.addEventListener('click', function(evt) {
			evt.preventDefault();
			addToWallet(evt.target as HTMLButtonElement).then();
		}));
}

const createTrForSymbol = function(asset : any) {
	let str = '';
	str += '<tr><td><img src="/img/logos/' + asset.Logo + '" class="symbol_logo" alt="Symbol logo"/></td>';
	str += '<td class="asset_name">' + asset.Name + '</td>';
	str += '<td><button class="w-200 btn btn-success btn-sm select_security" data-name="' + asset.Name + '" data-logo="' + asset.Logo + '" data-symbol="' + asset.Symbol + '">Select</button>';
	str += '<td><a href="https://strike.market/stocks/' + asset.Symbol + '" target="_blank">' + asset.Symbol + '</a></td>';
	str += '<td><a href="" class="getAddress" data-symbol="' + asset.Symbol + '">Get address</a></td>';
	str += '<td><a href="" class="addToWallet" data-symbol="' + asset.Symbol + '">Add to wallet</a></td></tr>';
	return str;
}

const getAddress = async function(button : HTMLButtonElement) {
	let symbol = button.dataset.symbol;
	//todo: validate that .value is correct here??
	let address = (await getSymbolContractAddress(symbol)).toString();
	if (address == AddressZero) {
		button.innerHTML = "Address doesn't exists yet. Buy it first";
	} else {
		navigator.clipboard.writeText(address).catch(() => {
			button.outerHTML = '<input value="' + address + '" />';
			(button as HTMLInputElement).select();
		}).then(() => {
			button.innerHTML = 'Copied';
		}).catch(reason => {
			alert(reason);
		});

	}
}


const addToWallet = async function(button : HTMLButtonElement) {
	let symbol = button.dataset.symbol;
	//todo: validate that .value is correct here??
	let address = (await getSymbolContractAddress(symbol)).toString();
	if (address == AddressZero) {
		button.innerHTML = "Address doesn't exists yet. Buy it first";
	} else {
		await addTokenToWallet(address, symbol);
	}
}

const selectToken = async function(button : HTMLButtonElement) {
	let symbol = button.dataset.symbol;
	let logo = button.dataset.logo;
	let name = button.dataset.name;


	let address;
	if (Moralis.Web3.isWeb3Enabled()) {
		address = await getSymbolContractAddress(symbol);
	}

	if (window.location.pathname.indexOf('securities') != -1) {
		await render('buy', null, function() {
			selectSymbol(symbol, name, logo, address);
		});
	} else {
		await setSelectedSymbolAndAddress(symbol, address);

		let selectSymbolBtn = document.getElementById('select-symbol');
		selectSymbolBtn.innerHTML = name + ' (' + symbol + ')';

		await updateBuyInfo(symbol, name, logo);
		hideModalSecurities();
	}
}

const findAssets = async function() {
	let search = (document.getElementById('search_securities') as HTMLInputElement).value;
	if (search.length < 2) {
		showTop();
		return;
	}

	let str = '';

	assets.forEach(function (asset) {
		if (asset.Symbol.toLowerCase().indexOf(search.toLowerCase()) != -1 ||
				asset.Name.toLowerCase().indexOf(search.toLowerCase()) != -1) {
			str += createTrForSymbol(asset);
		}
	});

	document.getElementById('list_of_securities').innerHTML = table + head + str + '</table>';
	bindButtonEvents();
}