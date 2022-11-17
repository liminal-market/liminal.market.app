import Moralis from "moralis";
import PositionsService from "../../services/backend/PositionsService";
import UserInfo from "./UserInfo";
import UserService from "../../services/backend/UserService";
import BigNumber from "bignumber.js";
import PositionsPage from "../pages/PositionsPage";

export default class UserPosition {

    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public static registerListener(moralis: typeof Moralis) {
        UserInfo.onUserLoggedIn.push(async () => {
            let userPosition = new UserPosition(moralis);
            userPosition.render();
        })
    }

    public async render() {
        let userService = new UserService(this.moralis);
        let positionService = new PositionsService(this.moralis);
        let userPosition = await positionService.getUserPositions(userService.getEthAddress()!);

        let pl_status = document.querySelector('.pl_status');
        pl_status?.classList.remove('hidden');
        pl_status?.addEventListener('click', (evt) => {
            evt.preventDefault();
            let positionPage = new PositionsPage(this.moralis);
            positionPage.load();
        })

        let unrealized_pl = document.getElementById('unrealized_pl');
        if (unrealized_pl) {
            let number = new BigNumber(userPosition.unrealizedPL);
            unrealized_pl.innerHTML = '$' + number.decimalPlaces(0).toFixed();
            let className = (userPosition.unrealizedPL.indexOf('-') == -1) ? 'green' : 'red';
            unrealized_pl.classList.add(className);
        }

        let unrealized_plpc = document.getElementById('unrealized_plpc');
        if (unrealized_plpc) {
            let number = new BigNumber(userPosition.unrealizedPLPc);
            unrealized_plpc.innerHTML = number.multipliedBy(100).decimalPlaces(2).toFixed() + '%';
            let className = (userPosition.unrealizedPLPc.indexOf('-') == -1) ? 'green' : 'red';
            unrealized_plpc.classList.add(className);
        }

    }


}