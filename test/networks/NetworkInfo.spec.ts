import {equal} from "assert";
import NetworkInformation from '../../src/networks/NetworkInfo';
import NetworkInfo from '../../src/networks/NetworkInfo';
import {NetworkType} from "../../src/networks/NetworkType";

describe("Test for NetworkInfo", () => {
    it("Get default instance of network info, should give mumbai network", () => {

        let instance = NetworkInformation.getInstance();

        equal(instance.ServerUrl, "https://5bgiedfv59dd.usemoralis.com:2053/server");
        equal(instance.AppId, "bhvFURhCqNvKGfVggu50fkcbm9ijMJqK3HRnfM79");
        equal(instance.ChainId, 80001);
        equal(instance.Name, "mumbai");
        equal(instance.ChainName, 'Polygon Mumbai');
        equal(instance.NativeCurrencyName, "Matic");
        equal(instance.NativeSymbol, "MATIC");
        equal(instance.NativeDecimal, 18);
        equal(instance.RpcUrl, 'https://matic-mumbai.chainstacklabs.com/');
        equal(instance.BlockExplorer, 'https://mumbai.polygonscan.com/');

    });

    it("Get default instance of network info, should give mumbai network then load fuji network", () => {
        let instance = NetworkInformation.getInstance();

        equal(instance.Name, "mumbai");

        NetworkInformation.loadNetwork('fuji')

        instance = NetworkInfo.getInstance();
        equal(instance.Name, "fuji");
    });

    it("Wrong network name, default to mumbai", () => {
        NetworkInformation.loadNetwork('test');
        let instance = NetworkInformation.getInstance();
        equal(instance.Name, "mumbai")
    });

    it('should get only mainnet networks', () => {
        let networks = NetworkInfo.getNetworks(NetworkType.Mainnet);
        for (let i = 0; i < networks.length; i++) {
            equal(networks[i].TestNetwork, false);
        }

    })
});