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

//localhost
let serverUrl = "https://xcqqzykqhjwv.usemoralis.com:2053/server";
let appId = "XP6fMmUXTiAH4yYBeigdjtkTmVOKhrTqdguMTE88";
let chainId = 31337;
if (true) {
  //rinkeby
  serverUrl = "https://rucsd2xip9xc.usemoralis.com:2053/server";
  appId = "WrszROWRp7oShP39MWHMLl4mMA6n2QMN8LDRD6gi";
  chainId = 4;
}



try {
  await Moralis.start({
    serverUrl,
    appId
  });
} catch (ex) {
  if (ex.message.indexOf('Invalid session token') != -1) {
    Moralis.User.logOut();
  }
  console.log('ERROR', ex);
}
console.log('1');

Moralis.enableWeb3().then(async function (evt) {

  const showWrongChainBanner = function () {
    document.getElementById('wrongChainId').style.display = 'block';
    document.getElementById('switchNetwork').addEventListener('click', async function (evt) {
      evt.preventDefault();
      const chainIdHex = await Moralis.switchNetwork(chainId);
      location.reload();
    })

  }
  console.log('3');
  const userChainId = await Moralis.getChainId();
  if (chainId != userChainId) {
    showWrongChainBanner();
  } else {
    document.getElementById('wrongChainId').style.display = 'none';
  }
  console.log('4');
  Moralis.onChainChanged(function (accounts) {
    location.reload();
  });
  Moralis.onAccountsChanged(function (accounts) {
    location.reload();
  });
  Moralis.onDisconnect(function (accounts) {
    location.reload();
  });
  Moralis.onConnect(function (accounts) {
    location.reload();
  });

}, function(e) {
  if (e.toString().indexOf('Non ethereum enabled browser') != -1) {
    showSetupMetamask();
  }
  console.log('error', e);
});

console.log('2');
window.onpopstate = function (event) {
  alert(`location: ${document.location}, state: ${JSON.stringify(event.state)}`)
}

const loadPath = async function () {
  let path = window.location.pathname.replace('/', '');
  if (path === '') path = 'buy';

  const fn = window.settings['show_' + path];
  if (typeof fn === 'function') {
    fn();
  }

  //render(path);
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