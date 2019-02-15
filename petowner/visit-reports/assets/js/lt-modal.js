var modalCtn = $('#modal_container'),
	  overlay = $('#overlay');

$('document').ready(function() {
	$('.modal_button').click(function() {
		var btnModalVal = $(this).attr('modal-value');
		if (btnModalVal === 'modal_a') {
			buildModalA();
		} else if (btnModalVal === 'modal_b') {
			buildModalB();
		} else {
			buildModalC();
		}
		$('.close_button').addClass('modal_open');
		$(overlay).addClass('modal_open');
    $(modalCtn).addClass('modal_open');
		
		dismissModal();
	});
});

let LeashtimeGallery = `
    <div id="GalleryView" class="col-sm-12 Full-height force-padding">
        <div id="lt-right-panel">
       
          <div id="media-preview" class="row force-padding">
            <div class="col-sm-12 height-12">
              
                <div id="imgHolder" class="img-backdrop responsive-image img-rounded" style="background-image: url(../online/assets/img/visit-report-3.jpg); " onclick="swapPhotoMap();"></div>
          
            </div>
         </div>
          
          <div id="visit-gallery" class="row force-padding">
            <div class="text-right">
             
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="../online/assets/img/visit-report-1.jpg"  style="" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="../online/assets/img/visit-report-2.jpg"  style="" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em border-white" src="../online/assets/img/visit-report-3.jpg"  style="box-shadow: 2px 2px 20px rgba(0,0,0,.7);" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="https://LeashTime.com/appointment-map.php?token=pslvp"  style="" alt="Map ">
              </div>
            </div>
          </div>

        </div>
      </div>
  `;



function buildModalA() {
	var html = `
    <div id="GalleryView" class="col-sm-12 Full-height force-padding">
        <div id="lt-right-panel">
       
          <div id="media-preview" class="row force-padding">
            <div class="col-sm-12 height-12">
              
                <div id="imgHolder" class="img-backdrop responsive-image img-rounded" style="background-image: url(../online/assets/img/visit-report-3.jpg); " onclick="swapPhotoMap();"></div>
          
            </div>
         </div>
          
          <div id="visit-gallery" class="row force-padding">
            <div class="text-right">
             
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="../online/assets/img/visit-report-1.jpg"  style="" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="../online/assets/img/visit-report-2.jpg"  style="" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em border-white" src="../online/assets/img/visit-report-3.jpg"  style="box-shadow: 2px 2px 20px rgba(0,0,0,.7);" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="https://LeashTime.com/appointment-map.php?token=pslvp"  style="" alt="Map ">
              </div>
            </div>
          </div>

        </div>
      </div>
  `
  
	showModal(html);
}

function buildModalB() {
	var html = `
    <div id="GalleryView" class="col-sm-12 Full-height force-padding">
        <div id="lt-right-panel">
       
          <div id="media-preview" class="row force-padding">
            <div class="col-sm-12 height-12">
              
                <div id="imgHolder" class="img-backdrop responsive-image img-rounded" style="background-image: url(../online/assets/img/visit-report-3.jpg); " onclick="swapPhotoMap();"></div>
          
            </div>
         </div>
          
          <div id="visit-gallery" class="row force-padding">
            <div class="text-right">
             
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="../online/assets/img/visit-report-1.jpg"  style="" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="../online/assets/img/visit-report-2.jpg"  style="" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em border-white" src="../online/assets/img/visit-report-3.jpg"  style="box-shadow: 2px 2px 20px rgba(0,0,0,.7);" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="https://LeashTime.com/appointment-map.php?token=pslvp"  style="" alt="Map ">
              </div>
            </div>
          </div>

        </div>
      </div>
  `;

	showModal(html);
}

function buildModalC() {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/country.json",
		success: function(json) {
			var inputOptions = '';
			for (var i = 0; i < json.countries.length; i++) {
				var country = json.countries[i];
				var name = country.countryName;
				var code = country.countryCode;
				inputOptions += '<option value="' + code + '" class="country_opt">' + name + '</option>';
			}
			jsonModalStructure(inputOptions);
			
			$('.close_button').addClass('modal_open');
			dismissModal();
		},
		error: function(data) {
			alert('Error loading data, please check url.');
		}
	});
}

function jsonModalStructure(inputOptions) {
	var html = `
    <div id="GalleryView" class="col-sm-12 force-padding" style="max-height:100vh">
        <div id="lt-right-panel">
       
          <div id="media-preview" class="row force-padding">
            <div class="col-sm-12" style="height:70vh">
              
                <div id="imgHolder" class="img-backdrop responsive-image img-rounded" style="background-image: url(../online/assets/img/visit-report-3.jpg); "></div>
          
            </div>
         </div>
          
          <div id="visit-gallery" class="row force-padding">
            <div class="text-right" style="height:30vh">
             
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="../online/assets/img/visit-report-1.jpg"  style="" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="../online/assets/img/visit-report-2.jpg"  style="" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em border-white" src="../online/assets/img/visit-report-3.jpg"  style="box-shadow: 2px 2px 20px rgba(0,0,0,.7);" alt="Map ">
              </div>
              <div style="display: inline-block">
                <img class="img-responsive size-4 img-rounded margin-p5em" src="https://LeashTime.com/appointment-map.php?token=pslvp"  style="" alt="Map ">
              </div>
            </div>
          </div>

        </div>
      </div>
  `;

	showModal(html);
}

function showModal(html) {
	modalCtn.append(html);
	overlay.fadeIn();
	modalCtn.fadeIn();
}

function dismissModal() {
	$('.modal_open').click(function() {
		modalCtn.hide();
		overlay.hide();
		modalCtn.html('');
	});
}