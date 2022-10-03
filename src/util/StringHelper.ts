export default class StringHelper {
    public static isNullOrEmpty(str: string | undefined) {
        return !str || str.toString().trim().length == 0;
    }
}