(function (namespace, $) {
    "use strict";
    var calendar;
    var petOwnerProfile;

    var dragBeginDate;
    var dragEndDate;

    var clickedDate;

    var beginDateService;
    var endDateService;
    var currentServiceChosen;
    var stringForCurrentService;
    var cBeginTW;
    var cEndTW;


    var currentPetsChosen = [];
    var event_visits = [];
    var pendingVisits = [];
    var surcharge_events = [];
    var all_visits = [];
    var surchargeItems =[];
    var serviceList = [];
    var timeWindowList =[];

    var isAjax = true;
    var isMultiDay = false;
    const dayArrStr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthsArrStr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var re = /([0-9]+):([0-9]+):([0-9]+)/;



    function resetVisit() {
        clickedDate = null;
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
                buildCalendarCellView(info.el, eventTitle, eventID, eventInfo);

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
            calEventHeader.setAttribute('class' , 'panel-group style-success');
        } else if (event.status == 'canceled') {
            calEventHeader.setAttribute('class' , 'panel-group style-danger');
        } else if (event.status == 'INCOMPLETE') {
            calEventHeader.setAttribute('class', 'panel-group style-default');
        } 

        if (event.isPending) {
            calEventHeader.setAttribute('class' , 'panel-group style-warning');
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

        //element.appendChild(calPanelDiv);
    }
    function buildCalendarCellViewTed(element, event, eventID) {

        let eventKeys = Object.keys(event);
        eventKeys.forEach((key)=> {
            //console.log(key);
        });

        //console.log(event.status);
        console.log('Element: ' + element.tagName);
        let visitID = eventID;
        let panelID = 'panel-' + visitID;
        let calPanelDiv = document.createElement('div');
        calPanelDiv.setAttribute('id', 'panel-'+visitID);


        if (event.status == 'completed') {
            calPanelDiv.setAttribute('class' , 'panel-group style-success');
        } else if (event.status == 'canceled') {
            calPanelDiv.setAttribute('class' , 'panel-group style-danger');
        } else if (event.status == 'INCOMPLETE') {
            calPanelDiv.setAttribute('class', 'panel-group style-default');
        } else if (event.isPending) {
            calPanelDiv.setAttribute('class' , 'panel-group style-warning');

        }


        let calEventDiv = document.createElement('div');
        calEventDiv.setAttribute('class' , 'card-head card-head-xs');
        calEventDiv.setAttribute('data-toggle', 'collapse');
        calEventDiv.setAttribute('data-parent', '#' + panelID);
        calEventDiv.setAttribute('data-target', '#' + visitID + '-body');
        calEventDiv.setAttribute('aria-expanded', 'false');
        calPanelDiv.appendChild(calEventDiv);

        let evtHeader = document.createElement('header');
        evtHeader.setAttribute('style' , 'line-height: 9px !important;padding-left:12px!important; width:70%;');
        //calEventDiv.appendChild(evtHeader);

        let evtTitle = document.createElement('span');
        evtTitle.setAttribute('class', 'service-name');
        evtTitle.innerHTML = event.title;
        evtHeader.appendChild(evtTitle);

        let evtTime = document.createElement('span');
        evtTime.setAttribute('class', 'time-window');
        evtTime.innerHTML = event.timeWindow;
        evtHeader.appendChild(evtTime);

        let pannelTools = document.createElement('div');
        pannelTools.setAttribute('class', 'tools');
        pannelTools.setAttribute('style', 'padding-right: 0');
        pannelTools.innerHTML = '<a class="btn btn-icon-toggle" style="border-radius: 2px !important;margin:.15em;"><i class="fa fa-bars"></i></a>';
        calEventDiv.appendChild(pannelTools);

        let evtBody = document.createElement('div');
        evtBody.setAttribute('id', visitID + '-body');
        evtBody.setAttribute('class', 'collapse');
        evtBody.setAttribute('aria-expanded', 'false');
        evtBody.innerHTML = '<div class="card-body small-padding border-top"><button class="btn btn-xs btn-info m-r-10 pull-left btn-rounded p-l-15 p-r-15" style="margin-right:5px"> <i class="fa fa-edit"></i> </button><button class="btn btn-xs btn-warning pull-left btn-rounded p-l-10 p-r-10"> <i class="fa fa-comments"></i></button><button class="btn btn-xs btn-danger pull-right text-xs">  <i class="fa fa-trash"></i> <span class="hidden-mobile"></span></button></div>';
        calEventDiv.appendChild(evtBody);

        calPanelDiv.appendChild(calEventDiv);
        element.appendChild(calPanelDiv);
    }
    function createCalendarEvent(visit) {

        let visitDateObj;
        let visitEndObj;
        let visitColor = 'magenta';
        let CbackgroundColor = 'black';
        let CborderColor ='yellow';
        let CtextColor = 'white';
        let visitURL = '';
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
        let eventDateEnd = visit.date;

        if(visit.status == 'CANCELED' && visit.pendingType == null) {

            visitColor = 'red';
            CbackgroundColor = 'red';
            CborderColor ='red';
            eventDateStart = visit.fullDate;
        } else if (visit.status == 'completed' && visit.pendingType == null) {

            visitColor = 'green';
            CbackgroundColor = 'green';
            CborderColor ='green';
            let visitReportDate = new Date(visit.completed);
            eventDateStart =visitReportDate;
        } else if (visit.status == 'INCOMPLETE' && visit.pendingType == null) {

            visitColor = 'magenta';
            CbackgroundColor = 'magenta'
            CborderColor ='magenta';
            eventDateStart = visit.fullDate;
        }
        if (visit.pendingType != null) {
            //console.log('PENDING TYPE: ' + visit.pendingType);
            pendingStatus = true;
            if (visit.pendingType == 'cancel') {

                visitColor = 'orange';
                CbackgroundColor = 'orange';
                CborderColor ='red';
                pendingStatus = true;
                pType = 'CANCEL';
                eventDateStart = visit.fullDate;

            } else if (visit.pendingType == 'uncancel') {

                visitColor = 'orange';
                CbackgroundColor = 'orange';
                CborderColor ='green';
                pendingStatus = true;
                pType = 'CANCEL';
                eventDateStart = visit.fullDate;

            } else {

                visitColor = 'orange';
                CbackgroundColor = 'orange';
                CborderColor ='yellow';
                //eventTitle += ' (PENDING APPROVAL)'
                pendingStatus = true;
                pType = 'SCHEDULE';
                eventDateStart = visit.fullDate;

            }
        }

        let event = {
            id : visit.appointmentid,
            groupid: 'recurring',
            title: eventTitle,
            start : eventDateStart,
            end : eventDateEnd,
            note: visit.visitNote,
            timeWindow : visit.time_window_start + ' - ' + visit.time_window_end,
            arrivalTime : visit.arrival_timeDay,
            completionTime: visit.completion_time,
            status : visit.status,
            isPending: pendingStatus,
            pendingType : pType,
            sitter: visit.sitter,
            backgroundColor  : CbackgroundColor,
            color : 'white',
            borderColor : CborderColor,

            /*visitMonth : monthNum,
            visitDate : dateOfDateString,
            visitDayOfWeek : dayOfWeekString,
            visitFormatDate : formatDateString*/
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
    function displayPendingView(info) {
        console.log('PENDING VIEW DISPLAY');
        let eventInfo = info.event;
        let eventDate = info.date;
        console.log('VISIT TITLE: ' + eventInfo.title + ' --> ' + eventDate);
        console.log(eventProps);
    }
    function displaySurcharges() {
        surchargeItems = LT.getSurcharges();
        surchargeItems.forEach((surcharge)=> {
            //console.log(surcharge.surchargeLabel);
            let surchargeEventItem  =  createSurchargeEvent(surcharge);
            surcharge_events.push(surchargeEventItem);
            calendar.addEvent(surchargeEventItem);
        });
    }
    function clickedEvent(eventInfo) {
        let eventClicked = eventInfo.event._def;
        let eventProps = eventClicked.extendedProps;
        let visitStatus = eventProps.status;
        let selectedVisitID = eventClicked.publicId;

        if (visitStatus == 'canceled') {
            console.log('VISIT CANCELED CLICKED');
            displayUncancel(eventClicked.publicId,info.date);

        } else if (visitStatus == 'completed') {

            displayVisitReport(eventClicked, selectedVisitID);

        } else if (visitStatus == 'future' ||visitStatus == 'INCOMPLETE') {

            displayCancelChange(eventClicked, selectedVisitID)

        } else if (visitStatus == 'surcharges') {

            displaySurchargeView();

        } else if (visitStatus == 'pending') {

            //displayVisitPending(info);


        } else {

            console.log(visitStatus);
        }
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
    function displayVisitReport(event, visitID) {
        all_visits.forEach((visit)=> {
            if(visit.appointmentid == visitID) {
                let matchedVisit = visit;
                displayVisitReportModal(matchedVisit);
            }
        });
    }

    function displayCancelChange(event, visitID) {
        console.log('FUTURE VISIT');
        let cancelChangeDate = event.date;
        let eventDetails = event.event;
        let serviceList = LT.getServices();
        let timeWindows = LT.getTimeWindows();
        let timeWindowVisit;

        /*let eventKeys = Object.keys(eventDetails);

        eventKeys.forEach((key)=> {
            console.log(key + ' --> ' + event[key]);
            if (key == 'extendedProps') {
                let propsDic = event['extendedProps']
                let propsKeys = Object.keys(propsDic);
                propsKeys.forEach((pKey) => {
                    if (pKey == 'timeWindow') {
                        timeWindowVisit = propsDic[pKey];
                    }
                    console.log('PROP: ' + pKey + ' --> ' + propsDic[pKey]);
                });
            }
        });*/
        const cancelChange = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header blue white-text">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h4 class="modal-title" id="formModalLabel">${event.title} - ${timeWindowVisit} </h4>
                        <p>VISIT ID:  ${visitID}</p>
                    </div>
                    <div class="alert alert-warning text-lg" role="alert">
                        <strong>Date:</strong> <span class="blue-text" id="dateToday">${cancelChangeDate}</span>
                        <div class="form-group pull-right control-width-normal">
                            <div class="input-group date" id="demo-date">
                                <div class="input-group-content">
                                    <input type="text" class="form-control" id='cancelUntilDate' value=''>
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
                                    <button type="button" class="btn green width-6 white-text" data-dismiss="modal" data-toggle="modal" data-target="#formModal3" id="requestVisitCancel">CANCEL</button>
                                    <button type="button" class="btn btn-danger" data-dismiss="modal" id="cancelButton">NOTE</button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <form class="form-horizontal" role="form">
                        <div class="modal-body" id="cancelVisit">
                            <div class="alert alert-warning text-lg" role="alert">
                                <div class="modal-footer grey lighten-2">
                                    <button type="button" class="btn green width-6 white-text" data-dismiss="modal" data-toggle="modal" data-target="#formModal3" id="requestVisitCancel">CHANGE VISIT</button>
                                    <button type="button" class="btn btn-danger" data-dismiss="modal" id="cancelButton">NOTE</button>
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
    function displayUncancel(event, visitID) {
        console.log('UNCANCEL : ' + event + ' ' + visitID);
        let serviceList = LT.getServices();
           let timeWindows = LT.getTimeWindows();
        let eventKeys = Object.keys(event);

        eventKeys.forEach((key)=> {
            console.log(key + ' --> ' + event[key]);
            if (key == 'extendedProps') {
                let propsDic = event['extendedProps']
                let propsKeys = Object.keys(propsDic);
                propsKeys.forEach((pKey) => {
                    if (pKey == 'timeWindow') {
                        timeWindowVisit = propsDic[pKey];
                    }
                    console.log('PROP: ' + pKey + ' --> ' + propsDic[pKey]);
                });

            }
        });
        const uncancelDisplay = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header blue white-text">
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                                <h4 class="modal-title" id="formModalLabel">UNCANCEL ${event.title} - ${timeWindowVisit}</h4>
                                <p>VISIT ID: ${visitID}</p>
                            </div>
                            <form class="form-horizontal" role="form">

                                <div class="modal-body" id="visitReport">
                                    <div class="alert alert-warning text-lg" role="alert">
                                <div class="modal-footer grey lighten-2">
                                    <button type="button" class="btn green width-6 white-text" data-dismiss="modal" data-toggle="modal" data-target="#formModal3" id="requestServiceButton">GRATUITY</button>
                                    <button type="button" class="btn btn-danger" data-dismiss="modal" id="cancelButton">NOTE</button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>`;

        let showModal = document.getElementById("formModal");
        showModal.innerHTML = uncancelDisplay;
        jQuery('#formModal').modal('show');
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
    function createCancelClick(visitID) {
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

        //        let visitShareButton = document.getElementsByClassName('ltVR-visitShareButton');
        //        visitShareButton.setAttribute('href' , evtShareReport);

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
                return '<label class=\"btn ink-reaction btn-info\"><input type=\"checkbox\" role=\"checkbox\" name=\"pet_name" id=\"pet' + pet.petID + '\"><i class=\"fa fa-paw fa-fw\"></i>' + pet.petName + '</label>'
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
                //console.log(petLabelNode);
                let petInput = petLabelNode[0];
                //console.log(petInput);
                /*if (petInput != null) {
                    console.log('PET element: ' + petInput.name + ' with ID: ' + petInput.id);
                    petLabelNode.addEventListener('click', function(event) {
                        //event.stopPropagation();
                        console.log(event);
                        let re=/(pet)([0-9]+)/;
                        let petNormal = re.exec(petInput.id)[2];
                        console.log('Pet Event target: ' + event.target);
                        console.log('Pet ID: ' + event.id);

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
        });
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

            let formattedVisitDateObject = parseTimeWindows(new Date(beginDate));

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

                for (let i = 0; i < dayDiff; i++) {
                    let visitDateAdd = new Date(formattedVisitDateObject);
                    visitDateAdd.setDate(formattedVisitDateObject.getDate()+i);                    
                    let multiDayEvent = createRequestEvent(visitDateAdd, currentServiceChosen);
                    scheduleRequestItems.push(multiDayEvent);
                }

                buildMultipleScheduleRequestFetch(formattedVisitDateObject, scheduleRequestItems);

            }

            calendar.render();
            resetVisit()
            displayPendingStatus();
            let showModal = document.getElementById("formModal");
            jQuery('#formModal').modal('hide');

        });
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
            start : eventDateFormat,
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
        let monthNum = dateToAdd.getMonth();
        let dateOfDateString = dateToAdd.getDate();
        let fullYearString = dateToAdd.getFullYear();
        let formatDateString = monthNum + '/' + dateOfDateString + '/' + fullYearString;
        event.visitMonth = monthNum;
        event.visitDate = dateOfDateString;
        event.visitDayOfWeek = dayOfWeekString;
        event.visitFormatDate = formatDateString;
    }
    function addVisitRequestEvent(visitEvent) {
        event_visits.push(visitEvent);
        pendingVisits.push(visitEvent);
        calendar.addEvent(visitEvent);
    }
    function buildMultipleScheduleRequestFetch(visitDateBegin, requestInfo) {
        let listOfVisits = [];
        requestInfo.forEach((request)=> {
            let visitItem = {
                'date' : request.start,
                'timeofday' : request.timeWindow,
                'servicecode' : request.serviceCode,
                'pets' : request.pets,
                'note' : request.note
            };
            listOfVisits.push(visitItem);
        });
        let request = {
            'totaldays' : '1',
            'visitdays' : '1',
            'start' : visitDateBegin,
            'end' : visitDateBegin,
            'servicecode' : requestInfo.serviceCode,
            'note' : requestInfo.note,
            'visits' : listOfVisits
        };
        console.log(request);

    }
    function buildScheduleRequestFetch(requestInfo, visitDateBegin) {
        
        let requestKeys = Object.keys(requestInfo);
        requestKeys.forEach((key) => {
            //console.log(key);
        });
        let visitItem = {
            'date' : requestInfo.start,
            'timeofday' : requestInfo.timeWindow,
            'servicecode' : requestInfo.serviceCode,
            'pets' : requestInfo.pets,
            'note' : requestInfo.note
        };

        let listOfVisits = [];
        listOfVisits.push(visitItem);

        let request = {
            'totaldays' : '1',
            'visitdays' : '1',
            'start' : visitDateBegin,
            'end' : visitDateBegin,
            'servicecode' : requestInfo.serviceCode,
            'note' : requestInfo.note,
            'visits' : listOfVisits
        };

        console.log(request); 
    }
    function calculateVisitCharges(visitDate, serviceID, numPets) {
        console.log('Visit date: ' + visitDate);
        let visitCharge = parseFloat(0);
        let serviceList = LT.getServices();
        serviceList.forEach((service)=> {
            //console.log(service);
            if (service.serviceCode == serviceID) {
                visitCharge += parseFloat(service.serviceCharge);
                console.log('CHARGE FOR VISIT: ' +  visitCharge);
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
                console.log(surcharge.surchargeType + ' ' + surcharge.charge);

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
