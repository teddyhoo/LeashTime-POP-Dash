var LT = (function() {

	"use strict";
	
	// ********************************************************************************************
 	// * exported arrays and pet owners and pets object
 	// ********************************************************************************************

	var service_list = [];
	var surcharge_list= [];
	var visit_list = [];
	var time_windows_list= [];
	var petOwnerAndPets;

	// ********************************************************************************************
	// *       CLASS OBJECTS REPRESENTING DATA COMPONENTS
	// ********************************************************************************************
	class PetOwner {
		constructor(client_id,
			pet_owner_data,
			pet_info) {

			this.client_id = client_id;
			this.petOwnerData = pet_owner_data;
			this.numberOfPets = pet_info.length;
			
			this.petImages = [];
			this.customFields = [];

			this.parsePetInfo(pet_info);
			this.parsePetOwnerData(pet_owner_data);

		}

		parsePetOwnerData(pData) {
			this.petOwnerName = pData['clientname'];
			this.lname = pData['lname'];
			this.fname = pData['fname'];
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
			this.garagegatecode = pData['garagegatecode'];
			this.alarmcompany = pData['alarmcompany'];
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

			this.emergency_name =this.emergency_dict['name'];
			this.emergency_location = this.emergency_dict['location'];
			this.emergency_homephone = this.emergency_dict['homephone'];
			this.emergency_workphone = this.emergency_dict['workphone'];
			this.emergency_cellphone= this.emergency_dict['cellphone'];
			this.emergency_note = this.emergency_dict['note'];
			this.emergency_hasKey = this.emergency_dict['haskey'];

			this.neighbor_name = this.neighbor_dict['name'];
			this.neighbor_location = this.neighbor_dict['location'];
			this.neighbor_homephone = this.neighbor_dict['homephone'];
			this.neighbor_workphone = this.neighbor_dict['workphone'];
			this.neighbor_cellphone= this.neighbor_dict['cellphone'];
			this.neighbor_note = this.neighbor_dict['note'];
			this.neighbor_hasKey = this.neighbor_dict['haskey'];
			let re = new RegExp('custom[0-9]+');
			let keys = Object.keys(pData);
			let customFieldsLocal = [];

			keys.forEach(function(clientKey) {
				if (re.exec(clientKey)) {
					let custom_dictionary = pData[clientKey];
					let custom_key_val = {};
					if (custom_dictionary['value'] != null) {
						custom_key_val[custom_dictionary['label']] = custom_dictionary['value'];
						customFieldsLocal.push(custom_key_val);
					}
				}
			})

			this.customFields = customFieldsLocal;
		}

		parsePetInfo(pet_info) {
			this.pets = [];
			let number_pets = pet_info.length;
			for (let p = 0; p < number_pets; p++) {
				let newPet = pet_info[p];
				let clientPet = new Pet(newPet);
				this.pets.push(clientPet);
			}
		}

		parseCustomFields(custom_fields) {

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
		}
	}
	class Visit {
		constructor(visitDictionary) {
			this.appointmentid = visitDictionary['appointmentid'];
			this.status = visitDictionary['status'];						// completed, INCOMPLETE,  arrived, canceled
			this.service = visitDictionary['servicelabel'];
			this.service_code = visitDictionary['servicecode'];

			this.date = visitDictionary['date'];     						// YYYY-MM-DD
			this.time_window_start = visitDictionary['starttime'];		// HH:MM:SS
			this.time_window_end = visitDictionary['endtime'];		// HH:MM:SS
			this.arrival_time = visitDictionary['arrived'];			 // YYYY-MM-DD HH:MM:SS
			this.completion_time = visitDictionary['completed']; // YYYY-MM-DD HH:MM:SS
			this.visitReport = visitDictionary['visit_report'];			// YYYY-MM-DD HH:MM:SS
			this.visitNote = visitDictionary['note'];
			this.charge = parseFloat(visitDictionary['charge']);
			this.surchargeAmount = parseFloat(0);
			this.isSurchargable = false;

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
	};
	class SitterVisit {
		constructor(visitid, lat, lon) {

		}
	}
	class ServiceItem {
		constructor(serviceItemName, serviceCode, serviceCharge, serviceHours, serviceTax, serviceFormattedHours) {

			this.serviceName = serviceItemName;
			this.serviceCode = serviceCode;
			this.serviceCharge = serviceCharge;
			this.serviceHours = serviceHours;
			this.serviceTax = serviceTax;
			this.serviceFormattedHours = serviceFormattedHours;

		}
	};
	class TimeWindowItem {
		constructor(timeWindowLabel, timeWindowBegin, timeWindowEnd,index) {
			this.label = timeWindowLabel;
			this.begin = timeWindowBegin;
			this.endTW = timeWindowEnd;
			this.indexVal = index;
		}
	}
	class SurchargeItem {

		constructor(surchargeDictionary) {
			
			this.surchargeTypeID = surchargeDictionary['surchargetypeid'];
			this.charge = surchargeDictionary['charge'];
			this.surchargeLabel = surchargeDictionary['label'];
			this.description = surchargeDictionary['description'];
			this.surchargeAutomatic = surchargeDictionary['automatic'];
			this.perVisit = surchargeDictionary['pervisit'];
			this.surchargeType = surchargeDictionary['type'];
			if (this.surchargeType == 'weekend') {
				this.saturdayBool = surchargeDictionary['saturday'];
				this.sundayBool = surchargeDictionary['sunday'];
			} else if (this.surchargeType == 'after') {
				this.afterTime = surchargeDictionary['time'];
			} else if (this.surchargeType == 'before') {
				this.beforeTime = surchargeDictionary['time']
			}
			this.surchargeDate = surchargeDictionary['date'];

		}

	}

	// ********************************************************************************************
	// *       HELPER FUNCTIONS
	// ********************************************************************************************

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
	// ***********************************************************************************
	// *                                                                                                                                           *
	// *            GET DATA ITEMS TO POPULATE THE PET OWNER PORTAL                     *
	// *            VISITS, SERVICE LIST, TIME WINDOWS, SURCHARGES                              *
	// *                                                                                                                                            *
	// ***********************************************************************************

	// Ajax calls

	// VISIT DATA FOR PARTICULAR CLIENT (LOG IN AS CLIENT ID)
	// https://leashtime.com/client-own-scheduler-data.php?
	// parameters: &timesframes=1&surchargetypes=1&servicetypes=1&start=YYYY-MM-DD &end=YYYY-MM-DD

	// CLIENT AND PET DATA FOR A PARTICULAR CLIENT
	// https://leashtime.com/client-own-profile-data.php

	// PET PHOTOS
	// https://leashtime.com/pet-photo.php?id={petid}&version=display
	// parameters: petid&version=display    [if set param, 300px max dimension; else, full size]


	function getClientProfileInfo(client_dict) {
		let clientKeys = Object.keys(client_dict);
		let client_name = client_dict['clientname'];
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
			for (let i =0; i < num_visits; i++) {
				let visit_dict = obj[i];
				const visit = new Visit(visit_dict);
				visit_list.push(visit);
			}
			for (let i =0; i < num_visits; i++) {
				let visit_item = visit_list[i];
				visit_item.checkSurcharge(surcharge_list);
			}
		});

		return visit_list;
	}
	function getServiceItems(serviceDictionary) {
		recursiveGetProperty(serviceDictionary, "servicetypes", function(sObj) {
			let num_service_items  = sObj.length;
			let service_list_obj = [];
			for (var s = 0; s < num_service_items; s++) {
				let service_dict = sObj[s];
				const service = new ServiceItem(service_dict['label'],
					service_dict['servicetypeid'],
					service_dict['charge'],
					service_dict['description'],
					service_dict['taxrate'],
					service_dict['extrapetcharge'])

				service_list.push(service);
			}
		});

		return service_list;
	}
	function getTimeWindows(timeWindowsDictionary) {
		recursiveGetProperty(timeWindowsDictionary, "timeframes", function(tWObj) {
			let num_tw_items  = tWObj.length;
			for (var s = 0; s < num_tw_items; s++) {
				let time_window_dict = tWObj[s];
				const time_window = new TimeWindowItem(time_window_dict['label'],
					time_window_dict['start'],
					time_window_dict['end'],
					s);

				time_windows_list.push(time_window);
			}
		});
		return time_windows_list;
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
	// ***********************************************************************************
	// *                                                                                                                                           *
	// *            REQUEST METHODS: SERVER CREATES NEW REQUEST                           *
	// *            QUEUE ITEMS, TO BE APPROVED BY MANAGER                                          *
	// *                                                                                                                                            *
	// ***********************************************************************************
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
	function sendRequestSingleVisit (url, serviceCode,  date,  timeWindow,  Note) {
		// Create JSON [ of {}, with each dict visit request details ]
		// Whether single visit or multiple visits, an array of dictionary items with following keys:
		//    serviceCode
		//    date
		//    timeWindow
		//    note
		//    tax
		//    surcharge
		//    charge
	}
	function sendRequestSchedule(url, visitArray) {
	}
	return {
		getVisits : getVisits,
		getServiceItems: getServiceItems,
		getTimeWindows: getTimeWindows,
		getSurchargeItems: getSurchargeItems,
		getClientProfileInfo : getClientProfileInfo,
		sendCancelVisitRequest : sendCancelVisitRequest,
		sendUncancelRequest : sendUncancelRequest,
		sendChangeVisitRequest : sendChangeVisitRequest,
		sendRequestSchedule : sendRequestSchedule,
	}
	module.exports = {
		visit_list : visit_list,
		service_list : service_list,
		surcharge_list : surcharge_list,
		time_windows_list : time_windows_list,
		Visit : Visit,
		PetOwner : PetOwner,
		Pet: Pet,
		ServiceItem : ServiceItem,
		SurchargeItem : SurchargeItem,
		TimeWindowItem : TimeWindowItem,
		SitterVisit : SitterVisit
	}
} ());