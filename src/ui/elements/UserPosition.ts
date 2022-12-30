import PositionsService from "../../services/backend/PositionsService";
import UserInfo from "./UserInfo";
import UserService from "../../services/backend/UserService";
import BigNumber from "bignumber.js";
import PositionsPage from "../pages/PositionsPage";

export default class UserPosition {


    constructor() {
    }

    public static registerListener() {
        UserInfo.onUserLoggedIn.push(async () => {
            let userPosition = new UserPosition();
            userPosition.render();
        })
    }

    public async render() {
        let userService = new UserService();
        let positionService = new PositionsService();
        let userPosition = await positionService.getUserPositions(userService.getEthAddress()!);
        if (!userPosition) return;

        let pl_status = document.querySelector('.pl_status');
        pl_status?.classList.remove('hidden');
        pl_status?.addEventListener('click', (evt) => {
            evt.preventDefault();
            let positionPage = new PositionsPage();
            positionPage.load();
        })

        let unrealized_pl = document.getElementById('unrealized_pl');
        if (unrealized_pl) {
            let number = new BigNumber(userPosition.unrealizedPL);
            unrealized_pl.innerHTML = '$' + number.decimalPlaces(0).toFixed();
            let className = this.getClassName(userPosition.unrealizedPL);
            unrealized_pl.classList.add(className);
        }


        let unrealized_plpc = document.getElementById('unrealized_plpc');
        if (unrealized_plpc) {
            let number = new BigNumber(userPosition.unrealizedPLPc);
            unrealized_plpc.innerHTML = number.multipliedBy(100).decimalPlaces(2).toFixed() + '%';
            let className = this.getClassName(userPosition.unrealizedPL);
            unrealized_plpc.classList.add(className);
        }

    }

    private getClassName(value: number) {
        return (value.toString().indexOf('-') == -1) ? 'green' : 'red';
    }


}