import ConnectionService from "./services/backend/ConnectionService";
import Routing from "./routing/Routing";
import ErrorInfo from "./errors/ErrorInfo";
import WalletHelper from "./util/WalletHelper";
import GeneralError from "./errors/GeneralError";
import Header from "./ui/elements/Header";
import UserPosition from "./ui/elements/UserPosition";
import User from "./dto/User";
import Network from "./networks/Network";
import NetworkInfo from "./networks/NetworkInfo";
import ExecuteTradeButton from "./ui/elements/tradepanel/ExecuteTradeButton";
import EventService from "./services/backend/EventService";

export default class App {
    public static User: User;
    public static Network: Network;

    constructor() {
        App.Network = NetworkInfo.getInstance();
        App.User = new User(null, '', App.Network.ChainId, '');
    }

    public async start() {
        let routing = new Routing();
        await routing.loadRoutes();

        UserPosition.registerListener();
        EventService.register();

        let header = new Header();
        header.load();
    }
}

let app = new App();
app.start().then();
// @ts-ignore
window.app = app;

export {App}