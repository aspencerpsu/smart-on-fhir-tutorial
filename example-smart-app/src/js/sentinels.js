(function(window){

  var plansUpdated;

  function SentinelInstance() {
    return {
            row: '',
            pres: [],
            memos: 0,
            isUpdated: false //default
           }
  };

  window.newAddendums = function(){

    return setInterval(function(){ return plansUpdated.forEach(function(element, index){
      console.log("at least it's running on a regular interval");
      pt = $('#fname').text() + " " + $('#lname').text();
      $row = element.row;
      if (element.memos != $('tr.'+$row+' > .details > .plan-raw > pre').length){
        var plans = $('tr.'+$row+' > .details > .plan-raw > pre');
        element.isUpdated = true;
        afas_or = confirm("Patient "+pt+"'s information has changed, do you want to initiate AFAS to send a message to the proxy?");
        afas_or ? console.log("Prompt a web socket to send pubsub information") : [element.isUpdated = false, element.memos=plans.length, element.pres = plans];
      }
    })}, 15000);
  };

  $.when(plansReady).fail(function(){
    console.debug("No care plans defined for subject");
    delete newAddendums; //remove from heap??
  });

  $.when(plansReady).done(function(){
    console.debug("I am prepared!");
    var sentinel;
    plansUpdated = $('.details > .plan-raw').map(function(index, value){
      sentinel = new SentinelInstance();//create a new sentinal instance for the providers list of patients;
      sentinel.memos = $(this).children('pre').length; //used as a justification for a change made to the list;
      sentinel.pres  = $(this).children('pre');
      sentinel.row = $(this).parent().parent().attr('class'); //the row corresponding to this element;
      return sentinel;
     }).get();
    var intervalID = window.newAddendums();
    console.log(intervalID);
  });
  
})(window);
