import {
  errorHandler
} from './error.js';
import {
  KYCUserIsValid
} from './kyc.js';
import {
  ChainId
} from './helper.js'

export const login = async function (callback) {

    let user = await Moralis.User.current();

    if (!user) {
      user = await Moralis.authenticate({
        signingMessage: "You are login into Liminal.market.\n\n"
      }).then(function(user) {
        attachWalletEvents();
        showLogout();
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
      showLogin();
    }
    return false;

}

export const attachWalletEvents = async function () {

  let enableWeb3Result = await Moralis.enableWeb3().then(async function (evt) {
      const showWrongChainBanner = function () {
        document.getElementById('wrongChainId').style.display = 'block';
        document.getElementById('switchNetwork').addEventListener('click', async function (evt) {
          evt.preventDefault();
          const chainIdHex = await Moralis.switchNetwork(ChainId());
          location.reload();
        })

      }
      const userChainId = await Moralis.getChainId();

      if (ChainId() != userChainId) {
        showWrongChainBanner();
      } else {
        document.getElementById('wrongChainId').style.display = 'none';
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

const showLogin = function () {
  document.getElementById('btn-login').style.display = 'block';
  document.getElementById('btn-logout').style.display = 'none';

  document.getElementById("btn-login").addEventListener('click', async function (e) { //say this is an anchor
    e.preventDefault();
    await login();
  });
}

const showLogout = function () {
  document.getElementById('btn-login').style.display = 'none';
  document.getElementById('btn-logout').style.display = 'block';
  document.getElementById("btn-logout").onclick = logOut;
}


const logOut = async function () {
  await Moralis.User.logOut();
  showLogin();
  return false;
}

export async function initAccount() {
  const user = Moralis.User.current();
  if (!user) {
    showLogin();
  } else {
    showLogout();
    await KYCUserIsValid();

  }
}