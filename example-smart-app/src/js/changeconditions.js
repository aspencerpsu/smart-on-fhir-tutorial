//This file here is to change the conditions && 
//periodically refresh the token, WHICH is not advisable 
//following oauth2 documentation, but is essential
//for capturing condition changes
(function(){
   window.refreshToken = function(){
	var params = JSON.parse(sessionStorage.tokenResponse);
	var state = params.state;
	var refresh_token = params.refresh_token;
	var client_secret = null;
	var storage = JSON.parse(sessionStorage[params.state]);
	var client_id = storage.client.client_id;
	var token_uri = storage.provider.oauth2.token_uri;
	var data = {
			grant_type: "refresh_token",
			client_id: client_id,
			client_secret: client_secret,
			refresh_token: refresh_token
		    };
	var settings = {
			  "crossDomain": true,
			  "url": token_uri,
			  "method": "POST",
			  "data": data,
			  "dataType": "json"
			};
	$.ajax(settings).done((resp)=>{console.log(resp); 
					sessionStorage['tokenResponse'] = JSON.stringify(resp);
				      }).catch((err)=>{console.error(err); alert("Could not refresh your token, admin may have revoked privileges, contact href")});
   };
   window.changeCondition(
   window.addCondition = function(condition){
	var conditionFHIR = {id: condition.id, 
			     category: condition.category.coding[0].code, 
			     categoryTitle: condition.category.text,
			     code: condition.code.coding[0].code, 
			     text: condition.code.text, 
			     clinicalstat: condition.clinicalStatus };
	$(".conditions > tbody").append("<tr><td><button id=\'"+condition.id+"'>"+condition.id+"</button><div style='display:none'><br>"+
					JSON.stringify(condititionFHIR)+"<br></div></td></tr>");
   };
}).call(window);
