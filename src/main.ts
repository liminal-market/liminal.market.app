import Routing from "./routing/Routing";
import Header from "./ui/elements/Header";
import UserPosition from "./ui/elements/UserPosition";
import User from "./dto/User";
import Network from "./networks/Network";
import NetworkInfo from "./networks/NetworkInfo";
import EventService from "./services/backend/EventService";
import WalletHelper from "./util/WalletHelper";
import SwitchNetworkModal from "./ui/modals/SwitchNetworkModal";
import OrderExecutedModal from "./ui/elements/tradepanel/OrderExecutedModal";
import OrderProgress from "./ui/elements/tradepanel/OrderProgress";
import Listener from "liminal.market/dist/services/Listener";

export default class App {
    public static User: User;
    public static Network: Network;

    constructor() {
        App.Network = NetworkInfo.getInstance();
        window.addEventListener('load', () => {
            // @ts-ignore
            let userWalletChainId = (window.ethereum && window.ethereum.chainId) ? parseInt(window.ethereum.chainId) : undefined;
            if (userWalletChainId) {
                let network = NetworkInfo.getNetworkInfoByChainId(userWalletChainId);
                if (!network) {
                    let switchNetwork = new SwitchNetworkModal();
                    switchNetwork.show();
                    return;
                } else {
                    NetworkInfo.setNetworkByChainId(userWalletChainId);
                    App.Network = NetworkInfo.getInstance();
                }
            }
        });

        App.User = new User(null, '', App.Network.ChainId, '');
    }

    public async start() {
        let routing = new Routing();
        await routing.loadRoutes();

        UserPosition.registerListener();
        EventService.register();

        let header = new Header();
        header.load();


        // @ts-ignore
        if (WalletHelper.isWebview() && window.VConsole) {
            // @ts-ignore
            var vConsole = new window.VConsole();
        }

    }

}

let app = new App();
app.start().then();
// @ts-ignore
window.app = app;

export {App}