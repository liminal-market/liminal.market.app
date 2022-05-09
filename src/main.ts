import ConnectionService from "./services/backend/ConnectionService";
import UserService from "./services/backend/UserService";
import Routing from "./routing/Routing";
import ConnectWallet from "./ui/modals/ConnectWallet";
import UserInfo from "./ui/elements/UserInfo";
import ErrorInfo from "./errors/ErrorInfo";
import WalletHelper from "./util/WalletHelper";
import GeneralError from "./errors/GeneralError";




const start = async function () {
    let slowServerTimer = setTimeout(slowServer, 5 * 1000);

    let connectionService = new ConnectionService();
    connectionService.start().then(async function () {
        clearTimeout(slowServerTimer);

        let loadingMessage = document.querySelector('.loading') as HTMLElement;
        let userService = new UserService(Moralis);
        let loggedInUser = await userService.isLoggedIn(loadingMessage);

        let routing = new Routing(Moralis);
        await routing.loadRoutes();


        if (loggedInUser) {
            let userInfo = new UserInfo(Moralis, (loggedInUser as any).providerInfo, loggedInUser);
            await userInfo.renderUserInfo('user_header_info');
            //load user info into UI
        } else {
            //show Connect Wallet button
            let connectWallet = new ConnectWallet(Moralis);
            connectWallet.renderButton('user_header_info');
        }

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

    let walletHelper = new WalletHelper();
    if (walletHelper.isWebview(window.navigator.userAgent))
    {
        console = ErrorInfo as any;
    }


    function slowServer() {
        let loading = document.querySelector('.loading');
        if (!loading) {
            clearTimeout(slowServerTimer);
            return;
        }

        loading.innerHTML = 'Hmmm.... our servers are slow and might be down. Give it few minutes.'

    }


}

start().then();


