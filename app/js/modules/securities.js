
import {
	addTokenToWallet,
	roundNumber, getAssets, getAssetBySymbol, AddressZero
} from './helper.js';
import {updateBuyInfo, setSelectedSymbolAndAddress, getSymbolContractAddress, hideModalSecurities, selectSymbol} from './buy.js';
import { render } from './render.js';

export const loadSecurities = async function(dontChangeUrl) {
	if (!dontChangeUrl) {
		history.pushState(null, 'List of securities', '/securities');
	}

	assets = await getAssets();

	let timer = null;
	document.getElementById('search_securities').addEventListener('keyup', function(evt) {
		clearTimeout(timer);

		timer = setTimeout(findAssets, 500);

	});
	showTop();
};

let assets = null;
let head = '<thead><tr><th colspan="3">Name</th><th colspan="3">Symbol</th></tr></thead>';
let table = '<table id="securities_table" class="table table-hover mt-2">';
const showTop = function() {

	let str = '';
	let symbols = ["MSFT", "AAPL", "AMZN", "TSLA", "GOOGL", "GOOG", "GME", "FB", "NVDA", "BRK.B", "JPM", "HD", "JNJ", "UNH", "PG", "BAC", "V", "ADBE", "NFLX", "CRM", "PFE", "DIS", "MA", "XOM", "TMO", "COST"]
	symbols.forEach(function(symbol) {
		var asset = assets.get(symbol);
		str += createTrForSymbol(asset);
	});
	document.getElementById('list_of_securities').innerHTML = table + head + str + '</table>';
	bindButtonEvents();
}

const bindButtonEvents = function() {

	document.querySelectorAll('.select_security').forEach(box =>
		box.addEventListener('click', function(evt) {
			selectToken(evt.target);
		}));
	document.querySelectorAll('.getAddress').forEach(box =>
		box.addEventListener('click', function(evt) {
			evt.preventDefault();
			getAddress(evt.target);
		}));
	document.querySelectorAll('.addToWallet').forEach(box =>
		box.addEventListener('click', function(evt) {
			evt.preventDefault();
			addToWallet(evt.target);
		}));
}

const createTrForSymbol = function(asset) {
	let str = '';
	str += '<tr><td><img src="/img/logos/' + asset.Logo + '" class="symbol_logo"/></td>';
	str += '<td class="asset_name">' + asset.Name + '</td>';
	str += '<td><button class="w-200 btn btn-success btn-sm select_security" data-name="' + asset.Name + '" data-logo="' + asset.Logo + '" data-symbol="' + asset.Symbol + '">Select</button>';
	str += '<td><a href="https://finance.yahoo.com/quote/' + asset.Symbol + '" target="_blank">' + asset.Symbol + '</a></td>';
	str += '<td><a href="" class="getAddress" data-symbol="' + asset.Symbol + '">Get address</a></td>';
	str += '<td><a href="" class="addToWallet" data-symbol="' + asset.Symbol + '">Add to wallet</a></td></tr>';
	return str;
}

const getAddress = async function(button) {
	let symbol = button.dataset.symbol;
	let address = await getSymbolContractAddress(symbol);
	if (address == AddressZero) {
		button.innerHTML = "Address doesn't exists yet. Buy it first";
	} else {
		navigator.clipboard.writeText(address);
		button.innerHTML = 'Copied';
	}
}


const addToWallet = async function(button) {
	let symbol = button.dataset.symbol;
	let address = await getSymbolContractAddress(symbol);
	if (address == AddressZero) {
		button.innerHTML = "Address doesn't exists yet. Buy it first";
	} else {
		addTokenToWallet(address, symbol);
	}
}

const selectToken = async function(button) {
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
		setSelectedSymbolAndAddress(symbol, address);

		let selectSymbolBtn = document.getElementById('select-symbol');
		selectSymbolBtn.innerHTML = name + ' (' + symbol + ')';

		updateBuyInfo(symbol, name, logo);
		hideModalSecurities();
	}
}

const findAssets = async function() {
	var search = document.getElementById('search_securities').value;
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