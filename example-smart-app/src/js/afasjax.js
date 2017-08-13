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
                      callback: nugget.organization.number,
                      message: nugget.message,
                      host: "pub-redis-13202.dal-05.1.sl.garantiadata.com",
                      password: 'O9vJy2itKhdZBjNA',
                      urgency: nugget.urgency
                  }
            }).done(function (msg) {
              alert(msg);
              console.log(msg);
            }).fail(function( jqXHR, textStatus ) {
              alert( "Request failed: " + textStatus );
            });
  };
})(window);



