(function(window){ 

  window.findCarePlans = function(plans){

    /* Initialize the care plan table */
    x = plans.length > 0 ? $('.care > tbody').append("<tr></tr>") : "closing"; //There's no plans break the closure
    if (x=="closing"){
      return null;
    }
    
    plans.forEach(function(plan,index){
      var last_row = $('.care > tbody > tr:last-child')
      if (plan.category[0] !== undefined && plan.category[0].coding !== undefined){
        plan.category[0].coding.forEach(function(code){
          code.code != '' ? last_row.append("<td class=\'category\'>"+code.code+"<button class=\'pressed\' id=\'"+plan.id+"\'>overwrite?</button>"+"</td>") : "no codes";
        });
      }
      //Status IS ALWAYS defined within the carePlan Resource; No need for conditional logics
      last_row.append("<td class=\'status\' id=\'"+plan.id+"\'>"+plan.status+"<button class=\'pressed\' id=\'"+plan.id+"\'>overwrite?</button>"+"</td>");
      /* end */
      if (plan.author !== undefined){
        plan.author.forEach(function(pt){
          pt.display != '' ? last_row.append("<td class=\'author\'>"+pt.display+"</td>") : "no authors";
        });
      }
      if (plan.text !== undefined && plan.text.div != ''){
        last_row.append("<td class=\'details\'>"+plan.text.div+"<button class=\'subjectdetails\'>variguard?</button>"+"</td>");
        $('.details > div').addClass('plan-raw'); //For Later
      } else {
        console.warn('No details enlisted for this encounter plan for subject, please advise');
      };
      if (plan.meta == undefined || plan.meta.lastUpdated == undefined){
        if (plan.modified == undefined){
          console.warn('No log sheet for patient\'s care provision, please address immediately');
        }
        else if (plan.modified !== undefined) {
          last_row.append("<td>"+plan.modified+"</td>");
        }
       } else if (plan.meta !== undefined && plan.meta.lastUpdated !== undefined){
         last_row.append("<td>"+plan.meta.lastUpdated+"</td>"); } 
             else{
               console.error("Something wrong with the updated time stamp for this plan");
         };
      //Initialize adding rows
      plans.length -1 != index ? $('.care > tbody').append("<tr></tr>") : '' //move onto the next thing
     });
  };

})(window);
