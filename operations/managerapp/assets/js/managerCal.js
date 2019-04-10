(function (namespace) {
    "use strict";
	var petOwnerProfile;
	var calendar; 

	var currentServiceChosen;
	var currentTimeWindowBegin;
	var currentTimeWindowEnd;
	var currentPetsChosen = [];
	var clickedDate;

	var all_visits = [];
    var surchargeItems =[];
	var serviceList = [];    
	var timeWindowList =[];
	var event_visits = [];
    var pendingVisits = [];
    
	var dragBeginDate;
    var dragEndDate;

    var visitReportList = [];
    var allVisits = [];
    var allSitters= [];
    var allClients =[];
    var isAjax = false;
    var visitsBySitter =  {};
    var onWhichDay = '';
    var fullDate = '';
    var username = '';
    var password = '';
    var userRole = 'm';

    const  dayArrStr = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const monthsArrStr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
   

    const masterVreportList = async () => {
        if(!isAjax) {
            let vReport = await LTMGR.getMasterVisitReportList(fullDate, fullDate);
            return vReport;
        }
        else {
            let vReport = await LTMGR.getMasterVisitReportListAjax(fullDate, fullDate);
            return vReport;
        }
    };



	document.addEventListener('DOMContentLoaded', function() {
		var calendarEl = document.getElementById('calendar');

		calendar = new FullCalendar.Calendar(calendarEl, {
			plugins: [ 'dayGrid', 'interaction' ],
				editable : true,
				dateClick: function(info) {
						clickedDate = info.date;
						displayVisitRequest(clickedDate);
				},

				eventClick: function(info) {
						let eventClicked = info.event._def;
						let eKeys = Object.keys(eventClicked);
						eKeys.forEach((keyItem)=> {
							console.log(keyItem);
						})
						let eventProps = eventClicked.extendedProps;
						let keys = Object.keys(eventProps);
						keys.forEach((keyItem)=> {
							//console.log(keyItem + ' ' + eventProps[keyItem]);
						})
						console.log('Appointment ID: ' + eventClicked.publicId + ' Status: ' + eventProps.status + ' Date: ' + info.date);
						if (eventProps.status == 'canceled') {
							displayUncancel(eventClicked.publicId,info.date);
						}
				},

				eventDragStart :  function(info) {

					dragBeginDate = info.event['start'];
					console.log(dragBeginDate);
				},

				eventDrop : function(info) {
					dragEndDate = info.event['start'];
					if (isValidDate(dragBeginDate, dragEndDate)) {


					}
					console.log(dragEndDate);
					if (confirm('revert change?')) {
						info.revert();
					}
				}
        });
        
        let today = new Date();
        let endDate = new Date();
        login('dlifebri', 'pass','o',today,endDate);

		
    });

    function login(loginDate) {

        allVisits = [];
        allSitters = [];
        allClients =[];
        visitsBySitter = [];
        loginDate = '2019-04-07';
        setupLoginSteps(loginDate, false);
    }

    async function setupLoginSteps(loginDate, isUpdate) {
        if (!isUpdate) {
            const managerLoginFetch =  loginPromise();
            await managerLoginFetch;
        }
        const sitterListAfterLogin = LTMGR.getManagerData();
        await sitterListAfterLogin.then((results)=> {
            allSitters = results;
        });
        const visitListAfterLogin = LTMGR.getManagerVisits();
        await visitListAfterLogin.then((results)=> {
            allVisits = results;
        })
        const clientsAfterLogin = LTMGR.getManagerClients();
        await clientsAfterLogin.then((results)=> {
            allClients = results;
        });

        /*masterVreportList()
        .then((vListItems)=> { 
            vListItems.forEach((item)=> {
                visitReportList.push(item);
            });

        });*/
    }

    async function loginPromise(loginDate) {

        /*if (username == '') {
            username = document.getElementById('userName').value;
        }
        if (password == '') {
            password = document.getElementById('passWord').value;
        }
        if (document.getElementById('login').innerHTML == 'LOGIN') {
            let usernameNode = document.getElementById('userName');
            usernameNode.parentNode.removeChild(usernameNode);
            let passwordNode = document.getElementById('passWord')
            passwordNode.parentNode.removeChild(passwordNode);
            document.getElementById('login').innerHTML = 'UPDATE';
        }*/

        fullDate = getFullDate();

        username = 'dlifebri';
        password = 'pass';

        if (loginDate == null) {
            fullDate = getFullDate();
        } else {
            fullDate = loginDate;
        }

        let url = 'http://localhost:3300?type=mmdLogin&username='+username+'&password='+password+'&role='+userRole+'&startDate='+fullDate+'&endDate='+fullDate;
        let loginFetchResponse;
        let response;
        try {
            loginFetchResponse = await fetch(url);
        } catch (error) {
            return error;
        }
        try {
            response = await loginFetchResponse.json();
        } catch(error) {
            console.log('Response error ');
        }
    }

    function getFullDate() {
        var todayDate = new Date();
        onWhichDay = new Date(todayDate);
        let todayMonth = todayDate.getMonth()+1;
        let todayYear = todayDate.getFullYear();
        let todayDay = todayDate.getDate();

        let dayOfWeek = todayDate.getDay();

        let dayWeekLabel = document.getElementById('dayWeek');
        //dayWeekLabel.innerHTML = dayArrStr[dayOfWeek] + ', ';
        let monthLabel = document.getElementById('month');
        //monthLabel.innerHTML = monthsArrStr[todayMonth-1];
        let dateLabel = document.getElementById("dateLabel");
        //dateLabel.innerHTML = todayDay;
        return todayYear+'-'+todayMonth+'-'+todayDay;
    }

    async function loginFetch(username,password,userRole,fullDate, endDate) {
        let url = 'http://localhost:3300?type=mmdLogin&username='+username+'&password='+password+'&role='+userRole+'&startDate='+fullDate+'&endDate='+fullDate;
        let loginFetchResponse;
        let response;
        try {
            loginFetchResponse = await fetch(url);
        } catch (error) {
            return error;
            }
        try {
            response = await loginFetchResponse.json();
        } catch(error) {
            console.log('Response error ');
        }
    }

    async function addCalendarEvents(eventData) {

        all_visits = await LTMGR.getManagerVisits();
            

         all_visits.forEach((visit) => {
            let eventTitle = visit.service;
            if (visit.note != null) {
                eventTitle += '\n' + visit.note;
            }
            let eventStart = visit.time_window_start;
            let eventEnd = visit.time_window_end;
            let eventDateStart = visit.date + ' ' + eventStart;
            let eventDateEnd = visit.date + ' ' + eventEnd;
            let visitColor = '';
            let visitURL = '';

            if(visit.status == 'canceled') {

                visitColor = 'red';

            } else if (visit.status == 'completed') {

                visitColor = 'green';
                visitURL ='<LINK TO VISIT REPORT>';

            } else if (visit.status  == 'future' || visit.status == 'INCOMPLETE' || visit.status == 'incomplete') {

                visitColor = 'blue';

            } else if (visit.status == 'late') {

                visitColor = 'orange';

            } else if (visit.status == 'pending') {

                visitColor = 'orange';
                eventTitle += ' (PENDING APPROVAL)'
                pendingVisits.push(visit);

            }

            let event = {
                id : visit.appointmentid,
                title: eventTitle,
                note: visit.visitNote,
                timeWindow : visit.time_window_start + ' - ' + visit.time_window_end,
                start : eventDateStart,
                end : eventDateEnd,
                arrivalTime : visit.arrival_time,
                completionTime: visit.completion_time,
                color : visitColor,
                status : visit.status,
                sitter: visit.sitter,
                isPending: false
            };
            event_visits.push(event);
            calendar.addEvent(event);
        });
    }
}(this.materialadmin)); 