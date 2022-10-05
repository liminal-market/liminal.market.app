import KycResultMessage from "./KycResultMessage";

export default class KycResult {
    additional_information = "";
    messages: KycResultMessage[] = [];
}