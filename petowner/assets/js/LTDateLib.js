
var LTDateLib = (function() {

	const dayArrStr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
	const monthsArrStr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
	var re = /([0-9]+):([0-9]+):([0-9]+)/;

	function getDayStringForDate(date) {
		
		let dateObj = new Date(date);
	}
	function calDaysBefore(todayDate) {
		let daysBeforeDate = new Date(todayDate);
		daysBeforeDate.setDate(daysBeforeDate.getDate() - 30);
		let beforeYear = daysBeforeDate.getFullYear();
		let beforeMonth = daysBeforeDate.getMonth() + 1;
		let beforeDate = daysBeforeDate.getDate();
		let fullDateString = beforeYear + '-' + beforeMonth + '-' + beforeDate;
		return fullDateString;
	}
	function calDaysAfter(todayDate) {
		let daysAfterDate = new Date(todayDate);
		daysAfterDate.setDate(daysAfterDate.getDate() + 30);
		let afterYear = daysAfterDate.getFullYear();
		let afterMonth = daysAfterDate.getMonth() + 1;
		let afterDate = daysAfterDate.getDate();
		let fullDateString = afterYear + '-' + afterMonth + '-' + afterDate;
		return fullDateString;
	}
	function calcDateDayDiff(beginDate, endDate) {
		let dateEndTimeStamp = (new Date(endDate).getTime());
		let dateBeginTimeStamp = (new Date(beginDate).getTime());
		let microSecondsDiff = Math.abs(dateBeginTimeStamp - dateEndTimeStamp);
		let daysDiff = Math.floor(microSecondsDiff/(1000*60*60*24));
		return daysDiff;
	}
	function getFullDate() {
	    var todayDate = new Date();
	    let futureDate = new Date();

	    futureDate.setDate(futureDate.getDate() + 45);
	    let futureMonth = futureDate.getMonth() + 1;
	    let todayMonth = todayDate.getMonth() + 1;
	    let todayYear = todayDate.getFullYear();
	    let todayDay = todayDate.getDate();
	    let dayOfWeek = todayDate.getDay();

	    return todayYear + '-' + todayMonth + '-' + todayDay;
	}
	function isValidDate(startDate, endDate) {
		let todayDate = new Date();
		console.log(todayDate);
		if (endDate < todayDate || startDate < todayDate) {
			console.log('Date before today');
			return false
		}
		if (startDate > todayDate && endDate > todayDate) {
			console.log('Valid placement');
			return true;
		}
	}

	function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    function parseTimeWindows(beginDateObj) {
        let newBeginDateObj = new Date(beginDateObj);
        let re= /([0-9]+):([0-9]+) (am|pm)/;
        let begTW = re.exec(cBeginTW);
        let endTW = re.exec(cEndTW);
        let bTWmatch = parseInt(begTW[1]);
        let eTWmatch = parseInt(endTW[1]);
        let isBeginMinutes = false;
        let isEndMinutes = false;
        console.log('Begin time window: ' + bTWmatch);
        if (begTW[2]  > 0) {
            isBeginMinutes = true;
        }
        if(endTW[2] > 0 ) {
            isEndMinutes = true;
        }
        if (begTW[3] == 'pm' && bTWmatch != 12) {
            bTWmatch += 12;
        }
        if(endTW[3] == 'pm' && eTWmatch != 12) {
            eTWmatch += 12;
        }
        console.log('Begin time window PM AM: ' + bTWmatch);

        newBeginDateObj.setUTCHours(addZero(bTWmatch));
        if (isBeginMinutes) {
            newBeginDateObj.setUTCMinutes(addZero(begTW[2]));
        }

        return newBeginDateObj;
    }
    function debugDateOutput(dateItem) {

        let visitTempIDMilli = dateItem.getTime();
        let realYear = dateItem.getUTCFullYear();
        let realMonth = addZero(dateItem.getUTCMonth()+1);
        let realHours = addZero(dateItem.getUTCHours());
        let realMin = addZero(dateItem.getUTCMinutes());
        let eventDateFormat = realYear+'-'+realMonth+'-'+dateItem.getUTCDate() + ' ' + realHours + ':' + realMin;
                
        console.log('Full obj: ' + dateItem);
        console.log('Date obj milli: ' + visitTempIDMilli);
        console.log('Date obj year: ' + realYear);
        console.log('Date obj month: ' + realMonth);
        console.log('Date obj hours: ' + realHours);
        console.log('Date obj min: ' + realMin);
        console.log(eventDateFormat);
    }

	return {
		calDaysBefore : calDaysBefore,
		calDaysAfter : calDaysAfter,
		getFullDate : getFullDate,
		calcDateDayDiff : calcDateDayDiff,
		isValidDate : isValidDate,
		addZero : addZero,
		parseTimeWindows : parseTimeWindows,
		debugDateOutput : debugDateOutput
	}
	module.exports = {
		dayArrStr : dayArrStr,
		monthsArrStr : monthsArrStr,
		re : re
	}

} ());