var LT = (function() {

	"use strict";

	var petOwnerAndPets;
	var businessInfo;

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

	 async function loginPetOwner(event) {

		getBrowserDetails();
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
			return response.json();
		});
		event.location = "./online/pop-calendar.html";
	}
	
	async function loginPetOwnerPortalAjaxTED(event) {

		getBrowserDetails();
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
			return response.json();
		});
		event.location = "./online/pop-calendar-TED.html";
	}
	async function loginPetOwnerPortalAjax(event) {

		getBrowserDetails();

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
			let responseDicItems = response.json();
			let responseDicKeys = Object.keys(responseDicItems);
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
		
		console.log('Number of Visits: ' + visitListResponse.visits.length);
		console.log('Pending visits: ' + visitListResponse.requestedvisits.length);

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
			console.log('----------------  PARSING PENDING VISITS   ----------------');
			parsePendingVisits(visitListResponse.requestedvisits);
			console.log('----------------  END PENDING VISITS   ----------------');

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
		businessInfo= new BizInfo(poHeaderResponse);
		return poHeaderResponse;
	}
	async function getVisitReport(visitObj) {
		let url = visitObj.visitReportURLInfo;
		if(url != null) {
			//console.log(url);
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
			//console.log(visitReportResponse);
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
					if (requestArray != null) {

						requestArray.forEach((newVisit)=> {
							let visitRequestItemKeys = Object.keys(newVisit);
							//console.log('-----NEW VISIT -----');
							visitRequestItemKeys.forEach((vvKey)=> {
								//console.log(vvKey + ' --> ' + newVisit[vvKey]);
							});
							let requestVisit = new RequestedVisit(newVisit);
							requested_visits.push(requestVisit);
						});
					}
					
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
	}
	async function sendCancelVisitRequest (cancelVisitList) {

		console.log('CANCEL VISIT LIST: ' + cancelVisitList);

		let url = "https://leashtime.com/client-own-schedule-change-json.php";
		let options = {
			'method' : 'POST',
			'headers' : {
				'accept' : 'application/json',
				'content-type' : 'application/json'
			},
			'body' : JSON.stringify(cancelVisitList)
		};		

		let cancelRequest = await fetch(url, options);
		let cancelRequestResponse = await cancelRequest.json();
	} 
	async function sendUncancelRequest (uncancelDictionary) {
		console.log('UNCANCEL REQUEST');

		let url = "https://leashtime.com/client-own-schedule-change-json.php";
		let options = {
			'method' : 'POST',
			'headers' : {
				'accept' : 'application/json',
				'content-type' : 'application/json'
			},
			'body' : JSON.stringify(uncancelDictionary)
		};		

		let uncancelRequest = await fetch(url, options);
		let uncancelRequestResponse = await uncancelRequest.json();
	}
	async function sendChangeVisitRequest (changeDictionary) {

		console.log('CHANGE VISIT REQUEST');

		let url = "https://leashtime.com/client-own-schedule-change-json.php";
		let options = {
			'method' : 'POST',
			'headers' : {
				'accept' : 'application/json',
				'content-type' : 'application/json'
			},
			'body' : JSON.stringify(changeDictionary)
		};		

		let changeRequest = await fetch(url, options);
		let changeRequestResponse = await changeRequest.json();

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
	function getRequestedVisits() {

		return requested_visits;
	}
	function getBizInfo() {

		return businessInfo;
	}
	function getBrowserDetails() {
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
			console.log(this.date);
			let jsDate = new Date(this.date);
			this.dayWeek = jsDate.getUTCDay();
			this.dateNum = jsDate.getUTCDate();
			this.jsMonth = jsDate.getUTCMonth();
			this.jsYear = jsDate.getFullYear();
			console.log('Day week: ' + this.dayWeek + ' Date: ' + this.dateNum + ' Month: ' + this.jsMonth + ' Year: ' + this.jsYear);
			this.pendingState = parseInt(visitDictionary['pendingchange']);
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
			//console.log(this.visitPhotoURL);
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
			
			/*let surchargeKeys = Object.keys(surchargeDictionary);
			surchargeKeys.forEach((key)=> {
				console.log(key + ' --> ' + surchargeDictionary[key]);
			});*/
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
				//console.log('WEEKEND surcharge with Saturday: ' + this.saturdayBool + ', Sunday: ' + this.sundayBool + '  surcharge amt --> ' + this.charge);


			} else if (this.surchargeType == 'after') {

				this.afterTime = surchargeDictionary['time'];
				//console.log('AFTER: ' + 	this.afterTime + ' --> ' + this.charge);

			} else if (this.surchargeType == 'before') {

				this.beforeTime = surchargeDictionary['time']
				console.log('BEFORE value: ' + this.beforeTime + ' --> ' + this.charge);

			} 

			/*console.log('SURCHARGE ID: ' + this.surchargeTypeID + ' LABEL: ' + this.surchargeLabel);
			console.log('----------------------------------------------------------------------');
			console.log('DESCRIPTION: ' + this.description);
			console.log('DATE: ' + this.surchargeDate + ' TYPE: ' + this.surchargeType + ' AMOUNT: ' + this.charge);*/

		}
	};
	class BizInfo {
		constructor(infoDic) {

			let successElem = infoDic.success;
			let businessElem = infoDic.business;
			let clientElem = infoDic.client;

			this.bizName = businessElem['bizName'];
			this.shortBizName = businessElem['shortBizName'];
			this.logo = businessElem['logo'];
			this.bizPhone = businessElem['bizPhone'];
			this.bizEmail = businessElem['bizEmail'];
			this.bizAddress = businessElem['bizAddress'];
			this.bizHomePage = businessElem['bizHomePage'];
			this.facebook = businessElem['facebook'];
			this.linkedinaddress = businessElem['linkedinaddress'];
			this.twitteraddress = businessElem['twitteraddress'];
			this.instagraminaddress = businessElem['instagraminaddress'];


			console.log('Business info: ' + this.bizName + ', ' + this.bizEmail);
			let succKeys = Object.keys(successElem);
			let bKeys = Object.keys(businessElem);
			let cKeys = Object.keys(clientElem);

			/*succKeys.forEach((key)=> {
				console.log('[s] ' + key + ' -> ' + successElem[key]);
			});
			bKeys.forEach((key)=> {
				console.log('[b] ' + key + ' -> ' + businessElem[key]);
			});
			cKeys.forEach((key)=> {
				console.log('[c] ' + key + ' -> ' + clientElem[key]);
			});*/
		}
	};
	class RequestedVisit {
		constructor(requestVisitInfo) {
			this.date = new Date(requestVisitInfo['date']);
			this.month = this.date.getUTCMonth()+1;
			this.dateNum = this.date.getUTCDate();
			this.timeOfDay = requestVisitInfo['timeofday'];
			this.serviceCode = requestVisitInfo['servicecode'];
			this.pets = requestVisitInfo['pets'];
			this.note = requestVisitInfo['note'];
			this.clientptr = requestVisitInfo['clientptr'];
			this.providerptr = requestVisitInfo['providerptr'];
			this.charge = requestVisitInfo['charge'];
			this.birthmark = requestVisitInfo['birthmark'];
			this.starttime = requestVisitInfo['starttime'];
			this.endtime = requestVisitInfo['endtime'];
			this.recurringPackage = requestVisitInfo['recurringpackage'];
			this.serviceLabel = requestVisitInfo['servicelabel'];
			this.clientServiceLabel = requestVisitInfo['clientservicelabel'];
			this.hours = requestVisitInfo['hours'];
			this.formattedHours = requestVisitInfo['formattedhours'];
			this.packageType = requestVisitInfo['packagetype'];

			console.log('Request Visit item: ' + this.date + ' - ' + this.timeOfDay + ' ' + this.clientServiceLabel + ' -- with birthmark -- ' + this.birthmark);
		}
	};

	return {
		getVisitList : getVisitList,
		getServices : getServices,
		getSurcharges : getSurcharges,
		getTimeWindows : getTimeWindows,
		getRequestedVisits : getRequestedVisits,
		getBizInfo : getBizInfo,
		getClientProfileAjax : getClientProfileAjax,
		getPOPheaderInfo : getPOPheaderInfo,
		getVisitReport : getVisitReport,
		sendCancelVisitRequest : sendCancelVisitRequest,
		sendUncancelRequest : sendUncancelRequest,
		sendChangeVisitRequest : sendChangeVisitRequest,
		sendRequestSchedule : sendRequestSchedule,
		loginPetOwnerPortalAjax :loginPetOwnerPortalAjax,
		loginPetOwner : loginPetOwner,
		getPetOwnerVisitsAjax : getPetOwnerVisitsAjax,
		getBrowserDetails : getBrowserDetails,
		loginPetOwnerPortalAjaxTED : loginPetOwnerPortalAjaxTED
	}
	module.exports = {
		visit_list : visit_list,
		requested_visits : requested_visits,
		listServices : listServices,
		surcharge_list : surcharge_list,
		time_windows_list : time_windows_list,
		petOwnerAndPets : petOwnerAndPets,
		businessInfo : businessInfo,
		Visit : Visit,
		PetOwner : PetOwner,
		Pet: Pet,
		ServiceItem : ServiceItem,
		SurchargeItem : SurchargeItem,
		TimeWindowItem : TimeWindowItem,
		BizInfo : BizInfo,
		VisitRequest : VisitRequest
	}
} ());