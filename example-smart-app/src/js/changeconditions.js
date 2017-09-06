//This file here is to change the conditions && 
//periodically refresh the token, WHICH is not advisable 
//following oauth2 documentation, but is essential
//for capturing condition changes
(function(){
  window.refreshToken = function(){
    var a_defer = $.Deferred(),
        params = JSON.parse(sessionStorage.tokenResponse),
        state = params.state,
        refresh_token = params.refresh_token,
        client_secret = null,
        storage = JSON.parse(sessionStorage[params.state]),
        client_id = storage.client.client_id,
        token_uri = storage.provider.oauth2.token_uri,
        results,
        data = {
            grant_type: "refresh_token",
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refresh_token
        },
        settings = {
          "crossDomain": true,
          "url": token_uri,
          "method": "POST",
          "data": data,
          "dataType": "json"
        };
    $.ajax(settings)
            .done((resp)=>{
              console.log(resp); 
              results = resp;
              a_defer.resolve(results);
            })
          .catch((err)=>{console.error(err); alert("Could not refresh your token, admin may have revoked privileges, contact href")});
    return a_defer.promise();
  };

  window.changeCondition = function(){
    var form = $("form[name=COC]");
        tokens = refreshToken();
    tokens.done((rez)=>{

        var id = form.children("input[name=id]").attr("placeholder"),
            catType = form.children("fieldset").children("input[name=category]").filter(":checked").val(),
            category = catType=="diagnosis"?"Diagnosis":"Problem",
            textDescription = form.children("textarea").text(),
            title = form.children("input[name=title]").val(),
            snoCode = form.children("input[list=codes]").val(),
            snoDescription = form.children("datalist > option:selected").val(),
            clinicalSelection = form.children("select").children("option:selected").val(),
            params = JSON.parse(sessionStorage.tokenResponse),
            state = params.state,
            storage = JSON.parse(sessionStorage[state]),
            server = storage.server;
        console.debug(id, catType, category, textDescription, title, snoCode, snoDescription, clinicalSelection);
        var originalConditionCluster = JSON.parse($(`.conditions > tbody > tr > #${id} > .originalCondition`).text().trim());
        console.debug(originalConditionCluster);
        originalConditionCluster.category.coding[0].code = catType;
        originalConditionCluster.category.coding[0].display = category;
        originalConditionCluster.category.text = title;
        originalConditionCluster.code.coding[0].code = snoCode;
        originalConditionCluster.code.coding[0].display = snoDescription;
        originalConditionCluster.code.text = textDescription;
        originalConditionCluster.clinicalStatus = clinicalSelection;
        console.log(originalConditionCluster.meta.versionId);
        $.ajax(server.concat(`/Condition/${id}`),
               {
                dataType: "json",
                crossDomain: true,
                method: "PUT",
                headers: {
                  accept: "application/json+fhir",
                  authorization: "Bearer "+rez.access_token,
                  "If-Match": "W/\"".concat(originalConditionCluster.meta.versionId).concat("\""),
                  "Content-Type": "application/json+fhir"
                },
                contentType: "application/json+fhir",
                data: JSON.stringify(originalConditionCluster)
               }
            )
             .then((results)=>{ 
                               console.log(results);
                               $(".conditionReaction").text("Success! Condition changed!");
                               $(".conditionReaction").css({'background-color': '#00d970',
                                                            height:'80px',
                                                            'text-align': 'center',
                                                            color: '#ffffff'
                                                           });
                                $(".conditionReaction").show().fadeOut(3000);
             })

             .fail((err, statsheet)=>{console.error(err); 
                                         $(".conditionReaction").text("Error, Could not change the condition for the ID specified...");
                                         $(".conditionReaction").css({'background-color': '#cc0c1b',
                                                                      height: '80px',
                                                                      'text-align': 'center',
                                                                      color: '#ffffff'
                                                                    });
                                         $(".conditionReaction").show().fadeOut(3000);
                                       });
             }).fail((err)=>console.error(err));
    };

    window.addCondition = function(condition){
        //some conditions may not be predefined with a SNOMED CT
        //index, see https://www.hl7.org/fhir/condition.html#9.2.3.3
        //for more information
        if (condition.code.coding == undefined){
          condition.code.coding = [];
          condition.code.coding.push({});
          condition.code.coding[0].code = "";
          condition.code.coding[0].system = "http://snomed.info/sct";
          condition.code.coding[0].display = "";
          condition.code.coding[0].userSelected = false;
        } else {
          //TODO;
          //Continue on, we may need to clarify additional details for conditions
        };

          var conditionFHIR = {id: condition.id, 
                               category: condition.category.coding[0].code, 
                               categoryTitle: condition.category.text,
                               code: condition.code.coding[0].code, 
                               codeDisplay: condition.code.coding[0].display,
                               text: condition.code.text, 
                               clinicalstat: condition.clinicalStatus 
                              };
        $(".conditions > tbody").append("<tr><td id='"+condition.id+"'>"+"<button>"+condition.id+"</button><div style='display:none'><br>"+
                JSON.stringify(conditionFHIR)+"<br></div><div class='originalCondition' style='display: none'>"+JSON.stringify(condition)+
		"</div></td></tr>");
    };
}).call(window);
