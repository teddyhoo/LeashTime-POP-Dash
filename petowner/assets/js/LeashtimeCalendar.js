(function (namespace, $) {
    "use strict";
    var petOwnerProfile;
    var startDateService;
    var endDateService;
    var currentTimeWindowBegin;
    var currentTimeWindowEnd;
    var currentServiceChosen;
    var dragStartDate;
    var dragStopDate;
    var dragDropServiceID;


    var all_visits = [];
    var surchargeItems =[];
    var serviceList = [];
    var timeWindowList =[];
    var event_visits = [];

    var currentPetsChosen = [];
    var schedule_request = [];
    var pendingVisits = [];

    const  dayArrStr = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const monthsArrStr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

        // -------------------------------------------------------------------------
        // |                                                                                                    | 
        // |                            LeashtimeCal var                                            | 
        // -------------------------------------------------------------------------
 
    var LeashtimeCal = function () {
        var o = this;
        var todayDate = new Date();
        let fullYear = todayDate.getFullYear();
        let dayOfMonth = todayDate.getDate();
        let monthDate = todayDate.getMonth()+1;
        let dateString = fullYear + '-' + monthDate + '-' + dayOfMonth;

        let clientURL = 'https://leashtime.com/client-own-schedule.php?'
        $(document).ready(function () {
            $.ajax({
                "url" : "http://localhost:3300",
                "type" : "GET",
                "data" : {"type" : "poVisits"},
                "dataTYPE" : "JSON"
            })
            .done((data)=> {
                $.ajax({
                    "url" : "http://localhost:3300",
                    "type" : "GET",
                    "data" : {"type" : "poClients"},
                    "dataTYPE" : "JSON"
                }).done((clientdata)=>{
                    petOwnerProfile = LT.getClientProfileInfo(clientdata);
                    o.createEvents(data);
                    o.initialize();
                })
            })
        })
    };

        // -------------------------------------------------------------------------
        // |                                                                                                | 
        // |                            LeashtimeCal PROTOTYPE functions         | 
        // -------------------------------------------------------------------------

    var p = LeashtimeCal.prototype;
    p.selectService = function(serviceID) {

        console.log('service selected with service id: ' + serviceID);

    };
    p.initialize = function () {
        this._enableEvents();
        this._initEventslist();
        this._initCalendar();
        this._displayDate();
    };
    p._enableEvents = function () {
        var o = this;

        $('#calender-prev').on('click', function (e) {
            o._handleCalendarPrevClick(e);
        });
        $('#calender-next').on('click', function (e) {
            o._handleCalendarNextClick(e);
        });
        $('.nav-tabs li').on('show.bs.tab', function (e) {
            o._handleCalendarMode(e);
            });
        $('#form-modal2').on('click', function(e) {
            o._clickModal(e);
        });
    };
    p._handleCalendarPrevClick = function (e) {
        $('#calendar').fullCalendar('prev');
        this._displayDate();
    };
    p._handleCalendarNextClick = function (e) {
        $('#calendar').fullCalendar('next');
        this._displayDate();
    };
    p._handleCalendarMode = function (e) {

        $('#calendar').fullCalendar('changeView', $(e.currentTarget).data('mode'));
    };
    p._displayDate = function () {
        var selectedDate = $('#calendar').fullCalendar('getDate');
        $('.selected-day').html(moment(selectedDate).format("dddd"));
        $('.selected-date').html(moment(selectedDate).format("DD MMMM YYYY"));
        $('.selected-year').html(moment(selectedDate).format("YYYY"));
    };
    p._clickDate = function () {
        var selectedDate = $('#calendar').fullCalendar('getDate');
        var visitDiv = $('#visitDiv')
        $('.selected-day').html(moment(selectedDate).format("dddd"));
        $('.selected-date').html(moment(selectedDate).format("DD MMMM YYYY"));
        $('.selected-year').html(moment(selectedDate).format("YYYY"));
    };
    p.createEvents = function(eventData) {

        console.log('Calling create events: ');

        all_visits = LT.getVisits(eventData);
        surchargeItems = LT.getSurchargeItems(eventData); 
        serviceList = LT.getServiceItems(eventData);
        timeWindowList = LT.getTimeWindows(eventData);

        //populateServiceList(serviceList);

        pendingVisits.forEach((pendingVisit) => {
            let eventTitle = pendingVisit.service;
            eventTitle += ' (PENDING APPROVAL)'
            let eventStart = pendingVisit.time_window_start;
            let eventEnd = pendingVisit.time_window_end;
            let eventStartDate = pendingVisit.date + ' ' + pendingVisit.eventStart;
            let eventEndDate = pendingVisit.date + ' ' + pendingVisit.eventEnd;
            let visitColor = 'orange';
            let visitURL = '';
        })

        surchargeItems.forEach((surcharge)=> {
            if (surcharge.surchargeType == 'holiday') {
                let eventTitle = surcharge.surchargeLabel;
                let surchargeID = surcharge.surchargeTypeID;
                let event = {
                    id : surcharge.surchargetypeID,
                    title: surcharge.surchargeLabel,
                    start : surcharge.surchargeDate,
                    end : surcharge.surchargeDate,
                    color : 'yellow',
                    chargeAmt : surcharge.charge,
                    status : surcharge.surchargeAutomatic                    
                };
                event_visits.push(event);
            }
        });

        all_visits.forEach((visit) => {
                
            let eventTitle = visit.service;
            if (visit.note != null) {
                eventTitle += '\n' + visit.note;
            }
            let eventStart = visit.time_window_start;
            let eventEnd = visit.time_window_end;
            let eventDateStart = visit.date + ' ' + eventStart;
            let eventDateEnd = visit.date + ' ' + eventEnd;
            let momentStart = moment(eventDateStart);
            let momentEnd = moment(eventDateEnd);

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
                start : momentStart,
                end : momentEnd,
                arrivalTime : visit.arrival_time,
                completionTime: visit.completion_time,
                color : visitColor,
                status : visit.status,
                sitter: visit.sitter,
                isPending: false
            };
            event_visits.push(event);

        });
    };
    p._clickModal = function() {

        var selectedDate = $('#calendar').fullCalendar('getDate');
    };
    p._initEventslist = function () {

        if (!$.isFunction($.fn.draggable)) {
            return;
        }
        var o = this;
        
        $('.list-events li ').each(function () {
            var eventObject = {
                title: $.trim($(this).text()), 
                className: $.trim($(this).data('className'))
            };
        
            $(this).data('eventObject', eventObject);
        
            $(this).draggable({
                zIndex: 999,
                revert: true, 
                revertDuration: 0, 
            });
        });
    };
    p._initCalendar = function (e) {
        if (!$.isFunction($.fn.fullCalendar)) {
            return;
        }
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        var o = this;

        //calendar = $('#calendar').fullCalendar('getCalendar');
        calendar.fullCalendar({
            height: 700,
            header: true,
            draggable: true, 
            selectable: true,
            events: event_visits,
            editable : true,

            select: function(start, end, jsEvent, view) {
    
                let tStartDate = new Date(start);
                let monthString = getMonthString(start);
                let todayNum = getTodayNum(start);
                let todayStr = getTodayString(start);
                let fullDateStringStart =  todayStr + ' ' +monthString + ' ' + todayNum;
                startDateService = new Date(start);
                endDateService = new Date(end);
                displayVisitRequest(fullDateStringStart);
                $('#calendar').fullCalendar("unselect");
            },
            eventClick:  function(event, jsEvent, view) {
                console.log('EVENT CLICK ' +event.id+ ' start: ' + event.start + ' end: ' + event.end);

                let apptID = event.id;
                let startDate = moment(event.start)
                let dateString = startDate.date();
                let dayOfWeek = startDate.day();
                let monthStr= startDate.month();
                let startHour = startDate.hour();
                let startMin = startDate.minute();
                if (startMin == 0) {
                    startMin = '00';
                }

                let endDate = moment(event.end);
                let endHour = endDate.hour();
                let endMin = endDate.minute();

                if (endMin == 0) {
                    endMin = '00';
                }

                if (event.status == 'canceled') {

                    let titleString = ' VISIT: ' + dayArrStr[dayOfWeek] + ', ' + monthsArrStr[monthStr] + '  '+ dateString +' <BR>  ' + event.title + '<BR> (' + startHour + ':' + startMin + '-' + endHour + ':' + endMin + ')'; 
                    displayUncancel(event, titleString);

                } else if (event.status == 'completed') {

                    let titleString = ' VISIT REPORT: ' + dayArrStr[dayOfWeek] + ', ' + monthsArrStr[monthStr] + '  '+ dateString +' <BR>  ' + event.title; 
                    let visitNote = event.note;
                    let arrivalTime = event.arrivalTime;
                    let completeTime = event.completionTime;
                    displayVisitReport(event, titleString, visitNote, arrivalTime, completeTime);

                }  else {

                    let titleString = ' VISIT: ' + dayArrStr[dayOfWeek] + ', ' + monthsArrStr[monthStr] + '  '+ dateString +' <BR>  ' + event.title + '<BR> (' + startHour + ':' + startMin + '-' + endHour + ':' + endMin + ')'; 
                    displayCancelChangeRequestPicker(event, titleString);   

                }
            },
            eventRender: function(event, element){
                $(element).find(".fc-content").append("");

                var $calendar = $("#calendar").fullCalendar("getCalendar");

                function remove_event(eventID){
                    var remove = confirm("Remove event ID " + eventID + "?");
                    if(remove == true){
                        calendar.fullCalendar("removeEvents", eventID);
                    }
                }
                if (event.status == 'canceled') {
                    event.color = 'red'
                }
            },
            views: {
                basic: {
                    // options apply to basicWeek and basicDay views
                },
                agenda: {
                    // options apply to agendaWeek and agendaDay views
                },
                week: {
                    // options apply to basicWeek and agendaWeek views
                },
                day: {
                    // options apply to basicDay and agendaDay views
                }
            },
            viewRender: function(view, element) { 
                $("#calendar").fullCalendar( 'refresh' ) 
                let keys = Object.keys(element);
                keys.forEach((k)=> {
                    //console.log('VIEW RENDER: '  +k + ' --> ' + element[k]);
                })
                let vKeys = Object.keys(view);
                    vKeys.forEach((vK)=> {
                    //console.log('View keys: ' + vK + ' view: ' + view[vK]);
                })
            },
            droppable: true,
            eventDragStart: function(event, jsEvent, ui, view) {
                console.log(event.id + ' ' + event.start);

                let startDate = moment(event.start)
                let dateString = startDate.date();
                let dayOfWeek = startDate.day();
                let monthStr= startDate.month();

                dragStartDate = moment(event.start);
                dragDropServiceID = event.id;
            },
            eventDrop: function(event, delta, revertFunc, jsEvent, ui, view) {

                let dateDrag = event.start;
                let momentDifference = moment.duration(delta);
                console.log(momentDifference.days());

                dragStopDate = moment(event.end);

                let today = moment(new Date);
                let isDropBeforeToday = isDateBefore(dragStopDate,today);
                let isDragBeforeToday = isDateBefore(dragStartDate,today);

                if (isDropBeforeToday) {
                    console.log(' drop date before today');
                    alert('warning: you are scheduling on day prior to today');
                    revertFunc();
                } else if (isDragBeforeToday) {
                    console.log(' drag date before today');
                    alert('warning: you are scheduling on day prior to today');
                    revertFunc();
                } else {
                    console.log(' drop date after today');
                    let dateString = dragStopDate.date();
                    let dayOfWeek = dayArrStr[dragStopDate.day()];
                    let monthStr= monthsArrStr[dragStopDate.month()];
                    let stopHour = dragStopDate.hour();
                    let stopMin = dragStopDate.minute();

                    let dateBeg = dragStartDate.date();
                    let dateBegDayWeek =  dayArrStr[dragStartDate.day()];
                    let monthBeg = monthsArrStr[dragStartDate.month()];
                    let startHour = dragStartDate.hour();
                    let startMin = dragStartDate.minute();

                    if (startMin < 10) {
                        startMin = '0'+startMin;
                    }

                    if (stopMin < 10) {
                        stopMin = '0'+stopMin;
                    }

                    displayChangePicker([{
                        buttonText: "changeServiceButton",
                        eventID : event.id,
                        service: event.title,
                        endDate: dayOfWeek + ' ' + monthStr+ ' ' + dateString,
                        originalDate : dateBegDayWeek + ' ' + monthBeg + ' ' + dateBeg,
                        end : stopHour + ':' + stopMin,
                        begin: startHour + ':' +startMin,
                        revert : revertFunc
                    }]);
                            
                    $('#formModal2').modal('show'); 
                }
            },
            drop: function (date, allDay) { 
                var originalEventObject = $(this).data('eventObject');
                console.log('Event dropped: ' + originalEventObject);
                let keys = Object.keys(originalEventObject);
                keys.forEach((key)=> {
                    console.log(key + ' -> ' + originalEventObject[key]);
                })

                console.log('Date param: ' + date);
                var copiedEventObject = $.extend({}, originalEventObject);

                copiedEventObject.start = date;
                copiedEventObject.allDay = allDay;
                copiedEventObject.className = originalEventObject.className;

                $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

             
                if ($('#drop-remove').is(':checked')) {
                   
                    $(this).remove();
                }
            },  
        });
    };

    // ----------------------------------------------------------------------------
    // |                                                                                                    | 
    // |                           Global functions                                              | 
    // ----------------------------------------------------------------------------

    function displayVisitReport(calEvent, datePicked, visitNote, arrive, complete) {
        console.log(visitNote);
        let eventStartMoment = moment(calEvent.start);
        let eventEndMoment = moment(calEvent. end);
        let startMonth = eventStartMoment.month();
        let startDate = eventStartMoment.date();
        let momentArrive = moment(arrive);
        let momentComplete = moment(complete);
        momentArrive  = moment(momentArrive, 'HH:mm').format('hh:mm a');
        momentComplete = moment(momentComplete, 'HH:mm').format('hh:mm a');

        const uncancelHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header blue white-text">
                        <img src="./assets/img/dog0.jpg" width=50 height=60>
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h4 class="modal-title" id="scheduledVisitAction">${datePicked}</h4>
                        <h4>${momentArrive} - ${momentComplete}</h4>
                    </div>
                    <form class="form-horizontal" role="form">
                        <div class="modal-body">
                            <div class="input-group-content">
                                <img src="./assets/img/visit-report-2.jpg" id="visitreportpic1" width=140 height = 140>
                                <img src="./assets/img/visit-report-3.jpg" id="visitreportpic2" width=140 height = 140>
                                <label>Note: ${visitNote} </label>
                            </div>
                            <div class="modal-footer grey lighten-2" id="visitReportPanel">
                                <button type="button" class="btn btn-danger" data-dismiss="modal" id='prevReport'>PREVIOUS REPORTS</button>
                                <button type="button" class="btn btn-danger" data-dismiss="modal" id='seeGPS'>SEE ROUTE</button>
                                <button type="button" class="btn btn-danger" data-dismiss="modal" id='leaveGratuity'>LEAVE GRATUITY</button>

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        let modalDiv = document.getElementById('formModal');
        modalDiv.innerHTML = uncancelHTML;
        $('#formModal').modal('show'); 

        let visitReportPanel = document.getElementById('visitReportPanel');


        let gratuityButton = document.getElementById('leaveGratuity');
        gratuityButton.addEventListener("click" ,  function(event) {
            let prevReportButton = document.getElementById('prevReport');
            let seeGPSbutton = document.getElementById('seeGPS');
            let gratuityButton = document.getElementById('leaveGratuity');
            prevReportButton.parentNode.removeChild(prevReportButton);
            seeGPSbutton.parentNode.removeChild(seeGPSbutton);
            gratuityButton.parentNode.removeChild(gratuityButton);

            const gratuityHTML = `

                <button type="button" class="btn btn-danger" data-dismiss="modal" id='tenpercent'>10%</button>
                <button type="button" class="btn btn-danger" data-dismiss="modal" id='twentypercent'>20%</button>
                <input type="text" class="form-control" id='grautuityAmt' size=100%>
                <label>Custom amount ($): </label>

            `;

            visitReportPanel.innerHTML = gratuityHTML;

            let tenPbutton = document.getElementById('tenpercent');
            let twentypercent = document.getElementById('twentypercent');
            tenPbutton.addEventListener("click", function(event) {


            })
        })
    }
    function displayUncancel(calEvent, datePicked) {
        let appointmentid = calEvent.id;
        let eventStartMoment = moment(calEvent.start);
        let eventEndMoment = moment(calEvent. end);
        let startMonth = eventStartMoment.month();
        let startDate = eventStartMoment.date();
        const uncancelHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header blue white-text">
                        <img src="./assets/img/dog0.jpg" width=50 height=60>
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h4 class="modal-title" id="scheduledVisitAction">${datePicked}</h4>
                    </div>
                    <form class="form-horizontal" role="form">
                        <div class="modal-body">
                            <div class="input-group-content">
                                <input type="text" class="form-control" id='cancelChangeText' size=100%>
                                <label>Note: </label>
                            </div>
                            <div class="modal-footer grey lighten-2" id="cancelChangeButtonPanel">
                                <button type="button" class="btn btn-danger" data-dismiss="modal" id='uncancelButton'>UNCANCEL VISIT</button>
                                <button type="button" class="btn btn-danger" data-dismiss="modal" id='changeServiceButton'>CHANGE SERVICE</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        let modalDiv = document.getElementById('formModal');
        modalDiv.innerHTML = uncancelHTML;
        $('#formModal').modal('show'); 

        let uncancelB = document.getElementById('uncancelButton');
        uncancelB.addEventListener("click", function(event) {
            console.log('Uncancel visit: ' + appointmentid + ' on date: ' + startMonth + '/' + startDate); 
        })
    }
    function displayVisitRequest(dateString) {
        
        console.log(dateString);
        const visitRequestHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header blue white-text">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                            <h4 class="modal-title" id="formModalLabel">SERVICE REQUEST</h4>
                        </div>
                        <form class="form-horizontal" role="form">

                            <div class="modal-body" id="servicePicker">
                                <div class="alert alert-warning text-lg" role="alert">
                                    <strong>Date:</strong> <span class="blue-text" id="dateToday">${dateString}</span>
                                    <div class="form-group pull-right control-width-normal">
                                        <div class="input-group date" id="demo-date">
                                            <div class="input-group-content">
                                                <input type="text" class="form-control" id='untilDate' value=''>
                                                <label>Until date: </label>
                                            </div>
                                            <span class="input-group-addon"><i class="fa fa-calendar"></i></span>
                                        </div>
                                    </div>
                                    <br>
                                </div>
                                <label class="text-default-light">SERVICE</label>
                                <div class="btn-group btn-group-justified" id="chooseService" role="group" aria-label="Justified button group">
                                    ${serviceList.map(function(service){
                                         return "<a href=# class=btn btn-default-bright type=checkbox role=checkbox id=service" +service.serviceCode+">" + service.serviceName + "</a>"
                                    })}
                                </div>
                                <br>
                                <label class="text-default-light">TIME WINDOW</label>
                                <div class="btn-group btn-group-justified" id="chooseTimeWindow" role="group" aria-label="Justified button group">
                                    ${timeWindowList.map(function(tw){
                                        let buttonHTML =  "<a href=# class=btn btn-default-bright type=checkbox role=checkbox id=tw" + tw.indexVal + ">" + tw.label + "</a>";
                                        return buttonHTML
                                    })}
                                </div> 
                                <br>
                                <label class="text-default-light">SELECT PETS</label>
                                <div class="btn-group btn-group-justified" id='petPicker' role="group" aria-label="Justified button group">
                                    ${petOwnerProfile.pets.map(function(pet) {
                                        return "<a href=# class=btn btn-default-bright type=checkbox role=checkbox id=pet" + pet.petID + ">" + pet.petName + "</a>"
                                    })}
                                </div>
                                <br>
                            </div>
                            <div class="modal-footer grey lighten-2">
                                <button type="button" class="btn green width-6 white-text" data-dismiss="modal" data-toggle="modal" data-target="#formModal3" id="requestServiceButton">REQUEST</button>
                                <button type="button" class="btn btn-danger" data-dismiss="modal">CANCEL</button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>`;

            let servicePickerModal = document.getElementById('formModal');
            servicePickerModal.innerHTML = visitRequestHTML;

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

            let twPicker = document.getElementById('chooseTimeWindow');
            let childNodeTW = twPicker.childNodes;
            childNodeTW.forEach((node)=> {
                if(node.id != null) {
                    node.addEventListener("click",function(event) {
                        let re=/(tw)([0-9]+)/;
                        let timeWindowNormal = re.exec(node.id)[2];
                        let timeWindowObj = timeWindowList[timeWindowNormal]
                        currentTimeWindowBegin = timeWindowObj.label;
                        currentTimeWindowEnd = timeWindowObj.label;
                        console.log(currentTimeWindowBegin + '  ' + currentTimeWindowEnd);
                    })
                }
            })

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
                }
            });

            $('#formModal').modal('show');

            let requestServiceButton = document.getElementById('requestServiceButton');
            let untilDate = document.getElementById('untilDate');
            requestServiceButton.addEventListener("click", function(event) {

                let selectDate = document.getElementById("todayDate");

                if (untilDate != '') {

                    let momentDate = moment(untilDate.value);
                    console.log('UNTIL DATE:' + momentDate.month() + '-' + momentDate.date() + '-' + momentDate.year());

                    let beginDateMoment = moment(startDateService);
                    console.log('BEGIN DATE:' + beginDateMoment.month() + '-' + beginDateMoment.date() + '-' + beginDateMoment.year());

                    let dayDiff = momentDate.diff(beginDateMoment, 'days');

                    let currentVisitRequestItems = [];


                    for (let i = 1; i <= dayDiff+1; i++) {

                        let startDate = moment(beginDateMoment).add(i, "days");
                        console.log(startDate.month() + '-' + startDate.date() + '-' + startDate.year());
                        let startDateCompare = startDate.month() + '-' + startDate.date() + '-' + startDate.year();
                        let now = Date.now() + i;
                        let serviceName;
                        let charge;
                        serviceList.forEach((service) => { 
                            if (service.serviceCode == currentServiceChosen) {
                                serviceName = service.serviceName;
                                charge = service.serviceCharge;

                            }
                        })
                        surchargeItems.forEach((surcharge)=> {
                            let surchargeMoment = moment(surcharge.surchargeDate);
                            let surchargeDateCompare = surchargeMoment.month() + '-' + surchargeMoment.date() + '-' + surchargeMoment.year()
                            if (surchargeDateCompare == startDateCompare) {
                                console.log('SURCHARGE: ' + surcharge.surchargeLabel + ' : ' + surchargeMoment.month() + '-' + surchargeMoment.date() + '-' + surchargeMoment.year());
                                let surchargeEvent = {
                                    id : now+1000,
                                    title: 'SURCHARGE: ' + surcharge.surchargeLabel,
                                    note: 'Surcharge',
                                    timeWindow : currentTimeWindowBegin,
                                    start : startDate,
                                    end : startDate,
                                    arrivalTime : 'none',
                                    completionTime: 'none',
                                    color : 'orange',
                                    status : 'pending',
                                    sitter: 'unassigned',
                                    serviceCharge : surcharge.charge,
                                    isPending: true
                                };
                                event_visits.push(surchargeEvent);
                                pendingVisits.push(surchargeEvent);
                                currentVisitRequestItems.push(surchargeEvent);
                                $('#calendar').fullCalendar('renderEvent', surchargeEvent, true);

                            }
                        })

                        let event = {
                            id : now,
                            title: serviceName,
                            note: 'visit note',
                            timeWindow : currentTimeWindowBegin,
                            start : startDate,
                            end : startDate,
                            arrivalTime : 'none',
                            completionTime: 'none',
                            color : 'orange',
                            status : 'pending',
                            sitter: 'unassigned',
                            serviceCharge : charge,
                            isPending: true
                        };

                        //console.log('event id: ' + event.id + ' start date: ' + event.start.month() + '/' + event.start.date()  + '/' + event.start.year());
                        event_visits.push(event);
                        pendingVisits.push(event);
                        currentVisitRequestItems.push(event);
                        $('#calendar').fullCalendar('renderEvent', event, true);
                    }
                    processServiceRequest(currentVisitRequestItems);

                } else {
                    let momentDate = moment(endDateService);
                    console.log(momentDate.month() + ' ' + momentDate.date() + ' ' + momentDate.year());
                }
            });
    }
    function displayCancelChangeRequestPicker(calEvent, datePicked) {
        console.log('raw date picked: ' + calEvent.start);
        console.log('display cancel change request picker: ' + calEvent.start.date() + ' ' + datePicked);

        let pickedDate = calEvent.start.date();
        let pickedMonth = calEvent.start.month();
        let pickedYear = calEvent.start.year();
        let pickedBeginHour = calEvent.start.hour();
        let pickedBeginMinute = calEvent.start.minute();

        let pickedEndHour = calEvent.end.hour();
        let pickedEndMinute = calEvent.end.minute();
        let appointmentid = calEvent.id;

        console.log('Picked date: ' + pickedMonth + ' ' + pickedDate + ' ' + pickedYear + ' ' + pickedBeginHour + ':' + pickedBeginMinute + ' --- ' + pickedEndHour + ':' + pickedEndMinute);

        const displayCancelChangeRequestPicker = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header blue white-text">
                        <img src="./assets/img/dog0.jpg" width=50 height=60>
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h4 class="modal-title" id="scheduledVisitAction">${datePicked}</h4>
                    </div>
                    <form class="form-horizontal" role="form">
                        <div class="modal-body">
                            <div class="input-group-content">
                                <input type="text" class="form-control" id='cancelChangeText' size=100%>
                                <label>Note: </label>
                            </div>
                            <div class="modal-footer grey lighten-2" id="cancelChangeButtonPanel">

                                <button type="button" class="btn btn-danger" data-dismiss="modal" id='cancelVisitButton'>CANCEL ONLY THIS VISIT</button>
                                <button type="button" class="btn btn-danger" id='cancelUntilVisitButton'>CANCEL VISITS UNTIL</button>
                                <button type="button" class="btn btn-danger" data-dismiss="modal" id='changeServiceButton'>CHANGE SERVICE</button>

                                            
                            </div>
                        </div>
                    </form>
                </div>
            </div>`;
        let modalDiv = document.getElementById('formModal');
        modalDiv.innerHTML = displayCancelChangeRequestPicker;
        $('#formModal').modal('show'); 

        let cancelVisitsButton = document.getElementById('cancelVisitButton');
        let changeButton = document.getElementById('changeServiceButton');
        let cancelVisitsUntilButton = document.getElementById('cancelUntilVisitButton');

        changeButton.addEventListener("click", function(event) {
            cancelVisitButton.parentNode.removeChild(cancelVisitButton);
            cancelVisitsUntilButton.parentNode.removeChild(cancelVisitsUntilButton);

            const changeHTML = `
                <button type="button" class="btn btn-danger" data-dismiss="modal" id='changeType'>CHANGE TYPE</button>  
                    <strong>Date:</strong> <span class="blue-text" id="${datePicked}"></span>
                    <div class="form-group pull-right control-width-normal">
                        <div class="input-group date" id="demo-date">
                            <div class="input-group-content">
                                <button type="button" class="btn btn-danger" data-dismiss="modal" id='dateChange'>CHANGE DATE</button>  
                                <button type="button" class="btn btn-danger" data-dismiss="modal" id='timeDayChange'>CHANGE TIME OF DAY</button>  

                            </div>
                            <span class="input-group-addon"><i class="fa fa-calendar"></i></span>
                        </div>
                        </div>
                    <br>
            `;
        })
        cancelVisitsButton.addEventListener("click", function(event) {
            console.log('Cancel: ' + calEvent.id + ' visit on '  + calEvent.start.date() + ' ' + calEvent.start.month());
            calEvent.status = 'canceled'
            calEvent.isPending = true;
            calEvent.color = 'red';
            $('#calendar').fullCalendar('rerenderEvents');
        });


        cancelVisitsUntilButton.addEventListener("click", function(event) {
            let cancelB = document.getElementById('cancelVisitButton');
            let changeB = document.getElementById('changeServiceButton');
            cancelB.parentNode.removeChild(cancelB);
            changeB.parentNode.removeChild(changeB);

            let panel = document.getElementById('cancelChangeButtonPanel');
            const cancelUntilHTML = `
                    <button type="button" class="btn btn-danger" data-dismiss="modal" id='confirmCancelUntil'>CANCEL VISITS UNTIL</button>  
                    <strong>Date:</strong> <span class="blue-text" id="${datePicked}"></span>
                    <div class="form-group pull-right control-width-normal">
                        <div class="input-group date" id="demo-date">
                            <div class="input-group-content">
                                <input type="text" class="form-control" id='untilDate2' value=''>
                                <label>Until date: </label>
                            </div>
                            <span class="input-group-addon"><i class="fa fa-calendar"></i></span>
                        </div>
                        </div>
                    <br>
            `;

            panel.innerHTML = cancelUntilHTML;
            let cancelUntilConfirm = document.getElementById('confirmCancelUntil');
            let untilDate = document.getElementById('untilDate2');

            cancelUntilConfirm.addEventListener("click", function(event) {
                let cancelUntilMoment = moment(untilDate2.value);                
                let beginDateMoment = moment(calEvent.start);
                let numDaysCancel = cancelUntilMoment.diff(beginDateMoment, "days");
                console.log('Number cancel days: ' + numDaysCancel);

                let cancelUntilMomentDay = cancelUntilMoment.date() + '-' + cancelUntilMoment.month() + '-' + cancelUntilMoment.year();
                let cancelUntilMomentBegin = beginDateMoment.date() + '-' + beginDateMoment.month() + '-' + beginDateMoment.year();


                for (let p = 0; p <= numDaysCancel; p++) {
                    let newDate = moment(beginDateMoment);
                    newDate.add(p, 'day');
                    console.log('New date: ' + newDate.date());
                    event_visits.forEach((event) => {
                        let startmoment = moment(event.start);
                        //console.log('Event date: ' + startmoment + ' ---> compare:  ' + newDate);
                        if (startmoment.isSame(newDate)) {
                            console.log('Canceling event: ' + newDate);
                            event.status = 'canceled';
                            event.isPending = true;
                            event.color = 'red';
                        }
                        $('#calendar').fullCalendar('renderEvent', event, true);  
                    });
                }
            })
            $('#calendar').fullCalendar('rerenderEvents');  
        });
    }
    function displayChangePicker(withButtons) {
            const cancelChangePanel =  `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header blue white-text">
                            <img src="./assets/img/dog0.jpg" width=50 height=60>
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                                    <h4 class="modal-title" id="scheduledVisitAction">
                                        Change: &nbsp&nbsp&nbsp${withButtons[0].service}
                                        <BR>
                                        from: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp ${withButtons[0].originalDate} (${withButtons[0].begin} to ${withButtons[0].end})
                                        <BR>
                                        to: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp${withButtons[0].endDate} (${withButtons[0].begin} to ${withButtons[0].end})
                                    </h4>
                    </div>
                    <form class="form-horizontal" role="form">
                        <div class="modal-body">
                            <div class="input-group-content">
                                    <input type="text" class="form-control" id='cancelChangeText' size=100%>
                                    <label>Note: </label>
                            </div>
                            <div class="modal-footer grey lighten-2" id="cancelChangeButtonPanel">

                            ${withButtons.map( function(key) {
                                return "<button type=\"button\" class=\"btn btn-danger\" data-dismiss=\"modal\" id=\"" + key.buttonText + "\">Confirm Change Visit</button>"
                            })}

                            <button type="button" class="btn btn-danger" data-dismiss="modal" id="cancelChange" onclick=cancelChange()>Cancel</button>
                            
                            </div>
                        </form>
                    </div>
                </div>
            </div>`

            let formModal = $('#formModal2').modal();
            formModal2.innerHTML = cancelChangePanel;
            let confirmChange = document.getElementById(withButtons[0].buttonText);
            confirmChange.addEventListener('click', function(event){
                event.preventDefault();
                let eventkeys = Object.keys(withButtons[0]);
            });

            let concelChange = document.getElementById(cancelChange);
            cancelChange.addEventListener('click', function(event) {
                event.preventDefault();
            });        
    }
    function processServiceRequest (eventItems) {

        console.log(eventItems.length);
        const invoiceHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header green white-text">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                        <h4 class="modal-title" id="formModalLabel">SUBMIT PETCARE SERVICE REQUEST</h4>
                    </div>
                    <form class="form-horizontal" role="form">
                        <div class="modal-body">
                            <section>
                            <div class="section-body">
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div class="card card-printable style-default-light">
                                            <div class="card-head">
                                                <div class="tools">
                                                    <div class="btn-group">
                                                        <a class="btn btn-floating-action grey" href="javascript:void(0);" onclick="javascript:window.print();"><i class="md md-print"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="card-body style-default-bright">
                                                <div class="row">
                                                    <div class="col-xs-8">
                                                        <h1 class="text-light"><i class="fa fa-paw fa-fw fa-2x text-accent-dark"> </i> <strong class="text-accent-dark">LEASHTIME</strong></h1>
                                                    </div>
                                                    <div class="col-xs-4 text-right">
                                                        <h1 class="text-light text-default-light">Invoice</h1>
                                                    </div>
                                                </div>
                                                <br>
                                                                           
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <table class="table">
                                                            <thead>
                                                                <tr>
                                                                    <th style="width:100px" class="text-left">DATE</th>
                                                                    <th style="width:100px" class="text-center">SERVICE</th>
                                                                    <th style="width:30" class="text-right">TIME</th>
                                                                    <th style="width:30px" class="text-right">AMT</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="invoice">
                                                                ${eventItems.map(function(event) {
                                                                    let startDate = event.start.date();

                                                                    let startMonth = event.start.month();
                                                                    let startMonthString = monthsArrStr[startMonth];

                                                                    let startDay = dayArrStr[event.start.day()];
                                                                    console.log(startDay);
                                                                    console.log(startDate + ' ' + startMonth);
                                                                    return "<tr><td>" + startDay + " " + startMonthString + " " + startDate + "</td><td>" + event.title + "</td><td>" + event.timeWindow + "</td><td>" + event.serviceCharge + "</td></tr>"; 
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </section>
                        </div>
                        <div class="modal-footer grey lighten-2">
                            <button type="button" class="btn btn-danger" data-dismiss="modal" id="cancelServiceRequest">CANCEL</button>
                            <button type="button" class="btn green width-6 white-text" data-dismiss="modal" id="sendVisitRequest">SUBMIT SERVICE REQUEST</button>
                        </div>
                        </form>
                    </div>
                </div>
        `;
        let invoice = document.getElementById('formModal3');
        invoice.innerHTML = invoiceHTML;
    }
    function populateServiceList  (serviceListItems) {

        let serviceEl = document.getElementById('serviceList');

        serviceListItems.forEach((serviceItem)=> {
            let listEl = document.createElement('li');
            listEl.setAttribute('class','tile lightgrey ui-draggable ui-draggable-handle padding');
            listEl.setAttribute('data-class-name', 'event-info');  
            let divElTileContent = document.createElement('div');
            divElTileContent.setAttribute('class', 'tile-content');
            let divElTileText = document.createElement('div');
            divElTileText.setAttribute('class','tileText');
            divElTileText.setAttribute('id', serviceItem.serviceCode);
            divElTileText.innerHTML = serviceItem.serviceName;
            divElTileContent.appendChild(divElTileText);
            listEl.appendChild(divElTileContent);
            serviceEl.appendChild(listEl);
        });
    }
    function createTableServiceRow (invoiceTable) {
        let pickedService = '';
        let newRow = document.createElement('tr');
        let newDateRow = document.createElement('td');
        newDateRow.innerHTML = getMonthString(new Date(startDateService)) + ' ' + getTodayNum(new Date(startDateService));
        let newServiceRow = document.createElement('td');
        newServiceRow.setAttribute('class','text-center');
        let newChargeRow = document.createElement('td');
        newChargeRow.setAttribute('class','text-right');

        serviceList.forEach((service)=> {
            if (currentServiceChosen == service.serviceCode) {
                newServiceRow.innerHTML = service.serviceName;
                pickedService = service.serviceName;
                newChargeRow.innerHTML = service.serviceCharge;
            }
        });

        let newTimeWindowRow = document.createElement('td');
        newTimeWindowRow.setAttribute('class','text-right');
        newTimeWindowRow.innerHTML = currentTimeWindowBegin + '-' + currentTimeWindowEnd;
        newRow.appendChild(newDateRow);
        newRow.appendChild(newServiceRow);
        newRow.appendChild(newTimeWindowRow);
        newRow.appendChild(newChargeRow);
        invoiceTable.appendChild(newRow);

        return pickedService;
    }
    var calendar = $('#calendar').fullCalendar('getCalendar');
    namespace.LeashtimeCal = new LeashtimeCal;

}(this.materialadmin, jQuery)); 











