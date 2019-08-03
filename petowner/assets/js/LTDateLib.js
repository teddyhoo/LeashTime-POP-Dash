
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
		console.log('CALLING DAY DIFF: ' + microSecondsDiff + ' ' + daysDiff);
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
	return {
		calDaysBefore : calDaysBefore,
		calDaysAfter : calDaysAfter,
		getFullDate : getFullDate,
		calcDateDayDiff : calcDateDayDiff,
		isValidDate : isValidDate

	}
	module.exports = {
		dayArrStr : dayArrStr,
		monthsArrStr : monthsArrStr,
		re : re
	}

} ());