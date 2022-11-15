import Network from "./Network";

export default class MainNetwork extends Network {

    constructor() {
        super();

        this.ServerUrl = "https://rokinwgcthqy.grandmoralis.com:2053/server";
        this.AppId = "FqJxfp9xng1SbovOToR2fnFjnBJju2Ko67nmTfFF";
        this.TestNetwork = false;
    }
}