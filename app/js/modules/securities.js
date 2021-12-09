
import {
	addTokenToWallet,
	roundNumber, getAssets, getAssetBySymbol, AddressZero
} from './helper.js';
import {updateBuyInfo, setSelectedSymbolAndAddress, getSymbolContractAddress} from './buy.js';

export const loadSecurities = async function() {
	assets = await getAssets();

	let timer = null;
	document.getElementById('search_securities').addEventListener('keyup', function(evt) {
		clearTimeout(timer);

		timer = setTimeout(findAssets, 500);

	});
	showTop();
}
let assets = null;
let head = '<thead><tr><th colspan="3">Name</th><th colspan="3">Symbol</th></tr></thead>';
let table = '<table id="securities_table" class="table table-hover mt-2">';
const showTop = function() {

	let str = '';
	let symbols = ["MSFT", "AAPL", "AMZN", "TSLA", "GOOGL", "GOOG", "GME", "FB", "NVDA", "BRK.B", "JPM", "HD", "JNJ", "UNH", "PG", "BAC", "V", "ADBE", "NFLX", "CRM", "PFE", "DIS", "MA", "XOM", "TMO", "COST"]
	symbols.forEach(function(symbol) {
		var asset = assets.get(symbol);
		str += '<tr><td><img src="/img/logos/' + asset.Logo + '" class="symbol_logo"/></td>';
		str += '<td class="asset_name">' + asset.Name + '</td>';
		str += '<td><button class="w-200 btn btn-success btn-sm select_security" data-name="' + asset.Name + '" data-logo="' + asset.Logo + '" data-symbol="' + asset.Symbol + '">Select</button>';
		str += '<td><a href="https://finance.yahoo.com/quote/' + asset.Symbol + '" target="_blank">' + asset.Symbol + '</a></td>';
		str += '<td><a href="">Get address</a></td>';
		str += '<td><a href="">Add to wallet</a></td></tr>';
	});
	document.getElementById('list_of_securities').innerHTML = table + head + str + '</table>';

	document.querySelectorAll('.select_security').forEach(box =>
		box.addEventListener('click', function(evt) {
			selectToken(evt.target);
		}))
}

const selectToken = async function(button) {
	let symbol = button.dataset.symbol;
	let logo = button.dataset.logo;
	let name = button.dataset.name;


	let address = await getSymbolContractAddress(symbol);

	setSelectedSymbolAndAddress(symbol, address);

	let selectSymbolBtn = document.getElementById('select-symbol');
	selectSymbolBtn.innerHTML = name + ' (' + symbol + ')';

	updateBuyInfo(symbol, name, logo);
	$( "#modalClose" ).trigger( "click" );
}

const findAssets = async function() {
	var search = document.getElementById('search_securities').value;
	if (search.length < 3) {
		showTop();
		return;
	}

	let str = '';

	assets.forEach(function (asset) {
		if (asset.Symbol.toLowerCase().indexOf(search.toLowerCase()) != -1 ||
				asset.Name.toLowerCase().indexOf(search.toLowerCase()) != -1) {
			str += '<tr><td><img src="/img/logos/' + asset.Logo + '" class="symbol_logo"/></td>';
			str += '<td>' + asset.Name + '</td>';
			str += '<td>' + asset.Symbol + '</td>';
			str += '<td><a href="">Get address</a></td>';
			str += '<td><a href="">Add to wallet</a></td></tr>';
		}
	});

	document.getElementById('list_of_securities').innerHTML = table + head + str + '</table>';
}