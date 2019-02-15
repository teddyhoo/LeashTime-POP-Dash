var LTMGR = (function() {
	
	"use strict";


	var sitterList = [];
	var visitList = []; 
	var allClients = [];
	var matrixDistance = [];
	var sitterDistanceData = [];
	var vrList = [];
	var vrListDic = {};
	var vrDetailDict = {};
	var session_cookie;


	class VisitReportVisitDetails {
		constructor(visitListItemDictionary) {
			this.visitID = visitListItemDictionary['appointmentid'];
			this.visitDate = visitListItemDictionary['visitdate'];
			this.visitTimeWindow = visitListItemDictionary['visittimeframe'];
			this.service =  visitListItemDictionary['service'];
			this.sitter =  visitListItemDictionary['sitter'];
			this.url =  visitListItemDictionary['url'];
			this.externalUrl =  visitListItemDictionary['externalurl'];
			this.status = visitListItemDictionary['status'];
			if (this.status == 'submitted' || this.status == 'published') {
				this.photocacheid = visitListItemDictionary['visitphotocacheid'];
				this.visitmapcacheid = visitListItemDictionary['visitmapcacheid'];
				this.reportsubmissiontype = visitListItemDictionary['reportsubmissiontype'];
				this.reportsubmissiondate = visitListItemDictionary['reportsubmissiondate'];
			} 
			if (this.status == 'published') {
				this.reportIsPublic = visitListItemDictionary['reportIsPublic'];
				this.reportIsPublicDetails = visitListItemDictionary['reportIsPublicDetails'];
				this.reportPublishedDate = visitListItemDictionary['reportPublishedDatePretty'];
				this.reportPublishedTime = visitListItemDictionary['reportPublishedTime'];
			} 
			//this.getVisitReportDetailAjax(this.externalUrl);
		}

		addVisitDetail(visitDictionary) {

			let visitReportKeys = Object.keys(visitDictionary);
			visitReportKeys.forEach((key) => {
				//console.log(key + ' ' + visitDictionary[key]);
				if (key == 'MOODBUTTON') {
					let moodButtonDic = visitDictionary[key]
					let moodKeys = Object.keys(moodButtonDic);
					moodKeys.forEach((key) => { 
						//console.log(key + ' ' +moodButtonDic[key]);
					})
				}
			})
			this.BIZNAME = visitDictionary['BIZNAME'];
		    this.BIZSHORTNAME = visitDictionary['BIZSHORTNAME'];
		    this.BIZEMAIL = visitDictionary['BIZEMAIL'];
		    this.BIZHOMEPAGE = visitDictionary['BIZHOMEPAGE'];
		    this.BIZADDRESS1 = visitDictionary['BIZADDRESS1'];
		    this.BIZADDRESS2 = visitDictionary['BIZADDRESS2'];
		    this.BIZCITY = visitDictionary['BIZCITY'];
		    this.BIZSTATE = visitDictionary['BIZSTATE'];
		    this.BIZZIP = visitDictionary['BIZZIP'];
		    this.BIZLOGINPAGE = visitDictionary['BIZLOGINPAGE'];
		    this.CLIENTID = visitDictionary['CLIENTID'];
		    this.CLIENTFNAME = visitDictionary['CLIENTFNAME'];
		    this.CLIENTLNAME = visitDictionary['CLIENTLNAME'];
		    this.PETOWNER = this.CLIENTFNAME + ' ' + this.CLIENTLNAME;
		    let arriveRaw = visitDictionary['ARRIVED']; //yyyy-mm-dd hh:mm:ss
		    let completeRaw = visitDictionary['COMPLETED'];
		    console.log('Arrive raw: ' + arriveRaw + ' Complete raw: ' + completeRaw);
		    let reArrComp =/[0-9]+:[0-9]+/;
		    let re=/[0-9]+-[0-9]+-[0-9]+/;
		    this.ARRIVED = arriveRaw; //reArrComp.exec(arriveRaw);
		    this.COMPLETED = completeRaw; //reArrComp.exec(completeRaw);
		    this.vrdate =re.exec(arriveRaw);
		    this.NOTE = visitDictionary['NOTE'];
		    this.PETS = visitDictionary['PETS'];
		    this.MAPROUTEURL = visitDictionary['MAPROUTEURL'];
		    this.MAPROUTENUGGETURL = visitDictionary['MAPROUTENUGGETURL'];
		    this.VISITPHOTOURL = visitDictionary['VISITPHOTOURL'];
		    this.VISITPHOTONUGGETURL = visitDictionary['VISITPHOTONUGGETURL'];
		    this.moodButtons = visitDictionary['MOODBUTTON'];
		    //console.log(moodButtons);
		    this.serviceLabel = 'Service';


		}	
	}
	class VisitReportListItem {
		constructor(visitListItemDictionary) {
			//console.log('VISIT INFO: ' + visitListItemDictionary['appointmentid']);

			this.visitID = visitListItemDictionary['appointmentid'];
			this.visitDate = visitListItemDictionary['visitdate'];
			this.visitTimeWindow = visitListItemDictionary['visittimeframe'];
			this.service =  visitListItemDictionary['service'];
			this.sitter =  visitListItemDictionary['sitter'];
			this.dateReport  =  visitListItemDictionary['date'];
			this.url =  visitListItemDictionary['url'];
			this.externalUrl =  visitListItemDictionary['externalurl'];
			this.status = visitListItemDictionary['status'];
			if (this.status == 'submitted' || this.status == 'published') {
				this.photocacheid = visitListItemDictionary['visitphotocacheid'];
				this.visitmapcacheid = visitListItemDictionary['visitmapcacheid'];
				this.reportsubmissiontype = visitListItemDictionary['reportsubmissiontype'];
				this.reportsubmissiondate = visitListItemDictionary['reportsubmissiondate'];
			} 
			if (this.status == 'published') {
				this.reportIsPublic = visitListItemDictionary['reportIsPublic'];
				this.reportIsPublicDetails = visitListItemDictionary['reportIsPublicDetails'];
				this.reportPublishedDate = visitListItemDictionary['reportPublishedDatePretty'];
				this.reportPublishedTime = visitListItemDictionary['reportPublishedTime'];
			} 
		}
	};
	class VisitReport {
		constructor(visitDictionary) {
			this.BIZNAME = visitDictionary['BIZNAME'];
		    this.BIZSHORTNAME = visitDictionary['BIZSHORTNAME'];
		    this.BIZEMAIL = visitDictionary['BIZEMAIL'];
		    this.BIZHOMEPAGE = visitDictionary['BIZHOMEPAGE'];
		    this.BIZADDRESS1 = visitDictionary['BIZADDRESS1'];
		    this.BIZADDRESS2 = visitDictionary['BIZADDRESS2'];
		    this.BIZCITY = visitDictionary['BIZCITY'];
		    this.BIZSTATE = visitDictionary['BIZSTATE'];
		    this.BIZZIP = visitDictionary['BIZZIP'];
		    this.BIZLOGINPAGE = visitDictionary['BIZLOGINPAGE'];
		    this.CLIENTID = visitDictionary['CLIENTID'];
		    this.CLIENTFNAME = visitDictionary['CLIENTFNAME'];
		    this.CLIENTLNAME = visitDictionary['CLIENTLNAME'];
		    this.PETOWNER = this.CLIENTFNAME + ' ' + this.CLIENTLNAME;
		    let arriveRaw = visitDictionary['ARRIVED']; //yyyy-mm-dd hh:mm:ss
		    let completeRaw = visitDictionary['COMPLETED'];
		    let reArrComp =/[0-9]+:[0-9]+/;
		    let re=/[0-9]+-[0-9]+-[0-9]+/;
		    this.ARRIVED = reArrComp.exec(arriveRaw);
		    this.COMPLETED = reArrComp.exec(completeRaw);
		    this.vrdate =re.exec(arriveRaw);
		    this.NOTE = visitDictionary['NOTE'];
		    this.PETS = visitDictionary['PETS'];
		    this.MAPROUTEURL = visitDictionary['MAPROUTEURL'];
		    this.MAPROUTENUGGETURL = visitDictionary['MAPROUTENUGGETURL'];
		    this.VISITPHOTOURL = visitDictionary['VISITPHOTOURL'];
		    this.VISITPHOTONUGGETURL = visitDictionary['VISITPHOTONUGGETURL'];
		    this.moodButtons = visitDictionary['MOODBUTTON'];
		    console.log(moodButtons);
		    this.sitterDict = visitDictionary['SITTER'];

		    if (this.sitterDict.none == true) {
		      this.SITTER = this.BIZSHORTNAME;
		    } else {
		      this.SITTER = sitterDict.sittername;
		    }

		    this.serviceLabel = 'Service';
		}
	};
	class DistanceMatrixPair {
		constructor(beginCoordinate, endCoordinate, beginName, endName, distance, duration) {
			this.beginCoordinate = beginCoordinate;
			this.endCoordinate = endCoordinate;

			this.beginName = beginName;
			this.endName = endName;
			this.distance = distance;
			this.duration = duration;
		}
		getDistance() {
		}
		getDuration() {
		}
		getLatLon(forName) {
		}
		getName(forLatLon) {
		}
	};
	class SitterProfile {
		constructor(sitterInfo) {
			let sitterKeys = Object.keys(sitterInfo);
			
			this.sitterID = sitterInfo.providerid;
			this.sitterName = sitterInfo.sitter;
			this.fName = sitterInfo.fname;
			this.lName = sitterInfo.lname;
			this.status = sitterInfo.active;
			this.street1 = sitterInfo.street1;
			this.city = sitterInfo.city;
			this.state = sitterInfo.state;
			this.zip = sitterInfo.zip;
			this.sitterLat = sitterInfo.lat;
			this.sitterLon = sitterInfo.lon;
			this.showVisits = true;
			this.distanceTable = [] 
			/* 
				{
					date.  -> YYYY-MM-DD
					start   -> coordinate[]
					end.    -> coordinate[]
					duration
					distance

				}
			*/
		}

		saveSitterDistanceTable() {

		}

		addDistanceTable(waypointInfo) {

		}

		getSitterDistanceTable() {

			return distanceTable;
		}

		calculateTotalMileage(startDate, endDate) {

		}

		calculateTotalDurationDriving (startDate, endDate) {

		}
	};
	class SitterVisit {
		constructor(visitInfo) {

			this.visitID = visitInfo.appointmentid;
			this.status = visitInfo.status;
			this.service = visitInfo.service;

            let re = new RegExp('[0-9]+:[0-9]+');

			// YYYY-MM-DD hh:mm:ss
			if (visitInfo.arrived != null){
				let arriveTime = re.exec(visitInfo.arrived);
				let standardTime = moment(arriveTime, 'HH:mm:ss').format('h:mm A');
				this.arrived = standardTime; 
			}
			if (visitInfo.completed != null) {
				let completeTime = re.exec(visitInfo.completed);
				let standardTime = moment(completeTime, 'HH:mm:ss').format('h:mm A');
				this.completed = standardTime;
			}
			this.starttime = visitInfo.starttime;
			this.endtime = visitInfo.endtime;

			this.sitterID = visitInfo.providerptr;
			this.sitterName = visitInfo.sitter;
			
			this.lat = visitInfo.lat;
			this.lon = visitInfo.lon;
			this.pets = visitInfo.pets;
			this.clientID = visitInfo.clientptr;
			this.clientName = visitInfo.clientname;
			this.timeOfDay = visitInfo.timeofday;
			this.visitNote = visitInfo.note;
		}
	};
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
	};
	class PetOwnerProfile {
		constructor(clientProfileInfo) {
			this.customFields = [];
			this.petImages = [];
			this.pets = [];

			this.client_id = clientProfileInfo['clientid'];
			this.petOwnerName = clientProfileInfo['clientname'];
			this.lname = clientProfileInfo['lname'];
			this.fname = clientProfileInfo['fname'];
			this.fname2 = clientProfileInfo['fname2'];
			this.lname2 = clientProfileInfo['lname2'];
			this.street1 = clientProfileInfo['street1'];
			this.street2 = clientProfileInfo['street2'];
			this.city = clientProfileInfo['city'];
			this.state = clientProfileInfo['state'];
			this.zip = clientProfileInfo['zip'];

			this.email = clientProfileInfo['email'];
			this.email2 = clientProfileInfo['email2'];

			this.cellphone = clientProfileInfo['cellphone'];
			this.cellphone2 = clientProfileInfo['cellphone2'];
			this.workphone = clientProfileInfo['workphone'];
			this.homephone = clientProfileInfo['homephone'];

			this.garagegatecode = clientProfileInfo['garagegatecode'];
			this.alarmcompany = clientProfileInfo['alarmcompany'];
			this.alarminfo = clientProfileInfo['alarminfo'];

			this.clinicptr = clientProfileInfo['clinicptr'];
			this.vetptr = clientProfileInfo['vetptr'];
			this.notes = clientProfileInfo['cellphone'];
			this.leashloc = clientProfileInfo['leashloc'];
			this.directions = clientProfileInfo['directions'];
			this.parkinginfo = clientProfileInfo['parkinginfo'];
			this.foodloc = clientProfileInfo['foodloc'];
			this.nokeyrequired = clientProfileInfo['nokeyrequired'];
			this.keyid = clientProfileInfo['keyid'];

			this.keydescription = clientProfileInfo['keydescription'];

			this.lat = clientProfileInfo['lat'];
			this.lon = clientProfileInfo['lon'];

			this.showkeydescriptionnotkeyid = clientProfileInfo['showkeydescriptionnotkeyid'];
			
			this.clinicname = clientProfileInfo['clinicname'];
			this.clinicstreet1 = clientProfileInfo['clinicstreet1'];
			this.clinicstreet2 = clientProfileInfo['clinicstreet2'];
			this.cliniccity = clientProfileInfo['cliniccity'];
			this.clinicstate = clientProfileInfo['clinicstate'];
			this.cliniczip = clientProfileInfo['cliniczip'];
			this.clinicphone = clientProfileInfo['clinicphone'];
			this.cliniclat = clientProfileInfo['cliniclat'];
			this.cliniclon = clientProfileInfo['cliniclon'];
			
			this.vetname = clientProfileInfo['vetname'];
			this.vetstreet1 = clientProfileInfo['vetstreet1'];
			this.vetstreet2 = clientProfileInfo['vetstreet2'];
			this.vetstate = clientProfileInfo['vetstate'];
			this.vetzip = clientProfileInfo['vetzip'];
			this.vetphone = clientProfileInfo['vetphone'];
			this.clinicphone = clientProfileInfo['clinicphone'];
			this.vetlat = clientProfileInfo['vetlat'];
			this.vetlon = clientProfileInfo['vetlon'];

			if (clientProfileInfo['emergency'] != null) {
				this.emergency_dict = clientProfileInfo['emergency'];
				this.emergency_name =this.emergency_dict['name'];
				this.emergency_location = this.emergency_dict['location'];
				this.emergency_homephone = this.emergency_dict['homephone'];
				this.emergency_workphone = this.emergency_dict['workphone'];
				this.emergency_cellphone= this.emergency_dict['cellphone'];
				this.emergency_note = this.emergency_dict['note'];
				this.emergency_hasKey = this.emergency_dict['haskey'];
			}
			if(clientProfileInfo['neighbor'] != null) {
				this.neighbor_dict = clientProfileInfo['neighbor'];
				this.neighbor_name = this.neighbor_dict['name'];
				this.neighbor_location = this.neighbor_dict['location'];
				this.neighbor_homephone = this.neighbor_dict['homephone'];
				this.neighbor_workphone = this.neighbor_dict['workphone'];
				this.neighbor_cellphone= this.neighbor_dict['cellphone'];
				this.neighbor_note = this.neighbor_dict['note'];
				this.neighbor_hasKey = this.neighbor_dict['haskey'];
			}

			this.parseCustomFields(clientProfileInfo);

			if (clientProfileInfo['pets'] != 0) {
				this.parsePetInfo(clientProfileInfo['pets']);
			}
		}
		parsePetInfo(petArr) {
			if(petArr != null) {
				let number_pets = petArr.length;
				petArr.forEach((petDict)=> {
					let clientPet = new Pet(petDict);	
					this.pets.push(clientPet);
				});
			}
			
		}
		parseCustomFields(customClient) {
			let re = new RegExp('custom[0-9]+');
			let keys = Object.keys(customClient);
			let customFieldsLocal = [];

			keys.forEach((clientKey) => { 

				if(re.exec(clientKey)) {
					let custom_dictionary = customClient[clientKey];
					let custom_key_val = {};
					if(custom_dictionary['value'] != null){
						custom_key_val[custom_dictionary['label']] = custom_dictionary['value'];
						customFieldsLocal.push(custom_key_val);
					}
				}
			});

			this.customFields = customFieldsLocal;
		}
	};

	function getVisitList() {
		return visitList;
	}
	function getVisitsBySitterID(sitterID) {
	}
	function getVisitsBySitter(sitterID) {

		let visitListForSitter = [];

		visitList.forEach((visitDetails) => {

			if (visitDetails.sitterID == sitterID) {
				visitListForSitter.push(visitDetails);
			}

		});

		return visitListForSitter;
	}
	function addDistanceMatrixPair(distanceMatrixInfo, waypoints) {

		let route_legs = distanceMatrixInfo.legs;
        let num_legs = distanceMatrixInfo.legs.length;
        let total_num_legs = num_legs;
		let total_dist_check = 0;
		let total_duration_check= 0;
		let route_index = 0;
		let total_distance = distanceMatrixInfo.distance/1000;
		total_distance = total_distance * .62137;
		let total_duration = distanceMatrixInfo.duration/60;

		console.log('route legs: ' + num_legs + ' waypoints: ' + waypoints.length);
		let matrixData = window.localStorage.getItem("distanceMatrix");
		matrixDistance = JSON.parse(matrixData);
		if (matrixDistance != null) {

			matrixDistance.forEach((matrix)=> {
				console.log('Reading matrix: ' + matrix.beginName);
			})
			//})
		} else {
			matrixDistance = [];
		}
 
		waypoints.forEach((waypointInfo)=>{
			let waypointInfoPrior;
			let startCoord;
			let endCoord;
			let startName;
			let endName;
			let distance;
			let duration;
			let durationHours;
			let convertDistance;

			if (route_index > 0) {
				console.log('Route index: ' + route_index);
				let leg = route_legs[route_index];
				endName = waypointInfo.name;
				endCoord = waypointInfo.location;
				waypointInfoPrior = waypoints[route_index-1]
				startName = waypointInfoPrior.name;
				startCoord = waypointInfoPrior.location;
				if (leg != null){
					distance = leg.distance;
					duration = leg.duration;
					durationHours = duration/60;
				 	convertDistance = (distance / 1000);
					let matrixItem = new DistanceMatrixPair(startCoord, endCoord, startName, endName, convertDistance, durationHours);
					matrixDistance.push(matrixItem);
				}
			}
			
			route_index = route_index + 1;
            num_legs = num_legs - 1;
		});
		window.localStorage.setItem("distanceMatrix", JSON.stringify(matrixDistance));
	}
	function getDistanceMatrix() {
		matrixDistance = [];
		let matrixData = window.localStorage.getItem("distanceMatrix");
		matrixDistance = JSON.parse(matrixData);
		if (matrixDistance != null) {
			matrixDistance.forEach((matrix)=> {
				//console.log('Getting from local... ' + matrix.beginName + ' ' + matrix.endName + ' (distance: ' + matrix.distance + ' miles, duration: ' + matrix.duration + ' ) ' + matrix.beginCoordinate + ' ' + matrix.endCoordinate);
			})
			return matrixDistance;
		}
		return null;
	}
	async function loginManager(username, password, role,startDate,endDate) {

		sitterList = [];
		visitList =[];
		allClients =[];

		console.log('Num sitter: ' + sitterList.length + ', Num visit: ' + visitList.length + ', Num client: ' + allClients.length);
		let url = 'http://localhost:3300?type=mmdLogin&username='+username+'&password='+password+'&role='+role+'&startDate='+startDate+'&endDate='+endDate;
		
		const response = await fetch(url);
		const myJson = await response.json();
	}
	async function getManagerData() {
		sitterList = [];
		visitList =[];
		allClients =[];

		let base_url = 'http://localhost:3300?type=gSit';		
		let response;
		try {
			response = await fetch(base_url);
			const myJson = await response.json();

			myJson.forEach((sitterProfile) => {
				let nSitterProfile = new SitterProfile(sitterProfile);
				sitterList.push(nSitterProfile);
			});
			return sitterList;
		} catch(error) {
			console.log('ERROR:' + error);
			return error;
		}
	}
	async function parseVisitReportsAjax(visitReportDict) {
		/*let visitReportInfo = new VisitReportVisitDetails(visitReportDict);
		vrList.push(visitReportInfo);*/
	}
	function parseVisitReport(visitReportDict) {
	}
	async  function getManagerVisits() {
		let base_url = 'http://localhost:3300?type=gVisit';		
		const response = await fetch(base_url);
		const myJson = await response.json();
		myJson.forEach((visit) => {
			let nVisitProfile = new SitterVisit(visit);
			let visitKeys = Object.keys(visit);
			visitKeys.forEach((key)=> {
				if (key == 'report') {
					parseVisitReport(visit[key])
				}
			})
			visitList.push(nVisitProfile);	
		});
		return visitList;
	}
	async function getManagerClients() {
		let base_url = 'http://localhost:3300?type=gClients';		
		const response = await fetch(base_url);
		const myJson = await response.json();
		myJson.forEach((client) => {
			let petOwner = new PetOwnerProfile(client);
			allClients.push(petOwner);	
		});
		return allClients;
	}
	async function managerLoginAjax(username, password, role) {
		let url = 'https://leashtime.com/mmd-login.php';
		/*const options = {
			method : 'POST',
			body : JSON.stringify({
				user_name : username,
				user_pass: password,
				expected_role : role
			}),
			credentials : 'include',
			mode : 'same-origin',
			//'credentials' : 'same-origin',
			headers : {
				'Accept': 'application/json',
				'Content-Type' : 'application/json',
				'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
			}
		};

		let response = await fetch(url, options)
		let data = response.json();
		console.log('RESPONSE CODE: ' + repsonse.status);
		return data;*/

		let url = 'https://leashtime.com/mmd-login.php';
		const options = {
			method : 'POST',
			body : JSON.stringify({
				user_name : username,
				user_pass: password,
				expected_role : role
			}),
			headers : {
				'Accept': 'application/json',
				'Content-Type' : 'application/json'
			}
		};

		let response = await fetch(url, options).then((response)=> {return response.json();});
		response.then((data)=> {
			data.json();
		})
		console.log('RESPONSE CODE: ' + response.status);
		console.log('RESPONSE data: ' + JSON.stringify(response));
	}
	async function getManagerDataAjax() {

		let url = 'https://leashtime.com/mmd-sitters.php';	
		let sitterJSON = await fetch(url).then((response)=> {return response.json();});
		console.log('sitterJSON RESPONSE FOR LIST SITTERS: ' + sitterJSON);
		sitterList = sitterJSON.sitters;
		console.log('RESPONSE FOR LIST SITTERS (stringified): ' + JSON.stringify(sitterList));
	}
		/*let url = 'https://leashtime.com/mmd-sitters.php';	
		const options = {
			method: 'POST',
			mode : 'same-origin',
			//credentials : 'same-origin',
			credentials : 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type' : 'application/json',
				'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
			}
		}

		let response = await fetch(url, options);
		let sitterJSON = response.json();
		sitterData = sitterJSON.sitters;
		console.log('RESPONSE FOR LIST SITTERS: ' + sitterData);
		return sitterData;*/	
	async function getManagerVisitsAjax(startDate, endDate) {

		let url = 'https://leashtime.com/mmd-visits.php';
		let listSitterID;
		sitterList.forEach((sitter) => {
			if(sitter.active == 1) {
				listSitterID += sitter.id + ',';
			 }
		});
		const options = {
			method: 'POST',
			body: JSON.stringify({'start_date' : startDate,'end_date' : endDate,'sitterids' : listSitterID}),
			credentials : 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type' : 'application/json',
			}
		}

		let response = await fetch(url, options);
		visitList = await response.json();
		console.log('JSON stringify: ' + JSON.stringify(visitList) );
		console.log('RESPONSE FOR VISIT REQUEST: ' + visitList);
		return visitList;
	}
	async function getManagerClientsAjax() {
		let url = 'https://leashtime.com/mmd-clients.php';
		let listClientID;
		visitList.forEach((visitItem)=> {
			clientIDlist += visitItem.clientptr + ',';
		});

		const options = {
			method : 'POST',
			body : JSON.stringify({'clientids':clientIDlist}),
			credentials : 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type' : 'application/json',
			}
		}

		let response = await fetch(url,options);
		let clientData = await response.json();
		clientList = clientData.clients;
		console.log('CLIENT DATA: ' + clientList);
	}
	async function getVisitReportListAjax(clientID, startDate, endDate, visitID) {
	}
	async function getVisitReportList(clientID, startDate, endDate, visitID) {

		console.log('client id: ' + clientID + ' start date: ' + startDate + ' end date: ' + endDate + ' visitID: ' + visitID);
		let url = 'http://localhost:3300?type=visitReportList&clientID='+clientID+'&startDate='+startDate+'&endDate='+endDate;
		let vrListRequest = await fetch(url);
		let vrListJson = await vrListRequest.json();
		if (vrListJson['visitReport'] == 'none') {
			console.log('Returning none');
			return vrListJson;
		} else {
			if(vrListJson != null ) {
				vrListJson.forEach((vrItem) => {
					let vrListItem = new VisitReportListItem(vrItem);
					let visitReportItem = new VisitReportVisitDetails(vrItem);
					vrList.push(visitReportItem);
					let vrApptID = vrItem.appointmentid;
					let vrExtUrl = vrItem.externalurl;
					vrListDic[vrApptID] = vrExtUrl;
					if (vrItem['appointmentid'] == visitID) {
						if (vrItem.externalurl != null) {
							const detailedVisitReport = async () => {
								let vDetail = await getVisitReport(visitReportItem.externalUrl);
								return vDetail;
							}
							detailedVisitReport()
							.then((report)=> {
								visitReportItem.addVisitDetail(report);
								vrList.push(report)
							})
						}
					} else {
						return {'noreport' : 'true'};
					}
				});
				return vrList;
			} else {
				return null;
			}

				//return JSON.stringify(vrListJson);

				/*vrListJson.forEach((vrItem) => {
					if (vrItem['appointmentid'] == visitID) {

						let visitReportItem = new VisitReportVisitDetails(vrItem);

						if (vrItem.externalurl != null) {

							let detailedVisitReport = getVisitReport(visitReportItem.externalUrl);
							visitReportItem.addVisitDetail(detailedVisitReport);
							return ({'report' : visitReportItem});
							return visitReportItem;
						}
					}
				});*/
		}
	}
	async function getVisitReport(visitID) {
			let url = 'http://localhost:3300?type=visitReport&getURL='+visitID;
			let vrDetailResponse = await fetch(url);
			let vrDetailJson  = await vrDetailResponse.json();
			vrDetailDict[visitID] = vrDetailJson;
			return vrDetailJson;	
	}

	return {

		getVisitList : getVisitList,
		loginManager : loginManager,
		getManagerData : getManagerData,
		getManagerVisits : getManagerVisits,
		getManagerClients : getManagerClients,
		getVisitsBySitterID : getVisitsBySitterID,
		getVisitsBySitter : getVisitsBySitter,
		addDistanceMatrixPair : addDistanceMatrixPair,
		getVisitReportList : getVisitReportList,
		getVisitReport : getVisitReport,
		getDistanceMatrix : getDistanceMatrix,
		managerLoginAjax : managerLoginAjax,
		getManagerDataAjax : getManagerDataAjax,
		getManagerVisitsAjax : getManagerVisitsAjax,
		getManagerClientsAjax :getManagerClientsAjax
	}

	modules.exports = {
		sitterList : sitterList,
		visitList : visitList,
		allClients : allClients,
		visitReportList : visitReportList,
		SitterVisit : SitterVisit,
		SitterProfile : SitterProfile,
		PetOwnerProfile : PetOwnerProfile,
		Pet : Pet,
		DistanceMatrixPair : DistanceMatrixPair,
		VisitReport : VisitReport,
		VisitReportListItem : VisitReportListItem,
		VisitReportVisitDetails :VisitReportVisitDetails,
		visitReportListDict : visitReportListDict
	}

} ());