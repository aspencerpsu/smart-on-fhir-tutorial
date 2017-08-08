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
              var  cryptomessage = require("crypto-js");
              var ciphertext = cryptomessage.AES.encrypt(first_message, 'secret-key');//use nurse name?
              var contacts = $('.contacts > tbody');
              console.log(contacts);
              var _get_callback = prompt("We have your number listed as (845)-598-6387: use as callback? Else, input within field");
              _get_callback == '' ? console.log('beginning to call...') : console.log('we can\'t call the kin');
              element.isUpdated = false;
              element.memos = plans.length;
              element.pres = plans;
          } else {
            element.isUpdated = false;
            element.memos = plans.length;
            element.pres = plans;
        };
      }
     }
   });
  }     

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
