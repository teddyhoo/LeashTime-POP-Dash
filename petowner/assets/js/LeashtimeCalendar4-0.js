(function (namespace) {
    "use strict";
	var all_visits;
	var petOwnerProfile;
	var surchargeItems;
	var serviceList;
	var timeWindowList;
	var event_visits = [];
	var calendar; 
	var currentServiceChosen;

	document.addEventListener('DOMContentLoaded', function() {
		var calendarEl = document.getElementById('calendar');

		calendar = new FullCalendar.Calendar(calendarEl, {
			plugins: [ 'dayGrid', 'interaction' ],
				dateClick: function(info) {
						let dateClick = info.date;
						console.log(dateClick);
						displayVisitRequest(dateClick);
				},

				eventClick: function(info) {
						let eventClicked = info.event._def;
						let eventProps = eventClicked.extendedProps;
						console.log('Appointment ID: ' + eventClicked.publicId + ' Status: ' + eventProps.status);
						
				}
		});

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
					addCalendarEvents(data);
					petOwnerProfile = LT.getClientProfileInfo(clientdata);
					calendar.render();

               });
			});
		});
	});

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

		let showModal = document.getElementById("formModal");
		showModal.setAttribute("class", "show");
	}
	function addCalendarEvents(eventData) {
				console.log('Calling create events: ');

				all_visits = LT.getVisits(eventData);
       	 		surchargeItems = LT.getSurchargeItems(eventData); 
        		serviceList = LT.getServiceItems(eventData);
        		timeWindowList = LT.getTimeWindows(eventData);

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