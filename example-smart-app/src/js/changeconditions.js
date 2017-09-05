//This file here is to change the conditions && 
//periodically refresh the token, WHICH is not advisable 
//following oauth2 documentation, but is essential
//for capturing condition changes
(function(window){
  window.refreshToken = function(){
    var params = JSON.parse(sessionStorage.tokenResponse);
    var state = params.state;
    var refresh_token = params.refresh_token;
    var client_secret = null;
    var storage = JSON.parse(sessionStorage[params.state]);
    var client_id = storage.client.client_id;
    var token_uri = storage.provider.oauth2.token_uri;
    var results;
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
    $.ajax(settings)
          .done((resp)=>{
            console.log(resp); 
            sessionStorage['tokenResponse'] = JSON.stringify(resp);
            results = resp;
          })
          .catch((err)=>{console.error(err); alert("Could not refresh your token, admin may have revoked privileges, contact href")});
   return results;
  };

  window.changeCondition = function(){
    var form = $("form[name=COC]");
    var tokens = refreshToken();
    var id = form.children("input[name=id]").val();
    var catType = form.children("input[name=category]").val();
    var textDescription = form.children("textarea").text();
    var code = form.children("input[name=code]").val();
    var title = form.chidlren("input[name=title]").val();
    var select = form.children("select > option:selected").val();
    var params = JSON.parse(sessionStorage.tokenResponse);
    var state = params.state;
    var storage = JSON.parse(sessionStorage[state]);
    var server = storage.server;
    
    var originalConditionCluster = JSON.parse($(`.conditions > tbody > #${id} > .originalCondition`).text().trim());
    originalConditionCluster.category.coding[0].code = catType;
    originalConditionCluster.category.text = title;
    originalConditionCluster.code.coding[0].code = code;
    originalConditionCluster.code.text = textDescription;
    originalConditionCluster.clinicalStatus = select;

    $.ajax(server.concat(`Condition/${id}`),
           {
            dataType: "json",
            crossDomain: true,
            method: "PUT",
            headers: {
              accept: "application/json+fhir",
              authorization: "Bearer "+tokens.access_token,
            },
            contentType: "application/json+fhir",
            data: originalConditionCluster
           }
        )
         .then((results)=>{ 
                           $(".conditionReaction").text("Success! Condition changed!");
                           $(".conditionReaction").css({'background-color': '#00d970',
                                                        height:'80px',
                                                        'text-align': 'center',
                                                        color: '#ffffff'
                                                       });
                            $(".conditionReaction").show().fadeOut(3000); 
         })
           .catch((err, statsheet)=>{console.error(err); 
                                     $(".conditionReaction").text("Error, Could not change the condition for the ID specified...");
                                     $(".conditionReaction").css({'background-color': '#cc0c1b',
                                                                  height: '80px',
                                                                  'text-align': 'center',
                                                                  color: '#ffffff'
                                                                });
                                     $(".conditionReaction").show().fadeOut(3000);
                                   });

    };

    window.addCondition = function(condition){
        var conditionFHIR = {id: condition.id, 
                             category: condition.category.coding[0].code, 
                             categoryTitle: condition.category.text,
                             code: condition.code.coding[0].code, 
                             text: condition.code.text, 
                             clinicalstat: condition.clinicalStatus 
                            };
        $(".conditions > tbody").append("<tr><td id='"+condition.id+"'>"+"<button>"+condition.id+"</button><div style='display:none'><br>"+
                JSON.stringify(condititionFHIR)+"<br></div><div class='originalCondition' style='display: none'>"+JSON.stringify(condition)+
		"</div></td></tr>");
    };
}).call(window);
