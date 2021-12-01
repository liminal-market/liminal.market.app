import {KYCUserIsValid} from './kyc.js';

export const login = async function (callback) {
  try {
  let user = await Moralis.User.current();
  if (!user) {
    user = await Moralis.authenticate({
      signingMessage: "You are login into Liminal.market"
    }).then(function (user) {
      console.log(user.get('ethAddress'))
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