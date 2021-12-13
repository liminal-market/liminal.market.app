import {
  initAccount
} from './modules/account.js';

import {
  initPositionsPage
} from './modules/positions.js';
import {
  render,
  renderWithMoralis
} from './modules/render.js';
import {
  sellPageInit
} from './modules/sell.js';
import {
  buyPageInit
} from './modules/buy.js';
import {
  isMarketOpen
} from './modules/market.js';
import {attachWalletEvents} from './modules/account.js';
import {getNetworkInfo} from './networks/network-info.js';
import {getContractsInfo} from './contracts/contract-addresses.js'
import {addTokenToWallet} from './modules/helper.js';
import {loadSecurities} from './modules/securities.js';

export const Main = {
  NetworkInfo : null,
  ContractAddressesInfo : null
};

const initMoralis = async function() {

  Main.NetworkInfo = await getNetworkInfo();
  Main.ContractAddressesInfo = getContractsInfo(Main.NetworkInfo.Name);

  await Moralis.start({
    serverUrl: Main.NetworkInfo.ServerUrl,
    appId: Main.NetworkInfo.AppId
  }).catch(function(err) {
    if (err.message.indexOf('Invalid session token') != -1) {
      Moralis.User.logOut();
    }
    console.log('ERROR', err);
  });


  let user = await Moralis.User.current();
  if(user) {
    await attachWalletEvents();
  }

  window.onpopstate = function (event) {
    //alert(`location: ${document.location}, state: ${JSON.stringify(event.state)}`)
  }
};


const loadPath = async function () {
  let path = window.location.pathname.replace('/', '');
  if (path === '') path = 'buy';

  const fn = window.settings['show_' + path];
  if (typeof fn === 'function') {
    fn();
  }
}


const showSell = async function (evt) {
  if (evt) evt.preventDefault();
  await renderWithMoralis('positions', null, 'sell', sellPageInit);
}
const showBuy = async function (evt) {
  if (evt) evt.preventDefault();
  await render('buy', null, buyPageInit);
}

const showSecurities = async function (evt) {
  if (evt) evt.preventDefault();
  await render('securities', null, loadSecurities);
}
const showPositions = async function (evt) {
  if (evt) evt.preventDefault();
  await renderWithMoralis('positions', null, 'positions', initPositionsPage);
}

const attachNavLinks = async function () {
  document.getElementById('nav-sell').addEventListener('click', async function (evt) {
    showSell(evt);
  });

  document.getElementById('nav-buy').addEventListener('click', async function (evt) {
    showBuy(evt);
  });

  document.getElementById('nav-securities').addEventListener('click', async function (evt) {
    showSecurities(evt);

  });
  document.getElementById('nav-positions').addEventListener('click', async function (evt) {
    showPositions(evt);
  });

  document.getElementById('add_ausd_to_wallet_menu').addEventListener('click', function(evt) {
    evt.preventDefault();
    addTokenToWallet(Main.ContractAddressesInfo.AUSD_ADDRESS, 'aUSD');
  })

}

window.settings = {
  show_sell: showSell,
  show_buy: showBuy,
  show_positions: showPositions,
  show_securities : showSecurities,
};

const start = async function () {
  initMoralis().then(function() {
    initAccount();
    isMarketOpen();
  });

  loadPath();
  attachNavLinks();


  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
}




await start();