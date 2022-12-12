import ExecuteTradeButton from "../../ui/elements/tradepanel/ExecuteTradeButton";
import App from "../../main";
import NetworkInfo from "../../networks/NetworkInfo";
import AuthenticateService from "./AuthenticateService";
import UserInfo from "../../ui/elements/UserInfo";
import {isJSON} from "../../util/Helper";

export default class EventService {

    public static register() {
        UserInfo.onUserLoggedIn.push(async () => {
            let eventService = new EventService();
            eventService.listen();
        });
    }

    public listen() {
        let network = NetworkInfo.getInstance();
        let eventSource = new EventSource(network.ServerUrl + '/listenForChanges?jwt=' + App.User.token);
        eventSource.onmessage = async (e: any) => {
            let data = e.data;
            console.log(e);
            if (!data || data == 'ok') return;

            let obj = isJSON(data);
            if (!obj) {
                console.log('data is not json:', data)
                return;
            }

            if (obj.methodName == 'OrderExecuted') {
                await ExecuteTradeButton.Instance.showTradeExecuted(obj);
            }


        }
    }
}