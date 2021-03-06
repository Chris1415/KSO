// Mapping -> Ascii to Key
const A = 65;const B = 66;const C = 67;const D = 68;const E = 69;const F = 70;const G = 71;const H = 72;const I = 73;const J = 74;const K = 75;const L = 76;const M = 77;const N = 78;const O = 79;const P = 80;const Q = 81;const R = 82;const S = 83;const T = 84;const U = 85;const V = 86;const W = 87;const X = 88;const Y = 89;const Z = 90;

//Script settings
const ENABLE_KEYBOARD_SHORTCUTS = true;
const SEND_VIEW_EVENT = true;

// *********************************
// INIT
// *********************************
window._boxever_settings = {
	client_key: SITECORECDP_CLIENT_KEY,
	target: SITECORECDP_API_TARGET,
	pointOfSale: SITECORECDP_POINT_OF_SALE,
	cookie_domain: SITECORECDP_COOKIE_DOMAIN,
	web_flow_target: SITECORECDP_WEB_FLOW_TARGET,
};

function loadScCdpLib(callback) {
	console.log('Sitecore CDP code repository script - loadScCdpLib');
	var scriptElement = document.createElement('script');
	scriptElement.type = 'text/javascript';
	scriptElement.src = SITECORECDP_JS_LIB_SRC;
	scriptElement.async = false;
	document.head.appendChild(scriptElement);
}

function delayUntilBrowserIdIsAvailable(functionToDelay) {
	if (window.Boxever == null || window.Boxever == undefined || window.Boxever === "undefined" || window.Boxever.getID() === "anonymous") {
		const timeToWaitInMilliseconds = 300;
		console.log('Sitecore CDP browserId is not yet available. Waiting ${timeToWaitInMilliseconds}ms before retrying.');
		window.setTimeout(delayUntilBrowserIdIsAvailable, timeToWaitInMilliseconds, functionToDelay);
	} else {
		functionToDelay();
	}
}

loadScCdpLib();
if (SEND_VIEW_EVENT) {
	delayUntilBrowserIdIsAvailable(FunctionsAfterLoad);
}

function FunctionsAfterLoad(){
	View();
	AttachToRegistration();
	AttachToLogin();
	getLocation();
	DoTheTrick();
}

 function DoTheTrick(){
//*** CUSTOM TRICK
	var targetElements = document.getElementsByClassName("component container col-xs-12 full-width-promo");
	if(targetElements && targetElements[0]){
    		targetElements[0].id = "PersonalizedHeroTeaser";
	}
}

function AttachToRegistration(){
	var currentUrl = window.location.href;
	if(currentUrl.includes("register")){
		var registrationForm = document.getElementsByClassName("form-signin")[0];
		if(registrationForm){
			registrationForm.addEventListener("submit", IdentifyCustomerForRegistrationForm, false);
			console.log("Added custom Registration Submit Event");
		}
	}

	function IdentifyCustomerForRegistrationForm(e){
		var firstName = document.getElementById("registerFirstName").value;
		var lastName = document.getElementById("registerLastName").value;
		var mail = document.getElementById("registerEmail").value;
		Identify(IDENTITY_PROVIDER, mail, firstName, lastName, mail);
		console.log("Identified via Registration");
		console.log("Position: " + localStorage["CurrentPositionLat"] + "|" + localStorage["CurrentPositionLng"]);
		SetGuestLoyalty(mail);
		SetGuestCustomerData(mail);
	}
}

function AttachToLogin(){
	var currentUrl = window.location.href;
	if(!currentUrl.includes("register")){
		var registrationForm = document.getElementsByClassName("form-signin")[0];
		if(registrationForm){
			registrationForm.addEventListener("submit", IdentifyCustomerForLoginForm, false);
			console.log("Added custom Login Submit Event");
		}
	}

	function IdentifyCustomerForLoginForm(e){
		var mail = document.getElementById("loginEmail").value;
		IdentifyViaLogin(IDENTITY_PROVIDER, mail, mail);
		console.log("Identified via Login");
		console.log("Position: " + localStorage["CurrentPositionLat"] + "|" + localStorage["CurrentPositionLng"]);
		SetGuestLoyalty(mail);
		SetGuestCustomerData(mail);
	}
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(savePosition);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}

function savePosition(position) {
	//alert("Current Position is " + position.coords.latitude + "|" + position.coords.longitude);
	localStorage["CurrentPositionLat"] = position.coords.latitude;
	localStorage["CurrentPositionLng"] = position.coords.longitude;
}

function GrabCurrentCategory(){
        var targetUrl = "/at-home";
        var currentUrl = window.location.href;
        if(currentUrl.includes(targetUrl) ){
            console.log("Category match - at-home");
            return "at-home";
        }
        targetUrl = "/at-work";
        if(currentUrl.includes(targetUrl)){
            console.log("at-work");
            return "at-work";
        }

        return "NONE";
    }

//keyboard shortcuts
function KeyPress(e) {
	var evtobj = window.event ? event : e
	// CTRL + I = Identify via static values
	if (evtobj.keyCode == I && evtobj.ctrlKey) {
		Identify(IDENTITY_PROVIDER, IDENTITY_EMAIL, IDENTITY_FNAME, IDENTITY_LNAME, IDENTITY_EMAIL, GENDER);
		console.log("IDENTIFIED");
	}
	// Alt + A = Anonymize
	if (evtobj.keyCode == C && evtobj.altKey) {
		Anonymize();
		console.log("Anonymized");
	}
	// ....
}

if (ENABLE_KEYBOARD_SHORTCUTS) {
	document.onkeydown = KeyPress;
}

// *********************************
// CDP
// *********************************
function View() {
	console.log('Sitecore CDP code repository script - sendViewEvent');
	var category = GrabCurrentCategory();
	var viewEvent = {
		"browser_id": Boxever.getID(),
		"channel": "WEB",
		"type": "VIEW",
		"language": "EN",
		"currency": CURRENCY,
		"page": window.location.pathname + window.location.search,
		"pos": SITECORECDP_POINT_OF_SALE,
		"session_data": {
			"uri": window.location.pathname
		},
		 "ext" : {
            	}
	};
	 if(category && category != "NONE"){
            viewEvent.ext.category = category;
        }
	Boxever.eventCreate(viewEvent, function(data) {}, 'json');
	console.log('view event');
}

function Identify(identifier_provider, identifier_id, firstName, lastName, email, gender, dob, phoneNumber){
	_boxeverq.push(function() {
		var identityEvent = {
			"browser_id": Boxever.getID(),
			"channel": "WEB",
			"type": "IDENTITY",
			"language": "EN",
			"currency": CURRENCY,
			"page": window.location.pathname,
			"pos": SITECORECDP_POINT_OF_SALE,
			"gender": gender,
			"firstname": firstName,
			"lastname": lastName,
			"email" : email,
			"identifiers": [{
				"provider": identifier_provider,
				"id": identifier_id
			}]
		};
		identityEvent = Boxever.addUTMParams(identityEvent);
		Boxever.eventCreate(identityEvent, function(data){}, 'json');
	})}

function IdentifyViaLogin(identifier_provider, identifier_id, email){
	_boxeverq.push(function() {
		var identityEvent = {
			"browser_id": Boxever.getID(),
			"channel": "WEB",
			"type": "IDENTITY",
			"language": "EN",
			"currency": CURRENCY,
			"page": window.location.pathname,
			"pos": SITECORECDP_POINT_OF_SALE,
			"email" : email,
			"identifiers": [{
				"provider": identifier_provider,
				"id": identifier_id
			}]
		};
		identityEvent = Boxever.addUTMParams(identityEvent);
		Boxever.eventCreate(identityEvent, function(data){}, 'json');
	})}

function Anonymize(){
	_boxeverq.push(function () {
		Boxever.reset();
	});
	location.reload();
}
// *********************************

function SetGuestLoyalty(email){
	GetCustomerIdentity(GetCustomerBaseUrlByIdentityId(email, IDENTITY_PROVIDER), UpdateGuestData, GetLoyaltyGuestExtension(), GetMembershipParams());
}

function SetGuestCustomerData(email){
	GetCustomerIdentity(GetCustomerBaseUrlByIdentityId(email, IDENTITY_PROVIDER), UpdateGuestData, GetCustomerGuestExtension(), GetLocationParams());
}
//**********************************
// REST
//**********************************
function GetLocationParams(){
	return GetGuestExtensionParams("Coordinates");
}

function GetMembershipParams(){
	return GetGuestExtensionParams("Membership");
}

function GetGuestExtensionParams(groupName){
	var params = {};
	params["key"] = groupName;
	if(groupName == "Coordinates"){
		params["lat"] = localStorage["CurrentPositionLat"];
		params["lng"] = localStorage["CurrentPositionLng"];
	}
	else if(groupName == "Membership"){
		params["Tier"] = "Bronze";
		params["Points"] = "10";
	}
	return params;
}

function GetLoyaltyGuestExtension(){
	return GetGuestExtension("Loyalty");
}
function GetCustomerGuestExtension(){
	return GetGuestExtension("CustomerData");
}

function GetCustomerBaseUrlByIdentityId(identity_id, identity_provider){
	return "https://api.boxever.com/v2/guests/?identifiers.id="+identity_id + "&identifiers.provider="+identity_provider;
}

function GetCustomerBaseUrlByEmail(email){
	return "https://api.boxever.com/v2/guests/?email="+email;
}

function GetGuestExtension(extensionName){
	return "/ext" + extensionName;
}

function UpdateGuestData(baseUrl, relativePart, params){
	var url = baseUrl + relativePart;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.withCredentials = false;
	xhr.setRequestHeader("Authorization", 'Basic ' + btoa(SITECORECDP_CLIENT_KEY+':'+SITECORECDP_CLIENT_SECRET));
	xhr.onload = function () {
		console.log(xhr.responseText);
	};
	xhr.send(JSON.stringify(params));
}

function GetCustomerIdentity(url, callback, relPart, params){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.withCredentials = false;
	xhr.setRequestHeader("Authorization", 'Basic ' + btoa(SITECORECDP_CLIENT_KEY+':'+SITECORECDP_CLIENT_SECRET));
	xhr.onload = function () {
		var jsonResponse = JSON.parse(xhr.responseText);
		callback(jsonResponse.items[0].href, relPart, params);
	};
	xhr.send();
}
