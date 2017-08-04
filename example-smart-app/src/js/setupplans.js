(function(window){ 

  window.findCarePlans = function(plans){

    var def = $.Deferred();
    /* Initialize the care plan table */
    x = plans.length > 0 ? $('.care > tbody').append("<tr></tr>") : "closing"; //There's no plans break the closure
    if (x=="closing"){
      return def.reject();
    } else {
    
    plans.forEach(function(plan,index){
      var last_row = $('.care > tbody > tr:last-child');
      last_row.attr('class', "row"+plan.id);
      /*CATEGORY TITLE*/
      if (plan.category[0] !== undefined && plan.category[0].coding !== undefined){
        plan.category[0].coding.forEach(function(code){
          code.code != '' ? last_row.append("<td class=\'category\'>"+code.code+"<button class=\'pressed\' id=\'"+plan.id+"\'>overwrite?</button>"+"</td>") : "no codes";
        });
      }
      /*end*/

      /*STATUS*/
      //Status IS ALWAYS defined within the carePlan Resource; No need for conditional logics
      last_row.append("<td class=\'status\'>"+"<select name='stat"+plan.id+"'></select>"+"</td>");
      statuses = ['active', 'cancelled', 'suspended', 'completed', 'draft'];
      rotatethroughstatus(plan.status, statuses, plan.id);

      /* end */
      /*AUTHOR*/
      if (plan.author !== undefined){
        plan.author.forEach(function(pt){
          pt.display != '' ? last_row.append("<td class=\'author\'>"+pt.display+"</td>") : "no authors";
        });
      }
      /* end */
      /* DETAIL */
      if (plan.text !== undefined && plan.text.div != ''){
        last_row.append("<td class=\'details\'>"+plan.text.div+"<button class=\'subjectdetails\' id=\'" + plan.id + "\'>variguard?</button>"+"</td>");
        $('.details > div').addClass('plan-raw'); //For Later
      } else {
        console.warn('No details enlisted for this encounter plan for subject, please advise');
      };
      /* end */

      /* MODIFICATIONS */
      if (plan.modified == undefined && plan.meta == undefined){
        console.warn('No log sheet for patient\'s care provision, please address immediately');
      } else if (plan.modified !== undefined) {
        last_row.append("<td class=\'modified\' id=\'"+plan.id+"\'>"+plan.modified+"</td>");
      } else if (plan.meta !== undefined && plan.meta.lastUpdated !== undefined){
        last_row.append("<td class=\'modified\' id=\'"+plan.id+"\'>"+plan.meta.lastUpdated+"</td>");
      } else{
        console.error("Something wrong with the updated time stamp for this plan");
      };
      /* end */
      //Initialize adding rows
      plans.length -1 != index ? $('.care > tbody').append("<tr></tr>") : '' //move onto the next thing
     });
    return def.resolve(plans);
  };

  function rotatethroughstatus(stat, arr, id){
   arr.map(function(val, ind){ val == stat ? $('select[name=stat'+id+']').prepend("<option selected=\'selected\'>"+stat+"</option>") :
                                             $('select[name=stat'+id+']').append("<option>"+val+"</option>");
   });
  }

})(window);
