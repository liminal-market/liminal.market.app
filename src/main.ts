import ConnectionService from "./services/backend/ConnectionService";
import UserService from "./services/backend/UserService";
import Routing from "./routing/Routing";
import ConnectWallet from "./ui/modals/ConnectWallet";
import UserInfo from "./ui/elements/UserInfo";
import ErrorInfo from "./errors/ErrorInfo";
import WalletHelper from "./util/WalletHelper";
import GeneralError from "./errors/GeneralError";
import Header from "./ui/elements/Header";
import AUsdBalance from "./ui/elements/AUsdBalance";
import NetworkInfo from "./networks/NetworkInfo";
import {ethereumInstalled, showBar} from "./util/Helper";

const start = async function () {
    let slowServerTimer = setTimeout(slowServer, 10 * 1000);
    showBar('ethereumInstalled0:' + ethereumInstalled());
    let connectionService = new ConnectionService();
    connectionService.start().then(async function () {
        clearTimeout(slowServerTimer);

        let loadingMessage = document.querySelector('.loading') as HTMLElement;
        let userService = new UserService(Moralis);
        let loggedInUser = await userService.isLoggedIn(loadingMessage);
console.log('loggedInUser', loggedInUser);
        if (loggedInUser) {
            let userInfo = new UserInfo(Moralis, (loggedInUser as any).providerInfo, loggedInUser);
            await userInfo.render('user_header_info');


        } else {
            //show Connect Wallet button
            let connectWallet = new ConnectWallet(Moralis);
            connectWallet.renderButton('user_header_info');
        }

        let routing = new Routing(Moralis);
        await routing.loadRoutes();

        if (Moralis.isWeb3Enabled() && NetworkInfo.getInstance().TestNetwork) {
            let header = document.querySelector('header');
            if (!header) return;
            let warningHtml = '<div class="errorBar">You are running on testnet. No real trades will be executed</div>';
            header.insertAdjacentHTML('beforebegin', warningHtml);
        }

        setTimeout(() => {
            showBar('ethereumInstalled2:' + ethereumInstalled());
        }, 10 * 1000)
    }).catch((reason) => {
        ErrorInfo.report(new GeneralError("Server is down. Please try again later.<br /><br />" + reason));
    });

    document.body.addEventListener('click', (evt) => {
        let userInfoDropdown = document.getElementById('userInfoDropdown');
        if (userInfoDropdown && !userInfoDropdown.classList.contains('d-none')) {
            userInfoDropdown.classList.add('d-none');
            evt.stopPropagation();
            evt.preventDefault();
        }
    })

    let walletHelper = new WalletHelper(Moralis);
    if (walletHelper.isWebview(window.navigator.userAgent))
    {
        //console = ErrorInfo as any;
    }


    function slowServer() {
        let loading = document.querySelector('.loading');
        if (!loading) {
            clearTimeout(slowServerTimer);
            return;
        }

        loading.innerHTML = 'Hmmm.... our servers are slow. Give it few seconds.'

    }
    Header.loadImage();

}

start().then();
