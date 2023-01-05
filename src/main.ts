import Routing from "./routing/Routing";
import Header from "./ui/elements/Header";
import UserPosition from "./ui/elements/UserPosition";
import User from "./dto/User";
import Network from "./networks/Network";
import NetworkInfo from "./networks/NetworkInfo";
import EventService from "./services/backend/EventService";
import WalletHelper from "./util/WalletHelper";

export default class App {
    public static User: User;
    public static Network: Network;

    constructor() {
        console.log('App constructor');
        App.Network = NetworkInfo.getInstance();
        window.addEventListener('load', () => {
            if (ethereum && ethereum.chainId != App.Network.ChainIdHex) {
                NetworkInfo.setNetworkByChainId(ethereum.chainId);
                App.Network = NetworkInfo.getInstance();
            }
            console.log('network', App.Network);
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

        if (WalletHelper.isWebview()) {
            // @ts-ignore
            var vConsole = new window.VConsole();
        }

        this.loadEth();
    }

    private loadEth() {
        window.addEventListener('load', () => {
            // @ts-ignore
            console.log('win.eth', window.ethereum)
            console.log('ethereum', ethereum);
        });
    }
}

let app = new App();
app.start().then();
// @ts-ignore
window.app = app;

export {App}