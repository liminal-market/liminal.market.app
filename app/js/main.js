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
import {getNetworkInfo} from './networks/network.js';
import {getContractsInfo} from './contracts/contract-addresses.js'



export const NetworkInfo = await getNetworkInfo();
export const ContractAddressesInfo = getContractsInfo(NetworkInfo.Name);


export const NetworkInfo = await getNetworkInfo();
export const ContractAddressesInfo = getContractsInfo(NetworkInfo.Name);


const initMoralis = async function() {




  await Moralis.start({
    serverUrl: NetworkInfo.ServerUrl,
    appId: NetworkInfo.AppId
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
    alert(`location: ${document.location}, state: ${JSON.stringify(event.state)}`)
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

const showSetupMetamask = async function() {
  render('metamask');
}

const showSell = async function (evt) {
  if (evt) evt.preventDefault();
  await renderWithMoralis('positions', null, 'sell', sellPageInit);
}
const showBuy = async function (evt) {
  if (evt) evt.preventDefault();
  await render('buy', null, buyPageInit);
}
const showPositions = async function (evt) {
  if (evt) evt.preventDefault();
  await renderWithMoralis('positions', null, 'positions', initPositionsPage);
}

const attachNavLinks = function () {
  document.getElementById('nav-sell').addEventListener('click', async function (evt) {
    showSell(evt);
    history.pushState(null, 'Sell securities', '/sell');
  });

  document.getElementById('nav-buy').addEventListener('click', async function (evt) {
    showBuy(evt);
    history.pushState(null, 'Buy securities', '/buy');
  });

  document.getElementById('nav-positions').addEventListener('click', async function (evt) {
    showPositions(evt);
    history.pushState(null, 'Positions', '/positions');
  });
}

window.settings = {
  show_sell: showSell,
  show_buy: showBuy,
  show_positions: showPositions
};

const start = async function () {
  initAccount();
  loadPath();
  attachNavLinks();
  isMarketOpen();


  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
}




await start();