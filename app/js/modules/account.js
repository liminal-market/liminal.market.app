import {
  errorHandler
} from './error.js';
import {
  KYCUserIsValid
} from './kyc.js';
import {
  NetworkInfo
} from '../main.js'
import {setupSteps} from './buy.js';

export const login = async function (callback) {

    let user = await Moralis.User.current();

    if (!user || user === null) {
       user = await Moralis.authenticate({
        signingMessage: "You are logging into Liminal.market.\n\n"
      }).then(function(user) {
        attachWalletEvents();
        showLogin(user);

        if (callback) callback();
        window.location.reload();
      }).catch(function (e) {

        if (e.message.indexOf("Request of type 'wallet_requestPermissions' already pending") != -1) {
          document.getElementById('weSentSigninRequest').style.display = 'block';
        } else {
          errorHandler('login', e);
        }
        return;
      });

    } else {
      showLogin(user);
    }
    return false;

}


export const attachWalletEvents = async function () {

  let enableWeb3Result = await Moralis.enableWeb3().then(async function (evt) {

      const userChainId = await Moralis.getChainId();

      if (NetworkInfo.ChainId != userChainId) {
        return;
      }

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

    },
    function (e) {
      if (e.toString().indexOf('Non ethereum enabled browser') != -1) {
        showSetupMetamask();
      }
      console.log('error', e);
    });
}

const showLogin = function (user) {
  if (!user || user === null) {
    document.getElementById('loginInfo').innerHTML = 'You are not logged in. <a href="" id="loginLink">Login</a>';
    document.getElementById("loginLink").addEventListener('click', async function (e) { //say this is an anchor
      e.preventDefault();
      await login();
    });
  } else {
    document.getElementById('loginInfo').innerHTML = 'You are logged as ' + shortEth(user.get('ethAddress')) + ' on <a href="" id="changeNetwork">' + NetworkInfo.Name + '</a> | <a href="" id="logoutLink">Click to logout</a>';
    document.getElementById("logoutLink").addEventListener('click', async function (e) { //say this is an anchor
      e.preventDefault();
      await logOut();
    });
    document.getElementById("changeNetwork").addEventListener('click', async function (e) { //say this is an anchor
      e.preventDefault();
      setupSteps(true);
    });

    if (Moralis.Web3.isWeb3Enabled()) {

      let stylesheet = document.styleSheets[0];
      for (let i=0;i<stylesheet.cssRules.length;i++) {
        if (stylesheet.cssRules[i].selectorText == '.addToWallet, .getAddress') {
          stylesheet.deleteRule(i);
          i = stylesheet.cssRules.length;
        }
      }
    }
  }
}

const shortEth = function(ethAddress) {
  return ethAddress.substr(0, 6) + "..." + ethAddress.substr(ethAddress.length - 4);
};

const logOut = async function () {
  await Moralis.User.logOut();
  showLogin();
  window.location.reload();
}

export async function initAccount() {
  const user = Moralis.User.current();
  showLogin(user);
}