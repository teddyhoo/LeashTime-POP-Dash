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
		
		dismissModal();
	});
});

function buildModalA() {
	var html = '<div id="modal_a" class="modal_dialog">' +
		'<div class="modal_header">' +
		'<div class="logo"></div>' +
		'<div class="close_button">&times;</div>' +
		'</div>' +
		'<div class="modal_body">' +
		'<h2 class="title">LETS GET STARTED</h2>' +
		'<form class="modal_form" name="form_a" action="" method="">' +
		'<div class="input_labl">Name</div>' +
		'<input type="text" required="required" class="modal_inpt" placeholder="" name="full_name" title="Enter your full name">' +
		'<div class="input_labl">Email</div>' +
		'<input type="email" required="required" class="modal_inpt" placeholder="" name="email" title="Enter a valid email address">' +
		'<div class="input_labl">Password</div>' +
		'<input type="password" required="required" class="modal_inpt" placeholder="" name="password" title="Enter a valid password">' +
		'<div class="input_labl">Confirm Password</div>' +
		'<input type="password" required="required" class="modal_inpt no_margin" placeholder="" name="confirm_password" title="Please confirm password">' +
		'</form>' +
		'</div>' +
		'<div class="divide"></div>' +
		'<div class="modal_footer">' +
		'<input type="submit" class="modal_button btn_dark btn-full" id="" value="REGISTER">' +
		'</div>' +
		'</div>';

	showModal(html);
}

function buildModalB() {
	var html = '<div id="modal_b" class="modal_dialog">' +
		'<div class="modal_header">' +
		'<div class="logo"></div>' +
		'<div class="close_button">&times;</div>' +
		'</div>' +
		'<div class="modal_body">' +
		'<h2 class="title">COME ON IN</h2>' +
		'<form class="modal_form" name="form_a" action="" method="">' +
		'<div class="input_labl">Email</div>' +
		'<input type="email" required="required" class="modal_inpt" placeholder="" name="email" title="Enter a valid email address">' +
		'<div class="input_labl">Password</div>' +
		'<input type="password" required="required" class="modal_inpt no_margin" placeholder="" name="password" title="Enter a valid password">' +
		'</form>' +
		'</div>' +
		'<div class="divide"></div>' +
		'<div class="modal_footer">' +
		'<input type="submit" class="modal_button btn_dark btn-full" id="" value="LOGIN">' +
		'</div>' +
		'</div>';

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
	var html = '<div id="modal_b" class="modal_dialog">' +
		'<div class="modal_header">' +
		'<div class="logo"></div>' +
		'<div class="close_button">&times;</div>' +
		'</div>' +
		'<div class="modal_body">' +
		'<h2 class="title">SET YOUR DESTINATION</h2>' +
		'<form class="modal_form" name="form_c" action="" method="">' +
		'<div class="custom-select">' +
		'<select class="country_select">' +
		'<option class="country_opt" value="0" disabled="" selected="">choose your country</option>' +
		inputOptions +
		'</select>' +
		'</div>';
		'</form>' +
		'</div>' +
		'<div class="divide"></div>' +
		'<div class="modal_footer">' +
		'<input type="submit" class="modal_button btn_dark btn-full" id="" value="SUBMIT">' +
		'</div>' +
		'</div>';
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