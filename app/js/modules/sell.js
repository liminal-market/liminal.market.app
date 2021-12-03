import { errorHandler } from "./error.js";
import { renderWithMoralis } from "./render.js";
import { getContractsInfo } from '../contracts/contract-addresses.js';
import SecurityFactoryInfo from "../abi/SecurityFactory.json" assert {	type: "json"};
import SecurityTokenInfo from "../abi/SecurityToken.json" assert {	type: "json"};
import {addTokenToWallet } from './helper.js';

export const sellPageInit = async function(symbol, qty) {

	document.getElementById('maxQty').addEventListener('click', function(evt) {
		evt.preventDefault();
		setQty();
	});

	document.getElementById('execute-trade').addEventListener('click', function(evt) {
		evt.preventDefault();
		executeTrade();
	})

	document.getElementById('symbols').addEventListener('change', function(evt) {
		evt.preventDefault();
		document.getElementById('sell_qty').value  = '';
	});

	if (symbol) {
		let symbols = document.getElementById('symbols');
		for (let i=0;i<symbols.options.length;i++) {
			if (symbols.options[i].value == symbol) {
				symbols.options[i].selected = true;
				i = symbols.options.length;
			}
		}

		if (qty) {
			document.getElementById('sell_qty').value = qty;
			setQty(symbol, qty);
		}
	}
}

const executeTrade = async function() {
	const symbol = document.getElementById('symbols').value;
	const qty = document.getElementById('sell_qty').value;

	console.log(SECURITY_FACTORY_ADDRESS)
	const options = {
		contractAddress: SECURITY_FACTORY_ADDRESS,
		functionName: "getSecurityToken",
		abi: SecurityFactoryInfo.abi,
		params : {
			symbol : symbol
		}
	};
	const contractAddress = await Moralis.executeFunction(options)
	/*.then(async (result) => {
		console.log(result);
	});
	*/
	if (contractAddress == "0x0000000000000000000000000000000000000000") {
		errorHandler("We couldn't find token for symbol " + symbol);
		return;
	}

	const options2 = {type: "erc20",
	amount: Moralis.Units.Token(qty, 18),
	receiver: SECURITY_FACTORY_ADDRESS,
	contractAddress: contractAddress}
	let result = await Moralis.transfer(options2)
console.log(result);

	let str = 'We are processing ' + qty + ' ' + symbol + '. We will add the USD value of your sell to aUSD token. Please add the token to your wallet.';
	str += '<br /><br /><button id="addTokenToWallet">Add aUSD token to wallet</button>';
	$('#sell_message').show().html(str);
	document.getElementById('addTokenToWallet').onclick = async function() {
		await addTokenToWallet(AUSD_ADDRESS, 'aUSD');
	}
}

const setQty = async function(symbol, qty) {
	if (!qty) {
		let symbols = document.getElementById('symbols');
		let option = symbols.options[symbols.selectedIndex];
		symbol = option.value;
		qty = option.dataset.qty;
	}

	document.getElementById('sell_qty').value = qty;
	loadSellAmountInUSD(symbol, qty);
}

const loadSellAmountInUSD = async function(symbol, qty) {

	const params =  { symbol: symbol };
    await Moralis.Cloud.run("getSymbolPrice", params).then(function(result) {
        var jsonResult = JSON.parse(result);
		let assetPrice = jsonResult.trade.p;
		let lastTraded = new Date(jsonResult.trade.t);

		let str = 'You will sell ' + qty + ' share and will recieve about ' + (Math.round(assetPrice * qty * 100) / 100) + ' aUSD for it.<br />';
		str += 'Last price of ' + symbol + ' was ' + assetPrice + ' at ' + lastTraded.toLocaleString();
		document.getElementById('sell_message').innerHTML = str;

    }).catch(function(result, a, b, c) {
        errorHandler(result);
    });
}