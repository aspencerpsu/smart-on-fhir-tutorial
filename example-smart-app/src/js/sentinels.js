(function(window){

  var plansUpdated;
  function SentinelInstance() {
    return {
            row: '',
            pres: [],
            memos: 0,
            isUpdated: false //default
           }
  }

  $.when(plansReady).fail(function(){
    console.debug("No care plans defined for subject");
    delete newaddendums; //remove from heap??
  });

  $.when(plansReady).done(function(){
    var sentinel;
    plansUpdated = $('.details > .plan-raw').map(function(index, value){
      sentinel = new SentintelInstance();//create a new sentinal instance for the providers list of patients;
      sentinel.memos = $(this).children('pre').length; //used as a justification for a change made to the list;
      sentinel.pres  = $(this).children('pre');
      sentinel.row = $(this).parent().parent().attr('class'); //the row corresponding to this element;
      return sentinel;
     }).get();
  });
  
  window.newAddendums = function(){

    return setInterval(plansUpdated.forEach(function(index,element){
      pt = $('#fname').text() + " " + $('#lname').text();
      $row = value.row;
      if (element.memos != $('tr.'+$row+' .details > .plan-raw > pre').length){
        var plans = $('tr.'+$row+' .details > .plan-raw > pre');
        element.isUpdated = true
        afas_or = confirm("Patient "+pt+"'s information has changed, do you want to initiate AFAS to send a message to the proxy?");
        afas_or ? console.log("Prompt a web socket to send pubsub information") : [element.isUpdated = false, element.memos=plans.length, element.pres = plans];
      }
    }), 15000);
  }
})(window);
