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

	showProgressStep('Please confirm transaction in Metamask', 50, false);

	const options = {
		contractAddress: SECURITY_FACTORY_ADDRESS,
		functionName: "getSecurityToken",
		abi: SecurityFactoryInfo.abi,
		params : {
			symbol : symbol
		}
	};
	const contractAddress = await Moralis.executeFunction(options)
	if (contractAddress == "0x0000000000000000000000000000000000000000") {
		errorHandler("We couldn't find token for symbol " + symbol);
		return;
	}

	const options2 = {
		type: "erc20",
		amount: Moralis.Units.Token(qty, 18),
		receiver: SECURITY_FACTORY_ADDRESS,
		contractAddress: contractAddress
	}
	let userCancelled = false;
	let result = await Moralis.transfer(options2).catch(() => userCancelled = true);

	if (userCancelled) {
		resetSell();
		return;
	}

	let str = 'We are processing ' + qty + ' ' + symbol + '. <a href="" id="addTokenToWallet">Please add the aUSD token</a> to your wallet to see your dollars at broker.';
	str += ' <a href="" id="copyAUSDAddress">Copy address</a>';

	showProgressStep(str, 99, false);

	document.getElementById('addTokenToWallet').onclick = async function(e) {
		e.preventDefault();
		await addTokenToWallet(AUSD_ADDRESS, 'aUSD');
	};
	document.getElementById('copyAUSDAddress').onclick = async function(evt) {
		evt.preventDefault();
		navigator.clipboard.writeText(AUSD_ADDRESS);
	};

	let query = new Moralis.Query('OrderSell');
	let subscription = await query.subscribe();
	subscription.on('update', (response) => {
		const object = response.toJSON();
		console.log('object updated', JSON.stringify(object), object);

		if ((!object.status && object.confirmed)) {
			showProgressStep('Blockchain has confirmed, order is being executed.' + ethLink, 80);
		} else if (object.status == 'order_filled') {
			showProgressStep('Order has been filled. aUSD should get some increase in your wallet', 100);
		}
	});
}

const resetSell = function() {
	document.getElementById('execute-trade').style.display = 'block';
	document.getElementById('execution_progress').style.display = "none";
}

const showProgressStep = async function (text, perc, warning) {
	document.getElementById('execute-trade').style.display = 'none';
	document.getElementById('execution_progress').style.display = "block";
	var element = document.getElementById('execution_steps');
	element.innerHTML = '<div class="progress_text">' + text + '</div>';
	element.style.width = perc + '%';

	element.classList.toggle('progress-bar-striped', (perc != 100));
	element.classList.toggle('progress-bar-animated', (perc != 100));
	if (warning) {
		element.classList.add('bg-warning');
		element.classList.add('progress_text_attn');
	} else {
		element.classList.remove('bg-warning');
		element.classList.remove('progress_text_attn');
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
    await Moralis.Cloud.run("getSymbolPrice", params).then(function(jsonResult) {
        //var jsonResult = JSON.parse(result);
		let assetPrice = jsonResult.trade.p;
		let lastTraded = new Date(jsonResult.trade.t);

		let str = 'You will sell ' + qty + ' share and will recieve about ' + (Math.round(assetPrice * qty * 100) / 100) + ' aUSD for it.<br />';
		str += 'Last price of ' + symbol + ' was ' + assetPrice + ' at ' + lastTraded.toLocaleString();
		document.getElementById('sell_message').innerHTML = str;

    }).catch(function(result, a, b, c) {
        errorHandler(result);
    });
}