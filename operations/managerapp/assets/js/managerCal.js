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

        document.addEventListener()
    });

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