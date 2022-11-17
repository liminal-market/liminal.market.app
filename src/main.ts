import ConnectionService from "./services/backend/ConnectionService";
import Routing from "./routing/Routing";
import ErrorInfo from "./errors/ErrorInfo";
import WalletHelper from "./util/WalletHelper";
import GeneralError from "./errors/GeneralError";
import Header from "./ui/elements/Header";
import AuthenticateUser from "./ui/elements/AuthenticateUser";
import UserPosition from "./ui/elements/UserPosition";


const start = async function () {
    let slowServerTimer = setTimeout(slowServer, 10 * 1000);
    let moralis = Moralis;
    let connectionService = new ConnectionService(moralis);
    connectionService.start().then(async () => {
        clearTimeout(slowServerTimer);

        let routing = new Routing(moralis);
        await routing.loadRoutes();

        UserPosition.registerListener(moralis);

        let authorizeUser = new AuthenticateUser(moralis);
        authorizeUser.authenticate();
    }).catch((reason) => {
        ErrorInfo.report(new GeneralError("Server is down. Please try again later.<br /><br />" + reason));
    });

    let walletHelper = new WalletHelper(moralis);
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
