(function manager (document) {
        const base_url = 'https://leashtime.com';
        var fullDate;
        var username = '';
        var password = '';
        var userRole = 'm';
        var isAjax = false;

        var allVisits = [];
        var allSitters= [];
        var allClients =[];
        var visitReportList = [];

        var visitsBySitter =  {};
        var mapMarkers = [];
        var visitButtonList = [];
        var displaySitters = {};
        var trackSitterMileage = [];

        var totalVisitCount = parseInt(0);
        var totalCancelVisitCount = parseInt(0);

        var re = /([0-9]+):([0-9]+):([0-9]+)/;

        const masterVreportList = async () => {
            if(!isAjax) {
                let vReport = await LTMGR.getMasterVisitReportList(fullDate, fullDate);
                return vReport;
            }
            else {
                let vReport = await LTMGR.getMasterVisitReportListAjax(fullDate, fullDate);
                return vReport;
            }
        };
        var moodButtonMap = {
            'poo' : 'icon-mood-poo-color@3x.png',
            'pee' : 'icon-mood-pee-color@3x.png',
            'play' : 'icon-mood-play-color@3x.png',
            'bath' : 'icon-mood-bath-color@3x.png',
            'food' : 'icon-mood-food-color@3x.png',
            'groom' : 'icon-mood-groom-color@3x.png',
            'medication' : 'icon-mood-meds-color@3x.png',
            'injection' : 'icon-mood-shot-color@3x.png',
            'treat' : 'icon-mood-treat-color@3x.png',
            'water' : 'icon-mood-water-color@3x.png'
        };

        var total_miles = 0;
        var total_duration_all = 0;
        var onWhichDay = '';
        const  dayArrStr = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
        const monthsArrStr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
       
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9',
            center : ([-77.888,38.1111]),
            zoom: 9
        });
        map.on("load",()=>{
        });

        function login(loginDate) {
            console.log('Logging in');
            removeSittersFromSitterList();
            removeAllMapMarkers();
            removeVisitDivElements();

            allVisits = [];
            allSitters = [];
            allClients =[];
            visitsBySitter = [];
            mapMarkers = [];

            setupLoginSteps(loginDate, false);
        }
        async function setupLoginSteps(loginDate, isUpdate) {
            console.log('setup login steps');
            if (!isUpdate) {
                const managerLoginFetch =  loginPromise();
                await managerLoginFetch;
            }
            const sitterListAfterLogin = LTMGR.getManagerData();
            await sitterListAfterLogin.then((results)=> {
                allSitters = results;
            });
            const visitListAfterLogin = LTMGR.getManagerVisits();
            await visitListAfterLogin.then((results)=> {
                allVisits = results;
            })
            const clientsAfterLogin = LTMGR.getManagerClients();
            await clientsAfterLogin.then((results)=> {
                allClients = results;
            });

            masterVreportList()
            .then((items)=> { 
                if (items != null) {
                    items.forEach((item)=> {
                        visitReportList.push(item);
                        //console.log('visit report id: ' + item.visitID + ' with status: ' + item.status);
                    });
                    flyToFirstVisit();
                    buildSitterButtons(allVisits, allSitters);
                }
            });
        }
        async function loginPromise(loginDate) {

            if (username == '') {
                username = document.getElementById('userName').value;
            }
            if (password == '') {
                password = document.getElementById('passWord').value;
            }
            if (document.getElementById('login').innerHTML == 'LOGIN') {
                let usernameNode = document.getElementById('userName');
                usernameNode.parentNode.removeChild(usernameNode);
                let passwordNode = document.getElementById('passWord')
                passwordNode.parentNode.removeChild(passwordNode);
                document.getElementById('login').innerHTML = 'UPDATE';
            }

            if (loginDate == null) {
                fullDate = getFullDate();
            } else {
                fullDate = loginDate;
            }

            let url = 'http://localhost:3300?type=mmdLogin&username='+username+'&password='+password+'&role='+userRole+'&startDate='+fullDate+'&endDate='+fullDate;
            let loginFetchResponse;
            let response;
            try {
                loginFetchResponse = await fetch(url);
            } catch (error) {
                return error;
            }
            try {
                response = await loginFetchResponse.json();
                let additionalDaysFetch = 'http://localhost:3300?type=mmdLogin&username='+username+'&password='+password+'&role='+userRole+'&startDate='+fullDate+'&endDate='+fullDate;
                let loginFetchResponseMore;
                let responseMoreDays;
                try {
                    logloginFetchResponseMore = await fetch(url);
                } catch(error) {
                    return error;
                }
                try {
                    responseMoreDays = await loginFetchResponseMore.json();
                } catch(error) {
                    console.log('Response more error.'); 
                }

            } catch(error) {
                console.log('Response error ');
            }
        }
        function loginAjax() {
            isAjax = true;
            removeSittersFromSitterList();
            removeAllMapMarkers();
            removeVisitDivElements();

            allVisits = [];
            allSitters = [];
            allClients =[];
            visitsBySitter = [];
            mapMarkers = [];
            loginPromiseAjax();
        }
        async function loginPromiseAjax() {
            if (username == '') {
                username = document.getElementById('userName').value;
            }
            if (password == '') {
                password = document.getElementById('passWord').value;
            }
            if (document.getElementById('login').innerHTML == 'LOGIN') {
                let usernameNode = document.getElementById('userName');
                usernameNode.parentNode.removeChild(usernameNode);
                let passwordNode = document.getElementById('passWord')
                passwordNode.parentNode.removeChild(passwordNode);
                document.getElementById('login').innerHTML = 'UPDATE';
            }

            fullDate = getFullDate();

            let loginAjaxFetchResponse = await LTMGR.managerLoginAjax(username, password, userRole);
            allSitters = await LTMGR.getManagerSittersAjax();
            allVisits = await LTMGR.getManagerVisitsAjax(fullDate, fullDate);
            allClients = await LTMGR.getManagerClientsAjax();

            masterVreportList()
            .then((vItems)=> { 
                vItems.forEach((item)=> {
                    visitReportList.push(item);
                    console.log(item.visitID + ' -> ' + item.status);
                });
                buildSitterButtons(allVisits, allSitters);
                flyToFirstVisit();
            });
        }       
        function buildSitterButtons(allSitterVisits, allSittersInfo) {
            console.log('BUILD SITTER BUTTONS');

            allSitterVisits.forEach((visit)=> {

                //console.log(visit.status + ' -> ' + visit.vrStatus);
            });

            totalVisitCount = parseInt(0);
            totalCancelVisitCount = parseInt(0);
            let activeSitters = [];

            allSittersInfo.forEach((sitter)=> {
                let hasVisits = false;
                let sitterCount = parseInt(0);
                let allVisitsDone = true;

                allSitterVisits.forEach((visitDetails)=> {
                    if (sitter.sitterID == visitDetails.sitterID) {
                        hasVisits = true;
                        if (visitDetails.status == 'late' || visitDetails.status == 'future' || visitDetails.status == 'incomplete') {
                            allVisitsDone = false;
                        }
                        if (true || visitDetails.status != 'canceled') {
                            createMapMarker(visitDetails, 'marker');
                            sitterCount = sitterCount + 1;
                            totalVisitCount = totalVisitCount + 1;
                            if (visitDetails.status == 'canceled') {
                                totalCancelVisitCount = totalCancelVisitCount + 1;
                            }
                        }
                    }
                });
                if (hasVisits) {
                    createSitterMapMarker(sitter);
                    displaySitters[sitter.sitterID] = false ;
                    let sitterListDiv = document.getElementById("sitterList");

                    let sitterFilterButton = document.createElement("button");
                    sitterFilterButton.setAttribute("type", "button");
                    sitterFilterButton.setAttribute("id", sitter.sitterID);
                    sitterFilterButton.setAttribute("class", "btn btn-block");

                    if (allVisitsDone) {
                        sitterFilterButton.setAttribute("style", "background-color: Green;")
                    } else {
                        sitterFilterButton.setAttribute("style", "background-color: Tomato;")
                    }
                    activeSitters.push(sitter);
                }
            });

            activeSitters.forEach((sitter)=> {
                populateSitterAccordions(sitter,allVisits);
            });

            updateSummaryGraph(activeSitters, allSitterVisits);
        }
        function createMapMarker(visitInfo) {

            let el = document.createElement('div');
            if (visitInfo.status == 'future') {
                el.setAttribute("class","marker-visit marker-visible marker-future");
            } else if (visitInfo.status == 'arrived') {
                el.setAttribute("class","marker-visit marker-visible marker-arrived");
            } else if (visitInfo.status == 'late') {
                el.setAttribute("class","marker-visit marker-visible marker-late");
            } else if (visitInfo.status == 'completed') {
                if(visitInfo.vrStatus == 'submitted') {
                    el.setAttribute("class","marker-visit marker-visible marker-submitted");
                }  else if (visitInfo.vrStatus == 'published') {
                    el.setAttribute("class","marker-visit marker-visible marker-published");
                } else {
                    el.setAttribute("class", "marker-visit marker-visible marker-complete");
                }
            } 
            el.setAttribute("id", visitInfo.appointmentid);

            let latitude = parseFloat(visitInfo.lat);
            let longitude = parseFloat(visitInfo.lon);
            let marker = new mapboxgl.Marker(el);
            let popup = new mapboxgl.Popup({offset : 25})
            marker.setPopup(popup);

            if (latitude != null && longitude != null && latitude < 90 && latitude > -90) {

                if (latitude > 90 || latitude < -90 ) {
                    console.log("Lat error");
                } else {
                    marker.setLngLat([longitude,latitude])
                                .addTo(map);
                    mapMarkers.push(marker);
                }       
                let visitID = visitInfo.appointmentid;

                el.addEventListener("click", async function(event) {
                    let popupBasicInfo;
                    let isAvailable = false;
                    //let visitReportListItem;

                    const vrList = async () => {
                        if (!isAjax) {
                            let vReport = await LTMGR.getVisitReportList(visitInfo.clientID, fullDate, fullDate, visitInfo.visitID);
                            vrListItem = vReport['report'];
                        } else {
                            let vReport = await LTMGR.getVisitReportListAjax(visitInfo.clientID, fullDate, fullDate, visitInfo.visitID);
                            vrListItem = vReport['report'];
                        }
                        return vrListItem;
                    };
                    const vrDetailsForList = async (vrLitem) => {
                        if (!isAjax) {
                            let vReportDetailsData = await LTMGR.getVisitReport(vrLitem.visitID, vrLitem);
                            return vReportDetailsData;
                        } else {
                            let vd = await fetch(vrLitem.externalUrl);
                            let vdResponse = await vd.json();
                            console.log("vdResponse: "+JSON.stringify(vdResponse));
                            console.log("vrLitem.externalUrl: "+vrLitem.externalUrl);
                                                        
                            vrLitem.addVisitDetail(vdResponse);
                            let dic = {};
                            dic.vrDetail = vrLitem;
                            return dic;
                        }
                    };
                    vrList()
                    .then((vListItem)=> { 
                        vrDetailsForList(vListItem)
                        .then((vrDetails)=>{
                            let visitReportDicInfo = vrDetails.vrDetail;
                            visitReportListItem = vrDetails.vrDetail;
                             if (visitInfo.visitID == visitReportListItem.visitID) {
                                popupBasicInfo = createVisitReport(visitReportListItem,visitInfo.visitID);
                                popup.setHTML(popupBasicInfo);

                            }
                        });
                    });      
                });
            }
        }
        function updateSummaryGraph(activeSitterList, sittersVisits) {

            let totalVisitCount = 0;
            let lateVisitCount = 0;
            let canceledVisitCount = 0;
            let completedVisitCount =0;
            let visitReportCountSent = 0;
            let visitReportCountNeedReview = 0;

            let totalVisitBar = document.getElementById('numTotal');
            let lateVisitBar = document.getElementById('numLatePercent');
            let progLateBar = document.getElementById('progLate');
            let cancelVisitBar = document.getElementById('cancelPercent');
            let progCancelBar = document.getElementById('progCancel');
            let visitReportBar = document.getElementById('numVRpercent');
            let progVisitReportReviewBar = document.getElementById('vrReviewBar');
            let progVisitReportSentBar = document.getElementById('vrSentBar');


            let visitReportSentBar = document.getElementById('numVRsentPercent');

           activeSitterList.forEach((sitter) => {
                sittersVisits.forEach((visit)=> {
                    if(visit.sitterID == sitter.sitterID) {
                        totalVisitCount = totalVisitCount + 1;
                        if (visit.status == 'late') {
                            lateVisitCount = lateVisitCount + 1;
                        } else if(visit.status == 'canceled') {
                            canceledVisitCount = canceledVisitCount + 1;
                        }else if (visit.status == 'completed') {
                            completedVisitCount = completedVisitCount  + 1;
                            if(visit.vrStatus == 'submitted') {
                                visitReportCountNeedReview = visitReportCountNeedReview + 1;
                            } else if (visit.vrStatus == 'published') {
                                visitReportCountSent = visitReportCountSent + 1;
                            }
                        } 
                    }
                });
           });
                
            totalVisitBar.innerHTML = totalVisitCount;

            let lateByTotal = lateVisitCount / totalVisitCount;
            lateByTotal = lateByTotal * 100;
            let lateVisitFloat =  Math.floor(lateByTotal);

            progLateBar.setAttribute("style", "width: " + lateVisitFloat + "%");

            let cancelByTotal = canceledVisitCount / totalVisitCount;
            cancelByTotal = cancelByTotal * 100;
            let cancelFloat = Math.floor(cancelByTotal);

            let visitReportReviewByTotal = visitReportCountNeedReview / totalVisitCount;
            visitReportReviewByTotal = visitReportReviewByTotal * 100;
            let vReviewFloat = Math.floor(visitReportReviewByTotal);
            progVisitReportReviewBar.setAttribute("style", "width: " + vReviewFloat + "%");

            let visitReportSendByTotal = visitReportCountSent / totalVisitCount;
            visitReportSendByTotal = visitReportSendByTotal * 100;
            let vSentFloat = Math.floor(visitReportSendByTotal);
            progVisitReportSentBar.setAttribute("style","width: " + vSentFloat +"%");

            lateVisitBar.innerHTML = lateVisitFloat + '%';
            cancelVisitBar.innerHMTL = cancelFloat + '%'; //cancelFloat + '%';
            visitReportBar.innerHTML = vReviewFloat + '%';
            visitReportSentBar.innerHTML = vSentFloat + '%';
        }
        function filterAccordionByStatus(filterType, visitList) {

            let sitterListDiv = document.getElementById('visitListBySitterAccordions');
            while(sitterListDiv.firstChild) {
                sitterListDiv.removeChild(sitterListDiv.firstChild);
            }
            visitList.forEach((visit)=> {
                console.log(visit.status);
            });

            allSitters.forEach((sitter) => {

                for (let i = 0; i < visitList.length; i++) {
                    let visit = visitList[i];
                    if (visit.sitterID == sitter.sitterID) {
                        populateSitterAccordions(sitter,visitList);
                        break;
                    }
                }
            });
        }
        function filterMapViewByVisitStatus(filterStatus) {

            console.log('Filter map view by visit status: ' + filterStatus);

            mapMarkers.forEach((marker)=>{
                marker.remove();
            });

            if (visitButtonList != null) { 
                visitButtonList.forEach((button)=>{
                    if (button.parentNode != null){
                        button.parentNode.removeChild(button);
                    }
                });

            }

            let visitFilterArray = [];

            allVisits.forEach((visitDetails)=> {
                let visitStatus = visitDetails.status;

                if (filterStatus == visitDetails.status) {
                    visitFilterArray.push(visitDetails);
                } 
                if (visitDetails.status == 'completed') {
                    if (visitDetails.visitReportStatus == filterStatus) {
                        visitFilterArray.push(visitDetails);
                    } 
                }
            });
            visitFilterArray.forEach((visit) => {
                createMapMarker(visit,'marker');
            });

            filterAccordionByStatus(filterStatus, visitFilterArray);
        }

        function createVisitReport(visitDictionary, visitID) {
            let dateReport;
            let timeReport;
            let submittedDate;
            let submittedTime;

            //console.log(visitDictionary.status);

            let popupBasicInfo = `<div class="card card-bordered style-primary" id="popupMain">
                                    <div class="card-head">
                                        <div class="tools">
                                            <div class="btn-group">
                                                <a class="btn btn-icon-toggle btn-refresh"><i class="md md-refresh"></i></a>
                                                <a class="btn btn-icon-toggle btn-collapse"><i class="fa fa-angle-down"></i></a>
                                                <a class="btn btn-icon-toggle btn-close"><i class="md md-close"></i></a>
                                            </div>
                                        </div>
                                        <header class="">${visitDictionary.service}</header>`;


            let arrivedTime = visitDictionary.ARRIVED;
            let completedTime = visitDictionary.COMPLETED;

            let arriveTime;
            let completeTime;

            if (arrivedTime != null) {
                let timeArrive = re.exec(arrivedTime);
                arriveTime = timeArrive[1] + ':' + timeArrive[2];
            }
            if (completedTime != null) {
                let timeComplete = re.exec(completedTime);        
                completeTime = timeComplete[1] + ':' + timeComplete[2];
            }
            let onMood;

            if (visitDictionary.moodButtons != null) {
                let moodKeys = Object.keys(visitDictionary.moodButtons);
                moodKeys.forEach((key)=> {
                    //console.log(key);
                })
                onMood = moodKeys.filter(function(key) {
                    return visitDictionary.moodButtons[key] == 1;
                });
                popupBasicInfo += `<div>
                                            ${onMood.map((mood)=>{
                                                return "<img src=./assets/img/"+moodButtonMap[mood]+" width=36 height=36>"
                                            })}
                                        </div>`
            } else {
                console.log('Mood buttons is null');
            }
            popupBasicInfo += `<div>`;

            if (visitDictionary.VISITPHOTONUGGETURL != null) {
                //popupBasicInfo += `<span><img src=${visitDictionary.VISITPHOTONUGGETURL}id="popupPhoto" width = 160 height = 160></span>`;
                popupBasicInfo += `<span><img async src=${visitDictionary.VISITPHOTONUGGETURL} id="popupPhoto" width = 160 height = 160></span>`;
            } else {
                if(visitDictionary.COMPLETED != null) {
                    popupBasicInfo += `<span><img src="./assets/img/leashtime-logo-big@3x.png" id="popupPhoto" width = 160 height = 160></span>`;
                }
            }
            if (visitDictionary.MAPROUTENUGGETURL != null) {
                //popupBasicInfo += ` &nbsp&nbsp <span><img src=${visitDictionary.MAPROUTENUGGETURL} width = 160 height = 160></span>`;
                popupBasicInfo += ` &nbsp&nbsp <span><img async src=${visitDictionary.MAPROUTENUGGETURL} width = 160 height = 160></span>`;

            } else {

            }
            popupBasicInfo += `</div>
                                        <div class="card-body p-t-0">
                                        </div>
                                    </div>
                                    <div class="card-body p-t-0">`;

            if(visitDictionary.ARRIVED != null && visitDictionary.COMPLETED != null) {

                popupBasicInfo += `<p><span class="text-default">ARRIVED: ${arriveTime} &nbsp &nbsp COMPLETE:  ${completeTime}</span></p>`;
             
             } else if (visitDictionary.ARRIVED != null && visitDictionary.COMPLETE == null) {
                
                popupBasicInfo += `<p><span class="text-default">ARRIVED: ${arriveTime} &nbsp &nbsp IN PROGRESS</span></p>`;
             
             } else {
                popupBasicInfo += `<p><span class="text-default">VISIT HAS NOT STARTED</span></p>`;
            }

            popupBasicInfo += `
                    <p class="no-margin no-padding"><span class="text-default">SITTER: </span>${visitDictionary.sitter}</p>
                    <p class="no-margin no-padding"><span class="text-default">CLIENT: ${visitDictionary.CLIENTFNAME} ${visitDictionary.CLIENTLNAME}</p>
                    <p class="no-margin no-padding"><span class="text-default">PETS: ${visitDictionary.PETS}</p>
                </div>
            </div>`;
            
            if (visitDictionary.status == 'submitted') {

                popupBasicInfo += '<div class=\"card\"><div class=\"card-header no-margin\"><p class=\"alert alert-success no-margin\"><i class=\"fa fa-compass\">VISIT COMPLETED</i>';
                submittedDate = visitDictionary.reportsubmissiondate;
                popupBasicInfo += '<p class=\"alert alert-warning no-margin\">PENDING REVIEW</p></div>';
                popupBasicInfo += '<p class=\"alert alert-success no-margin\">VISIT REPORT RECEIVED:  '+ submittedDate +'</p></div>';
             

            } else if (visitDictionary.status == 'published') {

                dateReport = visitDictionary.reportPublishedDate;
                timeReport = visitDictionary.reportPublishedTime;
                popupBasicInfo += '<div class=\"card\"><div class=\"card-header no-margin\"><p class=\"alert alert-success no-margin\"><i class=\"fa fa-compass\"> COMPLETE</i>';
                popupBasicInfo += '<p class=\"alert alert-success no-margin\">VISIT REPORT SENT:  '+ timeReport  +'  on ' + dateReport +'</p></div>';
                popupBasicInfo += '<p class=\"alert alert-success no-margin\">VISIT REPORT RECEIVED:  '+ submittedDate +'</p></div>';
             
            } else if (visitDictionary.status == 'noreportdatareceived' && visitDictionary.ARRIVED != null && visitDictionary.COMPLETED != null) {

                popupBasicInfo += '<div class=\"card\"><div class=\"card-header no-margin\"><p class=\"alert alert-danger no-margin\"><i class=\"fa fa-compass\">VISIT COMPLETED</i>';
                popupBasicInfo += '<p class=\"alert alert-danger no-margin\">VISIT REPORT NOT RECEIVED</p></div>';
                popupBasicInfo += '<div id="chatWrapper"><form id="sendSitterMessageForm"><input type="text" size=50 id="message" placeholder="PLEASE SEND VISIT REPORT"></form></div>';
                popupBasicInfo += '<p class=\"alert alert-danger no-margin\">SEND MESSAGE TO SITTER</p></div>';

             
            } else if (visitDictionary.status == 'maporphotoreceived') {

                popupBasicInfo += '<div class=\"card\"><div class=\"card-header no-margin\"><p class=\"alert alert-danger no-margin\"><i class=\"fa fa-compass\">VISIT COMPLETED</i>';
                popupBasicInfo += '<p class=\"alert alert-success no-margin\">VISIT REPORT NOT RECEIVED</p></div>';
                popupBasicInfo += '<div id="chatWrapper"><form id="sendSitterMessageForm"><input type="text" size=50 id="message" placeholder="PLEASE SEND VISIT REPORT"></form></div>';
                popupBasicInfo += '<p class=\"alert alert-success no-margin\">SEND MESSAGE TO SITTER</p></div>';


            }
            popupBasicInfo += `
                                        <div class=\"card-body small-padding p-t-0 p-b-0\">
                                                    <div class=\"form-group floating-label m-t-0 p-t-0\">
                                                                    
                                                        <textarea name=\"messageSitter\" id=\"messageSitter\" class=\"form-control text-sm\" rows=\"3\">
                                                            \n\n${visitDictionary.NOTE}
                                                        </textarea>
                                                        <label for=\"messageSitter\">
                                                            <i class=\"fa fa-note icon-tilt-alt\"></i> Visit Notes
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="card-actionbar">
                                                    <div class="card-actionbar-row no-padding">
                                                        <a href="javascript:void(0);" class="btn btn-icon-toggle btn-danger ink-reaction pull-left">
                                                        <i class="fa fa-heart"></i></a><a href="javascript:void(0);" class="btn btn-icon-toggle btn-default ink-reaction pull-left">
                                                        <i class="fa fa-reply"></i></a><a href="javascript:void(0);" class="btn btn-flat btn-default-dark ink-reaction">SEND</a>
                                                    </div>
                                                </div>
                                        </div>`;    

            return popupBasicInfo;
        }
        function createSitterMapMarker(sitterInfo) {
            let el = document.createElement('div');
            let latitude = parseFloat(sitterInfo.sitterLat);
            let longitude = parseFloat(sitterInfo.sitterLon);
            let popupView;
            if (latitude != null && longitude != null && latitude < 90 && latitude > -90) {
                popupView = createSitterPopup(sitterInfo);
                el.class = 'sitter';
                el.id = 'sitter';
                el.addEventListener("click", ()=> {
                    allVisits.forEach((visit) => { 
                        if(visit.sitterID == sitterInfo.sitterID) {
                            createMapMarker(visit, 'marker');
                        }
                    })
                })

                let popup = new mapboxgl.Popup({offset : 25})
                    .setHTML(popupView);

                if (latitude > 90 || latitude < -90 ) {
                    console.log("Lat error");
                } else {
                    let marker = new mapboxgl.Marker(el)
                        .setLngLat([longitude,latitude])
                        .setPopup(popup)
                        .addTo(map);

                    mapMarkers.push(marker);
                }
            }
        }
        function showSitterVisits(sitterID) {

            let showVisitButton = document.getElementById('sitterPopupShow'+sitterID);
            //console.log(showVisitButton.innerHTML);
            if (showVisitButton.innerHTML == 'SHOW VISITS') {
                let allVisitsNow = allVisits;
                allVisitsNow.forEach((visit)=> {
                    if (visit.sitterID == sitterID) {
                        createMapMarker(visit,'marker');
                    }
                });
                showVisitButton.innerHTML = 'DO NOT SHOW VISITS';
            } else {
                let allVisitsNow = allVisits;
                allVisitsNow.forEach((visit)=> {
                    if (visit.sitterID == sitterID) {
                       // console.log(visit.sitterID);
                        mapMarkers.forEach((mark)=> {
                            let markerHTML = mark.getElement();
                            console.log(markerHMTL.id);
                            if (visit.visitID == markerHTML.getAttribute('id' )) {
                                console.log('Remove this marker');
                            }
                        })
                    }
                });
            }
        }
        function createSitterPopup(sitterInfo) {
            console.log('create sitter popup');

            let popupBasicInfo = '<h1 style="color:white">'+sitterInfo.sitterName+'</h1>';
            popupBasicInfo += '<p style="color:white">'+sitterInfo.street1 +',  ' + sitterInfo.city + '</p>';
            let numberVisits = visitsBySitter[sitterInfo.sitterID];
            popupBasicInfo += '<p style="color:white">Number of visits: ' + numberVisits + '</p>';
            popupBasicInfo += '<div><button id="sitterPopupShow'+sitterInfo.sitterID+'" onclick=showSitterVisits('+sitterInfo.sitterID+') height=32 width=120>SHOW VISITS</button></div>';

            let currentVisitListBySitter =[];
            allVisits.forEach((visit)=> { 
                if (visit.sitterID == sitterInfo.sitterID && visit.status != 'canceled') {
                    currentVisitListBySitter.push(visit);
                }
            })
            currentVisitListBySitter.sort(function(a,b){
                let aDate = fullDate + ' ' + a.completed;
                let bDate = fullDate + ' ' + b.completed;
                return new Date(aDate) - new Date(bDate);
            });
            currentVisitListBySitter.forEach((visit)=> {
                if(visit.sitterID == sitterInfo.sitterID) {

                    if (visit.status == 'completed') {
                        popupBasicInfo += '<p style="color:white"> <img src="./assets/img/check-mark-green@3x.png" width=20 height=20>';
                    } else if (visit.status == 'late') {
                        popupBasicInfo += '<p style="color:white"> <img src="./assets/img/red-dot@3x.png" width=20 height=20>';
                    } else if (visit.status == 'canceled') {
                       popupBasicInfo += '<p style="color:white"> <img src="./assets/img/x-mark-red@3x.png" width=20 height=20>';
                    } else if (visit.status == 'arrived') {
                        popupBasicInfo += '<p style="color:white"> <img src="./assets/img/arrive.png" width=20 height=20>';
                    } else if (visit.status == 'future') {
                        popupBasicInfo += '<p style="color:white"> <img src="./assets/img/zoomin-bargraph@3x.png" width=20 height=20>';
                    }
                    popupBasicInfo += visit.clientName;

                    allClients.forEach((client)=> { 

                        if(client.client_id == visit.clientID) {

                            console.log('CLIENT NAME: ' + visit.clientName + ' CLIENT RECORD WITH ID: '  + client.client_id + " and visit ID:  " + visit.clientID);
                        }

                    });
                    allClients.forEach((client)=> {
                        if (visit.clientID == client.client_id) {
                            popupBasicInfo += ' (' + client.street1 ;
                            if(client.street2 != null) {
                                popupBasicInfo += ',' + client.street2 + '</p>';
                            }
                            popupBasicInfo += ')';
                        }
                    })
                    popupBasicInfo += '</p>';
                    if (visit.status == 'completed') {
                        popupBasicInfo += '<p style="color:white">Arrived: ' + visit.arrived + ' Completed: ' + visit.completed + '</p>';

                    }
                }
            })
            popupBasicInfo += '<p style="color:white"><img src=\"./assets/img/postit\-20x20.png\" width=20 height=20>&nbsp&nbsp<input type=\"text\" name=\"messageSitter\" id=\"messageSitter\"></p>';

            return popupBasicInfo;
        }
        function createSitterPopupWithMileage(sitterInfo, mileageInfo, visitList) {

            let popupBasicInfo = '<h1>'+sitterInfo.sitterName+'</h1>';
            popupBasicInfo += '<p>'+sitterInfo.street1 +',  ' + sitterInfo.city + '</p>';
            let distanceResponse = mileageInfo.route;
            let waypoints = mileageInfo.waypoints;
            let total_distance = distanceResponse.distance/1000;
            let total_duration = distanceResponse.duration/60;
            let route_legs = distanceResponse.legs;
            let num_legs = distanceResponse.legs.length;
            let total_dist_check = 0;
            let total_duration_check= 0;
            let first_distance = 0;
            let last_distance =0;
            let first_duration = 0;
            let last_duration =0;
            let route_index = 0;
            route_legs.forEach((leg)=> {
                let step_arr = leg.steps;
                num_legs = num_legs - 1;
                route_index = route_index + 1;
                total_dist_check = total_dist_check + parseFloat(leg.distance);
                total_duration_check = total_duration_check + parseFloat(leg.duration);
                if (route_index == 0) {
                    first_distance = leg.distance;
                }
                if (route_index == distanceResponse.legs.length - 1) {
                    last_distance = leg.distance
                }
            });
            total_miles = total_miles + (total_distance * .62137);
            total_duration_all = total_duration_all + total_duration;
            total_distance = total_distance * .62137;
            let per_visit_distance = total_distance / (waypoints.length-2);
            let per_visit_duration = total_duration / (waypoints.length-2);
            popupBasicInfo += '<p style="color:white">Total Miles: ' + total_distance + '<BR>';
            popupBasicInfo += '<p style="color:white"> Duration: ' + total_duration + '<BR>';
            popupBasicInfo += '<p style="color:white">Number of visits: </p'+ visitList.length +'<BR>';
            popupBasicInfo += '<ul>';
            visitList.forEach((visit)=> {
                popupBasicInfo += '<li>' + visit.clientName;
                if(visit.sitterName == sitterInfo.sitterName) {
                    createMapMarker(visit, "");
                }
            })
            popupBasicInfo += '</ul>';
            popupBasicInfo += '<p><img src=\"./assets/img/postit\-20x20.png\" width=20 height=20>&nbsp&nbsp<input type=\"text\" name=\"messageSitter\" id=\"messageSitter\"></p>';

            return popupBasicInfo;
        }
        function createSitterMapMarkerWithMileage(sitterInfo, mileageInfo, visitList) {
            let el = document.createElement('div');
            let latitude = parseFloat(sitterInfo.sitterLat);
            let longitude = parseFloat(sitterInfo.sitterLon);
            let popupView;
            if (latitude != null && longitude != null && latitude < 90 && latitude > -90) {
                popupView = createSitterPopupWithMileage(sitterInfo, mileageInfo, visitList);
                el.class = 'sitter';
                el.id = 'sitter';

                let popup = new mapboxgl.Popup({offset : 25})
                    .setHTML(popupView);

                if (latitude > 90 || latitude < -90 ) {
                    console.log("Lat error");
                } else {
                    let marker = new mapboxgl.Marker(el)
                        .setLngLat([longitude,latitude])
                        .setPopup(popup)
                        .addTo(map);

                    mapMarkers.push(marker);
                }
            }
            visitList.forEach((visit) => {
                createMapMarker(visit, "");
            })
        }        

        function getCurrentlyShowingSitters() {
            let currentShowingSitters = [];

            let sitterKeys = Object.keys(displaySitters);
            sitterKeys.forEach((sitter)=> {
                //console.log(sitter + ' ' + displaySitters[sitter]);
                if (displaySitters[sitter] = true) {
                    currentShowingSitters.push(sitter.sitterID);
                }
            })
            return currentShowingSitters;
        }
        function showVisitBySitter(sitterProfile){
            console.log('Showing visits by sitter');
            removeVisitDivElements();
            removeAllMapMarkers();

            let sitterFilterButton = document.getElementById(sitterProfile.sitterID);
            if(displaySitters[sitterProfile.sitterID]) {
                displaySitters[sitterProfile.sitterID] = false;
                sitterFilterButton.setAttribute("style", "background-color: Tomato;")
            } else {
                displaySitters[sitterProfile.sitterID] = true;
                sitterFilterButton.setAttribute("style", "background-color: DodgerBlue;")
            }

            let visitListBySitter = [];
            let currentVisitListBySitter = [];

            allVisits.forEach((visitDetails)=> {
                let sitterKeys = Object.keys(displaySitters);
                sitterKeys.forEach((sitKey) => {
                    if (displaySitters[sitKey] && visitDetails.sitterID == sitKey) {
                        visitListBySitter.push(visitDetails);
                        if (sitterProfile.sitterID  == visitDetails.sitterID && visitDetails.status != 'canceled') {     
                            currentVisitListBySitter.push(visitDetails);
                        }
                        //createMapMarker(visitDetails,'marker');
                    }
                })
            });

            let currentSitters = getCurrentlyShowingSitters();
 
            currentSitters.forEach((showSitterID)=> {
                allSitters.forEach((sitter)=> {
                    //console.log(showSitterID + ' ' + sitter.sitterID);
                    if (showSitterID == sitter.sitterID) {
                        createSitterMapMarker(sitter);
                    }
                })
            })

            currentVisitListBySitter.sort(function(a,b){
                let aDate = fullDate + ' ' + a.completed;
                let bDate = fullDate + ' ' + b.completed;
                return new Date(aDate) - new Date(bDate);
            });

            currentVisitListBySitter.forEach((visitDetails)=> {
                //createVisitHTML(visitDetails);
            });

            let isMileageDone = false;

            trackSitterMileage.forEach((sitterDicts)=> { 
                if (sitterDicts.sitterID == sitterProfile.sitterID) {
                    isMileageDone = true;
                }
            });

            if(!isMileageDone){
                calculateRouteTimeDistance(sitterProfile.sitterID, currentVisitListBySitter);
            } else {
                console.log('MILEAGE ENTRY EXISTS')
            }

            let lastVisit = visitListBySitter[visitListBySitter.length -1]

            if (lastVisit.lon != null && lastVisit.lat != null && lastVisit.lon > -90 && lastVisit.lat < 90) {

               map.flyTo({
                    center: [parseFloat(lastVisit.lon), parseFloat(lastVisit.lat)],
                    zoom: 18
                });
            }
        }

        function createVisitHTML(visitDetails) {       
          console.log('calling create visit html');
            let visitLabel = document.createElement("div");
            let visitDiv = document.getElementById("visitListByClient");   
            visitDiv.appendChild(visitLabel); 
            visitLabel.id = visitDetails.visitID;
            visitLabel.setAttribute("class", "tile-text");
            visitLabel.setAttribute("name", visitDetails.clientName);
            visitLabel.classList.add('alert','alert-callout');
            let fLat = parseFloat(visitDetails.lat);
            let fLon = parseFloat(visitDetails.lon);
            visitLabel.addEventListener('click' , function() {
                console.log(fLat + ' ' + fLon);
                map.flyTo({
                    center: [fLon, fLat],
                    zoom: 18
                });
            });
            visitLabel.innerHTML = visitDetails.clientName;

             if(visitDetails.status == 'late') {
                visitLabel.classList.add("alert-warning");
            } else if (visitDetails.status == "completed") {
                 visitLabel.classList.add("alert-success");
            } else if (visitDetails.status == "canceled") {
                 visitLabel.classList.add("alert-danger");
            }
            visitDiv.appendChild(visitLabel);
        }
        function showSitters() {
            total_miles = 0;
            total_duration_all =0;

            removeVisitDivElements();
            removeAllMapMarkers();
            let sitterProfile;
            let showingSitters = getCurrentlyShowingSitters();


            allSitters.forEach((sitter)=> {
                let hasVisits = false;
                allVisits.forEach((visit) => {
                    if (visit.sitterID == sitter.sitterID) {
                        hasVisits = true;
                    }
                });
                if (hasVisits) {
                    createSitterMapMarker(sitter);
                }
            });
        }
        function checkDistanceMatrix(waypointsArrayCheck) {

            let distanceMatrix = LTMGR.getDistanceMatrix();
            if (distanceMatrix != null) {
                //console.log('Waypoints to check: ' + waypointsArrayCheck.length + ', ' + distanceMatrix.length);
                let wayPointsGet = [];

                let numWaypoints = waypointsArrayCheck.length;
                for (let c=1 ; c < numWaypoints; c++) {
                    let wayEnd = waypointsArrayCheck[c];
                    let wayBegin = waypointsArrayCheck[c-1];
                    let wayBeginCoord = wayBegin['coordinates'];
                    let wayEndCoord = wayEnd['coordinates'];
                    
                    
                    distanceMatrix.forEach((matrix)=> {
                        let beginCoordinate = matrix.beginCoordinate;
                        let endCoordinate = matrix.endCoordinate;
                        //console.log(beginCoordinate + ' --> wayBegin: ' + wayBeginCoord);
                        if (beginCoordinate[0] == wayBeginCoord[0] && 
                            beginCoordinate[1] == wayBeginCoord[1] &&
                            endCoordinate[0] == wayEndCoord[0] &&
                            endCoordinate[1] == wayEndCoord[1]) {
                            console.log('Matched distance matrix');
                        }
                    });
                }
            }
        }
        function calculateRouteTimeDistance(sitterID, sitterRoute) {

            let waypointsArr = [];
            let visit_count = sitterRoute.length;

            sitterRoute.forEach((visit)=> {
                let lat = parseFloat(visit.lat);
                let lon = parseFloat(visit.lon);
                let coordPair = [];
                coordPair.push(lon);
                coordPair.push(lat);
                let coord = {"coordinates" : coordPair};
                let waypointName = {"name" : visit.clientName};
                waypointsArr.push(coord);
                visit_count = visit_count - 1;

            });

            allSitters.forEach((sitter)=> {
                if(sitterID == sitter.sitterID) {
                    let lat = parseFloat(sitter.sitterLat);
                    let lon = parseFloat(sitter.sitterLon);
                    let coordPair = [];
                    coordPair.push(lon);
                    coordPair.push(lat);
                    let coord = {"coordinates" : coordPair};

                    if (lat != null && lon != null && lon > -90 && lat < 90) {
                        waypointsArr.push(coord);
                        waypointsArr.unshift(coord);
                        createSitterMapMarker(sitter);
                    } else {
                        console.log('sitter does not have valid coordinates');
                    }

                 }
            });
            checkDistanceMatrix(waypointsArr);
            let waypointDict= {"waypoints": waypointsArr};
            var mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
            mapboxClient.directions.getDirections(waypointDict)
                .send()
                .then(response => {
                    const directions = response.body;
                    let waypoints = directions['waypoints'];
                    let routes = directions.routes;
                    let d2 = routes[0];
                    parseDistanceData(d2, waypoints,sitterID);
                }, error => {
                    console.log('Hit error');
                    console.log(error.message);
                });
        }
        function parseDistanceData(distanceResponse, waypoints, sitterID) {
        }




        function showLoginPanel() {
            var loginPanel = document.getElementById("lt-loginPanel");
            loginPanel.setAttribute("style", "display:block");
        }
        function flyToVisit(visitDetails) {

            if (visitDetails != null) {
                if (visitDetails.lon != null && visitDetails.lat != null && visitDetails.lon > -90 && visitDetails.lat < 90) {
                    map.flyTo({
                        center: [visitDetails.lon, visitDetails.lat],
                        zoom: 20
                    });
                } else {
                    alert("Coordinates are invalid");
                }
            }
        }
        function flyToFirstVisit() {
            allVisits.forEach((visit)=> {
                //console.log(visit.clientName + ' lat: ' + visit.lat + ' , lon: ' + visit.lon);
            })
            if (allVisits[1] != null) {
                 let lastVisit = allVisits[1];
                if (lastVisit.lon != null && lastVisit.lat != null && lastVisit.lon > -90 && lastVisit.lat < 90 ) {
                    map.flyTo({
                        center: [lastVisit.lon, lastVisit.lat],
                        zoom: 16
                    });
                } else {
                    console.log('FIRST VISIT FLY TO INVALID COORDINATES: ' + lastVisit.clientName + ' (' + lastVisit.lon + ',' + lastVisit.lat + ')');
                }
            }
        }        
        function getFullDate() {
            var todayDate = new Date();
            onWhichDay = new Date(todayDate);
            let futureDate = new Date();

            futureDate.setDate(futureDate.getDate() + 45);
            let futureMonth = futureDate.getMonth()+1;
            console.log(futureDate);
            console.log(futureMonth);
            console.log(futureDate.getDate());

            let todayMonth = todayDate.getMonth()+1;
            let todayYear = todayDate.getFullYear();
            let todayDay = todayDate.getDate();

            let dayOfWeek = todayDate.getDay();

            let dayWeekLabel = document.getElementById('dayWeek');
            dayWeekLabel.innerHTML = dayArrStr[dayOfWeek] + ', ';
            let monthLabel = document.getElementById('month');
            monthLabel.innerHTML = monthsArrStr[todayMonth-1];
            let dateLabel = document.getElementById("dateLabel");
            dateLabel.innerHTML = todayDay;
            return todayYear+'-'+todayMonth+'-'+todayDay;
        }
        function updateDateLabels(month, date, day)  {
            let dayWeekLabel = document.getElementById('dayWeek');
            let monthLabel = document.getElementById('month');
            let dateLabel = document.getElementById("dateLabel");
            dayWeekLabel.innerHTML = day + ', ';
            monthLabel.innerHTML = month;
            dateLabel.innerHTML = todayDay;
        }
        function prevDay() {
            removeAccordionControls();
            onWhichDay.setDate(onWhichDay.getDate()-1)
            let monthDate = onWhichDay.getMonth();
            let monthDay = onWhichDay.getDate();
            let prevDay = onWhichDay.getDay() - 1;
            console.log(monthDate + ' ' + monthDay + ' ' +prevDay);

            let dateRequestString = onWhichDay.getFullYear() + '-' + monthDate+ '-' + monthDay;

            updateDateInfo(monthDate, monthDay, prevDay);

            fullDate = dateRequestString;
            prevDaySteps(dateRequestString);

            updateDateLabels()
            removeSittersFromSitterList();
            removeAllMapMarkers();
            removeVisitDivElements();
        }
        function nextDay() {

            removeAccordionControls();

            onWhichDay.setDate(onWhichDay.getDate()+1)
            let monthDate = onWhichDay.getMonth() + 1;
            let monthDay = onWhichDay.getDate();
            let dateRequestString = onWhichDay.getFullYear() + '-' + monthDate+ '-' + monthDay;
            updateDateInfo();
            fullDate = dateRequestString;
            prevDaySteps(dateRequestString);

            removeSittersFromSitterList();
            removeAllMapMarkers();
            removeVisitDivElements();
        }
        async function prevDaySteps(loginDate) {

            allVisits = [];
            allSitters = [];
            allClients =[];

            let url = 'http://localhost:3300?type=mmdLogin&username='+username+'&password='+password+'&role='+userRole+'&startDate='+loginDate+'&endDate='+loginDate;
            const loginFetchResponse = await fetch(url);
            const response = await loginFetchResponse.json();

            const sitterListAfterLogin = LTMGR.getManagerData();
            await sitterListAfterLogin.then((results)=> {
                allSitters = results;
            });

            const visitListAfterLogin = LTMGR.getManagerVisits();
            await visitListAfterLogin.then((results)=> {
                allVisits = results;
            })

            const clientsAfterLogin = LTMGR.getManagerClients();
            await clientsAfterLogin.then((results)=> {
                allClients = results;
            });

            visitsBySitter = [];
            mapMarkers = [];
        
            masterVreportList()
            .then((vListItems)=> { 
                vListItems.forEach((item)=> {
                    visitReportList.push(item);
                    console.log(item.visitID + ' -> ' + item.status);
                });
                flyToFirstVisit();
                buildSitterButtons(allVisits, allSitters);
            });
        }
        function updateDateInfo() {

            let todayMonth = onWhichDay.getMonth() +1 ;
            let todayYear = onWhichDay.getFullYear();
            let todayDay = onWhichDay.getDate();
            let dayOfWeek = onWhichDay.getDay();
           //console.log('Today month: ' + todayMonth + ' Year:' + todayYear + ' Today Day: ' + todayDay + ' Day of Week:' + dayOfWeek);

            /*let dayWeekLabel = document.getElementById('dayWeek');
            dayWeekLabel.innerHTML = dayArrStr[dayOfWeek] + ', ';
            let monthLabel = document.getElementById('month');
            monthLabel.innerHTML = monthsArrStr[todayMonth-1];
            let dateLabel = document.getElementById("dateLabel");
            dateLabel.innerHTML = todayDay;*/
        }        
        function truncate(value) {
            console.log(value);
            if (value < 0) {
                return Math.ceil(value);
            }
            return Math.floor(value).toString();
        } 

        function removeAccordionControls() {
            let accordionVisits = document.getElementById('visitListBySitterAccordions');

            while (accordionVisits.hasChildNodes()) {   
              accordionVisits.removeChild(accordionVisits.firstChild);
            }
        }
        function removeVisitDivElements() {
            /*var element = document.getElementById("visitListByClient");
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }*/
        }
        function removeSittersFromSitterList() {

            //            var element = document.getElementById("sitterList");
            //            while (element.firstChild) {
            //                element.removeChild(element.firstChild);
            //            }
        }
        function removeAllMapMarkers() {
            mapMarkers.forEach((marker)=>{
                marker.remove();
            });
        }     

        function populateSitterAccordions(sitter,accordionVisits) {

            let sitterListDiv = document.getElementById('visitListBySitterAccordions');
            let sitterListElement = document.createElement('div');
            sitterListElement.setAttribute("class", "sitter card panel");

            let sitterCardHead = createSitterCardHead(sitter, "sitterListAccordions",sitter.sitterID );
            let headerElement  = createHeaderTools(sitter);
            let toolDiv  = createToolDiv(sitter);

            sitterListDiv.appendChild(sitterListElement);
            sitterListElement.appendChild(sitterCardHead);
            sitterCardHead.appendChild(headerElement);
            sitterCardHead.appendChild(toolDiv);

            let expandAccordion = createExpandAccordion(sitter);
            let cardBody = createCardBody(sitter);
            let panelGroup = createPanelGroup(sitter);

            cardBody.appendChild(panelGroup);
            expandAccordion.appendChild(cardBody);
            sitterListElement.appendChild(expandAccordion);

            let panelGroupMain = document.createElement('div');
            panelGroupMain.setAttribute("class", 'panel-group');
            panelGroupMain.setAttribute("id","mainAccordion");
            sitterListDiv.appendChild(panelGroupMain);
            let visitCount = 0;

            accordionVisits.forEach((visit)=> {
                if(visit.sitterID == sitter.sitterID) {

                    visitCount = visitCount +1;

                    let panelItem = createVisitPanelItem(visit);
                    let visitDiv = createVisitDetailDiv(visit);
                    createVisitDetailHeader(visit, visitDiv);
                    let visitExpandAccordion = visitDetailExpandAccordion(visit);
 
                    panelItem.appendChild(visitDiv);
                    panelItem.appendChild(visitExpandAccordion);
                    panelGroup.appendChild(panelItem);

                }
            });

            headerElement.innerHTML = sitter.sitterName + ' (' + visitCount + ')';
        }
        function createSitterCardHead(sitterInfo, parentName, targetName) {
            let sitterCardHeadMake = document.createElement('div');
            //      sitterCardHead.setAttribute("type", "div");
            sitterCardHeadMake.setAttribute("id", sitterInfo.sitterID);
            sitterCardHeadMake.setAttribute("class", "card-head card-head-sm collapsed");
            sitterCardHeadMake.setAttribute("data-toggle", "collapse");
            sitterCardHeadMake.setAttribute("data-parent", "#"+parentName);
            sitterCardHeadMake.setAttribute("data-target", "#accordion-"+ targetName);
            sitterCardHeadMake.setAttribute("aria-expanded", "false");

            sitterCardHeadMake.addEventListener('click', ()=> {
                //console.log('tapped sitter accordion item');
            })
            return sitterCardHeadMake;
        }
        function createHeaderTools(sitterInfo) {

            let cHeaderElement = document.createElement('header');
            cHeaderElement.setAttribute("type", "header");
            cHeaderElement.setAttribute("id", "header-"+sitterInfo.sitterID);
            cHeaderElement.innerHTML = sitterInfo.sitterName;
            return cHeaderElement;;
        }
        function createToolDiv(sitterInfo) {

            let cToolDiv = document.createElement('div');
            cToolDiv.setAttribute("id","tool-accordion-"+sitterInfo.sitterID); 
            cToolDiv.setAttribute("class","tools");

            let buttonTool = document.createElement('button');
            buttonTool.setAttribute("type","button");
            buttonTool.setAttribute("class", "btn btn-icon-toggle");

            let iTool = document.createElement('i')
            iTool.setAttribute("type","i");
            iTool.setAttribute("class","fa fa-angle-down");

            cToolDiv.appendChild(buttonTool);
            cToolDiv.appendChild(iTool);

            return cToolDiv;
        }
        function createExpandAccordion(sitterInfo) {
            let cExpandAccordion = document.createElement('div');
            cExpandAccordion.setAttribute("id", "accordion-"+sitterInfo.sitterID);
            cExpandAccordion.setAttribute("class", "collapse");
            cExpandAccordion.setAttribute("style","height: 0px;");
            cExpandAccordion.setAttribute("aria-expanded", "false");
            return cExpandAccordion;
        }
        function createCardBody(sitterInfo) {
            let cCardBody = document.createElement('div');
            cCardBody.setAttribute("class", "card-body small-padding");
            cCardBody.setAttribute("id","visitsBy-"+sitterInfo.sitterID);
            return cCardBody;
        }    
        function createPanelGroup(sitterInfo) {
            let cPanelGroup = document.createElement('div');
            cPanelGroup.setAttribute("class","panel-group");
            cPanelGroup.setAttribute("id","visitAccordionPanel-"+sitterInfo.sitterID);
            return cPanelGroup;
        }        
        function createVisitPanelItem(visitInfo) {

            let panelItem = document.createElement('div');
            panelItem.setAttribute("class","visit card panel");
            panelItem.setAttribute("id","visitDetailDiv-"+ visitInfo.visitID);
            return panelItem;
        }
        function createVisitDetailDiv(visitInfo) {

            let visitDiv = document.createElement('div');
            visitDiv.setAttribute("id", "visit-"+visitInfo.visitID);
            visitDiv.setAttribute("class", "card-head card-head-sm collapsed");
            visitDiv.setAttribute("data-toggle", "collapse");
            visitDiv.setAttribute("data-parent", "#visitDetailDiv-" + visitInfo.visitID);
            visitDiv.setAttribute("data-target", "#visitDetails-"+visitInfo.visitID);
            visitDiv.setAttribute("aria-expanded", "false");
                  
            if(visitInfo.status == 'completed') {
                visitDiv.classList.add("style-success");
            } else if (visitInfo.status == "late") {
                visitDiv.classList.add("bg-warning");
            } else if (visitInfo.status == "future") {
                visitDiv.classList.add("bg-info");
            } else if (visitInfo.status == "canceled") {
                visitDiv.classList.add("bg-danger");
            } else if (visitInfo.status == "arrived") {       
            }

            visitDiv.addEventListener('click', (eventObj) => {
                flyToVisit(visitInfo);
            });

            return visitDiv;
        }
        function createVisitDetailHeader(visitInfo, visitDivParent) {

            let visitHeader = document.createElement("header");

            let visitSummaryHTML = `
                ${visitInfo.clientName} (${visitInfo.timeOfDay})
            `;
            visitHeader.innerHTML = visitSummaryHTML;

            let visitToolDiv = document.createElement('div');
            visitToolDiv.setAttribute("id","tool-accordion-"+visitInfo.visitID);
            visitToolDiv.setAttribute("class","tools");

            let visitDetailButton = document.createElement('button');
            visitDetailButton.setAttribute("type","button");
            visitDetailButton.setAttribute("class", "btn btn-icon-toggle");
            let iVisit = document.createElement('i')
            iVisit.setAttribute("type","i");
            iVisit.setAttribute("class","fa fa-angle-down");

            visitDivParent.appendChild(visitHeader);
            visitToolDiv.appendChild(visitDetailButton);
            visitToolDiv.appendChild(iVisit);
            visitDivParent.appendChild(visitToolDiv);
        }
        function visitDetailExpandAccordion(visitInfo) {
            let visitExpandAccordion = document.createElement('div');
            visitExpandAccordion.setAttribute("id", "visitDetails-"+visitInfo.visitID);
            visitExpandAccordion.setAttribute("class", "collapse");
            visitExpandAccordion.setAttribute("style","height: 0px;");
            visitExpandAccordion.setAttribute("aria-expanded", "false");

            let visitDetailCard = document.createElement("div");
            visitDetailCard.setAttribute("class", "card-body no-padding no-margin style-default-light");
            //visitDetailCard.setAttribute("id","visitDetailCard-" + visitInfo.visitID);
            visitDetailCard.setAttribute("style", "background-color: #e1e1e1;")
                   
            let visitDetailsHTML = ' ' ;

            allClients.forEach((client)=> {
                if (client.client_id == visitInfo.clientID) {

                    let cardMB0 = document.createElement('div');
                    cardMB0.setAttribute("cls", "card m-b-0");
                    let cardHead = document.createElement('div');
                    cardHead.setAttribute("class", "card-head");
                    let tabBodyContent = document.createElement('div');
                    tabBodyContent.setAttribute("class", "card-body tab-content");
                    cardMB0.appendChild(cardHead);
                    cardMB0.appendChild(tabBodyContent);
                    visitDetailCard.appendChild(cardMB0);


                    let tabList = document.createElement('ul');
                    tabList.setAttribute("class", "nav nav-tabs nav-justified style-default-light");
                    tabList.setAttribute("data-toggle","tabs");

                    cardHead.appendChild(tabList);

                    let tabItemVisitInfo = createDetailVisitTab("visit-edit-", visitInfo.visitID, "fa fa-home", "VISIT", true);
                    tabList.appendChild(tabItemVisitInfo);
                    
                    let tabItemHomeInfo = createDetailVisitTab("visit-home-info-", visitInfo.visitID, "fa fa-home", "HOME", false);
                    tabList.appendChild(tabItemHomeInfo);

                    let tabItemCustomerInfo = createDetailVisitTab("visit-profile-", visitInfo.visitID, "fa fa-user","CLIENT", false);
                    tabList.appendChild(tabItemCustomerInfo);

                    let tabPaneVisitDetails = createTabBodyVisitDetails(visitInfo);
                    let tabPaneHomeInfo = createTabBodyHomeInfo(visitInfo);

                    tabBodyContent.appendChild(tabPaneVisitDetails);
                    tabBodyContent.appendChild(tabPaneHomeInfo);


                }
            });
            /*if (visitInfo.visitNote != null) {
                visitDetailsHTML = `<p>NOTE: ${visitInfo.visitNote}` + visitDetailsHTML;
            }*/

            //visitDetailCard.innerHTML = visitDetailsHTML;
            visitExpandAccordion.appendChild(visitDetailCard);
            return visitExpandAccordion;
        }
        function createDetailVisitTab(textClass, visitID, textIcon, tabText, isActive) {
            let tabItemVisitInfo = document.createElement('li');
            if (isActive) {
                tabItemVisitInfo.setAttribute("class", "active");
            } else {
                tabItemVisitInfo.setAttribute("class", "");
            }

            let aHrefTab = document.createElement('a');
            aHrefTab.setAttribute("href",  "#"+textClass + visitID)

            let iconComp = document.createElement('i');
            iconComp.setAttribute("class", textIcon);

            aHrefTab.appendChild(iconComp);
            aHrefTab.innerHTML = tabText;
            tabItemVisitInfo.appendChild(aHrefTab);
            return tabItemVisitInfo;
        }
        function createTabBodyVisitDetails(visitInfo) {
            let tabPaneVisitDetails = document.createElement('div');
            tabPaneVisitDetails.setAttribute("class", "tab-pane active");
            tabPaneVisitDetails.setAttribute("id", "visit-edit-"+visitInfo.visitID);

            let toolsDiv = document.createElement('div');
            toolsDiv.setAttribute("class", "tools align-right");
            toolsDiv.setAttribute("id","tabToolDiv")



            let buttonVisitNotes = document.createElement('div');
            buttonVisitNotes.setAttribute("type","button");
            buttonVisitNotes.setAttribute("class", "btn ink-reaction btn-info");
            buttonVisitNotes.innerHTML = `<i class="fa fa-comments"></i>NOTES`;

            let buttonReassign = document.createElement('div');
            buttonReassign.setAttribute("type","button");
            buttonReassign.setAttribute("class","btn ink-reaction btn-warning");
            buttonReassign.innerHTML = `<i class="fa fa-exchange"></i>REASSIGN`;

            let buttonCancelVisit = document.createElement('div');
            buttonCancelVisit.setAttribute("type","button");
            buttonCancelVisit.setAttribute("class","btn ink-reaction btn-danger");
            buttonCancelVisit.innerHTML = `<i class="fa fa-ban"></i>CANCEL`;

            toolsDiv.appendChild(buttonVisitNotes);
            toolsDiv.appendChild(buttonReassign);
            toolsDiv.appendChild(buttonCancelVisit);

            let toolButtons = `<button type="button" class="btn ink-reaction btn-info"><i class="fa fa-comments"></i></button>`;

            tabPaneVisitDetails.appendChild(toolsDiv);
           //let tDiv = document.getElementById("tabToolDiv");
            //tDiv.innerHMTL = toolButtons;
            return tabPaneVisitDetails;
        }
        function createTabBodyHomeInfo(visitInfo) {
            let tabPaneVisitDetails = document.createElement('div');
            tabPaneVisitDetails.setAttribute("class", "tab-pane");
            tabPaneVisitDetails.setAttribute("id", "visit-home-info-"+visitInfo.visitID);

            let title = document.createElement('p');
            title.innerHTML = `HOME INFO`;
            tabPaneVisitDetails.appendChild(title);


            /*tabPaneVisitDetails.innerHMTL = `<p>HOME INFO</p>
                      <h4 class="no-margin">ALARM CODE: 27-33-22</h4>
                      <h4 class="no-margin">KEY CODE: 234145</h4>
                      <p>FOOD LOCATION:<b> KITCHEN UNDER THE SINK</b></p>
                      <p>Quod option numquam vel in, et fuisset delicatissimi duo, 
                      qui ut animal noluisse erroribus. Ea eum veniam audire. 
                      Per at postea mediocritatem, vim numquam aliquid eu,
                       in nam sale gubergren. Dicant vituperata consequuntur at sea, 
                       mazim commodo</p>`;
            */
            return tabPaneVisitDetails;
        }

} (document)); 




            //<div class="sitter card panel"> 
            //          sitterListElement.setAttribute("type", "div"); CPA REMOVED
            //          sitterListElement.setAttribute("id","sitterListAccordions") //These IDs must be unique to thre HTML page 
            //<div class="card-head card-head-sm collapsed" data-toggle="collapse" data-parent="#visitListBySitterAccordions" data-target="#accordion3-1" aria-expanded="false">
            //let sitterCardHead = document.createElement('div');
            //      sitterCardHead.setAttribute("type", "div");
            /*sitterCardHead.setAttribute("id", sitter.sitterID);
            sitterCardHead.setAttribute("class", "card-head card-head-sm collapsed");
            sitterCardHead.setAttribute("data-toggle", "collapse");
            sitterCardHead.setAttribute("data-parent", "#sitterListAccordions");
            sitterCardHead.setAttribute("data-target", "#accordion-"+sitter.sitterID);
            sitterCardHead.setAttribute("aria-expanded", "false");

            sitterCardHead.addEventListener('click', ()=> {
                console.log('tapped sitter accordion item');
            })*/
            // <header>${sitter.sitterID}</header>

            // <div class="tools">
            // <a class="btn btn-icon-toggle"><i class="fa fa-angle-down"></i></a>
            // </div>
            // <div id="accordion3-1" class="collapse" aria-expanded="false" style="height: 0px;">
            //            expandAccordion.setAttribute("type", "div");
            //      <div class="card-body small-padding ">      
            //            cardBody.setAttribute("type","div");
            //      <div class="visit panel-group" id="visitID">
            //            panelGroup.setAttribute("type","div");
                    
            //  <div class="card panel">
            //   panelItem.setAttribute("type","div");
            //<div class="card-head card-head-sm collapsed" data-toggle="collapse" data-parent="#visitID" data-target="#visit-1" aria-expanded="false">
            //  visitDiv.setAttribute("type", "div");
            // visitDiv.setAttribute("class", "card-head card-head-sm collapsed"); CPA
            //  panelItem.setAttribute("style","background-color: #0B6623");
            // check visit report sent status and adjust view
            //visitDiv.setAttribute("style","background-color: #FDD033");
            // visitDiv.setAttribute("style","background-color: #ADD8E6");
            //visitDiv.setAttribute("style","background-color: #A80000");
            // <div class="tools">
            //  <a class="btn btn-icon-toggle"><i class="fa fa-angle-down"></i></a>
            //  <div id="visit-1" class="collapse" aria-expanded="false" style="height: 0px;">
            //      visitExpandAccordion.setAttribute("type", "div");
            //  <div class="card-body">
            //      visitDetailCard.setAttribute("type", "div");

