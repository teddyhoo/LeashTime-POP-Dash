(function(namespace, $) {
	"use strict";

	var LeashtimeFormWizard = function() {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function() {
			o.initialize();
		});

	};
	var p = LeashtimeFormWizard.prototype;

	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function() {
		this._initWizard();
	};

	// =========================================================================
	// LEASHTIME WIZARD
	// =========================================================================

	p._initWizard = function() {
		var o = this;
		$('#leashtimeAccountWizard').bootstrapWizard({
			onTabShow: function(tab, navigation, index) {
				o._handleTabShow(tab, navigation, index, $('#leashtimeAccountWizard'));
			},
	  		onNext: function(tab, navigation, index) {
				var form = $('#leashtimeAccountWizard').find('.form-validation');
	  			var valid = form.valid();
	  			if(!valid) {
	  				form.data('validator').focusInvalid();
	  				return false;
	  			}
	  		}
		});
	};

	p._handleTabShow = function(tab, navigation, index, wizard){
		var total = navigation.find('li').length;
		var current = index + 0;
		var percent = (current / (total - 1)) * 100;
		var percentWidth = 100 - (100 / total) + '%';

		navigation.find('li').removeClass('done');
		navigation.find('li.active').prevAll().addClass('done');

		$('#submit-new-account').prop('disabled', false);

		wizard.find('.progress-bar').css({width: percent + '%'});
		$('.form-wizard-horizontal').find('.progress').css({'width': percentWidth});
	};

	// =========================================================================
	namespace.LeashtimeFormWizard = new LeashtimeFormWizard;
}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
