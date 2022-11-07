import Network from "./Network";

export default class MainNetwork extends Network {

    constructor() {
        super();

        this.ServerUrl = "https://03sj8bj43s54.grandmoralis.com:2053/server";
        this.AppId = "G62wwf2lVoNz0v5tKRZKHPcHWjEh2Xd816UyRQYU";
        this.TestNetwork = false;
    }
}