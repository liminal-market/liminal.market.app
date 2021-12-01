import {getAssets} from './helper.js';


let assetPrice = 0;
let lastTraded = '';

const getSymbolPrice = async function(symbol) {
    if (!symbol) {
        symbol = document('#symbols :selected').val();
        console.log('symb:' + symbol);
    }

    if (symbol === '') {
		assetPrice = 0;
		lastTraded = '';
       	setSymbolInfo();
        return;
    }

    const params =  { symbol: symbol };
    await Moralis.Cloud.run("getSymbolPrice", params).then(function(result) {
        var jsonResult = JSON.parse(result);
		assetPrice = jsonResult.trade.p;
		lastTraded = jsonResult.trade.t;

        setSymbolInfo();
        updateBuyInfo();
    }).catch(function(result) {
        console.log('catch:' + result);
    });
}

const setSymbolInfo = async function(text) {
	if (lastTraded === '') {
		$('#last-trade').html('Last trade:' + assetPrice + ' at ' + lastTraded);
		return;
	}
    $('#last-trade').html('Last trade:' + assetPrice + ' at ' + lastTraded);
}

const updateBuyInfo = async function() {
    let buyAmount = $('#buy_amount').val();
    $('#buy-info').html('Estimated you will buy:' + (buyAmount / assetPrice) + ' shares at the price of ' + assetPrice);
}

const updateSellInfo = async function() {
    let buyAmount = $('#sell_amount').val();
    $('#buy-info').html('Estimated you will sell:' + (buyAmount / assetPrice) + ' shares at the price of ' + assetPrice);
}


export const setupAssetsPage = async function() {
	document.getElementById('symbols').onchange = getSymbolPrice;
	document.getElementById('buy_amount').onchange = updateBuyInfo;

    let assets = await getAssets();
    let str = '';
    for (var i=0;i<assets.length;i++) {
        str += '<option value="' + assets[i].Symbol + '">' + assets[i].Symbol + ' - ' + assets[i].Name + '</option>';
    }
    $('#symbols').append(str);
    $('#symbols').select2();

}
