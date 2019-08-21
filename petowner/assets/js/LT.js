var LT = (function() {

	"use strict";

	var petOwnerAndPets;
	var visit_list = [];
	var surcharge_list= [];

	var listServices = [];
	var time_windows_list= [];
	var requested_visits = [];

	var isAjax = true;
	var clientType;
	var userNameGlobal;
	var passwordGlobal;
 	var responseDictionary = {};


	// ********************************************************************************************
	// *       NETWORK GET FUNCTIONS
	// ********************************************************************************************

	async function loginPetOwnerPortalAjaxTED(event) {

		checkClient();

		console.log('Login pet owner portal ajax');
		userNameGlobal = window.localStorage.getItem('username');
		passwordGlobal = window.localStorage.getItem('password');

		let uName;
		let pWord;

		if (userNameGlobal == null) {
			uName = document.getElementById('username').value;
			pWord = document.getElementById('password').value;
			window.localStorage.setItem('username', uName);
			window.localStorage.setItem('password',pWord);
		} else {
			uName = userNameGlobal;
			pWord = passwordGlobal;
		}

		let loginURL = 'https://leashtime.com/pop-login.php?user_name=' + uName + '&user_pass=' + pWord;
		
		let loginRequest = await fetch(loginURL).then((response)=> {
			response.headers.forEach(function(val, key) { 
				console.log(key + ' -> ' + val); 
			 });
			return response.json()
		});
		event.location = "./online/pop-calendar-TED.html";
	}
	async function loginPetOwnerPortalAjax(event) {

		checkClient();

		console.log('Login pet owner portal ajax');
		userNameGlobal = window.localStorage.getItem('username');
		passwordGlobal = window.localStorage.getItem('password');

		let uName;
		let pWord;

		if (userNameGlobal == null) {
			uName = document.getElementById('username').value;
			pWord = document.getElementById('password').value;
			window.localStorage.setItem('username', uName);
			window.localStorage.setItem('password',pWord);
		} else {
			uName = userNameGlobal;
			pWord = passwordGlobal;
		}

		let loginURL = 'https://leashtime.com/pop-login.php?user_name=' + uName + '&user_pass=' + pWord;
		
		let loginRequest = await fetch(loginURL).then((response)=> {
			response.headers.forEach(function(val, key) { 
				console.log(key + ' -> ' + val); 
			 });
			return response.json()
		});
		event.location = "./online/pop-calendar.html";
	}
	async function getPetOwnerVisitsAjax(event, startDate, endDate) {
		let clientVisitsURL = 'https://leashtime.com/client-own-scheduler-data.php?start=' +startDate + '&end=' + endDate + '&visits=1&servicetypes=1&surchargetypes=1&timeframes=1';
		let options = {
			method : 'GET',
			headers : {
				'accept' : 'application/json',
				'content-type' : 'application/json',
				'credentials' : 'same-origin'
			}
		}
		let visitPORequest = await fetch(clientVisitsURL,options);
		let visitListResponse = await visitPORequest.json();
		responseDictionary = visitListResponse;
		
		if (visitListResponse.visits != null) {
				visitListResponse.visits.forEach((visitDict)=> {
					const visit = new Visit(visitDict);
					visit_list.push(visit);
				});
		}
		if (visitListResponse.servicetypes != null) {
			parseService(visitListResponse.servicetypes);
		}
		if (visitListResponse.surchargetypes != null) {
			parseSurcharges(visitListResponse.surchargetypes);
		}
		if (visitListResponse.timeframes != null) {
			parseTimeWindows(visitListResponse.timeframes);		
		}
		if(visitListResponse.requestedvisits != null) {
			parsePendingVisits(visitListResponse.requestedvisits);
		}
		return visit_list;
	}	
	async function getClientProfileAjax() {
		let clientProfileURL = 'https://leashtime.com/client-own-profile-data.php';
		let options = {
			method : 'GET',
			headers : {
				'accept' : 'application/json',
				'content-type' : 'application/json',
				'credentials' : 'same-origin'
			}
		}
		let profileRequest = await fetch(clientProfileURL,options);
		let profileResponse = await profileRequest.json();
		petOwnerAndPets = new PetOwner(profileResponse);
		return petOwnerAndPets;
	}
		/*
			Purpose: to supply business and client identity info to populate the POP header.

			Usage: WHEN LOGGED IN AS CLIENT: https://leashtime.com/pop-data-capsule-json.php

			Returns JSON:

				FAIL: {"error":<some error message>}

				SUCCESS: 

			{
			"success":true,
			"business":
				{"bizName":"Dog's Life",
				"shortBizName":"Dog's Life",
				"logo":"https:\/\/LeashTime.com\/bizfiles\/biz_3\/logo.jpg",
				"bizPhone":"703 555 1212",
				"bizEmail":"dogslife69@yahoo.com",
				"bizAddress":{"street1":"123 Main Street","street2":"","city":"Vienna","state":"VA","zip":"22180"},
				"bizHomePage":"http:\/\/s179641890.onlinehome.us\/test\/dogslifehome.html",
				"facebook":null,
				"linkedinaddress":null,
				"twitteraddress":null,
				"instagraminaddress":null},
			"client":{"fullname":"Elroy Krum","fname":"Elroy","lname":"Krum"}
			}
		*/
	async function getPOPheaderInfo() {

		let url = 'https://leashtime.com/pop-data-capsule-json.php';
		let options = {
			'method' : 'GET',
			'headers' : {
				'accept' : 'application/json',
				'content-type' : 'application/json'
			}
		}
		let poHeaderRequest = await fetch(url,options);
		let poHeaderResponse = await poHeaderRequest.json();
		console.log(poHeaderResponse);
	}
	async function getVisitReport(visitObj) {
		let url = visitObj.visitReportURLInfo;
		if(url != null) {
			console.log(url);
			let options = {
				'method' : 'GET',
				'headers' : {
					'accept' : 'application/json',
					'content-type' : 'application/json'
				}
			}
			let visitReportRequest = await fetch(url, options);
			let visitReportResponse = await visitReportRequest.json();
			visitObj.addVisitReportDetails(visitReportResponse);
			console.log(visitReportResponse);
		}
		
	}


	// ***********************************************
	// *			PARSE RESPONSE FUNCTIONS
	// ***********************************************

	function parsePendingVisits(requestedDict) {

		requestedDict.forEach((visitDic)=> {
			let dictKeys = Object.keys(visitDic);
			dictKeys.forEach((vKey) => {
				if (vKey == 'visits') {
					let requestArray = visitDic[vKey];
					requestArray.forEach((newVisit)=> {
						let visitRequestItemKeys = Object.keys(newVisit);
						console.log('-----NEW VISIT -----');
						visitRequestItemKeys.forEach((vvKey)=> {
							//console.log(vvKey + ' --> ' + newVisit[vvKey]);
						});
						let requestVisit = new Visit(newVisit);
						requested_visits.push(requestVisit);
					});
				}
			});
		});
	}
	function parseService(service_dict) {

		service_dict.forEach((serviceDicItem) =>{
			let serviceObj = new ServiceItem(serviceDicItem);
			listServices.push(serviceObj);
		});
	}
	function parseTimeWindows(time_window_dict) {
		let i = 0;
		time_window_dict.forEach((timeWindow) =>{
			let serviceObj = new TimeWindowItem(timeWindow,i);
			i++;
			time_windows_list.push(serviceObj);
		});
	}
	function parseSurcharges(surcharge_dict) {
		surcharge_dict.forEach((surchargeItem) =>{
			let serviceObj = new SurchargeItem(surchargeItem);
			surcharge_list.push(serviceObj);
		});
	}
	// ***********************************************
	// *			SEND REQUEST FUNCTIONS
	// ***********************************************
	async function sendUncancelRequest (uncancelDictionary) {

		console.log('UNCANCEL REQUEST');
		let requestDic = {
			'fname' : petOwnerAndPets.fname,
			'lname' : petOwnerAndPets.lname,
			'groupnote' : 'NONE',
			'changetype' : 'cancel',
			'visits' : cancelVisitList
		};

		let url = "https://leashtime.com/client-own-schedule-change-json.php";
		let options = {
			'method' : 'POST',
			'headers' : {
				'accept' : 'application/json',
				'content-type' : 'application/json'
			},
			'body' : JSON.stringify(requestDic)
		};		

		let scheduleRequest = await fetch(url, options);
		let scheduleRequestResponse = await scheduleRequest.json();
		console.log(scheduleRequestResponse);
	}
	async function sendChangeVisitRequest (url, visitID,  changeType,  changeNote) {

		console.log('CHANGE VISIT REQUEST');
	}
	async function sendCancelVisitRequest (cancelVisitList) {

		let url = "https://leashtime.com/client-own-schedule-change-json.php";
		let options = {
			'method' : 'POST',
			'headers' : {
				'accept' : 'application/json',
				'content-type' : 'application/json'
			},
			'body' : JSON.stringify(cancelVisitList)
		};		

		let scheduleRequest = await fetch(url, options);
		let scheduleRequestResponse = await scheduleRequest.json();
		console.log(scheduleRequestResponse);
	}

	/*
		client-own-schedule-change-json.php

		to post a JSON request specifying a cancel, uncancel, or change request involving multiple visits.
		accepts either a native JSON parameter (via "application/json" request type) 
		OR a regular post with a JSON-formatted argument named "changes".
		results in a "Schedule Change" request type, a request type invented a few months ago.
		returns {"status":"ok", "requestid":29394994} or
		{"error":"no active session"} or
		{"error":"unknown visit[<some visit id >]"}


		To see it in action, log in as a Dog's Life customer, select a few visits, and click one of the buttons.  The form that opens makes an AJAX call to client-own-schedule-change-json.php.
		Input format:
		{ 
		  "fname", -- should be either client's fname or fname2
		  "lname", -- should be either client's lname or lname2
		  "groupnote", -- the note field for the whole request
		  "changetype", -- change|cancel|uncancel
		  "visits": [
		      {"id", -- visit id
		        "note", -- note specific to this visit
		      },
		      {"id", -- visit id
		        "note", -- note specific to this visit
		      },...
		   ]
		}
	*/

	async function sendRequestSchedule(visitJson) {
		let url = 'https://leashtime.com/client-scheduler-json-post.php';
		let options = {
			'method' : 'POST',
			'headers' : {
				'accept' : 'application/json',
				'content-type' : 'application/json'
			},
			'body' : JSON.stringify(visitJson)
		};
		let scheduleRequest = await fetch(url, options);
		let scheduleRequestResponse = await scheduleRequest.json();
		console.log(scheduleRequestResponse);
	}

	// ***********************************************
	// *			RETURN DATA ARRAYS UTILITY FUNCTIONS
	// ***********************************************
	function getVisitList() {
		
		return visit_list;
	}
	function getServices() {

		return listServices;
	}
	function getTimeWindows() {

		return time_windows_list;
	}
	function getSurcharges() {

		return surcharge_list;
	}
	function checkClient() {
		console.log(location.hostname);
		console.log(navigator.appCodeName);
		console.log(navigator.appName);
		console.log(navigator.appVersion);
		console.log(navigator.cookieEnabled);
		//console.log(navigator.geolocation);
		console.log(navigator.online);
		console.log(navigator.platform);
		console.log(navigator.product);

		clientType = navigator.userAgent;
		return navigator.platform;
	}

	// ********************************************************************************************
	// *       CLASS OBJECTS REPRESENTING DATA COMPONENTS
	// ********************************************************************************************
	class PetOwner {
		constructor(pet_owner_data) {
			this.client_id = pet_owner_data.clientid;
			this.petOwnerData = pet_owner_data;
			this.petImages = [];
			this.pets = [];
			this.parsePetOwnerData(pet_owner_data);
			this.parsePetInfo(pet_owner_data.pets);
			this.parseCustomFields(pet_owner_data);
		}
		parsePetOwnerData(pData) {
			//let profileKeys = pData.keys();
			//profileKeys.forEach((key) => {
			//	console.log(key + ' --> ' + pData[key]);
			//});
			this.petOwnerName = pData['clientname'];
			this.lname = pData['lname'];
			this.fname = pData['fname'];
			this.fname2 = pData['fname2'];
			this.lname2 = pData['lname2'];
			this.lat = pData['lat'];
			this.lon = pData['lon'];
			this.zip = pData['zip'];
			this.city = pData['city'];
			this.email = pData['email'];
			this.state = pData['state'];
			this.street1 = pData['street1'];
			this.street2 = pData['street2'];
			this.email2 = pData['email2'];
			this.cellphone = pData['cellphone'];
			this.cellphone2 = pData['cellphone2'];
			this.homephone = pData['homephone'];
			this.workphone = pData['workphone'];
			this.garagegatecode = pData['garagegatecode'];
			this.alarmcompany = pData['alarmcompany'];
			this.alarmcophone = pData['alarmcophone'];
			this.alarminfo = pData['alarminfo'];
			this.vetptr = pData['vetptr'];
			this.notes = pData['cellphone'];
			this.leashloc = pData['leashloc'];
			this.directions = pData['directions'];
			this.parkinginfo = pData['parkinginfo'];
			this.foodloc = pData['foodloc'];
			this.keyid = pData['keyid'];
			this.keydescription = pData['keydescription'];
			this.showkeydescriptionnotkeyid = pData['showkeydescriptionnotkeyid'];
			
			this.clinicname = pData['clinicname'];
			this.clinicstreet1 = pData['clinicstreet1'];
			this.clinicstreet2 = pData['clinicstreet2'];
			this.cliniccity = pData['cliniccity'];
			this.clinicstate = pData['clinicstate'];
			this.cliniczip = pData['cliniczip'];
			this.clinicphone = pData['clinicphone'];
			this.cliniclat = pData['cliniclat'];
			this.cliniclon = pData['cliniclon'];
			
			this.vetname = pData['vetname'];
			this.vetstreet1 = pData['vetstreet1'];
			this.vetstreet2 = pData['vetstreet2'];
			this.vetstate = pData['vetstate'];
			this.vetzip = pData['vetzip'];
			this.vetphone = pData['vetphone'];
			this.clinicphone = pData['clinicphone'];
			this.vetlat = pData['vetlat'];
			this.vetlon = pData['vetlon'];

			this.emergency_dict = pData['emergency'];
			this.neighbor_dict = pData['neighbor'];

			if (this.emergency_dict != null) {
				this.emergency_name =this.emergency_dict['name'];
				this.emergency_location = this.emergency_dict['location'];
				this.emergency_homephone = this.emergency_dict['homephone'];
				this.emergency_workphone = this.emergency_dict['workphone'];
				this.emergency_cellphone= this.emergency_dict['cellphone'];
				this.emergency_note = this.emergency_dict['note'];
				this.emergency_hasKey = this.emergency_dict['haskey'];
			}

			if(this.neighbor_dict != null) {
				this.neighbor_name = this.neighbor_dict['name'];
				this.neighbor_location = this.neighbor_dict['location'];
				this.neighbor_homephone = this.neighbor_dict['homephone'];
				this.neighbor_workphone = this.neighbor_dict['workphone'];
				this.neighbor_cellphone= this.neighbor_dict['cellphone'];
				this.neighbor_note = this.neighbor_dict['note'];
				this.neighbor_hasKey = this.neighbor_dict['haskey'];
			}
		}
		parsePetInfo(pet_info) {
			if (pet_info != null) {
				let number_pets = pet_info.length;
				for (let p = 0; p < number_pets; p++) {
					let newPet = pet_info[p];
					let clientPet = new Pet(newPet);
					//console.log('new pet data: ' + newPet + ' with PET object: ' + clientPet.petName);
					this.pets.push(clientPet);
				}
			}
		}
		parseCustomFields(custom_fields) {
			this.customStuff = [];
			let keys = Object.keys(custom_fields);
			let re = new RegExp('(custom[0-9]+)');

			keys.forEach((customField)=> {
				let regexMatch = re.exec(customField);
				if(regexMatch != null) {
					let customDic = custom_fields[customField];
					let keyCustom = customDic['label'];
					let keyVal = customDic['value'];
					let customObj = new CustomField(keyCustom, keyVal);
					this.customStuff.push(customObj);
				}
			});
		}
	}
	class CustomField {
		constructor(customKey, customVal) {

			this.customKey = customKey;
			this.customVal  = customVal;

		}
	}
	class Pet {
		constructor(pet_data) {
			this.petID = pet_data['petid'];
			this.petName = pet_data['name'];
			this.petType = pet_data['type'];
			this.age = pet_data['birthday'];
			this.breed = pet_data['breed'];
			this.gender = pet_data['sex'];
			this.petColor = pet_data['color'];
			this.fixed = pet_data['fixed'];
			this.description = pet_data['description'];
			this.notes = pet_data['name'];
			this.customPetFields = [];

			let pet_keys = Object.keys(pet_data);
			let re = new RegExp('(custom[0-9]+)');

			pet_keys.forEach((field)=> {
				let regexMatch = re.exec(field);
				if(regexMatch != null) {
					let customDic = pet_data[field];
					let keyCustom = customDic['label'];
					let keyVal = customDic['value'];
					let customObj = new CustomField(keyCustom, keyVal);
					this.customPetFields.push(customObj);
				}
			});				
		}
	}
	class Visit {
		constructor(visitDictionary) {
			this.appointmentid = visitDictionary['appointmentid'];
			this.date = visitDictionary['date'];     						// YYYY-MM-DD
			let jsDate = new Date(this.date);
			this.dayWeek = jsDate.getDay();
			this.dateNum = jsDate.getDate();
			this.jsMonth = jsDate.getMonth();
			//console.log('ORIGINAL DATE: ' + this.date + '  as follows.  DAY WEEK: ' + this.dayWeek + ', DATE NUM: ' + this.dateNum + ' MONTH: ' + this.jsMonth);

			this.pendingState = parseInt(visitDictionary['pendingchange']);
			//console.log(this.pendingState);
			if(this.pendingState != null) {
				this.pendingType = visitDictionary['pendingchangetype'];
			}
			this.sitterID = visitDictionary['providerptr'];
			this.status = visitDictionary['status'];						// completed, INCOMPLETE,  arrived, canceled
			this.service = visitDictionary['servicelabel'];
			this.service_code = visitDictionary['servicecode'];
			this.packageType = visitDictionary['packagetype'];
			this.time_window_start = visitDictionary['starttime'];		// HH:MM:SS
			this.time_window_end = visitDictionary['endtime'];		// HH:MM:SS
			this.timeOfDay = visitDictionary['timeofday'];
			this.visitHours = visitDictionary['hours'];
			this.formattedHours = visitDictionary['formattedhours'];
			this.visitNote = visitDictionary['note'];
			this.charge = parseFloat(visitDictionary['charge']);
			this.surchargeAmount = parseFloat(0);
			this.isSurchargable = true;

			if (visitDictionary['status'] == 'completed') {
				
				this.arrived = visitDictionary['arrived'];
				let arriveDate = new Date(this.arrived);
				let hours = arriveDate.getHours();
				let minutes = arriveDate.getMinutes();
				this.arrival_time  = hours + ':' + minutes;

				this.completed = visitDictionary['completed'];
				let completeDate = new Date(this.completed);
				let cHours = completeDate.getHours();
				let cMinutes = completeDate.getMinutes();
				this.completion_time = cHours + ':' + cMinutes; // YYYY-MM-DD HH:MM:SS
				this.visitReport = visitDictionary['visitreport'];
				this.visitReportStatus = visitDictionary['visitreportstatus'];
				if(this.visitReportStatus != null) {
					this.visitReportURLInfo = this.visitReportStatus.url;
					this.visitReportReceived = this.visitReportStatus.received;
					this.visitReportPhoto = this.visitReportStatus.photo;
					//getVisitReport(this.visitReportURLInfo, this.appointmentid);
				}
			}		

			this.fullDate = new Date(this.date + ' ' + this.time_window_start);

			if (visitDictionary['adjustment'] != null) {
				this.adjustment = parseFloat(adjust_amt);
			} else {
				this.adjustment = parseFloat(0);
			}	
			if (visitDictionary['tax'] != null) {
				this.tax = parseFloat(visitDictionary['tax']);
			} else {
				this.tax = parseFloat(0);
			}
		}

		mergeSitterVisitInfo(sitter_visit_dict) {
			this.clientptr = sitter_visit_dict['clientptr'];
			this.clientname = sitter_visit_dict['clientname'];
		}
		updateStatus(status) {
			this.status = status;
		}
		checkSurcharge(sur_list) {
			let num_sur = sur_list.length;
			for (let sitem = 0; sitem < num_sur; sitem++) {
				let  surchargeObj = sur_list[sitem];
				if (this.date == surchargeObj.surchargeDate) {
					this.surchargeAmount = 10;
					this.isSurchargable = true;
				}
			}
		}
		calculateTotalCharges() {
			let totalVisitCharges = parseFloat(this.charge);
			if (this.adjustment != null) {
				let intAdj = parseFloat(this.adjustment);
				totalVisitCharges += intAdj;
			}
			if (this.tax != null) {
				let intTax = parseFloat(this.tax)
				totalVisitCharges += intTax;
			}
			if (this.surchargeAmount != null) {
				let intSur = parseFloat(this.surchargeAmount);
				totalVisitCharges += intSur;
			}

			return this.totalVisitCharges;
		}
		addVisitReportDetails(visitReportInfo) {
			this.visitPhotoURL = visitReportInfo['VISITPHOTOURL'];
			console.log(this.visitPhotoURL);
			this.mapImageURL = visitReportInfo['MAPROUTEURL'];
			this.visitReportNote = visitReportInfo['NOTE'];
			this.iconButtons = visitReportInfo['MOODBUTTONS'];
			this.visitReportPets = visitReportInfo['PETS'];
		}
	};
	class ServiceItem {
		constructor(serviceDictionary) {
			this.serviceName = serviceDictionary['label'];
			this.serviceCode = serviceDictionary['servicetypeid'];
			this.serviceCharge = serviceDictionary['charge'];
			this.serviceDescription = serviceDictionary['description'];
			this.serviceTax = serviceDictionary['taxrate'];
			this.extraPetCharge = serviceDictionary['extrapetcharge'];
			//this.serviceHours = serviceDictionary['hours'];
			//this.serviceFormattedHours = serviceFormattedHours;
		}
	};
	class TimeWindowItem {
		constructor(timeWindowDict, index) {
			this.twLabel = timeWindowDict['label'];
			this.begin = timeWindowDict['start'];
			this.endTW = timeWindowDict['end'];
			this.indexVal = index;
		}
	};
	class SurchargeItem {
		constructor(surchargeDictionary) {
			
			this.surchargeTypeID = surchargeDictionary['surchargetypeid'];
			this.surchargeLabel = surchargeDictionary['label'];
			this.description = surchargeDictionary['description'];
			this.surchargeDate = surchargeDictionary['date'];
			this.surchargeType = surchargeDictionary['type'];
			this.charge = surchargeDictionary['charge'];
			this.surchargeAutomatic = surchargeDictionary['automatic'];
			this.perVisit = surchargeDictionary['pervisit'];


			if (this.surchargeType == 'weekend') {

				this.saturdayBool = surchargeDictionary['saturday'];
				this.sundayBool = surchargeDictionary['sunday'];
				console.log('WEEKEND surcharge with Saturday: ' + this.saturdayBool + ', Sunday: ' + this.sundayBool + '  surcharge amt --> ' + this.charge);


			} else if (this.surchargeType == 'after') {

				this.afterTime = surchargeDictionary['time'];
				console.log('AFTER: ' + 	this.afterTime + ' --> ' + this.charge);

			} else if (this.surchargeType == 'before') {

				this.beforeTime = surchargeDictionary['time']
				console.log('BEFORE value: ' + this.beforeTime + ' --> ' + this.charge);

			} 

		}
	};

	return {
		getVisitList : getVisitList,
		getServices : getServices,
		getSurcharges : getSurcharges,
		getTimeWindows : getTimeWindows,
		//getClientProfileInfo : getClientProfileInfo,
		getClientProfileAjax : getClientProfileAjax,
		getPOPheaderInfo : getPOPheaderInfo,
		getVisitReport : getVisitReport,
		sendCancelVisitRequest : sendCancelVisitRequest,
		sendUncancelRequest : sendUncancelRequest,
		sendChangeVisitRequest : sendChangeVisitRequest,
		sendRequestSchedule : sendRequestSchedule,
		loginPetOwnerPortalAjax :loginPetOwnerPortalAjax,
		getPetOwnerVisitsAjax : getPetOwnerVisitsAjax,
		checkClient : checkClient,
		loginPetOwnerPortalAjaxTED : loginPetOwnerPortalAjaxTED
	}
	module.exports = {
		visit_list : visit_list,
		listServices : listServices,
		surcharge_list : surcharge_list,
		time_windows_list : time_windows_list,
		petOwnerAndPets : petOwnerAndPets,
		Visit : Visit,
		PetOwner : PetOwner,
		Pet: Pet,
		ServiceItem : ServiceItem,
		SurchargeItem : SurchargeItem,
		TimeWindowItem : TimeWindowItem
	}
} ());