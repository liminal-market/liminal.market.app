import Network from "./Network";

export default class TestNetwork extends Network {

    constructor() {
        super();

        if (window.location.host.indexOf('localhost') != -1) {
            this.ServerUrl = "https://pkkenhl7syns.grandmoralis.com:2053/server";
            this.AppId = "QpShD4VYQT6N7evc2vMu3VtEKSEGjQPSbuJNhlIq";
        } else {
            this.ServerUrl = "https://f8t1vrrwtboa.usemoralis.com:2053/server";
            this.AppId = "XZhp3wQobrKiCib0Bf4FPVKAUhbHM9SvTLKOKvBb";
        }
        this.TestNetwork = true;
    }
}