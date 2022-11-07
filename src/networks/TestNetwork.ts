import Network from "./Network";

export default class TestNetwork extends Network {

    constructor() {
        super();

        if (window.location.host.indexOf('localhost') != -1) {
            this.ServerUrl = "https://dqet8dfymvzj.usemoralis.com:2053/server";
            this.AppId = "TXR6YesK99VgRCxSecnySRMp1KI5rLnCfIetQuuU";
        } else {
            this.ServerUrl = "https://f8t1vrrwtboa.usemoralis.com:2053/server";
            this.AppId = "XZhp3wQobrKiCib0Bf4FPVKAUhbHM9SvTLKOKvBb";
        }
        this.TestNetwork = true;
    }
}