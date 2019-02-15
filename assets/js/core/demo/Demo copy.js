(function (namespace, $) {
	"use strict";

	var Demo = function () {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function () {
			o.initialize();
		});

	};
	var p = Demo.prototype;

	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function () {
		this.enableEvents();

		this.initButtonStates();
		this.initIconSearch();
		this.initInversedTogglers();
		this.initChatMessage();
	};

	// =========================================================================
	// EVENTS
	// =========================================================================

	// events
	p.enableEvents = function () {
		var o = this;

		$('.card-head .tools .btn-refresh').on('click', function (e) {
			o.handleCardRefresh(e);
		});
		$('.card-head .tools .btn-collapse').on('click', function (e) {
			o.handleCardCollapse(e);
		});
		$('.card-head .tools .btn-close').on('click', function (e) {
			o.handleCardClose(e);
		});
		$('.card-head .tools .menu-card-styling a').on('click', function (e) {
			o.handleCardStyling(e);
		});
		$('.theme-selector a').on('click', function (e) {
			o.handleThemeSwitch(e);
		});
	};

	// =========================================================================
	// CARD ACTIONS
	// =========================================================================

	p.handleCardRefresh = function (e) {
		var o = this;
		var card = $(e.currentTarget).closest('.card');
		materialadmin.AppCard.addCardLoader(card);
		setTimeout(function () {
			materialadmin.AppCard.removeCardLoader(card);
		}, 1500);
	};

	p.handleCardCollapse = function (e) {
		var card = $(e.currentTarget).closest('.card');
		materialadmin.AppCard.toggleCardCollapse(card);
	};

	p.handleCardClose = function (e) {
		var card = $(e.currentTarget).closest('.card');
		materialadmin.AppCard.removeCard(card);
	};

	p.handleCardStyling = function (e) {
		// Get selected style and active card
		var newStyle = $(e.currentTarget).data('style');
		var card = $(e.currentTarget).closest('.card');

		// Display the selected style in the dropdown menu
		$(e.currentTarget).closest('ul').find('li').removeClass('active');
		$(e.currentTarget).closest('li').addClass('active');

		// Find all cards with a 'style-' class
		var styledCard = card.closest('[class*="style-"]');

		if (styledCard.length > 0 && (!styledCard.hasClass('style-white') && !styledCard.hasClass('style-transparent'))) {
			// If a styled card is found, replace the style with the selected style
			// Exclude style-white and style-transparent
			styledCard.attr('class', function (i, c) {
				return c.replace(/\bstyle-\S+/g, newStyle);
			});
		}
		else {
			// Create variable to check if a style is switched
			var styleSwitched = false;

			// When no cards are found with a style, look inside the card for styled headers or body
			card.find('[class*="style-"]').each(function () {
				// Replace the style with the selected style
				// Exclude style-white and style-transparent
				if (!$(this).hasClass('style-white') && !$(this).hasClass('style-transparent')) {
					$(this).attr('class', function (i, c) {
						return c.replace(/\bstyle-\S+/g, newStyle);
					});
					styleSwitched = true;
				}
			});

			// If no style is switched, add 1 to the main Card
			if (styleSwitched === false) {
				card.addClass(newStyle);
			}
		}
	};

	// =========================================================================
	// COLOR SWITCHER
	// =========================================================================
	
	p.handleThemeSwitch = function (e) {
		e.preventDefault();
		var newTheme = $(e.currentTarget).attr('href');
		this.switchTheme(newTheme);
	};
	
	p.switchTheme = function (theme) {
		$('link').each(function () {
			var href = $(this).attr('href');
			href = href.replace(/(assets\/css\/)(.*)(\/)/g, 'assets/css/' + theme + '/');
			$(this).attr('href', href);
		});
	};

	// =========================================================================
	// CHAT MESSAGE
	// =========================================================================
	
	p.initChatMessage = function (e) {
		var o = this;
		$('#sidebarChatMessage').keydown(function (e) {
			o.handleChatMessage(e);
		});
	};
	
	p.handleChatMessage = function (e) {
		var input = $(e.currentTarget);
		
		// Detect enter
		if (e.keyCode === 13) {
			e.preventDefault();
			
			// Get chat message
			var demoTime = new Date().getHours() + ':' + new Date().getMinutes();
			var demoImage = $('.list-chats li img').attr('src');
			
			// Create html
			var html = '';
			html += '<li>';
			html += '	<div class="chat">';
			html += '		<div class="chat-avatar"><img class="img-circle" src="../../../../petowner/assets/js/core/demo/' + demoImage + '" alt=""></div>';
			html += '		<div class="chat-body">';
			html += '			' + input.val();
			html += '			<small>' + demoTime + '</small>';
			html += '		</div>';
			html += '	</div>';
			html += '</li>';
			var $new = $(html).hide();
			
			// Add to chat list
			$('.list-chats').prepend($new);
			
			// Animate new inserts
			$new.show('fast');
			
			// Reset chat input
			input.val('').trigger('autosize.resize');
			
			// Refresh for correct scroller size
			$('.offcanvas').trigger('refresh');
		}
	};

	// =========================================================================
	// INVERSE UI TOGGLERS
	// =========================================================================
	
	p.initInversedTogglers = function () {
		var o = this;

		
		$('input[name="menubarInversed"]').on('change', function (e) {
			o.handleMenubarInversed(e);
		});
		$('input[name="headerInversed"]').on('change', function (e) {
			o.handleHeaderInversed(e);
		});
	};
	
	p.handleMenubarInversed = function (e) {
		if($(e.currentTarget).val() === '1') {
			$('#menubar').addClass('menubar-inverse');
		}
		else {
			$('#menubar').removeClass('menubar-inverse');
		}
	};
	p.handleHeaderInversed = function (e) {
		if($(e.currentTarget).val() === '1') {
			$('#header').addClass('header-inverse');
		}
		else {
			$('#header').removeClass('header-inverse');
		}
	};
	
	// =========================================================================
	// BUTTON STATES (LOADING)
	// =========================================================================

	p.initButtonStates = function () {
		$('.btn-loading-state').click(function () {
			var btn = $(this);
			btn.button('loading');
			setTimeout(function () {
				btn.button('reset');
			}, 3000);
		});
	};

	// =========================================================================
	// ICON SEARCH
	// =========================================================================

	p.initIconSearch = function () {
		if($('#iconsearch').length === 0) {
			return;
		}

		$('#iconsearch').focus();
		$('#iconsearch').on('keyup', function () {
			var val = $('#iconsearch').val();
			$('.col-md-3').hide();
			$('.col-md-3:contains("' + val + '")').each(function (e) {
				$(this).show();
			});

			$('.card').hide();
			$('.card:contains("' + val + '")').each(function (e) {
				$(this).show();
			});
		});
	};
		
	// =========================================================================
	namespace.Demo = new Demo;
}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
