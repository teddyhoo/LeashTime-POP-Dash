const http = require('http');
const https = require('https');
const url = require('url'); 
var request = require('request');

const port = 3300;
const maxLength = 10;

const url_Base_MGR = 'https://leashtime.com';
const mmdLogin = 'mmd-login.php';
const mmdSitters = 'mmd-sitters.php';
const mmdClients = 'mmd-clients.php';
const mmdVisits = 'mmd-visits.php';
const mmdEnvironment = 'mmd-environment.php';

var currentUser = '';
var currentPass= '';
var visitList =[];
var sitterList = [];
var clientList = [];
var timeOffList = [];
var detailVisitReportList = {};


const visitData = require('./data/visit.json');
const clientData = require('./data/client.json');
var clientProfile = [];
var timeFrames = [];
var serviceTypes = [];
var surchargeTypes = [];
var clientOwnVisits = [];
var petOwnerDataRaw = {};
var cookieVal = '';

var loginUsername;
var loginPassword;
var loginRole;
var loginStartDate;
var loginEndDate;


// https://leashtime.com/client-own-scheduler-data.php?timeframes=1


http.createServer((req, res) => {
	var typeRequest = url.parse(req.url,true).query;
	var theType = typeRequest.type;

	res.writeHead(200, { 'Content-Type': 'application/json','Access-Control-Allow-Origin':'*'});
 	if (theType == 'poVisits') {
		console.log('VISIT DATA' + petOwnerDataRaw);
		res.write(JSON.stringify(petOwnerDataRaw));
		res.end();
	} else if (theType == 'poClients') {
		console.log('CLIENT DATA'+ clientData);
		res.write(JSON.stringify(clientData));
		res.end();
	} else if(theType == 'mmdLogin') {

		mgrLoginURL = url_Base_MGR +'/'+ mmdLogin;

		let username = typeRequest.username;
		let password = typeRequest.password;
		let user_role = typeRequest.role;
		let start_date = typeRequest.startDate;
		let end_date = typeRequest.endDate;

		loginUsername = username;
		loginPassword = password;
		loginRole = user_role;
		loginStartDate = start_date;
		loingEndDate = end_date;

		visitList =[];
		sitterList = [];
		clientList = [];
		timeOffList = [];
		vrList = [];

	 	var j = request.jar();
	 	request = request.defaults({jar: j});
	 	request.post({
	 			url: 'https://leashtime.com/mmd-login.php', 
	 			form: {user_name:username, user_pass:password, expected_role:user_role},
	 			headers: {
					'Content-Type' : 'application/x-www-form-urlencoded',
					'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
				}

	 	}, function(err,httpResponse,body){ 
	 		if(err != null) {
	 			console.log(err);
	 		} else {

	 			cookieVal = httpResponse.headers['set-cookie'];
	 			console.log(cookieVal);
	 			request.post({
	 				url: 'https://leashtime.com/mmd-sitters.php',
	 				headers: {
	 					'Cookie' : cookieVal,
						'Content-Type' : 'application/x-www-form-urlencoded',
						'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
	 				}
	 			}, function(err2, httpResponse2, body2) {
	 				if (err2 != null) {
	 					console.log(err2);
	 				} else {
	 					let listSitterID;
	 					sitterJSON = JSON.parse(body2);
	 					console.log(sitterJSON);
	 					sitterList = sitterJSON.sitters;
			 			sitterList.forEach((sitter) => {
							 if(sitter.active == 1) {
								listSitterID += sitter.id + ',';
							 }
			 			});
			 			console.log(sitterJSON);
						request.post({
							url: 'https://leashtime.com/mmd-visits.php',
							form: {'start' : start_date, 'end': end_date, 'sitterids':listSitterID},
							headers: {
								'Cookie': cookieVal,
								'Content-Type' : 'application/x-www-form-urlencoded',
								'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
							}
						}, function(err3,  httpResponse3, body3) {
							if (err3 != null) {
								console.log(err3);
							} else {
								listSitterID = ''
								visitList = JSON.parse(body3);
								let clientIDlist;
								visitList.forEach((visitItem)=> {
									clientIDlist += visitItem.clientptr + ',';
								})
							 	request.post({
									url: 'https://leashtime.com/mmd-clients.php',
									form: {'clientids':clientIDlist},
									headers: {
										'Cookie': cookieVal,
										'Content-Type' : 'application/x-www-form-urlencoded',
										'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
									}
								}, function(err4,  httpResponse4, body4) {
									if (err4 != null) {
										console.log(err4);
									} else {
										let allClientInfo = JSON.parse(body4);	
										console.log(allClientInfo);
										clientList = allClientInfo.clients;
								 		res.write(JSON.stringify({managerData : "ok"}));
								 		res.end();
									}
								});
							 }
						})
					}
				});
	 		}
	 	});
 	} else if (theType == "masterReportList") {
		console.log('Master report list');
		let username = loginUsername;
		let password = loginPassword;
		let user_role = loginRole;
		let start_date = typeRequest.startDate;
		let end_date = typeRequest.endDate;
		console.log('Start date: ' + typeRequest.startDate + ' End date: ' + typeRequest.endDate);
		var j = request.jar();
	 	request = request.defaults({jar: j});

	 	request.post({
			url: 'https://leashtime.com/mmd-login.php', 
			form: {user_name:username, user_pass:password, expected_role:user_role},
	 		headers: {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
			}
	 	}, function(err,httpResponse,body) { 
	 		if(err != null) {
	 			console.log(err);
	 		} else {

	 			cookieVal = httpResponse.headers['set-cookie'];
				let clientID = typeRequest.clientID;
				let start = typeRequest.startDate;
				let end = typeRequest.endDate;
				console.log('CLIENT ID: ' + clientID);
				let vrListRequest = require('request');
				let vrListJar = vrListRequest.jar();
				vrListRequest = vrListRequest.defaults({jar: vrListJar});

				let options = {
					url : 'https://leashtime.com/visit-report-list-ajax.php?start='+start+'&end='+end,
					method: 'GET',
					headers: {
						'Cookie' : cookieVal,
						'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
						'Accept' : 'application/json',
						'Accept-Charset' : 'utf-8',
						'Allow-Control' : true 
					}
				};

				vrListRequest(options,function(error, httpResponse, body) {
					console.log(body);
					if (error != null) {
						console.log('Error on the visit report list reques: ' + error);
					} else {
						let vrList = JSON.parse(body);
						console.log(vrList);
						if(vrList.error != null) {
							res.write(JSON.stringify({ "visitReport" : "none"}));				
						} else {
							if (vrList != null) {
								vrList.forEach((dict)=> {
									detailVisitReportList[dict.appointmentid] = dict.externalurl;
								})
								res.write(JSON.stringify(vrList));
							} else {
								console.log('NO visit reports from the server');
								res.write(JSON.stringify({ "visitReport" : "none"}));				
							}
						}
						
						vrListRequest = null;
						vrListJar = null;
						options = null;
					}
					res.end();
				});
			}
		});
	} else if (theType == "visitReportList") { 

		mgrLoginURL = url_Base_MGR +'/'+ mmdLogin;

		let username = loginUsername;
		let password = loginPassword;
		let user_role = loginRole;
		let start_date = typeRequest.startDate;
		let end_date = typeRequest.endDate;

		var j = request.jar();
	 	request = request.defaults({jar: j});

	 	request.post({
			url: 'https://leashtime.com/mmd-login.php', 
				form: {user_name:username, user_pass:password, expected_role:user_role},
	 			headers: {
					'Content-Type' : 'application/x-www-form-urlencoded',
					'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
				}
	 	}, function(err,httpResponse,body){ 
	 		if(err != null) {
	 			console.log(err);
	 		} else {

	 			cookieVal = httpResponse.headers['set-cookie'];
				let clientID = typeRequest.clientID;
				let start = typeRequest.startDate;
				let end = typeRequest.endDate;
				console.log('CLIENT ID: ' + clientID);
				let vrListRequest = require('request');
				let vrListJar = vrListRequest.jar();
				vrListRequest = vrListRequest.defaults({jar: vrListJar});

				let options = {
					url : 'https://leashtime.com/visit-report-list-ajax.php?clientid='+clientID+'&start='+start+'&end='+end+'&receivedonly=1',
					method: 'GET',
					headers: {
						'Cookie' : cookieVal,
						'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
						'Accept' : 'application/json',
						'Accept-Charset' : 'utf-8',
						'Allow-Control' : true 
					}
				};
				let optionsAllClients = {
					url: 'https://leashtime.com/visit-report-list-ajax.php?start=' + start + '&end=' + end + '&receivedonly=1',
					method: 'GET',
					headers: {
						'Cookie' : cookieVal,
						'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
						'Accept' : 'application/json',
						'Accept-Charset' : 'utf-8',
						'Allow-Control' : true
					}
				}

				vrListRequest(optionsAllClients,function(error, httpResponse, body) {
					if (error != null) {
						console.log('Error on the visit report list reques: ' + error);
					} else {
						let vrList = JSON.parse(body);
						if(vrList.error != null) {
							res.write(JSON.stringify({ "visitReport" : "none"}));				
						} else {
							if (vrList != null) {
								vrList.forEach((dict)=> {
									detailVisitReportList[dict.appointmentid] = dict.externalurl;
								})
								res.write(JSON.stringify(vrList));
							} else {
								console.log('NO visit reports from the server');
								res.write(JSON.stringify({ "visitReport" : "none"}));				
							}
						}
						
						vrListRequest = null;
						vrListJar = null;
						options = null;
					}
					res.end();
				});

				let options2 = {
					url : 'https://leashtime.com/visit-report-list-ajax.php?clientid='+clientID+'&start='+start+'&end='+end+'&publishedonly=1',
					method: 'GET',
					headers: {
						'Cookie' : cookieVal,
						'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
						'Accept' : 'application/json',
						'Accept-Charset' : 'utf-8',
						'Allow-Control' : true 
					}
				};
			}
		});
	} else if(theType == "visitReport") {
		console.log('VISIT REPORT DETAILS');
		let externalURLval = detailVisitReportList[typeRequest.getURL];
		console.log(typeRequest.getURL + ' ' + externalURLval);

		var vrDetailsRequest = require('request');
		//var vrDetailsJar = vrDetailsRequest.jar();
		//vrDetailsRequest = vrDetailsRequest.defaults({jar: vrDetailsJar});

		let vrDetailsOptions  =  {
			url : externalURLval,
			method: 'GET',
			headers: {
				//'Cookie' : cookieVal,
				//'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
				'Accept' : 'application/json',
				'Accept-Charset' : 'utf-8',
				'Content-Type' : 'application/json',
				'Allow-Control' : true 
			}
		};
		vrDetailsRequest(vrDetailsOptions,function(error, httpResponse, body) {
			if (error != null) {
				console.log('Error on the visit report list request');
			} else {
				console.log(body);
				let visitReportDetail = JSON.parse(body);
				let vrDetailsDict = Object.keys(visitReportDetail);
				vrDetailsDict.forEach((key) => {
					console.log(key + ' -> ' + visitReportDetail[key]);
				})
				res.write(JSON.stringify(visitReportDetail));
				vrDetailsRequest = null;
				vrDetailsJar = null;
				res.end();

			}
		}); 
	} else if(theType == 'petOwnerLogin') {

		username = typeRequest.username;
		password = typeRequest.password;
		loginStartDate = typeRequest.dateStart;
		loginEndDate = typeRequest.dateEnd;

		console.log(loginStartDate + ' ' + loginEndDate);
		let urlString = 'https://leashtime.com/pop-login.php?user_name='+username+'&user_pass='+password;

	 	var j = request.jar();
	 	request = request.defaults({jar: j});
	 	request
	 		.get(urlString)
	 		.on('response', function(response) {
	 			var petOwnerVisits = require('request');
	 			var jj = petOwnerVisits.jar();
	 			petOwnerVisits = petOwnerVisits.defaults({jar: jj});

	 			cookieVal = response.headers['set-cookie'];
	 			let clientVisitsURL = 'https://leashtime.com/client-own-scheduler-data.php?start=' +loginStartDate + '&end=' + loginEndDate + '&visits=1&servicetypes=1&surchargetypes=1&timewindows=1';
				let petOwnerVisitsOptions = {
	 				method : 'GET',
	 				url : clientVisitsURL,
	 				headers : {
						'Accept' : 'application/json',
						'Accept-Charset' : 'utf-8',
						'Content-Type' : 'application/json',
						'Allow-Control' : true,
	 					'Cookie' : cookieVal
	 				}
	 			};

	 			petOwnerVisits(petOwnerVisitsOptions,function(error,response,body) {
					if (error != null) {
						console.log('Error on the client visits request');
					} else {
						petOwnerDataRaw = JSON.parse(body);
						let keys = Object.keys(petOwnerDataRaw);
						keys.forEach((key)=> {
							console.log(key + ' --> ' + petOwnerDataRaw[key]);
						})
						res.write(JSON.stringify({ "response" : "ok"}));
						res.end();
	 				}
	 			});
	 		});
	} else if (theType == "petOwnerVisits") {

		res.write(JSON.stringify(petOwnerVisits));
		res.end();

	} else if (theType == "cancel") {

		res.write(JSON.stringify({ "response" : "ok"}));
		visitCancel(typeRequest.visitid, typeRequest.note);
		res.end();
	} else if (theType == "uncancel") {

		res.write(JSON.stringify({ "response" : "ok"}));
		visitUncancel(typeRequest.visitid, typeRequest.note);
		res.end();
	} else if (theType == "change") {

		res.write(JSON.stringify({ "response" : "ok"}));
		visitChange(typeRequest.visitid, typeRequest.note);
		res.end();
	} else if (theType == "gSit") {
		console.log('Num sitters: ' + sitterList.length);
		res.write(JSON.stringify(sitterList));
		res.end();
	} else if (theType == "gVisit") {
		res.write(JSON.stringify(visitList));
		res.end();
	} else if (theType == "gClients") {
		res.write(JSON.stringify(clientList));
		res.end();
	} else if (theType == 'getSitterList') {
	} else if (theType == 'getVisitList') {
	} else if (theType == 'getClientList') {
	}
}).listen(port);

function loginManager(urlString) {

	mgrLoginURL = url_Base_MGR +'/'+ mmdLogin;

	let username = 'dlife';
	let password = 'pass';
	let user_role = 'm';

	var j = request.jar();
	request = request.defaults({jar: j});
	request.post({
		url: 'https://leashtime.com/mmd-login.php', 
		form: {user_name:loginUsername, user_pass:loginPassword, expected_role:loginRole},
		headers: {
					'Content-Type' : 'application/x-www-form-urlencoded',
					'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
				}
	 	}, function(err,httpResponse,body){ 
	 		if(err != null) {
	 			console.log(err);
	 		} else {

	 			cookieVal = httpResponse.headers['set-cookie'];
	 		}
	 	})
}

function cleanupSession() {

	sitterList = [];
	visitList = [];
	clientList = [];
	request =require('request');
	console.log(request.headers);
}
function getVisitData(request, start, end, cookie, sitterIDs) {
	request.post({
		url: 'https://leashtime.com/mmd-visits.php',
		form: {'start' : start, 'end': end, 'sitterids':sitterIDs},
		headers: {
			'Cookie': cookie,
			'Content-Type' : 'application/x-www-form-urlencoded',
			'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
	 	}
	}, function(err3,  httpResponse3, body3) {
		if (err3 != null) {
			console.log(err3);
		} else {
			listSitterID = ''
			visitList = JSON.parse(body3);
			let clientIDlist;
			visitList.forEach((visitItem)=> {
				clientIDlist += visitItem.clientptr + ',';
			})
	 		console.log('----------------------------------------------------');
			console.log('CALLING GET CLIENT DATA: ' + clientIDlist);
		 	console.log('----------------------------------------------------');

		}
	})
}
function getClientData(request, cookie, clientIDs) {
	request.post({
		url: 'https://leashtime.com/mmd-clients.php',
		form: {'clientids':clientIDs},
		headers: {
			'Cookie': cookie,
			'Content-Type' : 'application/x-www-form-urlencoded',
			'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
		}
	}, function(err4,  httpResponse4, body4) {
		if (err4 != null) {
			console.log(err4);
		} else {
			console.log('----------------------------------------------------');
			console.log('Recevied client data response');
			let allClientInfo = JSON.parse(body4);	
			clientList = allClientInfo.clients;
			console.log('Client list num items: ' + clientList.length);
	 		console.log('----------------------------------------------------');

		}
	})
}
function getSitterList() {

	return JSON.stringify(sitterList);
}
function getFlagData() {
}
function visitCancel(appointmentid, note) {

	console.log("CANCEL VISIT REQUEST FOR: " + appointmentid);
}
function visitUncancel(appointmentid, note) {

	console.log("UNCANCEL VISIT REQUEST FOR: " + appointmentid);
}
function visitChange(appointmentid, note) {
	
	console.log("VISIT CHANGE FOR " + appointmentid);
}
function requestVisits(visitInfoArray) {

	visitInfoArray.forEach((visitDict)=> {

			let date = visitDict.date;
			let timeWindow = visitDict.timewindow;
			let serviceID = visitDict.serviceid;
			let pets = visitDict.pets;
			let note = visitDict.note;
			let isStart = visitDict.isstart;
			let isEnd = visitDict.isend;
			let visitCharge = visitDict.visitcharge;


	})
}