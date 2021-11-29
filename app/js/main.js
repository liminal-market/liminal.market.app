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
import { sellPageInit } from './modules/sell.js';
import { buyPageInit } from './modules/buy.js';

const serverUrl = "https://rucsd2xip9xc.usemoralis.com:2053/server";
const appId = "WrszROWRp7oShP39MWHMLl4mMA6n2QMN8LDRD6gi";

try {
  await Moralis.start({
    serverUrl,
    appId
  });
}catch (ex) {
  if (ex.message.indexOf('Invalid session token') != -1) {
    Moralis.User.logOut();
  }
  console.log('ERROR', ex);
}

await Moralis.enableWeb3();


window.onpopstate = function (event) {
  alert(`location: ${document.location}, state: ${JSON.stringify(event.state)}`)
}

const loadPath = async function() {
  let path = window.location.pathname.replace('/', '');
  if (path === '') path = 'buy';

  const fn = window.settings['show_' + path];
  if(typeof fn === 'function') {
    fn();
  }

  //render(path);
}
const showSell = async function(evt) {
  if (evt) evt.preventDefault();
  await renderWithMoralis('positions', null, 'sell', sellPageInit);
}
const showBuy = async function(evt) {
  if (evt) evt.preventDefault();
  await render('buy', null, buyPageInit);
}
const showPositions = async function(evt) {
  if (evt) evt.preventDefault();
  await renderWithMoralis('positions', null, 'positions', initPositionsPage);
}

const attachNavLinks = function() {
  document.getElementById('nav-sell').addEventListener('click', async function(evt) {
    showSell(evt);
    history.pushState(null, 'Sell securities', '/sell');
  });

  document.getElementById('nav-buy').addEventListener('click', async function(evt) {
    showBuy(evt);
    history.pushState(null, 'Buy securities', '/buy');
  });

  document.getElementById('nav-positions').addEventListener('click', async function(evt) {
    showPositions(evt);
    history.pushState(null, 'Positions', '/positions');
  });
}

window.settings = {
  /* [..] Other settings */
  show_sell: showSell,
  show_buy : showBuy,
  show_positions : showPositions
  /* , [..] More settings */
};

const start = async function () {
  initAccount();
  loadPath();
  attachNavLinks();
}


await start();
