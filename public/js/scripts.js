
// domainr bit
function domainrCheck(domain) {
	var timeoutSecs = 5;

	$.ajax({
			url: '/domainr?domain=' + domain,
			timeout: timeoutSecs * 1000
		})
		.success(function(data){
      if (!data.status || data.status.length <= 0) {
        return console.log('Fail: Couldnt find anything from Domainr');
      }
      console.log(data.status[0]);
      getDomainrData(data.status[0]);
		})
		.fail(function(res){
			console.log('Fail: ' + res.status);

			// highlight that shit
			$('main').find('.current').addClass('dead-item');

			$('.loading').hide();
			$('.errors').show();

			// error messages
			$('.errors').html('Ahh shit, it\'s broken.');
			setTimeout(function(){
				$('.errors').html('Ahh shit, it\'s broken. <a href="https://domainr.com/">Domainr</a> is failing to return anything on this domain.');
			}, 2000);
			setTimeout(function(){
				$('.errors').html('Ahh shit, it\'s broken. <a href="https://domainr.com/">Domainr</a> is failing to return anything on this domain. Sorry!');
			}, 5000);

	});
}

function getDomainrData(data) {
  var states = {
    'unregistrable': 'unavailable',
    'dpml': 'unavailable',
    'transferable': 'available',
    'inactive': 'available',
    'active': 'taken',
    'undelegated': 'maybe',
    'pending': 'maybe'
  };

	var state = states[data.summary] || 'unknown';
  console.log('state', state, data);

	var domain = data.domain;

	var link = ['',''];
	if(state === 'available' || state === 'maybe' || state === 'unknown'){
		link[0] = '<a title="Register this domain!" href="https://domainr.com/'+ domain +'">';
		link[1] = '</a>';
	}

	var domainPretty = link[0] + domain.replace('.', '<span class="'+ state +'">.</span>') + link[1];

	var suffix = '.' + data.zone;
	var suffixUrl = '#';

	var stateHtml = 'This domain is ' + link[0] + '<span class="'+ state +'">' + state + '</span>' + link[1] + '.';
	var suffixHtml = 'Read more about the <a href="'+ suffixUrl +'"><span>"' + suffix + '"</span></a>  suffix.';

	$('more-detail').addClass(state);
	$('.loading').hide();

	// replace the domain with a 'pretty' version
	$('.more-detail').find('h1').html(domainPretty);

	// add in the html for availability and the suffix info
	$('.availability').html(stateHtml).show();
	$('.suffix').html(suffixHtml).show();

	// highlight that shit
	$('main').find('.current').addClass(state + '-item');
}

// filters

function filters(){
	$('.text-filter').on('input', function(){ filterDomains(); });
	$('.domain-filter').change(function(){ filterDomains(); });
	$('.sort-filter').change(function(){ sortDomains(); });
}

function sortDomains(){
	var type = $('.sort-filter').val();
	$('main').find('li').tsort({ order: type });
}

function filterDomains(){

	var domainFilter = $('.domain-filter').val();	

	var textFilter = $('.text-filter').val();
	// trim, strip spaces, lowercase-ify and replace the fullstop
	textFilter = textFilter.trim().replace(/\s+/g, '').toLowerCase().replace('.', '');

	//reset
	$('main').find('li').show();

	$('main').find('li').each(function(){

		var domainItem = $(this).find('h1').html();

		// if the domain filter isn't none
		if(domainFilter != 'none'){
			// if the domain suffix isn't present in the word
			var domainPresent = (domainItem.indexOf(domainFilter) == -1);
			if(domainPresent){ $(this).hide(); }
		}

		// if the text isn't present in the domain hide it
		var textPresent = (domainItem.replace('.', '').indexOf(textFilter) == -1);
		if(textPresent){ $(this).hide(); }

	});

	domainCounter();
}
$(document).ready(function(){

	// controls when the more-detail should show
	moreDetailsControl();

	// filters the domains
	filters();

	// reseizes on load and whenever the page is resized
	headerResize();

	$(window).resize(function(){
		headerResize();
	});

	domainCounter();

});

function headerResize(){
	$('main').css('paddingTop', $('.top').outerHeight() );
	$('.more-detail').css('height', $('header').outerHeight() );
}

function domainCounter(){

	var shownDomains = 0;
	$('main').find('li').each(function(){
		if($(this).is(':visible')){ shownDomains++; }
	});

	if(shownDomains == 0){
		$('.amount').html('Try a different filter?');
		$('.big-error').addClass('big-error-shown');
	}else{
		$('.amount').html(shownDomains + ' domains returned!');
		$('.big-error').removeClass('big-error-shown');
	}
}

function moreDetailsControl(){
	$('main').find('li').click(function(){
		// the text from what you're clicking on
		var domain = $(this).text().trim();
		var domainPretty = domain.replace('.', '<span class="fullstop">.</span>')

		// resets
		$('.availability').hide();
		$('.suffix').hide();
		$('.errors').hide();


		$('.loading').show();
		$('.more-detail').find('h1').html(domainPretty);
		$('.more-detail').addClass('more-detail-hidden');
		$('main').find('li').removeClass('current');

		// adding new data
		domainrCheck(domain);

		// display that shit
		$(this).addClass('current');
		$('header').addClass('header-hidden');
		$('.more-detail').removeClass('more-detail-hidden');
	});

	$('.more-detail').find('.close').click(function(){
		$('header').removeClass('header-hidden');
		$('.more-detail').addClass('more-detail-hidden');
		$('.current').removeClass('current');

	});
}

function capitaliseString(string){
	return string.charAt(0).toUpperCase()+string.slice(1);
}
