import {equal} from "assert";
import {upperFirstLetter} from "../../../src/util/Helper";

describe("Test subscription class", () => {

    it("Should have correct table prefix", () => {
        let text = "mumbai";
        let upperString = upperFirstLetter(text);

        equal(upperString, "Mumbai")

    })

})