    function day_of_the_month(startDate) {
    }
    function dayMonth(d) {
        console.log(d);
        return (d.getDate() < 10 ? '0' : '') + d.getDate();
    }
    function getTodayString (todayDate) {
        let clickDay = new Date(todayDate);
        let daysOfWeek = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
        let dayWeek = daysOfWeek[clickDay.getDay()];            
        return dayWeek;
    };
    function getTodayNum (todayDate) {
        let clickDay = new Date(todayDate);
        return clickDay.getDate()+1;
    };
    function getMonthString  (todayDate) {
        let clickDate = new Date(todayDate);
        let months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        let monthString = months[clickDate.getMonth()];
        return monthString;
    };
    function clean_hour  (d) {

        return(d.getHours() < 10 ? '0' : '') + d.getHours();
    };
    function clean_minute  (d) {

        return(d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    };
    function month_zero  (d) {

        let monthNum = d.getMonth() + 1;
        return (monthNum < 10 ? '0' : '') + monthNum;
    };
    function isDateAfter (d1, d2) {
        if (moment(d1).isAfter(d2)) {
            return true;
        } else {
            return false;
        }
    }
    function isDateBefore(d1, d2) {
        if (moment(d1).isBefore(d2)) {
            return true;
        } else {
            return false;
        }

    }