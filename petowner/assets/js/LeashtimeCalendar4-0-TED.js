(function (namespace, $) {
    "use strict";
    var calendar;
    var petOwnerProfile;
    var all_visits = [];
    var event_visits = [];
    var pendingVisits = [];

    var dragBeginDate;
    var dragEndDate;

    var beginDateService;
    var endDateService;
    var currentServiceChosen;
    var stringForCurrentService;
    var cBeginTW;
    var cEndTW;

    var currentPetsChosen = [];
    var surcharge_events = [];
    var surchargeItems =[];
    var serviceList = [];
    var timeWindowList =[];

    var isAjax = true;
    var isMultiDay = false;
    const dayArrStr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthsArrStr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var re = /([0-9]+):([0-9]+):([0-9]+)/;



    function resetVisit() {
        beginDateService = null;
        endDateService = null;
        currentServiceChosen = null;
        stringForCurrentService = null;
        cBeginTW = null;
        cEndTW = null;
        currentPetsChosen = null;
        dragBeginDate = null;
        dragEndDate = null;
        isMultiDay = false;
    }

    document.addEventListener('DOMContentLoaded', function() {
        console.log('Document is loaded');

        var calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: [ 'dayGrid', 'interaction', 'list' ],
            editable : true,
            timeZone : 'UTC',
            defaultView : 'dayGridMonth',
            fixedWeekCount : false,

            dateClick: function(info) {
                displayVisitRequest(info);
            },

            eventClick: function(info) {
                clickedEvent(info);
            },

            eventDragStart :  function(info) {
                dragBeginDate = info.event['start'];
                console.log(dragBeginDate);
            },

            eventDrop : function(info) {
                dragEndDate = info.event['end'];
                console.log(dragEndDate);

                if (LTDateLib.isValidDate(dragBeginDate, dragEndDate)) {
                    displayDragDropChangeView(info);
                } else {
                    info.revert()
                    if (confirm('revert change?')) {
                        info.revert();
                    }
                }
            },
            eventRender : function(info) {
                let eventInfo = info.event.extendedProps;
                let eventID = info.event.id;
                let eventTitle = info.event.title;
                let elementHolder = info.el;
                let styleElement = elementHolder.style
                //styleElement.cssText = 'background-color: white';
                //console.log(styleElement.cssText);
                //console.log('Event id: ' + eventID + ' Title: ' + eventTitle);
                //buildCalendarCellView(info.el, eventTitle, eventID, eventInfo);

            }
        });
        calendar.render();
        let startDate = LTDateLib.getFullDate();
        getVisits(LTDateLib.calDaysBefore(startDate) , LTDateLib.calDaysAfter(startDate));
    });

    async function getVisits(start, end) {
        if (isAjax) {
            all_visits = await LT.getPetOwnerVisitsAjax(this, start, end);
            all_visits.forEach((visit)=> {
                let eventData = createCalendarEvent(visit);
                calendar.addEvent(eventData);
            });
            petOwnerProfile = await LT.getClientProfileAjax();
            displaySurcharges();
            displayPendingStatus();
            //populateTimeline();
        }
    }
    function buildCalendarCellView(element, eventTitle, eventID, event) {
        let visitID = eventID;
        let panelID = visitID;
        let calPanelDiv = document.createElement('div');
        calPanelDiv.setAttribute('id', 'panel-'+visitID);
        calPanelDiv.setAttribute('class', 'lt-CalendarPanel panel-group');

        let calEventDiv = document.createElement('div');
        calPanelDiv.setAttribute('id', 'event-'+visitID);
        calEventDiv.setAttribute('class' , 'lt-ListItem card panel transparent');
        calPanelDiv.appendChild(calEventDiv);

        let calEventHeader = document.createElement('div');
        calEventHeader.setAttribute('class' , 'card-head card-head-xs');
        calEventHeader.setAttribute('data-toggle', 'modal');
        calEventHeader.setAttribute('data-parent', '#panel-' + panelID);
        calEventHeader.setAttribute('data-target', '#formModal');
        calEventHeader.setAttribute('aria-expanded', 'false');
        calEventDiv.appendChild(calEventHeader);

        if (event.status == 'completed') {
            calEventHeader.setAttribute('class' , 'card-head card-head-xs panel-group style-success');
        } else if (event.status == 'canceled') {
            calEventHeader.setAttribute('class' , 'card-head card-head-xs panel-group style-danger');
        } else if (event.status == 'INCOMPLETE') {
            calEventHeader.setAttribute('class', 'card-head card-head-xs panel-group style-default');
        } 
        if (event.isPending) {
            calEventHeader.setAttribute('class' , 'card-head card-head-xs  panel-group style-warning');
        }

        let evtHead = document.createElement('header');
        calEventHeader.appendChild(evtHead);

        let editBtn = document.createElement('i');
        editBtn.setAttribute('class', 'fa fa-pencil lt-hide-toggle pull-right');
        evtHead.appendChild(editBtn);

        let evtTitle = document.createElement('span');
        evtTitle.setAttribute('class', 'lt-ServiceName');
        evtTitle.innerHTML = eventTitle;
        evtHead.appendChild(evtTitle);

        let br = document.createElement('br');
        evtHead.appendChild(br);

        let evtTime = document.createElement('span');
        evtTime.setAttribute('class', 'lt-TimeWindow');
        evtTime.innerHTML = event.service;
        evtHead.appendChild(evtTime);

        element.appendChild(calPanelDiv);
    }
    function createCalendarEvent(visit) {

        let visitDateObj;
        let visitColor = 'magenta';
        let CbackgroundColor = 'black';
        let CborderColor ='yellow';
        let CtextColor = 'white';
        let pType ='';
        let eventTitle = visit.service;
        let pendingStatus = false;

        if (visit.note != null) {
            eventTitle += '\n' + visit.note;
        }
        if (visit.arrival_time != null) {
            visitDateObj = new Date(visit.date + ' ' + visit.arrival_time);
        } else {
            visitDateObj = new Date(visit.date);
        }
        let eventDateStart = visitDateObj;
        let startMonth = eventDateStart.getUTCMonth() + 1;
        let startDate = eventDateStart.getUTCDate();
        let visitStartDateFormat = startMonth + '/' + startDate + '/' + eventDateStart.getFullYear();
        let eventDateEnd = visit.date;
        eventDateStart = visit.fullDate;
        if(visit.status == 'CANCELED') {
            visitColor = 'red';
            CbackgroundColor = 'red';
            CborderColor ='red';
        } else if (visit.status == 'completed') {
            visitColor = 'green';
            CbackgroundColor = 'green';
            CborderColor ='green';
        } else if (visit.status == 'INCOMPLETE') {
            visitColor = 'magenta';
            CbackgroundColor = 'magenta'
            CborderColor ='magenta';
        }
        if (visit.pendingType != null) {
            pendingStatus = true;
            if (visit.pendingType == 'cancel') {
                visitColor = 'orange';
                CbackgroundColor = 'orange';
                CborderColor ='red';
                pendingStatus = true;
                pType = 'CANCEL';
            } else if (visit.pendingType == 'uncancel') {
                visitColor = 'orange';
                CbackgroundColor = 'orange';
                CborderColor ='green';
                pendingStatus = true;
                pType = 'UNCANCEL';
            } else {
                visitColor = 'orange';
                CbackgroundColor = 'orange';
                CborderColor ='yellow';
                pendingStatus = true;
                pType = 'SCHEDULE';
            }
        }

        let event = {
            id : visit.appointmentid,
            groupid: 'recurring',
            title: eventTitle,
            start : eventDateStart,
            end : eventDateEnd,
            note: visit.visitNote,
            visitDate : visitStartDateFormat,
            timeWindow : visit.time_window_start + ' - ' + visit.time_window_end,
            arrivalTime : visit.arrival_timeDay,
            completionTime: visit.completion_time,
            status : visit.status,
            isPending: pendingStatus,
            pendingType : pType,
            sitter: visit.sitter,
            backgroundColor  : CbackgroundColor,
            color : 'white',
            borderColor : CborderColor
        };

        addDateDataToEvent(event,eventDateStart);
        event_visits.push(event);
        if (event.isPending) {
            pendingVisits.push(event);
        }
        return event;
    }
    function createSurchargeEvent(surchargeItem) {

        let titleString = surchargeItem.surchargeLabel + ' '  + surchargeItem.surchargeDescription + ' - $' + surchargeItem.charge;
        let dateObj = new Date(surchargeItem.surchargeDate);
        //console.log('SURCHARGE: ' + titleString);
        let surchargeEvent = {
            id : surchargeItem.surchargeTypeID,
            groupid: 'surcharges',
            status : 'surcharges',
            title: titleString,
            start : dateObj,
            color : 'yellow',
            backgroundColor  : 'yellow',
            borderColor : 'yellow',
            textColor : 'white'
        };

        return surchargeEvent;
    }
    function createRequestEvent(serviceDate, serviceNameString) {
        let fullYearPre = serviceDate.getFullYear();
        let dateObj = new Date(serviceDate);
        console.log('Creating date object for begin service date: ' + dateObj);
        let realYear = dateObj.getFullYear();
        let realMonth = dateObj.getMonth()+1;
        let eventDateFormat = fullYearPre+'-'+realMonth+'-'+dateObj.getDate();
        let millisecondsVisitID = dateObj.getMilliseconds();

        let newEvent = {
            id : millisecondsVisitID,
            groupid : 'petsit',
            title: stringForCurrentService,
            start : serviceDate,
            note: 'NO NOTE',
            timeWindow : cBeginTW + ' - ' + cEndTW,
            pets : currentPetsChosen,
            status : 'pending',
            isPending: true,
            pendingType : 'SCHEDULE',
            backgroundColor : 'orange',
            eventTextColor : 'white',
            color : 'orange',

        };
        //addDateDataToEvent(newEvent);
        addVisitRequestEvent(newEvent);
        return newEvent;
    }
    function addDateDataToEvent(event , dateToAdd) {
        let dayOfWeekString = dayArrStr[dateToAdd.getDay()];
        let monthNum = dateToAdd.getMonth()+1;
        let dateOfDateString = dateToAdd.getDate();
        let fullYearString = dateToAdd.getFullYear();
        let formatDateString = monthNum + '/' + dateOfDateString + '/' + fullYearString;
        event.visitMonth = monthNum;
        event.visitDateNum = dateOfDateString;
        event.visitDayOfWeek = dayOfWeekString;
        event.visitFormatDate = formatDateString;
    }
    function addVisitRequestEvent(visitEvent) {
        event_visits.push(visitEvent);
        pendingVisits.push(visitEvent);
        calendar.addEvent(visitEvent);
    }
    function clickedEvent(eventInfo) {
        let eventClicked = eventInfo.event._def;
        let eventProps = eventClicked.extendedProps;
        let visitStatus = eventProps.status;
        let selectedVisitID = eventClicked.publicId;

        if (visitStatus == 'CANCELED') {
            console.log('VISIT CANCELED CLICKED');
            displayUncancel(eventClicked,selectedVisitID);

        } else if (visitStatus == 'completed') {

            displayVisitReport(eventClicked, selectedVisitID);

        } else if (visitStatus == 'future' ||visitStatus == 'INCOMPLETE') {

            displayCancel(eventClicked, selectedVisitID)

        } else if (visitStatus == 'surcharges') {

            displaySurchargeView();

        } else if (visitStatus == 'pending') {

            //displayVisitPending(info);


        } else {

            console.log(visitStatus);
        }
    }

    function displayPendingView(info) {
        console.log('PENDING VIEW DISPLAY');
        let eventInfo = info.event;
        let eventDate = info.date;
        console.log('VISIT TITLE: ' + eventInfo.title + ' --> ' + eventDate);
        console.log(eventProps);
    }
    function buildPendingView(event, eventID) {
        let visitID = eventID;
        let panelID = visitID;
        let eventDate = new Date(event.start);

        let visitDay = eventDate.getDate();
        let visitMonthNum = eventDate.getMonth();
        let visitMonth = monthsArrStr[visitMonthNum];
         
        let visitService = event.title;
        let visitTimeWindow = event.timeWindow;
        let pendingCount = pendingVisits.length;

        let pendingCountDiv = document.getElementById('#lt-BadgePending');
        let pendingDiv = document.getElementById('#lt-PendingEvents');
        let pendingDay = document.getElementsByClassName('sevice-day');
        let pendingmonth = document.getElementsByClassName('sevice-month');

        pendingCountDiv.innerHTML = pendingCount;
        pendingDay.innerHTML = visitDay;
        pendingMonth.innerHTML = visitMonth;

        let calPendingEventDiv = document.createElement('li');
        calPendingEventDiv.setAttribute('id', 'pending-'+visitID);
        if(event)
        calPendingEventDiv.setAttribute('class' , 'tile alert-warning');
        pendingDiv.appendChild(calPendingEventDiv);

        let calPendingEventLink = document.createElement('a');
        calPendingEventLink.setAttribute('class' ,'tile-content ink-reaction p-l-0 m-b-5');
        calPendingEventLink.setAttribute('data-toggle','modal');
        calPendingEventLink.setAttribute('data-parent', pendingDiv);
        calPendingEventLink.setAttribute('data-target', '#formModal');
        calPendingEventLink.setAttribute('aria-expanded', 'false');
        calPendingEventDiv.appendChild(calPendingEventLink);

        let evtDate = document.createElement('div');
        evtDate.setAttribute('class' , 'tile-icon tile-icon-sm btn btn-default-dark');
        calPendingEventLink.appendChild(evtDate);

        let evtDay = document.createElement('p');
        evtDay.setAttribute('class' , 'date-num');
        evtDate.appendChild(evtDay);

        let evtMonth = document.createElement('span');
        evtMonth.setAttribute('class' , 'date-month text-xxs');
        evtDate.appendChild(evtMonth);

        let evtInfo = document.createElement('div');
        evtInfo.setAttribute('class' , 'tile-text text-sm');
        calPendingEventLink.appendChild(evtInfo);

        let evtService = document.createElement('span');
        evtService.setAttribute('class', 'service-name');
        evtService.innerHTML = visitService;
        evtInfo.appendChild(evtService);

        let br = document.createElement('br');
        evtInfo.appendChild(br);

        let evtTime = document.createElement('span');
        evtTime.setAttribute('class', 'lt-TimeWindow');
        evtTime.innerHTML = event.timeWindow;
        evtInfo.appendChild(evtTime);

        let calPendingCancel = document.createElement('a');
        calPendingCancel.setAttribute('class' , 'btn btn-flat ink-reaction m-t-5');
        calPendingCancel.innerHTML = ' <i class="md md-delete"></i>';
        calPendingEventDiv.appendChild(calPendingCancel);

        element.appendChild(calPendingEventDiv);
    }
    function displayPendingStatus() {
        if (pendingVisits.length > 0) {
            let pendingBadge = document.getElementById('lt-BadgePending');
            pendingBadge.innerHTML = pendingVisits.length;
            let pendingView = document.getElementById('lt-PendingEvents');
            let pendingHTML;

            pendingVisits.forEach((pend)=> {
                //console.log(pend);
                let dateStart = new Date(pend.start);
                let monthStart = dateStart.getMonth();
                let monthString = monthsArrStr[monthStart];
                let serviceList = LT.getServices();
                let serviceName;

                serviceList.forEach((service)=>{
                    if (service.serviceID == pend.title) {
                        serviceName = service.serviceName;
                        //console.log(serviceName)
                    }
                });

                if(pend.pendingType == 'CANCEL') {

                    pendingHTML += `<a href="#" class="btn btn-block btn-danger">${pend.title} ${monthString} ${dateStart.getDate()}</a></div>`;
                
                } else if (pend.pendingType == 'SCHEDULE') {
                
                    pendingHTML += `<a href="#" class="btn btn-block btn-success">${pend.title} ${monthString} ${dateStart.getDate()}</a></div>`;

                }
            });

            pendingView.innerHTML = pendingHTML;
        }
    }
    function displaySurcharges() {
        surchargeItems = LT.getSurcharges();
        surchargeItems.forEach((surcharge)=> {
            let surchargeEventItem  =  createSurchargeEvent(surcharge);
            surcharge_events.push(surchargeEventItem);
            calendar.addEvent(surchargeEventItem);
        });
    }
    function displayVisitReport(event, visitID) {
        all_visits.forEach((visit)=> {
            if(visit.appointmentid == visitID) {
                let matchedVisit = visit;
                displayVisitReportModal(matchedVisit);
            }
        });
    }
    function displayCancel(event, visitID) {

        let eventProps;

        let eventKeys = Object.keys(event);
        eventKeys.forEach((key)=> {
            if (key == 'extendedProps') {
                eventProps = event[key];
            }
        });

        let timeWindowVisit = eventProps.timeWindow;
        let formatDate = new Date(eventProps.visitFormatDate);
        let visitFormatMonth = formatDate.getUTCMonth() + 1;
        let visitFormatDate = formatDate.getUTCDate();
        let visitFormatYear = formatDate.getFullYear();
        let visitFormatWhole = visitFormatMonth + '/' + visitFormatDate + '/' + visitFormatYear;

        const cancelChange = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header blue white-text">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h4 class="modal-title" id="formModalLabel">${event.title} - ${timeWindowVisit} </h4>
                        <p>VISIT ID:  ${visitID}</p>
                    </div>
                    <div class="alert alert-warning text-lg" role="alert">
                        <strong>Date:</strong> <span class="blue-text" id="dateCancelBegin">${visitFormatWhole}</span>
                        <div class="form-group pull-right control-width-normal">
                            <div class="input-group date" id="demo-date">
                                <div class="input-group-content">
                                    <input type="text" class="form-control" id="cancelUntilDate" value="NONE">
                                    <label>Until date: </label>
                                </div>
                                <span class="input-group-addon"><i class="fa fa-calendar"></i></span>
                            </div>
                        </div>
                        <br>
                    </div>
                    <form class="form-horizontal" role="form">
                        <div class="modal-body" id="cancelVisit">
                            <div class="alert alert-warning text-lg" role="alert">
                                <div class="modal-footer grey lighten-2">
                                    <button type="button" class="btn btn-danger" data-dismiss="modal" forVisit="${visitID}" id="cancelVisitButton"}>REQUEST CANCELLATION</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
             </div>`;

        let showModal = document.getElementById("formModal");
        showModal.innerHTML = cancelChange;
        jQuery('#formModal').modal('show');
        createCancelClick(visitID);
    }
    function createCancelClick(visitID) {
        let cancelButton = document.getElementById('cancelVisitButton');
        cancelButton.addEventListener('click', (event)=> {
            let dateCancelField = document.getElementById('dateCancelBegin');
            let dateCancelBegin = new Date(dateCancelField.innerHTML);

            let cancelUntilField = document.getElementById('cancelUntilDate');
            let cancelUntilValue = cancelUntilField.value;

            
            if (cancelUntilValue != 'NONE') {
                console.log('Begin cancel: ' + dateCancelBegin + ' Until cancel: ' + cancelUntilValue);
                let cancelUntilDate = new Date(cancelUntilValue);
                console.log('End cancel: ' + cancelUntilDate);
                let cancelDayDiff = LTDateLib.dayDiff

            } else {
                let buttonCancel = event.target;
                let visitIDCancel = buttonCancel.getAttribute('forVisit');

                all_visits = LT.getVisitList();
                all_visits.forEach((visit)=> {
                    if(visit.appointmentid == visitIDCancel) {
                        console.log(visit.appointmentid + '  on ' + visit.date);
                        visit.status = 'CANCELED';
                        visit.pendingState = parseInt(7578);
                        visit.pendingType = 'cancel';
                        let calendarEvent = calendar.getEvents();
                        calendarEvent.forEach((eventItem)=>{
                            if (eventItem.id == visitID) {
                                eventItem.remove();
                            }
                        });
                        calendar.addEvent(createCalendarEvent(visit));
                    } 
                });
            }
            calendar.rerenderEvents();
            resetVisit();
            let showModal = document.getElementById("formModal");
            jQuery('#formModal').modal('hide');

        });
    }

    function displayUncancel(event, visitID) {

        let eventProps;

        let eventKeys = Object.keys(event);
        eventKeys.forEach((key)=> {
            if (key == 'extendedProps') {
                eventProps = event[key];
            }
        });

        let timeWindowVisit = eventProps.timeWindow;
        let formatDate = new Date(eventProps.visitFormatDate);
        let visitFormatMonth = formatDate.getUTCMonth() + 1;
        let visitFormatDate = formatDate.getUTCDate();
        let visitFormatYear = formatDate.getFullYear();
        let visitFormatWhole = visitFormatMonth + '/' + visitFormatDate + '/' + visitFormatYear;

        const uncancelChange = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header blue white-text">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h4 class="modal-title" id="formModalLabel">${event.title} - ${timeWindowVisit} </h4>
                        <p>VISIT ID:  ${visitID}</p>
                    </div>
                    <div class="alert alert-warning text-lg" role="alert">
                        <strong>Date:</strong> <span class="blue-text" id="dateUncancelBegin">${visitFormatWhole}</span>
                        <div class="form-group pull-right control-width-normal">
                            <div class="input-group date" id="demo-date">
                                <div class="input-group-content">
                                    <input type="text" class="form-control" id="uncancelUntil" value="NONE">
                                    <label>Until date: </label>
                                </div>
                                <span class="input-group-addon"><i class="fa fa-calendar"></i></span>
                            </div>
                        </div>
                        <br>
                    </div>
                    <form class="form-horizontal" role="form">
                        <div class="modal-body" id="cancelVisit">
                            <div class="alert alert-warning text-lg" role="alert">
                                <div class="modal-footer grey lighten-2">
                                    <button type="button" class="btn btn-danger" data-dismiss="modal" forVisit="${visitID}" id="uncancelVisitButton"}>REQUEST UNCANCEL</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
             </div>`;

        let showModal = document.getElementById("formModal");
        showModal.innerHTML = uncancelChange;
        jQuery('#formModal').modal('show');
        createUncancelClick(visitID);
    }

    function createUncancelClick(visitID) {
        let cancelButton = document.getElementById('uncancelVisitButton');
        cancelButton.addEventListener('click', (event)=> {

            let dateCancelField = document.getElementById('dateUncancelBegin');
            let dateCancelBegin = new Date(dateCancelField.innerHTML);

            let cancelUntilField = document.getElementById('uncancelUntil');
            let cancelUntilValue = cancelUntilField.value;
            
            if (cancelUntilValue != 'NONE') {
                console.log('Begin cancel: ' + dateCancelBegin + ' Until cancel: ' + cancelUntilValue);
                let cancelUntilDate = new Date(cancelUntilValue);
                console.log('End cancel: ' + cancelUntilDate);
                let cancelDayDiff = LTDateLib.dayDiff

            } else {
                let buttonCancel = event.target;
                let visitIDCancel = buttonCancel.getAttribute('forVisit');
                all_visits = LT.getVisitList();
                all_visits.forEach((visit)=> {
                    if(visit.appointmentid == visitIDCancel) {
                        console.log(visit.appointmentid + '  on ' + visit.date);
                        visit.status = 'INCOMPLETE';
                        visit.pendingState = parseInt(7578);
                        visit.pendingType = 'uncancel';
                        let calendarEvent = calendar.getEvents();
                        calendarEvent.forEach((eventItem)=>{
                            if (eventItem.id == visitID) {
                                eventItem.remove();
                            }
                        });
                        calendar.addEvent(createCalendarEvent(visit));
                    } 
                });
            }

            calendar.rerenderEvents();
            resetVisit();
            let showModal = document.getElementById("formModal");
            jQuery('#formModal').modal('hide');

        });
    }
    function displayCancelPicker(visitID) {
    }
    function displayDragDropChangeView(info) {
        let infoKeys = Object.keys(info);
        infoKeys.forEach((keyInfo) => {
            console.log(keyInfo + ' --> ' + info[keyInfo]);
        });
    }
    function displaySurchargeView(info) {
        console.log('SURCHARGE CLICKED');
        let eventInfo = info.event;
        let eventDate = info.date;
        console.log('VISIT TITLE: ' + eventInfo.title + ' --> ' + eventDate);
        console.log(eventProps);
    }
    function displayVisitReportModal(visit) {

        let showModal = document.getElementById('ltVR-ModalContainer');

        let visitDuration = document.getElementsByClassName('ltVR-visitDuration');

        Array.from(document.getElementsByClassName('ltVR-visitService')).forEach((elem) => {
            elem.innerHTML = visit.service;
        });
        Array.from(document.getElementsByClassName('ltVR-visitStartStop')).forEach((elem) => {
            elem.innerHTML = visit.arrival_time + ' to ' + visit.completion_time;
        });
        Array.from(document.getElementsByClassName('ltVR-visitPhoto')).forEach((elem) => {
            elem.setAttribute('src' , visit.visitPhotoURL);
        });
        Array.from(document.getElementsByClassName('ltVR-visitMap')).forEach((elem) => {
            elem.setAttribute('src' , visit.mapImageURL);
        });
        Array.from(document.getElementsByClassName('ltVR-visitPets')).forEach((elem) => {
            elem.innerHTML = visit.visitReportPets;
        });
        Array.from(document.getElementsByClassName('ltVR-visitFullDate')).forEach((elem) => {
            let dayWeek = dayArrStr[visit.dayWeek];
            let dayDate = visit.dateNum;
            let monthStr = monthsArrStr[visit.jsMonth]
            elem.innerHTML = dayWeek + ', ' + monthStr + ' ' + dayDate;
        });

        jQuery(showModal).modal('show');
    }
    function displayVisitRequest(eventInfo) {
        beginDateService = new Date(eventInfo.date);
        let chosenDate = new Date(eventInfo.date);
        let chosenDay = chosenDate.getDay();
        let dayString = dayArrStr[chosenDay];
        let chosenMonth = chosenDate.getMonth();
        let monthString = monthsArrStr[chosenMonth];
        let chosenFullYear = chosenDate.getFullYear();
        let dateChosen = chosenDate.getDate();

        let serviceList = LT.getServices();
        let timeWindows = LT.getTimeWindows();
        let surcharges = LT.getSurcharges();
        let petsInfo = LT.getPets();
        const visitRequestHTML = `
            <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header blue white-text">
            <button type="button" class="btn btn-danger width-2 pull-right" data-dismiss="modal" id="cancelButton">CANCEL</button>
            <h4 class="modal-title" id="formModalLabel">CREATE A SERVICE REQUEST</h4>
            </div>
            <div class="alert alert-warning no-margin p-b-25" role="alert">
            <div class="row">
            <div class="col-xs-3 text-center">
            <small>DATE</small><br>
            <span class="blue-text" id="dateToday">${eventInfo.dateStr}</span>
            </div>
            <div class="col-xs-6 text-center">
            <small>SERVICE/TIME</small><br>
            <span class="blue-text" id="selectedService"> NONE  </span>
            </div>
            <div class="col-xs-3 text-center">
            <small>PETS</small><br>
            <button><span class="blue-text" id="selectedPets"> ALL PETS</span></button>
            </div>
            </div>
            </div>
            <div style="margin-top:-24px">
            <div id="rootwizard1" class="form-wizard form-wizard-horizontal">
            <form class="form floating-label">
            <div class="form-wizard-nav">
            <div class="progress"><div class="progress-bar progress-bar-info"></div></div>
            <ul class="nav nav-justified nav-pills">
            <li class="done"><a href="#tab1" data-toggle="tab" aria-expanded="false"><span class="step">1</span>
            <span class="title">DATE</span></a></li>
            <li class="active"><a href="#tab2" data-toggle="tab" aria-expanded="true"><span class="step">2</span>
            <span class="title">SERVICE/TIME</span></a></li>
            <li class=""><a href="#tab3" data-toggle="tab" aria-expanded="false"><span class="step">3</span>
            <span class="title">PETS</span></a></li>
            <li class=""><a href="#tab4" data-toggle="tab" aria-expanded="false"><span class="step">4</span>
            <span class="title">CONFIRM</span></a></li>
            </ul>
            </div>
            <div class="tab-content clearfix" style="background-color: #f5f5f5 !important">
            <div class="tab-pane" id="tab1">
            <br>
            <div class="row">
            <div class="col-sm-6 text-center">
            <strong>Service Date:</strong> <span class="blue-text" id="todayDate">${eventInfo.dateStr}</span><br>
            </div>
            <div class="col-sm-6 text-center">
            <button type="button btn-block" class="btn btn-warning white-text" id="requestMultiService">MAKE MULTIDAY REQUEST</button>
            </div>
            </div>
            <br>
            </div>
            <div class="tab-pane active" id="tab2">
            <br>
            <div class="row">
            <div class="col-sm-6 text-center">
            <div class="btn-group">
            <button type="button" class="btn ink-reaction btn-default-light">SELECT SERVICE TO REQUEST</button>
            <button type="button" class="btn ink-reaction btn-default-light dropdown-toggle" data-toggle="dropdown" aria-expanded="true"><i class="fa fa-caret-down"></i></button>
            <ul class="dropdown-menu" role="menu" id="serviceDropDown">
            ${serviceList.map(function(service){
                return '<li><a value="service' +service.serviceCode+ '" id="service' +service.serviceCode+ '">' + service.serviceName + ' ($'+ service.serviceCharge +  ')</a></li>'
            })}
            </ul>
            </div>
            </div>
            <div class="col-sm-6 text-center">
            <div class="btn-group">
            <button type="button" class="btn ink-reaction btn-default-light">SELECT SERVICE TIME WINDOW</button>
            <button type="button" class="btn ink-reaction btn-default-light dropdown-toggle" data-toggle="dropdown" aria-expanded="true"><i class="fa fa-caret-down"></i></button>
            <ul class="dropdown-menu width-5" role="menu" id="chooseTimeWindow">
            ${timeWindows.map(function(tw){
                return '<li><a href=\"#\" class=\"btn btn-default-bright\" type=\"checkbox\" role=\"checkbox\" id=\"tw' + tw.indexVal + '\">' + tw.twLabel + '</a></li>';
            })}
            </ul>
            </div>
            </div>
            </div>
            <br>
            </div>
            <div class="tab-pane" id="tab3">
            <br>
            <div class="form-group text-center">
            <div class="btn-group" data-toggle="buttons" id="petPicker">
            ${petsInfo.map(function(pet) {
                return '<label for=\"pet_name' + pet.petID + '\" class=\"btn ink-reaction btn-info\"><input type=\"checkbox\" role=\"checkbox\" name=\"pet_name' + pet.petID +  '\" id=\"pet' + pet.petID + '\"><i class=\"fa fa-paw fa-fw\"></i>' + pet.petName + '</label>'
                //return '<input type=\"checkbox\" role=\"checkbox\" name=\"pet_name' + pet.petID +  '\" id=\"pet' + pet.petID + '\"><label for=\"pet_name' + pet.petID + '\" class=\"btn ink-reaction btn-info\"><i class=\"fa fa-paw fa-fw\"></i>' + pet.petName + '</label></input>'

            })}
            </div>
            </div>
            <br>
            </div>
            <div class="tab-pane" id="tab4">
            <div class="card-body no-y-padding">
            <br>
            <button type="button" class="btn btn-success btn-lg btn-block btn-default white-text" data-dismiss="modal" data-toggle="modal" data-target="#formModal" id="requestServiceButton">REQUEST SINGLE VISIT</button>
            </div>
            <br>
            </div>
            </div>
            <div class="card-body no-y-padding">
            <ul class="pager wizard">
            <li class="previous"><a class="btn-raised" href="javascript:void(0);">Previous</a></li>
            <li class="next"><a class="btn-raised" href="javascript:void(0);">Next</a></li>
            </ul>
            </div>
            </form>
            </div>
            </div>
            </div>
            </div>`;

        let showModal = document.getElementById("formModal");
        jQuery(showModal).modal('show');
        addServicePicker(visitRequestHTML);
        addTimeWindowEventListeners();
        addPetPickerListener();
        addMultiDayRequestPicker();
        addRequestServiceButtonListener();

        let cancelButtonClick = document.getElementById('cancelButton');
        cancelButtonClick.addEventListener('click', function() {
            resetVisit();
            jQuery(showModal).modal('hide');
        });
    }
    function addServicePicker(visitRequestHMTLtemplate) {
        let servicePickerModal = document.getElementById('formModal');
        servicePickerModal.innerHTML = visitRequestHMTLtemplate;

        let sPicker = document.getElementById('serviceDropDown');
        let childNodeServiceItems = sPicker.childNodes;
        childNodeServiceItems.forEach((node)=> {
            let aNode = node.childNodes;
            let aaNode = aNode[0];
            if (aaNode != null) {
                aaNode.addEventListener("click", function(event) {
                    let re=/(service)([0-9]+)/;
                    currentServiceChosen = re.exec(aaNode.id)[2];
                    let serviceLabel = document.getElementById('selectedService');
                    let serviceList = LT.getServices();
                    serviceList.forEach((service)=> {
                        if (currentServiceChosen == service.serviceCode) {
                            serviceLabel.innerHTML = service.serviceName;
                            stringForCurrentService = service.serviceName;
                        }
                    });
                });
            }
        });
    }
    function addTimeWindowEventListeners() {
        let twPicker = document.getElementById('chooseTimeWindow');
        let childNodeTW = twPicker.childNodes;
        childNodeTW.forEach((node)=> {
            let aNode = node.childNodes;
            let aaNode = aNode[0]
            if(aaNode != null) {
                aaNode.addEventListener("click",function(event) {
                    let timeWindows = LT.getTimeWindows();
                    let re=RegExp('tw([0-9]+)');
                    let timeWindowNormal = re.exec(aaNode.id)[1];
                    let tWind = parseInt(timeWindowNormal);
                    let timeWindowObj = timeWindows[tWind]
                    cBeginTW = timeWindowObj.begin;
                    cEndTW = timeWindowObj.endTW;
                    let serviceLabel = document.getElementById('selectedService');
                    serviceLabel.innerHTML = stringForCurrentService + '<BR>' + cBeginTW + ' - ' + cEndTW;

                })
            }
        });
    }
    function addPetPickerListener() {
        let pickPet = document.getElementById('petPicker');
        let childNodePet = pickPet.childNodes;

        childNodePet.forEach((petNode)=> {

            let petLabelNode = petNode.childNodes;

            if(petLabelNode != null) {
                Array.from(petLabelNode).forEach((pNode)=> {
                    if (pNode.type == 'checkbox') {
                        console.log(pNode + ' CHECKBOX TYPE');
                         pNode.addEventListener('click', function(event) {
                            console.log('clicked on pNode: ');
                            console.log(event.target);
                            let re=/(pet)([0-9]+)/;
                            let petNormal = re.exec(pNode.value);
                            console.log('clicked on: ' + petNormal);
                            if (pNode.value == 'on') {
                                pNode.value = 'off';
                            } else {
                                pNode.value = 'on';
                                console.log('Pet Event target: ' + event.target);
                                console.log('Pet ID: ' + event.id);
                            }
                        });
                    }
                });
            }
        });
                /*if (petInput != null) {
                    petLabelNode.addEventListener('click', function(event) {
                        //event.stopPropagation();
                        console.log(event);
                       

                        let index = 0;
                        let popIndex = 0;

                        let isPetUnchose = false;

                        currentPetsChosen.forEach((chosenPet) => {
                            if (petInput.id == chosenPet) {
                                isPetUnchose = true;
                                popIndex = index;
                                index = index+1;
                            }
                        });
                        console.log(currentPetsChosen.length);

                        if (!isPetUnchose) {
                            currentPetsChosen.push(petInput.id);
                        } else {
                            currentPetsChosen.splice(popIndex,1);
                        }    

                        currentPetsChosen.forEach((chosenPet)=> {
                            console.log(chosenPet);
                        })

                    });        
                }*/
    }
    function addMultiDayRequestPicker() {
        let multidayVisit = document.getElementById("requestMultiService");
        multidayVisit.addEventListener('click', function() {
            event.preventDefault();
            let parentNode = multidayVisit.parentNode;
            let parentsChildren = parentNode.childNodes;
            while(parentsChildren.hasChildNodes) {
                parentNode.removeChild(parentNode.firstChild);
            }
            let endDateHTML = `
                <div class="col-sm-6 text-center">
                    <strong>End date:</strong>
                    <span class="blue-text"><input type="text" class="form-control" id="scheduleUntilDate"></span>
                    <br>
                </div>`;

            parentNode.innerHTML = endDateHTML;
            parentNode.addEventListener('focusout', function(e) {
                console.log(e.target);
                let singleDate = document.getElementById('dateToday');
                let endDateObj = document.getElementById('scheduleUntilDate');
                let endDateWrap = document.createElement('strong');
                let endDateJS = new Date(endDateObj.value);
                let endDateMonthString = monthsArrStr[endDateJS.getMonth()];
                let endDateNum = endDateJS.getDate();

                let endDateWidget = `
                        <span class="blue-text" id="endDate">${endDateMonthString} ${endDateNum}</span>
                        <br>`;
                endDateWrap.innerHTML = endDateWidget;
                singleDate.parentNode.insertBefore(endDateWrap, singleDate);
            }, true);

            let requestButton = document.getElementById('requestServiceButton');
            requestButton.innerHTML = 'Request Multiple Visits';

        });
    }
    function addRequestServiceButtonListener() {

        let requestServiceButton = document.getElementById('requestServiceButton');
        requestServiceButton.addEventListener("click", function(event)  {

            event.stopPropagation();

            let dateBeginYear = beginDateService.getFullYear();
            let dateBeginField = document.getElementById('todayDate');
            let beginDate = dateBeginField.innerHTML;
            dateBeginField.innerHTML = '';
            let dateEndField = document.getElementById('scheduleUntilDate');
            let endDate; 

            if (dateEndField != null) {
                endDate = dateEndField.value;
            } else {
                endDate = '';
            }

            let formattedVisitDateObject = LTDateLib.parseTimeWindows(new Date(beginDate));

            console.log(formattedVisitDateObject);
            if (endDate == '' || endDate == null) {
                endDate = 'NONE';        
                let newEvent = {
                    id : formattedVisitDateObject.getTime(),
                    groupid : 'petsit',
                    title: stringForCurrentService,
                    start : formattedVisitDateObject,
                    note: 'NO NOTE',
                    timeWindow : cBeginTW + ' - ' + cEndTW,
                    pets : currentPetsChosen,
                    status : 'pending',
                    isPending: true,
                    pendingType: 'SCHEDULE',
                    backgroundColor : 'orange',
                    eventTextColor : 'white',
                    color : 'orange',
                };
                addDateDataToEvent(newEvent, formattedVisitDateObject);
                addVisitRequestEvent(newEvent);
                buildScheduleRequestFetch(newEvent, formattedVisitDateObject);
                let visitCharge = calculateVisitCharges(formattedVisitDateObject, currentServiceChosen, 1);
                console.log('Visit charge: ' + visitCharge);

            } else {

                let formatEndDate = new Date(endDate);
                let dayDiff = LTDateLib.calcDateDayDiff(formattedVisitDateObject,formatEndDate);

                let scheduleRequestItems = [];
                let subtotalTaxCharges = 0;
                let subtotalSurcharges = 0;
                let subtotalVisitCharges = 0;

                for (let i = 0; i < dayDiff; i++) {
                    let visitDateAdd = new Date(formattedVisitDateObject);
                    visitDateAdd.setDate(formattedVisitDateObject.getDate()+i);   
                    let newVisitDateAdd = parseTimeWindows(new Date(visitDateAdd));                 
                    let multiDayEvent = createRequestEvent(newVisitDateAdd, currentServiceChosen);
                    scheduleRequestItems.push(multiDayEvent);
                    subtotalVisitCharges += calculateVisitCharges(newVisitDateAdd, currentServiceChosen, 1);
                }

                console.log(subtotalVisitCharges);

                buildMultipleScheduleRequestFetch(formattedVisitDateObject, formatEndDate, scheduleRequestItems);

            }

            calendar.render();
            resetVisit()
            displayPendingStatus();

            let showModal = document.getElementById("formModal");
            jQuery('#formModal').modal('hide');

        });
    }
    function buildMultipleScheduleRequestFetch(visitDateBegin, visitDateEnd, requestInfo) {

        let visitMonth = addZero(visitDateBegin.getUTCMonth()+1);
        let visitDate = addZero(visitDateBegin.getUTCDate());
        let visitYear = visitDateBegin.getUTCFullYear();
        let formattedDateString = visitMonth + '/' + visitDate + '/' + visitYear;
        let visitMonthEnd = addZero(visitDateEnd.getUTCMonth()+1);
        let dateEnd = addZero(visitDateEnd.getUTCDate());
        let visitYearEnd = visitDateEnd.getUTCFullYear();
        let formattedEndDateString = visitMonthEnd + '/' + dateEnd + '/' + visitYearEnd;

        console.log(formattedDateString + '  ' + formattedEndDateString);

        let listOfVisits = [];

        requestInfo.forEach((request)=> {
            console.log('ADDING VISIT DATE TO REQUEST: '  + request.start);
            let visitItem = {
                'date' : request.start,
                'timeofday' : request.timeWindow,
                'servicecode' : currentServiceChosen,
                'pets' : request.pets,
                'note' : request.note
            };
            listOfVisits.push(visitItem);
        });

        let request = {
            'totaldays' : LTDateLib.calcDateDayDiff(visitDateBegin,visitDateEnd),
            'visitdays' : LTDateLib.calcDateDayDiff(visitDateBegin,visitDateEnd),
            'start' : formattedDateString,
            'end' : formattedEndDateString,
            'servicecode' : currentServiceChosen,
            'note' : 'NO NOTE',
            'visits' : listOfVisits
        };
        console.log(request);
        LT.sendRequestSchedule(request);
    }
    function buildScheduleRequestFetch(requestInfo, visitDateBegin) {       
        let visitMonth = addZero(visitDateBegin.getUTCMonth()+1);
        let visitDate = addZero(visitDateBegin.getUTCDate());
        let visitYear = visitDateBegin.getUTCFullYear();
        let formattedDateString = visitMonth + '/' + visitDate + '/' + visitYear;
        console.log(formattedDateString);

        if (requestInfo.pets == null) {
            requestInfo.pets = petOwnerProfile.pets;
        }
        let visitItem = {
            'date' : formattedDateString,
            'timeofday' : requestInfo.timeWindow,
            'servicecode' : currentServiceChosen,
            'pets' : currentPetsChosen,
        };

        let listOfVisits = [];
        listOfVisits.push(visitItem);

        let request = {
            'start' : formattedDateString,
            'end' : formattedDateString,
            'servicecode' : currentServiceChosen,
            'pets' : currentPetsChosen,
            'note' : 'NO NOTE',
            'totaldays' : '1',
            'visitdays' : '1',  
            'visits' : listOfVisits
        };

        console.log(request); 

        let sampleVisitRequest =   {
            "start":"07/24/2019",
            "end":"08/27/2019",
            "servicecode":"29",
            "prettypets":"Apple, Bubbles",
            "pets":"Apple,Bubbles",
            "note":"Please be on time.",
            "totaldays":4,
            "visitdays":4,
            "visits":
                [
                    {
                        "date":"07/24/2019",
                        "servicecode":"29",
                        "timeofday":"5:00 pm-7:00 pm",
                        "pets":"Apple,Bubbles"
                    },
         
                    {
                        "date":"7/25/2019",
                        "servicecode":"29",
                        "timeofday":"9:00 am-11:00 am",
                        "pets":"Apple,Bubbles"
                    },
                    {
                        "date":"7/25/2019",
                        "servicecode":"29",
                        "timeofday":"3:00 pm-5:00 pm",
                        "pets":"Apple,Bubbles"
                    }
                ]

        };
        LT.sendRequestSchedule(request);
    }
    function calculateVisitCharges(visitDate, serviceID, numPets) {
        let visitCharge = parseFloat(0);
        let serviceList = LT.getServices();
        serviceList.forEach((service)=> {
            if (service.serviceCode == serviceID) {
                visitCharge += parseFloat(service.serviceCharge);
            }
        });

        let doesSurchargeApply = false;
        let surcharge_events = LT.getSurcharges();
        surcharge_events.forEach((surcharge) => {
            if (surcharge.surchargeDate != null) {
                let sDate= new Date(surcharge.surchargeDate);
                let visitDateNum = visitDate.getUTCDate();
                let visitMonthNum = visitDate.getUTCMonth();
                let surchargeDateNum = sDate.getUTCDate();
                let surchargeMonthNum = sDate.getUTCMonth();

                if (visitDateNum == surchargeDateNum && visitMonthNum == surchargeMonthNum) {
                    let surchargeAmt = parseInt(surcharge.charge);
                    visitCharge += surchargeAmt;
                }
            } else {
                //console.log(surcharge.surchargeType + ' ' + surcharge.charge);

            }


        });

        return visitCharge;
    }
    function sendGratuity() {
    }
    function populateTimeline() {

        let timelineList = document.getElementById('timelineItems');
        let timelineHTML = ``;
        let numVisits = all_visits.length;
        let items = [
                { src: 'dog0.jpg', srct: 'dog0.jpg', title: 'Watch your head', description: 'Having so much much much fun'},
                { src: 'Ball2.jpg', srct: 'Ball2.jpg', title: 'Play ball' },
                { src: 'IMG_1247.jpg', srct: 'IMG_1247.jpg', title: 'Hide and seek' },
                { src: 'Ball2.jpg', srct: 'Ball2.jpg', title: 'Play ball' },
                  { src: 'IMG_1246.jpg', srct: 'IMG_1246.jpg', title: 'Where are the treats?' },
                { src: 'IMG_2009.jpg', srct: 'IMG_2009.jpg', title: 'Play ball' },
                { src: 'IMG_1262.jpg', srct: 'IMG_1262.jpg', title: 'Where are the treats?' },
                { src: 'IMG_1744.jpg', srct: 'IMG_1744.jpg', title: 'Where are the treats?' },
                { src: 'IMG_1749.jpg', srct: 'IMG_1749.jpg', title: 'Where are the treats?' },
                { src: 'IMG_1773.jpg', srct: 'IMG_1773.jpg', title: 'Where are the treats?' },
                { src: 'Ball.jpg', srct:  'Ball.jpg', title: 'Play and Fun' },
                  { src: 'DogStand.jpg', srct:  'DogStand.jpg', title: 'Dog Standoff' },
                { src: 'Lilly-close.jpg', srct:  'Lilly-close.jpg', title: 'Close up' },
                { src: 'IMG_1783.jpg', srct: 'IMG_1783.jpg', title: 'Where are the treats?' },
                { src: 'Lilly-Car.jpg', srct:  'Lilly-Car.jpg', title: 'Joy ride' },
                { src: 'Group.jpg', srct:  'Group.jpg', title: 'Play date' },
                { src: 'Lilly-Museum.jpg', srct:  'Lilly-Museum.jpg', title: 'Loving the museum' },
                { src: 'Museum-2.jpg', srct:  'Museum-2.jpg', title: 'Running wild' },
                { src: 'L1.jpg', srct:  'L1.jpg', title: 'Play and Fun' },
                { src: 'L2.jpg', srct:  'L2.jpg', title: 'Play and Fun' },
                { src: 'L3.jpg', srct:  'L3.jpg', title: 'Play and Fun' },
                { src: 'IMG_1784.jpg', srct: 'IMG_1784.jpg', title: 'Where are the treats?' },
                { src: 'IMG_1785.jpg', srct: 'IMG_1785.jpg', title: 'Where are the treats?' },
                { src: 'IMG_1922.jpg', srct: 'IMG_1922.jpg', title: 'Where are the treats?' },
                { src: 'IMG_1925.jpg', srct: 'IMG_1925.jpg', title: 'Where are the treats?' },

        ]
        let counter = 0;

        for (let i=numVisits-1; i > 0; i--) {
            let currentVisit = all_visits[i];
            let startTime;
            let endTime;
            counter += 1;
            if (counter > items.length - 1) {
                counter = 0;
            }
            let imgSrc = items[counter];
            let imgFile = imgSrc.srct;

            if (currentVisit.arrived == null) {
                startTime = currentVisit.time_window_start;
            } else {
                startTime = currentVisit.arrived;
            }
            if(currentVisit.completed == null) {
                endTime = currentVisit.time_window_end;
            } else {
                endTime = currentVisit.completed;
            }
            let visitNoteVisit;
            if (currentVisit.visitNote == null) {
                visitNoteVisit = 'NO VISIT NOTE';
            } else {
                visitNoteVisit = currentVisit.visitNote;
            }

            if (currentVisit.status == 'canceled') {
                visitNoteVisit = 'CANCELLED VISIT';
            }
            let cardStyle = 'style-success';
            //console.log(currentVisit.serviceID);
            if (currentVisit.service_code == 65) {
                cardStyle = 'style-danger';
            }

              timelineHTML += `
                <li class="timeline-inverted">
                <div class="timeline-circ circ-lg style-success"></div>
                <div class="timeline-entry">
                    <div class="card ${cardStyle}">
                        <div class="card-body small-padding">
                            <img src="./assets/img/${imgFile}" width=100 height=100>
                            <div class="pull-right text-sm"><small><span class="opacity-50">${currentVisit.date}</span> ${startTime} - ${endTime}</small></div>
                                <h4 class="no-padding no-margin">${currentVisit.service}</h4>
                                    <p class="no-padding no-margin">${visitNoteVisit}</p>
                            </div>
                        </div>
                    </div>
                </li>
            `;
        }

        timelineList.innerHTML = timelineHTML;
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

}(this.materialadmin, window.jQuery));