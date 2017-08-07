(function(window){
  var plansUpdated = [];
  var checkUpdated_ = function(the_fucking_deferred_object){
    console.debug(the_fucking_deferred_object);

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
 

    function myAddies(){
      return plansUpdated.forEach(function(element, index){
        console.debug("at least it's running on a regular interval");
        pt = $('#fname').text() + " " + $('#lname').text();
        $row = element.row;
        if (element.memos != $('tr.'+$row+' > .details > .plan-raw > pre').length){
          var plans = $('tr.'+$row+' > .details > .plan-raw > pre');
          element.isUpdated = true;
          afas_or = confirm("Patient "+pt+"'s information has changed, do you want to initiate AFAS to send a message to the proxy?");
          afas_or ? console.debug("Prompt a web socket to send pubsub information") : [element.isUpdated = false, element.memos=plans.length, element.pres = plans];
        }
      });
    }     

    window.newAddendums = function(){
      return setInterval(myAddies, 10000);
    };

    $.when(the_fucking_deferred_object).fail(function(){
      console.debug("No care plans defined for subject");
      delete newAddendums; //remove from heap??
    });

  $.when(the_fucking_deferred_object).done(function(){
    var sentinel;
    var plansUpdated = $('.care > .details > .plan-raw').map(function(index, value){
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
  
})(window);
