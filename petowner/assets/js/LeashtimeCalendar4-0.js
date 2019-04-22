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
    var isAjax = 'true';

	document.addEventListener('DOMContentLoaded', function() {
		var calendarEl = document.getElementById('calendar');
		calendar = new FullCalendar.Calendar(calendarEl, {
			plugins: [ 'dayGrid', 'interaction' ],
				editable : true,
				defaultView : 'dayGridMonth',
				dateClick: function(info) {
						clickedDate = info.date;
						console.log(petOwnerProfile.pets);
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

		calendar.render();

		if(isAjax) {

			getVisits();
			
		} else {
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
						populateTimeline();
	               });
				});
			});
		}
	});

	async function getVisits() {
		let visitData = await LT.getPetOwnerVisitsAjax(this, '2019-04-01', '2019-05-31');
		let calData;
		visitData.forEach((visit)=> {
			let eventData = createCalendarEvent(visit);
			calendar.addEvent(eventData);
		});

		petOwnerProfile = await LT.getClientProfileAjax();
		
	}

	function createCalendarEvent(visit) {
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
			visitColor = 'yellow';
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
		return event;

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
	function convertDate(dateItem) {

		let convertDate = new Intl.DateTimeFormat('en-US').format(dateItem);
		var formatter = new Intl.DateTimeFormat('en-us', {
			weekday: 'long'
		});
		formatter.formatToParts(dateItem);
		console.log(formatter.weekday);
		return convertDate
	}

   	function displayVisitRequest(dateString) {
   		console.log('clicked on date: ' + dateString);
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
					console.log('Current service chosen: ' + currentServiceChosen);
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

		let requestServiceButton = document.getElementById('requestServiceButton');
		requestServiceButton.addEventListener("click", function(event)  {
			let showModal = document.getElementById("formModal");
			showModal.setAttribute("class", "hidden");
			console.log(currentTimeWindowBegin + '  ' + currentTimeWindowEnd + ' ' +  currentServiceChosen  + ' ' + currentPetsChosen);
			let newEvent = {
				id : '000000000',
				title: currentServiceChosen,
				note: '',
				timeWindow : currentTimeWindowBegin + ' - ' + currentTimeWindowEnd,
				start : dateString,
				end : dateString,
				color : 'orange',
				status : 'pending',
				isPending: false
			};
			event_visits.push(newEvent);
			calendar.addEvent(newEvent);
		});

		let showModal = document.getElementById("formModal");
		showModal.setAttribute("class", "show");
	}
	function addCalendarEvents(eventData) {


	}
	function displayUncancel(calEvent, datePicked) {
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
            console.log('Uncancel visit: ' + calEvent + ' on date: ' + calEvent + '/' + calEvent); 
        })
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
}(this.materialadmin)); 