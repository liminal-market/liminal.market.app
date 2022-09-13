export default class StringHelper {
    public static isNullOrEmpty(str: string | undefined) {
        return !str || str.trim().length == 0;
    }
}