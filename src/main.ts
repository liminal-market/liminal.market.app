import ConnectionService from "./services/backend/ConnectionService";
import UserService from "./services/backend/UserService";
import Routing from "./routing/Routing";
import ConnectWallet from "./ui/modals/ConnectWallet";
import UserInfo from "./ui/elements/UserInfo";


const start = async function () {

    let connectionService = new ConnectionService();
    connectionService.start().then(async function () {
        let routing = new Routing();
        await routing.loadRoutes();

        let userService = new UserService();
        let loggedInUser = userService.isLoggedIn();

        if (loggedInUser) {
            let userInfo = new UserInfo(Moralis, loggedInUser);
            await userInfo.renderUserInfo();
            //load user info into UI
        } else {
            //show Connect Wallet button
            let connectWallet = new ConnectWallet(Moralis);
            connectWallet.renderButton('connect_wallet_header');
        }
    }).catch((reason) => {
        document.getElementById('main_container')!.innerHTML
            = "Server is down. Please try again later.<br /><br />" + reason;
    });

}

start().then();


