var LT = (function() {

	"use strict";
	
	// ********************************************************************************************
 	// * exported arrays and pet owners and pets object
 	// ********************************************************************************************

 	var responseDictionary = {};
	var listServices = [];
	var surcharge_list= [];
	var visit_list = [];
	var time_windows_list= [];
	var petOwnerAndPets;
	var isAjax = true;
	var clientType;
	var userNameGlobal;
	var passwordGlobal;

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
			//console.log('-------VISIT ID: ' + visitDictionary['appointmentid'] + ' --------------');

			this.appointmentid = visitDictionary['appointmentid'];
			this.date = visitDictionary['date'];     						// YYYY-MM-DD
			this.pendingState = parseInt(visitDictionary['pendingchange']);
			if(this.pendingState != null) {
				this.pendingType = visitDictionary['pendingchangetype'];
				//console.log('Visit state pending: ' + this.pendingType);
			}
			this.sitterID = visitDictionary['providerptr'];
			this.status = visitDictionary['status'];						// completed, INCOMPLETE,  arrived, canceled
			this.service = visitDictionary['servicelabel'];
			this.service_code = visitDictionary['servicecode'];
			this.packageType = visitDictionary['packagetype'];
			if (this.packageType != 'ongoing') {
				//console.log('Package type: ' + this.packageType)
			}
			this.time_window_start = visitDictionary['starttime'];		// HH:MM:SS
			this.time_window_end = visitDictionary['endtime'];		// HH:MM:SS
			this.timeOfDay = visitDictionary['timeofday'];
			this.visitHours = visitDictionary['hours'];
			this.formattedHours = visitDictionary['formattedhours'];
			this.visitNote = visitDictionary['note'];
			this.charge = parseFloat(visitDictionary['charge']);
			this.surchargeAmount = parseFloat(0);
			this.isSurchargable = false;

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

				//console.log('COMPLETED VISIT: ' + this.arrival_time +' - ' + this.completion_time);

				this.visitReport = visitDictionary['visitreport'];
				this.visitReportStatus = visitDictionary['visitreportstatus'];
				if(this.visitReportStatus != null) {
					this.visitReportURLInfo = this.visitReportStatus.url;
					getVisitReport(this.visitReportURLInfo, this.appointmentid);
					this.visitReportReceived = this.visitReportStatus.received;
					this.visitReportPhoto = this.visitReportStatus.photo;
					//console.log('VISIT REPORT: ' + this.visitReportURLInfo + ' ' + ' PHOTO: ' + this.visitReportReceived);
				}
			}		

			//console.log('Date: ' + this.date + ', Start: ' + this.time_window_start + ', End: ' + this.time_window_end + ' TOD: ' + this .timeOfDay	);
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
			this.mapImageURL = visitReportInfo['MAPROUTEURL'];
			this.visitNote = visitReportInfo['NOTE'];
			this.iconButtons = visitReportInfo['MOODBUTTONS'];
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
			if (this.surchargeType == 'weekend') {
				this.saturdayBool = surchargeDictionary['saturday'];
				this.sundayBool = surchargeDictionary['sunday'];
			} else if (this.surchargeType == 'after') {
				this.afterTime = surchargeDictionary['time'];
			} else if (this.surchargeType == 'before') {
				this.beforeTime = surchargeDictionary['time']
			}
			this.charge = surchargeDictionary['charge'];
			this.surchargeAutomatic = surchargeDictionary['automatic'];
			this.perVisit = surchargeDictionary['pervisit'];
		}
	};

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
	async function loginPetOwner(event) {

		checkClient();

		if(isAjax) {
			loginPetOwnerPortalAjax(event);
		} else {
			console.log('Login pet owner portal NO AJAX');
			console.log(event.location);
			let uName = document.getElementById('username').value;
			let pWord = document.getElementById('password').value;
			let poDate = '2019-06-01';
			let endpoDate = '2019-08-31';

			let loginURL = 'http://localhost:3300?type=petOwnerLogin&username='+uName+'&password='+pWord+'&dateStart='+poDate+'&dateEnd='+endpoDate;
			let loginRequest = await fetch(loginURL).then((response)=> {
				console.log('Return response login request: ' + response.json());
				let responseKeys = Object.keys(response.json());
				responseKeys.forEach((key) => {
					console.log(key);
				});
				return response.json()
			});

			event.location = "file:///Users/edwardhooban/Desktop/LeashTime-POP-Dash/petowner/online/pop-calendar.html";
		}
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
		return visit_list;
	}	

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
	function getPets() {

		return petOwnerAndPets.pets;
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
	// PET PHOTOS
	// https://leashtime.com/pet-photo.php?id={petid}&version=display
	// parameters: petid&version=display    [if set param, 300px max dimension; else, full size]
	function getClientProfileInfo(client_dict) {
		let client_id = client_dict['clientid'];
		let pet_info;
		let petOwnerAndPets;
		recursiveGetProperty(client_dict, "pets", function(obj) {
			pet_info = obj;
			petOwnerAndPets = new PetOwner(client_id, client_dict, pet_info);
		})
		return petOwnerAndPets;
	}
	function getVisits(visitsDictionary)  {
		recursiveGetProperty(visitsDictionary, "visits", function(obj) {
			let num_visits = obj.length;
			console.log('number of visits: ' + num_visits);
			console.log(obj);
			for (let i =0; i < num_visits; i++) {
				let visit_dict = obj[i];
				console.log(visit_dict);
				const visit = new Visit(visit_dict);
				visit_list.push(visit);
			}
			for (let i =0; i < num_visits; i++) {
				let visit_item = visit_list[i];
				visit_item.checkSurcharge(surcharge_list);
			}
		});
	}
	function getSurchargeItems(surchargeDictionary) {
		recursiveGetProperty(surchargeDictionary, "surchargetypes", function(sObj) {
			let num_surcharge_items  = sObj.length;
			for (let t = 0; t < num_surcharge_items ; t++) {
				let surcharge_dict = sObj[t];
				let surchargeDicKeys = Object.keys(surcharge_dict);
				surchargeDicKeys.forEach((sKey) => {
					//if (sKey == 'type'){
						//console.log(sKey + ' ' + surcharge_dict[sKey]);
					//}
				});
				const surcharge = new SurchargeItem(surcharge_dict);
				surcharge_list.push(surcharge);
			}
		});
		return surcharge_list;
	}
	function sendCancelVisitRequest (url, visitID,  cancelNote) {
		let urlEndpoint = url+'?type=cancel&cancelVisit=1&visitid='+visitID+'&visitnote='+cancelNote;

		fetch(urlEndpoint)
		.then(
			function(response) {
				if (response.status !== 200) {
					console.log('Looks like problem. Status code: ' + response.status);
					return;
				}
				response.json().then(function(data) {
					if (data.response != null) {
						//console.log(data.response);
					}
				});
			})
		.catch(err => function(err) {
			console.log(err);
			alert("failed to fetch");
		});
	}
	function sendUncancelRequest (url, visitID,  uncancelNote) {
		let urlEndpoint = url+'?type=uncancel&cancelVisit=1&visitid='+visitID+'&visitnote='+cancelNote;

		fetch(urlEndpoint)
		.then(
			function(response) {
				if (response.status !== 200) {
					console.log('Looks like problem. Status code: ' + response.status);
					return;
				}
				response.json().then(function(data) {
					console.log(data);
				});
			}
		)
		.catch(err => function(err) {
			console.log(err);
			alert("failed to fetch");
		});
	}
	function sendChangeVisitRequest (url, visitID,  changeType,  changeNote) {
		let urlEndpoint = url+'?type=change&cancelVisit=1&visitid='+visitID+'&visitnote='+cancelNote;

		fetch(urlEndpoint)
		.then(
			function(response) {
				if (response.status !== 200) {
					console.log('Looks like problem. Status code: ' + response.status);
					return;
				}
				response.json().then(function(data) {

					console.log(data);
				});
			}
		)
		.catch(err => function(err) {
			console.log(err);
			alert("failed to fetch");
		});
	}
	async function sendRequestSchedule(visitJson) {
		let url = 'https://leashtime.com/testxx.php';
		let options = {
			'method' : 'POST',
			'headers' : {
				'accept' : 'application/json',
				'content-type' : 'application/json'
			}
		};
		let scheduleRequest = await(url, options);
		let scheduleRequestResponse = await scheduleRequest.json();

	}
	async function getVisitReport(visitReportURL, visitID) {

		//console.log(visitReportURL);
		let url = visitReportURL;
		let options = {
			'method' : 'GET',
			'headers' : {
				'accept' : 'application/json',
				'content-type' : 'application/json'
			}
		}
		let visitReportRequest = await fetch(url, options);
		let visitReportResponse = await visitReportRequest.json();
		visit_list.forEach((visit)=> {
			if (visit.appointmentid == visitID) {
				visit.addVisitReportDetails(visitReportResponse);
			}
		})
		return visitReportResponse;

	}
	function getVisitReportPhoto(visitID) {

	}
	function recursiveGetProperty(obj, lookup, callback) {
		let level_depth = 1;
		let count_level = 1;
		for (var property in obj) {
			count_level = count_level + 1;
			if (property == lookup) {
				callback(obj[property]);
			} else if(obj[property] instanceof Object) {
				level_depth = level_depth + 1;
				recursiveGetProperty(obj[property], lookup, callback);
			}
		}
	} 

	return {
		getVisits : getVisits,
		getVisitList : getVisitList,
		getServices : getServices,
		getSurcharges : getSurcharges,
		getTimeWindows : getTimeWindows,
		getPets : getPets,
		getClientProfileInfo : getClientProfileInfo,
		getClientProfileAjax : getClientProfileAjax,
		getVisitReport : getVisitReport,
		sendCancelVisitRequest : sendCancelVisitRequest,
		sendUncancelRequest : sendUncancelRequest,
		sendChangeVisitRequest : sendChangeVisitRequest,
		sendRequestSchedule : sendRequestSchedule,
		loginPetOwnerPortalAjax :loginPetOwnerPortalAjax,
		getPetOwnerVisitsAjax : getPetOwnerVisitsAjax,
		loginPetOwner : loginPetOwner,
		checkClient : checkClient
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