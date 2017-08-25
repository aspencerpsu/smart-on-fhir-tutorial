/* AFAS ASYNC APP CALL 
 * -----------------------
 * This function will create a call
 * to the bluemix.net-AFAS-CLOUD by RESTful POST request
 *
 */
(function(window){

  window.afasjax = function(nugget){
    //Make an ajax call to the system
    $.ajax('https://afas-cloud.mybluemix.net/api/red-sub',
            {method: "POST",
              data: {
                      practitioner: nugget.practitioner,
                      callback: nugget.callback,
                      message: nugget.message,
                      urgency: nugget.urgency,
		      patient: nugget.patient,
		      contacts: JSON.stringify(nugget.contacts), 
                  },
              contentType: 'application/x-www-form-urlencoded',
              dataType: 'json',
	      crossDomain: true
            }
            ).done(function(msg) {
              alert(msg);
              console.log(msg);
            }).fail(function( jqXHR, textStatus ) {
              alert( "Request failed: " + textStatus );
            });
  };
})(window);



