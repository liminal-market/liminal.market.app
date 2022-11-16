import {instance, mock, verify} from "@johanblumenberg/ts-mockito";
import {equal} from "assert";
import CookieHelper from "../../src/util/CookieHelper";
import {JSDOM} from 'jsdom';

describe("Test CookieHelper", () => {
    it("Set cookie on document", () => {
        let window = new JSDOM().window;
        let document =window.document;

        let networkName = "test";
        let cookieHelper = new CookieHelper(document);
        cookieHelper.setCookie('network', networkName);

        equal(document.cookie, "network=" + networkName);

    })
    it("Get cookie on document", () => {
        let window = new JSDOM().window;
        let document = window.document;

        let networkName = "test";
        let cookieHelper = new CookieHelper(document);

        cookieHelper.setCookie('network', networkName);
        let cookieValue = cookieHelper.getCookieValue("network");

        equal(cookieValue, networkName);

    })
})