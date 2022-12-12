import Network from "./Network";

export default class TestNetwork extends Network {

    constructor() {
        super();

        if (window.location.host.indexOf('localhost') == -1) {
            this.ServerUrl = "https://f8t1vrrwtboa.usemoralis.com:2053/server";
            this.AppId = "XZhp3wQobrKiCib0Bf4FPVKAUhbHM9SvTLKOKvBb";
        } else {
            this.ServerUrl = "http://localhost:3000";
            this.AppId = "";
        }
        this.TestNetwork = true;
    }
}