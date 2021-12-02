import {
  errorHandler
} from './error.js';
import {
  KYCUserIsValid
} from './kyc.js';

export const login = async function (callback) {
  try {
    let user = await Moralis.User.current({
      provider: "walletconnect"
    });

    if (!user) {
      user = await Moralis.authenticate({
        provider: "walletconnect",
        mobileLinks: [
          "rainbow",
          "metamask",
          "argent",
          "trust",
          "imtoken",
          "pillar",
        ],
        signingMessage: "You are login into Liminal.market"
      }).then(function (user) {
        console.log('user ethaddr:', user.get('ethAddress'));
        attachWalletEvents()
      }, function (err) {
        errorHandler('login', e);
      })

      showLogout();
      if (callback) callback();
      window.location.reload();
    } else {
      showLogin();
    }
    return false;
  } catch (e) {
    if (e.message.indexOf("Request of type 'wallet_requestPermissions' already pending") != -1) {

    }

    console.log('login error', JSON.stringify(e));
  }
}

const attachWalletEvents = async function () {

  let enableWeb3Result = await Moralis.enableWeb3({
    provider: "walletconnect"
  }).then(async function (evt) {

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

  document.getElementById("btn-login").addEventListener('click', function (e) { //say this is an anchor
    e.preventDefault();
    login();
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