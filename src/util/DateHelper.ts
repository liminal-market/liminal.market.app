export default class DateHelper {

    public static IsOlderThen(date : Date, minutes : number) {
        let currentTime = new Date().getTime();
        return (currentTime > (date.getTime() + minutes * 60 * 1000));
    };


}