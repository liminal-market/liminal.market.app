import User from "../../dto/User";
import UserService from "../../services/backend/UserService";
import NetworkInfo from "../../networks/NetworkInfo";
import App from "../../main";

export default class BasePage {

    user: User;
    network: NetworkInfo;

    constructor() {
        this.user = App.User;
        this.network = App.Network
    }

}