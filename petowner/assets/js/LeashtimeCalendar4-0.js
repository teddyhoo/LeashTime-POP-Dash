(function (namespace, $) {
    "use strict";
    var petOwnerProfile;
    var calendar;
    var currentServiceChosen;
    var currentTimeWindowBegin;
    var currentTimeWindowEnd;
    var currentPetsChosen = [];
    var clickedDate;
    var dragBeginDate;
    var dragEndDate;
    var beginDateService;
    var endDateService;

    var event_visits = [];
    var pendingVisits = [];
    var surcharge_events = [];
    var all_visits = [];
    var surchargeItems =[];
    var serviceList = [];
    var timeWindowList =[];

    var isAjax = true;
    const dayArrStr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthsArrStr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var re = /([0-9]+):([0-9]+):([0-9]+)/;


    document.addEventListener('DOMContentLoaded', function() {
        var calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: [ 'dayGrid', 'interaction', 'list' ],
            editable : true,
            defaultView : 'dayGridMonth',
            fixedWeekCount : false,

            dateClick: function(info) {
                clickedDate = info.date;
                displayVisitRequest(clickedDate);
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
            	//console.log('-----------NEW EVENT---------');
                let eventInfo = info.event.extendedProps;
               /* let propsKeys = Object.keys(eventInfo);
                propsKeys.forEach((key)=> {
                	console.log(key);
                })*/
                let event = info.event.id;
                //console.log('event id: ' + event);
                /*let eventKeys = Object.keys(event);
                eventKeys.forEach((key)=> { 
                	console.log(key);
                });*/
                buildCalendarCellView(info.el, eventInfo, event);

            }
        });
        calendar.render();
        let startDate = LTDateLib.getFullDate();
        getVisits(LTDateLib.calDaysBefore(startDate) , LTDateLib.calDaysAfter(startDate));
    });

    async function getVisits(start, end) {
        if (isAjax) {
            all_visits = await LT.getPetOwnerVisitsAjax(this, start, end);
            console.log('All visits size: ' + all_visits.length);
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
    function buildCalendarCellView(element, event, eventID) {

    	/*let eventKeys = Object.keys(event);
    	console.log('---------RENDER CAL CELL----------');
    	eventKeys.forEach((key) => { 
    		console.log(key + ' --> ' + event[key]);
    	});*/

    	let visitID = eventID;
        let calCell = eventID;
        let panelID = 'panel-' + calCell;
        //console.log('visit ID: ' + visitID + ' -> ' + panelID);
        let calPanelDiv = document.createElement('div');
        calPanelDiv.setAttribute('id', 'panel-'+visitID);
        calPanelDiv.setAttribute('class' , 'panel-group');

		let calEventDiv = document.createElement('div');
		calEventDiv.setAttribute('class' , 'card-head card-head-xs');
		calEventDiv.setAttribute('data-toggle', 'collapse');
		calEventDiv.setAttribute('data-parent', '#' + panelID);
		calEventDiv.setAttribute('data-target', '#' + visitID + '-body');
		calEventDiv.setAttribute('aria-expanded', 'false');
		calPanelDiv.appendChild(calEventDiv);

		let evtHeader = document.createElement('header');
		evtHeader.setAttribute('style' , 'line-height: 9px !important;padding-left:12px!important; width:70%;');
		calEventDiv.appendChild(evtHeader);

		let evtTitle = document.createElement('span');
		evtTitle.setAttribute('class', 'service-name');
		evtTitle.innerHTML = event.title;
		evtHeader.appendChild(evtTitle);

		let evtTime = document.createElement('span');
		evtTime.setAttribute('class', 'time-window');
		evtTime.innerHTML = event.start;
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
            console.log('PENDING TYPE: ' + visit.pendingType);
            pendingStatus = true;
            if (visit.pendingType == 'cancel') {
                visitColor = 'orange';
                CbackgroundColor = 'orange';
                CborderColor ='red';
                eventTitle += ' (PENDING APPROVAL)'
                pendingStatus = true;
                eventDateStart = visit.fullDate;
            } else if (visit.pendingType == 'uncancel') {
                visitColor = 'orange';
                CbackgroundColor = 'orange';
                CborderColor ='green';
                eventTitle += ' (PENDING APPROVAL)'
                pendingStatus = true;
                eventDateStart = visit.fullDate;
            } else {
                visitColor = 'orange';
                CbackgroundColor = 'orange';
                CborderColor ='yellow';
                eventTitle += ' (PENDING APPROVAL)'
                pendingStatus = true;
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
            arrivalTime : visit.arrival_time,
            completionTime: visit.completion_time,
            color : visitColor,
            backgroundColor  : CbackgroundColor,
            borderColor : CborderColor,
            status : visit.status,
            sitter: visit.sitter,
            isPending: pendingStatus
        };
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
    function displayPendingStatus(eventInfo) {
        if (pendingVisits.length > 0) {
            let pendingBadge = document.getElementById('pendingVisitBadge')
            pendingBadge.addEventListener('click', function(event) {
                console.log('PENDING VISITS');
                pendingBadge.innerHTML = 'PENDING VISITS'
            });
            //let pendingView = document.getElementById('offCanvasPendingView');
            //let pendingHTML = ` `;
            //pendingView.innerHTML = pendingHTML;

        }
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

            displayVisitPending(info);


        } else {

            console.log(visitStatus);
        }
    }
    function displayVisitRequest(dateString) {
           beginDateService = new Date(dateString);
           let chosenDate = new Date(dateString);
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
<span class="blue-text" id="dateToday">${monthString} ${dateChosen} ${chosenFullYear}</span>
</div>
<div class="col-xs-6 text-center">
<small>SERVICE/TIME</small><br>
<span class="blue-text" id="">30 MIN WALK | MIDDAY </span>
</div>
<div class="col-xs-3 text-center">
<small>PETS</small><br>
<button><span class="blue-text" id="">PETSNAME</span></button>
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
<strong>Service Date:</strong> <span class="blue-text" id="dateToday">${monthString} ${dateChosen} ${chosenFullYear}</span><br>
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
<ul class="dropdown-menu" role="menu">
${serviceList.map(function(service){
    return '<li><a value=\"service' +service.serviceCode+ '\">' + service.serviceName + '</a></li>'
})}
</ul>
</div>
</div>
<div class="col-sm-6 text-center">
<div class="btn-group">
<button type="button" class="btn ink-reaction btn-default-light">SELECT SERVICE TIME WINDOW</button>
<button type="button" class="btn ink-reaction btn-default-light dropdown-toggle" data-toggle="dropdown" aria-expanded="true"><i class="fa fa-caret-down"></i></button>
<ul class="dropdown-menu width-5" role="menu">
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
<div class="btn-group" data-toggle="buttons">
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
        addRequestServiceButtonListener();

        let cancelButtonClick = document.getElementById('cancelButton');
        cancelButtonClick.addEventListener('click', function() {
            currentServiceChosen = null;
            currentTimeWindowBegin = null;
            currentTimeWindowEnd = null;
            pets = [];
            jQuery(showModal).modal('hide');
        });
    }
    /*async function getVisitReport(urlInfo, visitID) {
        let visitReport = await LT.getVisitReport(urlInfo, visitID);
        let vrKeys = Object.keys(visitReport);
            vrKeys.forEach((keyItem)=> {
                console.log(keyItem);
        });
        let photoURL = visitReport['VISITPHOTOURL'];
        return photoURL;
    }*/
    function displayVisitReport(event, visitID) {

        console.log('VISIT REPORT VIEW: ' + event + ' ' + visitID);
        let currentVisit;
        let visitPhotoURL;
        let mapImageURL;

        all_visits = LT.getVisitList();
        all_visits.forEach((visit)=> {
            if (visit.appointmentid == visitID) {
                /*if(visit.visitPhotoURL != null) {
                    visitPhotoURL = visit.visitPhotoURL
                } else {
                    visitPhotoURL = getVisitReport(visit.visitReportURLInfo, visitID)
                }*/
                const visitReportHTML = `
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header blue white-text">
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                                <h4 class="modal-title" id="formModalLabel">VISIT REPORT</h4>
                                <p>VISIT ID: ${visitID}
                            </div>
                        <div>
                        <img src = ${visit.visitPhotoURL} height = 100 width = 100>
                        <img src = ${visit.mapImageURL} height = 100 width = 100>
                        <h4>Note</h4>
                        <p>${visit.visitNote}
                    </div>
                    <form class="form-horizontal" role="form">
                        <div class="modal-body" id="visitReport">
                            <div class="alert alert-warning text-lg" role="alert">
                                <div class="modal-footer grey lighten-2">
                                    <button type="button" class="btn green width-6 white-text" data-dismiss="modal" data-toggle="modal" data-target="#formModal3" id="requestServiceButton">GRATUITY</button>
                                    <button type="button" class="btn btn-danger" data-dismiss="modal" id="cancelButton">NOTE</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>`;

                let showModal = document.getElementById("formModal");
                showModal.innerHTML = visitReportHTML;
                jQuery('#formModal').modal('show');

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

        let eventKeys = Object.keys(eventDetails);

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
    function displayPendingView(info) {
        console.log('PENDING VIEW DISPLAY');
        let eventInfo = info.event;
        let eventDate = info.date;
        console.log('VISIT TITLE: ' + eventInfo.title + ' --> ' + eventDate);
        console.log(eventProps);

    }
    function createCancelClick(visitID) {
    }
    function addServicePicker(visitRequestHMTLtemplate) {
        let servicePickerModal = document.getElementById('formModal');
        servicePickerModal.innerHTML = visitRequestHMTLtemplate;

        let sPicker = document.getElementById('chooseService');
        let childNodeServiceItems = sPicker.childNodes;
        childNodeServiceItems.forEach((node)=> {
            if (node.id != null){
                node.addEventListener("click", function(event) {
                    let re=/(service)([0-9]+)/;
                    currentServiceChosen = re.exec(node.id)[2];
                })
            }
        });
    }
    function addTimeWindowEventListeners() {
        let twPicker = document.getElementById('chooseTimeWindow');
        let childNodeTW = twPicker.childNodes;
        childNodeTW.forEach((node)=> {
            if(node.id != null) {
                node.addEventListener("click",function(event) {
                    let timeWindows = LT.getTimeWindows();
                    let re=RegExp('tw([0-9]+)');
                    let timeWindowNormal = re.exec(node.id)[1];
                    let tWind = parseInt(timeWindowNormal);
                    let timeWindowObj = timeWindows[tWind]
                    currentTimeWindowBegin = timeWindowObj.begin;
                    currentTimeWindowEnd = timeWindowObj.endTW;
                })
            }
        });
    }
    function addPetPickerListener() {
        let pickPet = document.getElementById('petPicker');
        let childNodePet = pickPet.childNodes;
        childNodePet.forEach((node)=> {
            if(node.id != null) {
                node.addEventListener("click",function(event) {
                    let re=/(pet)([0-9]+)/;
                    let petNormal = re.exec(node.id)[2];
                    let index = 0;
                    let popIndex = 0;
                    let isPetUnchose = false;

                    currentPetsChosen.forEach((chosenPet) => {
                        if (petNormal == chosenPet) {
                            isPetUnchose = true;
                            popIndex = index;
                            index = index+1;
                        }
                     })

                    if (!isPetUnchose) {
                        currentPetsChosen.push(petNormal);
                    } else {
                        currentPetsChosen.splice(popIndex,1);
                    }
                });
                currentPetsChosen.forEach((pet)=> {
                    console.log(pet);ooo
                });
            }
        });
    }
    function addRequestServiceButtonListener() {

        let requestServiceButton = document.getElementById('requestServiceButton');

        serviceList.forEach((service)=> {
            if (currentServiceChosen == service.serviceCode) {
                currentServiceChosen = service.serviceName;
            }
        });

        requestServiceButton.addEventListener("click", function(event)  {

            let dateBeginYear = beginDateService.getFullYear();
             let dateBeginField = document.getElementById('dateToday');
             let beginDate = dateToday.innerHTML;
            let dateEndField = document.getElementById('untilDate');
            let endDate = dateEndField.value;

            if (endDate == '' || endDate == null) {
                 endDate = 'NONE';
                let dateObj = new Date(beginDate);
                let visitTempIDMilli = new Date()
                 dateObj.setYear(dateBeginYear);
                 let realYear = dateObj.getFullYear();
                 let realMonth = dateObj.getMonth()+1;
                 let eventDateFormat = realYear+'-'+realMonth+'-'+dateObj.getDate();
                 let serviceList = LT.getServices();
                 let newEvent = {
                    id : visitTempIDMilli,
                    groupid : 'petsit',
                    title: currentServiceChosen,
                    start : eventDateFormat,
                    backgroundColor : 'orange',
                    eventTextColor : 'white',
                    note: 'NO NOTE',
                    timeWindow : currentTimeWindowBegin + ' - ' + currentTimeWindowEnd,
                    color : 'orange',
                    status : 'pending',
                    isPending: true
                };

                addVisitRequestItems(newEvent);

            } else {

                let dateObj = new Date(beginDate);
                 dateObj.setYear(dateBeginYear);
                 let formatEndDate = new Date(endDate);
                 formatEndDate.setYear(dateBeginYear);
                 let dayDiff = LTDateLib.calcDateDayDiff(dateObj,formatEndDate);
                let serviceList = LT.getServices();

                serviceList.forEach((service)=> {
                    if (currentServiceChosen == service.serviceCode) {
                        currentServiceChosen = service.serviceName;
                    }
                });

                 for (let i = 0; i < dayDiff; i++) {
                     let visitDateAdd = formatEndDate.getDate() - 1;
                     formatEndDate.setDate(visitDateAdd);
                     createRequestService(formatEndDate);
                }
            }

            let showModal = document.getElementById("formModal");
            showModal.setAttribute("aria-hidden", "true");
            showModal.setAttribute("class", "modal fade");
            showModal.setAttribute("tabindex", "-1");

        });
    }

    function createRequestService(serviceDate) {
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
            title: currentServiceChosen,
            start : eventDateFormat,
            backgroundColor : 'orange',
            eventTextColor : 'white',
            note: 'NO NOTE',
            timeWindow : currentTimeWindowBegin + ' - ' + currentTimeWindowEnd,
            color : 'orange',
            status : 'pending',
            isPending: false
        };

        addVisitRequestItems(newEvent);
        calendar.render();
    }
    function addVisitRequestItems(visitEvent) {
            event_visits.push(visitEvent);
            calendar.addEvent(visitEvent);
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
}(this.materialadmin, window.jQuery));
