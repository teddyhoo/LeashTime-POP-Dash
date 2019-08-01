(function (namespace, $) {
    
    console.log('loaded views module');
    
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
                console.log(pend);
                let dateStart = new Date(pend.start);
                let monthStart = dateStart.getMonth();
                let monthString = monthsArrStr[monthStart];
                let serviceList = LT.getServices();
                let serviceName;

                serviceList.forEach((service)=>{
                    if (service.serviceID == pend.title) {
                        serviceName = service.serviceName;
                        console.log(serviceName)
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
    function displayVisitReportModal(visit) {

        let showModal = document.getElementById('ltVR-ModalContainer');

        let visitFullDate = document.getElementsByClassName('ltVR-visitFullDate');
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
        //visitFullDate.innerHTML = visit.date;
        //visitDuration.innerHTML = '30 minutes';
        //        let visitShareButton = document.getElementsByClassName('ltVR-visitShareButton');
        //        visitShareButton.setAttribute('href' , evtShareReport);

        jQuery(showModal).modal('show');
    }

}(this.materialadmin, window.jQuery));