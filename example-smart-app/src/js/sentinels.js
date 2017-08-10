(function(window){
  var plansUpdated = [];
  window.checkUpdated_ = function(deferred_object){
    console.debug(deferred_object);

    function SentinelInstance() {
      return {
              row: '',
              pres: [],
              memos: 0,
              isUpdated: false //default
             }
    };


      /****** May not be a good idea to use pop up boxes ******/
      /** Epic has an inbox for pending ***/
 

    function addToAFAS(){
      console.debug("at least it's running on a regular interval");
      return plansUpdated.forEach(function(element, index){
        pt = $('#fname').text() + " " + $('#lname').text();
        $row = element.row;

        if (element.memos != $('tr.'+$row+' > .details > .plan-raw > pre').length){

          if (!element.isUpdated){
            var plans = $('tr.'+$row+' > .details > .plan-raw > pre');
            element.isUpdated = true;
            afas_or = confirm("Patient "+pt+"'s information has changed, do you want to initiate AFAS to send a message to the proxy?");
            if (afas_or) {
              first_message = plans.filter(':first').text();
              /*TODO: add the user information when app is registered with user */
              /*XXX: Default is myself */
              provider = {name: "portal", organization: {number: "(845)-371-2125"}}
              parseMessage = parseForStatus(first_message,pt, provider);
              var contacts = $('.contacts > tbody > .names > td'); //list of the NAMES of hcproxies
              contacts = contacts.map(function(){ return $(this).text();}).get();
              parseMessage.contacts = [];
              contacts.forEach(function(elem){ parseMessage.contacts.push({name:elem}); });
              var cells = $('.contacts > tbody > .cells > td').each(function(index){
                parseMessage.contacts[index].cell = $(this).text();
              });
              var emails = $('.contacts tbody > .emails > td').each(function(index){
                parseMessage.contacts[index].email = $(this).text();
              });
              var home = $('contacts > tbody > .phones > td').each(function(index){
                parseMessage.contacts[index].land = $(this).text();
              });
              console.log(cells);
              console.log(emails);
              console.log(home);
              console.debug(contacts);

              /*TODO: we must call the user's name and telecom number for the organization
               * We must declare the user variables within the portal for the EMR system
               * for an example, I'm using my cell phone number for now
               */

              var _get_callback = prompt("We have your number listed as (845)-371-2125: use as callback? Else, input within field");
              if( _get_callback == '' ){
                     console.log('beginning to call...');
                     parseMessage.callback = "(845)-371-2125";
                     //use user's password?
                     console.log(parseMessage);
                     var ciphertext = CryptoJS.AES.encrypt(parseMessage, 'portal');                  
                     console.debug(ciphertext);
              } else {
                parseMessage.callback = _get_callback;
                console.log(parseMessage);
                var ciphertext = CryptoJS.AES.encrypt(parseMessage, 'portal');
                console.debug(ciphertext);
              };
                /*
                 *
                 * AFAS COMMUNCATION SECTION 
                 *
                 *
                 */
              element.isUpdated = false;
              element.memos = plans.length;
              element.pres = plans;
          } else {
              element.isUpdated = false;
              element.memos = plans.length;
              element.pres = plans;
          };
        };
      }; 
     });
  };   

    /* Functions */
    
    window.parseForStatus = function(message,patient, prov){
      var reg = /(Condition|Medication|Procedure|Observation):?/i;
      var determine_mess = message.match(reg);

      if (determine_mess !== null &&
          Object.prototype.toString.call(determine_mess) == "[object Array]"){

        switch (determine_mess[1]) {

          case "Condition":
            severity = determine_mess.input.match(/(severe|moderate|mild)/i);
            if (severity !== null &&
                Object.prototype.toString.call(severity) == "[object Array]"){
              var cluster = {'practicioner': prov.name, 'callback': prov.organization.number};

              if (severity[1] == "severe"){
                cluster.message = "Patient ".concat(patient).concat(" has undergone a severe condition, please contact ASAP ").concat(prov.organization.numer);
                cluster.urgency = 'call';
                return cluster; } else if (severity[1] == "moderate") {

                cluster.message = "Patient ".concat(patient).concat(" has a elevated condition, please call ").concat(prov.organization.number);
                cluster.urgency = 'text&email';
                return cluster; } else if (severity[1] == "mild") {
                return cluster; } else {
                console.warn("Nothing to send to the next-of-kin, false alarm...");
              };
            };
            break;
          
          case "Procedure":
            //ongoing
            console.error("Not ready for production");
            break;

          case "Observation":
            //ongoing
            console.error("Not ready for production");
            break;

          case "Medication":
            //ongoing 
            console.error("Not ready for production");
            break;  
        };
      } else {
        console.warn("You don't have any specific details to send to patient, please read fhi7.org for more examples ");
      }
    };

    window.newAddendums = function(){
      return setInterval(addToAFAS, 10000);
    };

    $.when(deferred_object).fail(function(){
      console.debug("No care plans defined for subject");
      delete newAddendums; //remove from heap??
    });


  $.when(deferred_object).done(function(){
    var sentinel;
    plansUpdated = $('.details > .plan-raw').map(function(index, value){
      sentinel = new SentinelInstance();//create a new sentinal instance for the providers list of patients;
      sentinel.memos = $(this).children('pre').length; //used as a justification for a change made to the list;
      sentinel.pres  = $(this).children('pre');
      sentinel.row = $(this).parent().parent().attr('class'); //the row corresponding to this element;
      return sentinel;
     }).get();
    console.debug(plansUpdated);
    var intervalID = window.newAddendums();
    console.debug(intervalID);
  });
 }
  
})(window);
