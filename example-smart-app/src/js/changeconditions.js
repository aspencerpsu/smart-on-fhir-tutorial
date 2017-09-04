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
	var client_id = storage.client_id;
	var token_uri = storage.provider.oauth2.token_uri;
	var data = {
			grant_type: "refresh_token&refresh_token=".concat(refresh_token),
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
					if(resp.statusCode == 200
					   || resp.statusCode == 201){
						sessionStorage['tokenResponse'] = JSON.stringify(resp);
						} else {
							alert("Incorrect refresh token, please consult with Consultant"+
								"Admin may have revoked your token");	
						};
					}).catch((err)=>{console.error(err);});
   };
  
}).call(window);
