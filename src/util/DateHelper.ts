export default class DateHelper {

    public static isOlderThen(date : Date, minutes : number) {
        let currentTime = new Date().getTime();
        return (currentTime > (date.getTime() + minutes * 60 * 1000));
    };

    public static getWeekday() {
        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

        const d = new Date();
        return weekday[d.getDay()];
    }

    public static getOpenAndCloseHours() {
        const d = new Date();

        let openHour = 9 + 4 + (-1 * (d.getTimezoneOffset()/60));
        let closeHour = 16 + 4 + (-1 * (d.getTimezoneOffset()/60));
        return [openHour + ':30', closeHour + ':00']
    }

}