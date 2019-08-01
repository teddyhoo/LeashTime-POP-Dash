(function (namespace, $) {

	var all_visits = [];


	document.addEventListener('DOMContentLoaded', function() {

		let startDate = LTDateLib.getFullDate();
		console.log('Date: ' + startDate);
		getPhotoInfo(LTDateLib.calDaysBefore(startDate) , LTDateLib.calDaysAfter(startDate));
		jQuery("#data-nanogallery2").nanogallery2({
			thumbnailHeight:  'auto',
			thumbnailWidth:   220,
			galleryDisplayTransition : 'slideUp',
			galleryDisplayTransitionDuration : 1,
			thumbnailDisplayTransition : 'slideUp2',
			thumbnailDisplayTransitionDuration : 1200,
			thumbnailDisplayInterval : 500,
			thumbnailBorderHorizontal: 1,
			thumbnailBorderVertical: 1,
			thumbnailGutterHeight : 10,
			thumbnailGutterWidth : 20,
			thumbnailLabel:     { 
				position: 'onBottom',
				hideIcons: false, 
				titleFontSize: '1.1em', 
				displayDescription : true
			},
			icons : {
				thumbnailAlbum : "<i style=\"color:#e00;\" class=\"fa fa-search-plus\"></i>"
			},
			itemsBaseURL:     'assets/img/',
			items: [
				{ src: 'dog0.jpg', srct: 'dog0.jpg', title: 'Watch your head', description: 'Having so much much much fun'},
				{ src: 'Ball2.jpg', srct: 'Ball2.jpg', title: 'Play ball' },
				{ src: 'IMG_1247.jpg', srct: 'IMG_1247.jpg', title: 'Hide and seek' },
				{ src: 'Ball2.jpg', srct: 'Ball2.jpg', title: 'Play ball' },
				{ src: 'IMG_1246.jpg', srct: 'IMG_1246.jpg', title: 'Where are the treats?' },
				{ src: 'IMG_2009.jpg', srct: 'IMG_2009.jpg', title: 'Play ball' },
				{ src: 'IMG_1262.jpg', srct: 'IMG_1262.jpg', title: 'Where are the treats?' },
				{ src: 'IMG_1744.jpg', srct: 'IMG_1744.jpg', title: 'Where are the treats?' },
				{ src: 'IMG_1749.jpg', srct: 'IMG_1749.jpg', title: 'Where are the treats?' },
				{ src: 'IMG_1773.jpg', srct: 'IMG_1773.jpg', title: 'Where are the treats?' },
				{ src: 'Ball.jpg', srct:  'Ball.jpg', title: 'Play and Fun' },
				{ src: 'DogStand.jpg', srct:  'DogStand.jpg', title: 'Dog Standoff' },
				{ src: 'Lilly-close.jpg', srct:  'Lilly-close.jpg', title: 'Close up' },
			]
		});
	});



	async function getPhotoInfo(start, end) {
		all_visits = await LT.getPetOwnerVisitsAjax(this, start, end);
		all_visits.forEach((visit)=> {
			console.log(visit.appointmentid);
		});
	}	
}(this.materialadmin, window.jQuery)); 