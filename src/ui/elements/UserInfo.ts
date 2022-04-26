import {ExecuteTradeOffHoursTxt} from "../../modules/buy";
import UserService from "../../services/backend/UserService";

export default class UserInfo {
    moralis: typeof Moralis;
    user?: typeof Moralis.User;
    userService: UserService;

    public constructor(moralis: typeof Moralis, user?: typeof Moralis.User) {
        this.moralis = moralis;
        this.user = user;
        this.userService = new UserService(this.moralis);
    }

    public async renderUserInfo() {
        this.listenForWalletChanges();

        let userInfoDiv = document.getElementById('user_info');
        if (!userInfoDiv) return;

        let isOffHours = this.userService.isOffHours();
        userInfoDiv.innerHTML = 'Render user info login box';


        let offHoursBtn = document.getElementById('off_hours');
        if (offHoursBtn) {
            offHoursBtn.addEventListener('click', this.toggleOffHours);
        }

    }

    private listenForWalletChanges() {
        this.moralis.onChainChanged(function () {
            location.reload();
        });
        this.moralis.onAccountChanged(function () {
            location.reload();
        });
        this.moralis.onDisconnect(function () {
            location.reload();
        });
        this.moralis.onConnect(function () {
            location.reload();
        });
    }

    private toggleOffHours(e: MouseEvent) {
        let input = e.target as HTMLInputElement;
        let isOffHours =  input.checked;

        this.userService.setOffHours(isOffHours);

        let executeTradeBtn = document.getElementById('execute-trade');
        if (!executeTradeBtn) return;

        if (input.checked) {
            executeTradeBtn.innerHTML = "Execute trade";
        } else {
            executeTradeBtn.innerHTML = ExecuteTradeOffHoursTxt;
        }
    }
}