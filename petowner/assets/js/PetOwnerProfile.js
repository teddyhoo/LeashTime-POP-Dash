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
    var isAjax = true;
  

    $(document).ready(function () {
        if (isAjax) {

            getPetOwnerProfile();

        } else {
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
                    petOwnerProfile = LT.getClientProfileInfo(clientdata);
                    populateProfileFields();
                    populateHomeInfo();
                    populatePets();
                    //populateCustom();
                    addEditEvents();
                });
            });
        }
    });

    async function getPetOwnerProfile() {
        petOwnerProfile = await LT.getClientProfileAjax();
        populateProfileFields();
        populateHomeInfo();
        populatePets();
        populateCustom();
        addEditEvents();

    }

    function addEditEvents() {

        const elemItems = document.getElementsByClassName('editField');
        Array.from(elemItems).forEach((item)=> {
            item.addEventListener('click', ()=> {
                let currentTextVal = item.textContent;
                console.log(item);
                console.log(item.id + ' : ' + currentTextVal);

                let formDiv = document.createElement('div');
                let formElem = document.createElement('form');
                let formInput = document.createElement('input');
                let formLabel = document.createElement('label');
                let formButton = document.createElement('button');

                formDiv.setAttribute('class', 'form-group');
               
                formElem.setAttribute('action', 'javascript:; onsubmit=\"editField(this)\"');
                
                formInput.setAttribute('type', 'text');
                formInput.setAttribute('class','form-control');
                formInput.setAttribute('id', item.id);
                formInput.setAttribute('name', item.id);
                formInput.setAttribute('value', currentTextVal);

                formDiv.appendChild(formElem);
                formElem.appendChild(formInput);

                formLabel.setAttribute('for',item.id);
                formButton.setAttribute('class','btn btn-primary');
                formButton.setAttribute('type', 'submit');
                formButton.innerHTML = 'DONE';

                formElem.appendChild(formLabel);
                formElem.appendChild(formButton);
                while (item.firstChild) {
                    item.removeChild(item.firstChild);
                }         
                this.item.addChild(formDiv);       
                /*let formEditControl = `
                <div class="form-group">
                    <form action="javascript:;" onsubmit="editField(this)">
                        <input type="text" class="form-control" id=${item.id} name=${item.id}  value=${currentTextVal}>
                        <label for=${item.id}></label>
                        <button type="submit">DONE</button>
                    </form>
                </div>`;
                item.innerHTML = formEditControl;*/
                
            });
        })
    }

    function editField(editComponent) {

        console.log(editComponent);

    }
    function populateCustom() {
        let customTab = document.getElementById('tab-custom');
        let clientProfileCustom = petOwnerProfile.customStuff;
        let customHTML = `<dl class="dl-horizontal" style="margin-top:24px;">`;
        clientProfileCustom.forEach((customObj)=> {
            if (customObj.customVal == '1') {
                customHTML += `<dt>${customObj.customKey}</dt><dd><span class="badge style-success">YES</span></dd>`;

            } else if (customObj.customVal == '0') {
                customHTML += `<dt>${customObj.customKey}</dt><dd><span class="badge style-danger">NO</span></dd>`;

            } else if (customObj.customVal != null) {
                customHTML += `<dt>${customObj.customKey}</dt><dd>${customObj.customVal}</dd>`;

            }
        
        })
        customHTML += `</dl>`;  

        customTab.innerHTML = customHTML;
    }

    function populatePets() {

        let petProfileTab = document.getElementById('tab-pet');
        let petProfileHTML = `<div class="pull-right button btn-lg blue ink-reaction btn-raised">`;
        
        petOwnerProfile.pets.forEach((petProfile)=> { 
            petProfileHTML += `<a href="#!" id="${petProfile.petID}" class="white-text">EDIT ${petProfile.petName}</a><BR>`
        });

    
        petProfileHTML += `</div>
                    <div class="pull-right button btn-lg green ink-reaction btn-raised m-r-20">
                            <a href="#offcanvas-chat" data-toggle="offcanvas" class="white-text">ADD</a>
                    </div>
                    <h3 class=""><i class="fa fa-clock-o text-info"></i> PET PROFILES</h3>
                    `;  

        petOwnerProfile.pets.forEach((petProfile)=> { 
            petProfileHTML += `<button id="${petProfile.petID}" class="btn btn-default btn-raised">${petProfile.petName}</button>`
        });
        //<button class="btn btn-default btn-raised m-l-10">Lilly</button>
        petProfileHTML += `<hr />`;


        petOwnerProfile.pets.forEach((petProfile)=> { 

            petProfileHTML += `<div class="row">
            <div class="col-xs-12 col-sm-3 col-md-4 m-b-20">
                <div class="">
                    <img src="assets/img/profile-images/pic-mypet.jpg" width="100%" height="auto" alt="" class="" />
                </div>
                <div class="full-bleed button btn-lg blue ink-reaction btn-raised text-center">
                    <a href="#!" class="white-text">CHANGE PICTURE</a>
                </div>
            </div>
            <div class="col-xs-12 col-sm-9 col-md-8">

                <div class="row">
                    <div class="col-xs-12 col-sm-6">
                        <div class="text-left">
                            <dl class="lt-profile dl-horizontal">  
                                <dt>Pet's Name</dt>
                                    <dd class="editField" id="petName+${petProfile.petID}">${petProfile.petName} (${petProfile.petType})</dd>
                                <dt>Age</dt>
                                    <dd class="editField" id="petAge+${petProfile.petID}">${petProfile.age}</dd>
                                <dt>Sex</dt>
                                    <dd class="editField" id="petGender+${petProfile.petID}">${petProfile.gender}</dd>
                                <dt >Breed/Color</dt>
                                    <dd class="editField" id="petBreed+${petProfile.petID}">${petProfile.breed} (${petProfile.petColor}</dd>
                                <dt>Description</dt>
                                    <dd class="editField" id="petDescription+${petProfile.petID}">${petProfile.description}</dd>
                                <dt>Notes</dt>
                                    <dd class="editField" id="petNotes+${petProfile.petID}">${petProfile.notes}</dd>
                            </dl>
                        </div>
                    </div>`;
                    petProfileHTML += `       <div class="none" "col-xs-12 col-sm-6">
                    <div class="">
                    <dl class="lt-profile dl-horizontal">`;

                let petCustom = petProfile.customPetFields;
                petCustom.forEach((customPetKey)=> {
                    petProfileHTML += `<dt>${customPetKey.customKey}</dt>`;
                    if (customPetKey.customVal == '1') {
                        petProfileHTML +=`<dd class="editField" id="petName+${petProfile.petID}"><span class="badge style-success">YES</span>`;

                    } else if (customPetKey.customVal == '0') {
                        petProfileHTML +=`<dd class="editField" id="petName+${petProfile.petID}"><span class="badge style-success">NO</span>`;

                    } else if (customPetKey.customVal != null){
                        petProfileHTML +=`<dd class="editField" id="petName+${petProfile.petID}">${customPetKey.customVal}</dd>`;

                    }
                });
                     petProfileHTML += ` </div>
                </div>
            </div>
            </div>`;
     });
        
     petProfileTab.innerHTML = petProfileHTML;

    }
    function populateProfileFields() {

        let basicProfileTab =document.getElementById('basicInfo');
        let petOwnerNameTitle = document.getElementById('petOwnerNameTitle');
        petOwnerNameTitle.innerHTML = petOwnerProfile.fname + ' <strong>' + petOwnerProfile.lname + '</strong>';
        let petOwnerBasicHTML = `
        <dl class="dl-horizontal" style="margin-top:24px;">
            <dt class="">Password</dt>
                <dd>
                    <a href="#!" class="button btn-sm blue ink-reaction btn-raised btn-styled white-text">Change Password</a>
                </dd>
            <dt>Alt Name</dt>
                <dd class="editField" id="firstNameLastName">${petOwnerProfile.fname2} ${petOwnerProfile.lname2}</dd>
            <dt>Email</dt>
                <dd class="editField" id="email">${petOwnerProfile.email}</dd>
            <dt>Alt Email</dt>
                <dd class="editField" id="email2">${petOwnerProfile.email2}</dd>
            <dt>Cell Phone</dt>
                <dd class="editField" id="cellphone">${petOwnerProfile.cellphone}</dd>
            <dt>Home Phone</dt>
                <dd class="editField" id="homephone">${petOwnerProfile.homephone}</dd>
            <dt>Work Phone</dt>
                <dd class="editField" id="workphone">${petOwnerProfile.workphone}</dd>
        </dl>`;

        basicProfileTab.innerHTML =  petOwnerBasicHTML;
    }
    function populateHomeInfo() {
        let homeInfoSection = document.getElementById('tab-home');

        let homeInfoHTML = `
        <div class="pull-right button btn-lg blue ink-reaction btn-raised">
            <a href="#!" class="white-text">EDIT</a>
        </div>
        <h3><i class="fa fa-home text-info"></i> HOME INFORMATION</h3>
        <hr />

        <div class="col-sm-4 text-lg">

            <dl class="dl-verticle">
                <dt>Home Address</dt>
                    <dd class="editField" id="street1">${petOwnerProfile.street1}</dd>
                    <dd class="editField" id="cityStateZip">${petOwnerProfile.city}, ${petOwnerProfile.state} ${petOwnerProfile.zip}</dd>
            </dl>

            <dl class="dl-verticle">
                <dt>Mailing Address</dt>
                <dd class="editField" id="street1Mailing">${petOwnerProfile.street1}</dd>
                <dd class="editField" id="cityStateZipMailing">${petOwnerProfile.city}, ${petOwnerProfile.state} ${petOwnerProfile.zip}</dd>
            </dl>
            <div class="checkbox checkbox-styled tile-text m-b-25">
                <label><input type="checkbox"></label> Bring in Mail
            </div>

            <dl class="dl-verticle">
                <dt>Neighbor Contact</dt>
                <dl class="dl-verticle">
                <dt>Name</dt>
                <dd class="editField" id="nameNeighbor">${petOwnerProfile.neighbor_name}</dd>
                <dt>Location</dt>
                <dd class="editField" id="locationNeighbor">${petOwnerProfile.neighbor_location}</dd>
                <dt>Home Phone</dt>
                <dd class="editField" id="homePhoneNeighbor">${petOwnerProfile.neighbor_homephone}</dd>
                <dt>Work phone</dt>
                <dd class="editField" id="workPhoneNeighbor"${petOwnerProfile.neighbor_workphone}</dd>
                <dt>Cell phone</dt>
                <dd class="editField" id="cellPhoneNeighbor">${petOwnerProfile.neighbor_cellphone}</dd>
                <dt>Note</dt>
                <dd class="editField" id="noteNeighbor">${petOwnerProfile.neighbor_note}</dd>
                <dt class="editField" id="hasKeyNeighbor">Has key</dt>
                <dd>${petOwnerProfile.neighbor_hasKey}</dd>
                </dl>
            </dl>

            <dl class="dl-verticle">
                <dt>Trusted Emergency Contact</dt>
                <dl class="dl-verticle">
                <dt>Name</dt>
                <dd class="editField" id="emergencyName">${petOwnerProfile.emergency_name}</dd>
                <dt>Location</dt>
                <dd class="editField" id="emergencyLocation">${petOwnerProfile.emergency_location}</dd>
                <dt>Home Phone</dt>
                <dd class="editField" id="emergencyHomePhone">${petOwnerProfile.emergency_homephone}</dd>
                <dt>Work Phone</dt>
                <dd class="editField" id="emergencyWorkPhone">${petOwnerProfile.emergency_workphone}</dd>
                <dt>Cell phone</dt>
                <dd class="editField" id="emergencyCellPhone">${petOwnerProfile.emergency_cellphone}</dd>
                <dt>Note</dt>
                <dd class="editField" id="emergencyNote">${petOwnerProfile.emergency_note}</dd>
                <dt>Has key</dt>
                <dd class="editField" id="emergencyHasKey">${petOwnerProfile.emergency_hasKey}</dd>
                </dl>
            </dl>

        </div>

        <div class="col-sm-8">

        <div class="row grey lighten-2 p-b-15">
            <div class="col-sm-12 col-md-4 text-center">
                <div class="m-t-20 grey p-t-5 p-b-5">
                    <h3 class="m-b-0">ALARM/GATE</h3>
                        <h4 class="white-text text-shadow m-t-5"><strong>SEE CODE</strong></h4>
                </div>    
            </div>

            <div class="col-sm-12 col-md-8">
                <dl class="dl-verticle m-t-25">
                    <dt class="editField" id="alarmCompany">${petOwnerProfile.alarmcompany}</dt>
                        <dd class="editField" id="alarmCompanyPhone" >${petOwnerProfile.alarmcophone}</dd>
                    <dt>Alarm Instructions</dt>
                        <dd class="editField" id="alarmInstructions">${petOwnerProfile.alarminfo}</dd>
                    </dl>
                    <dt>Garage / Gate Code</dt>
                        <dd class="editField" id="garageGateCode">${petOwnerProfile.garagegatecode}</dd>
                    </dl>
                </div>
            </div>

            <div class="row m-t-20">
                <div class="col-sm-12 col-md-12">
                    <dl class="dl-horizontal">
                        <dt>Directions to Home</dt>
                            <dd class="editField" id="directions">${petOwnerProfile.directions}</dd>
                        <dt>Parking Info</dt>
                            <dd>${petOwnerProfile.parkinginfo}</dd>
                        <dt>Food Location</dt>
                            <dd class="editField" id="foodLocation">${petOwnerProfile.foodloc}</dd>
                        <dt>Leash Location</dt>
                            <dd class="editField" id="leashLocation">${petOwnerProfile.leashloc}</dd>
                        <dt>Entry Notes</dt>
                            <dd class="editField" id="entryNotes">Use all keys and then alarm box.</dd>
                        <dt>Litterbox Location</dt>
                            <dd class="editField" id="litterBox">Laundry Room</dd>
                        <dt>Circuit Breaker</dt>
                            <dd class="editField" id="circuitBreaker">Located in the Laundry Room</dd>
                    </dl>
                </div>
            </div>`;
        homeInfoSection.innerHTML = homeInfoHTML;
    }
        
    
} (this.materialadmin));