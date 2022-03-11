// Define the Boxever queue
var _boxeverq = _boxeverq || [];

// Define the Boxever settings 
var _boxever_settings = {
	client_key: 'sise1eunua85o8xcud0kedjg1clno632', // Replace with your client key
	target: 'https://api.boxever.com/v1.2', // Replace with your API target endpoint specific to your data center region
	cookie_domain: '*.ch-ha-kso-cm.sitecoredemo.com/', // Replace with the top level cookie domain of the website that is being integrated e.g ".example.com" and not "www.example.com"
	pointOfSale: "Demo",  // Replace with your POS
	web_flow_target: "https://d35vb5cccm4xzp.cloudfront.net",
};

// Import the Boxever library asynchronously 
(function () {
	var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true;
	s.src = 'https://d1mj578wat5n4o.cloudfront.net/boxever-1.4.1.min.js';
	var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x);
})();

function delayUntilBrowserIdIsAvailable(functionToDelay) {
	if (window.Boxever == null || window.Boxever == undefined || window.Boxever === "undefined" || window.Boxever.getID() === "anonymous") {
		const timeToWaitInMilliseconds = 300;
		console.log('Sitecore CDP browserId is not yet available. Waiting ${timeToWaitInMilliseconds}ms before retrying.');
		window.setTimeout(delayUntilBrowserIdIsAvailable, timeToWaitInMilliseconds, functionToDelay);
	} else {
		functionToDelay();
	}
};

function View() {
	console.log('Sitecore CDP Tampermonkey script - sendViewEvent');
	var viewEvent = {
		"browser_id": Boxever.getID(),
		"channel": "WEB",
		"type": "VIEW",
		"language": "EN",
		"currency": "EUR",
		"page": window.location.pathname + window.location.search,
		"pos": "Demo",  // Replace with your POS
		"session_data": {
			"uri": window.location.pathname
		}
	};
	Boxever.eventCreate(viewEvent, function (data) { }, 'json');
	console.log('view event');
}

// Entry Point
delayUntilBrowserIdIsAvailable(View);
