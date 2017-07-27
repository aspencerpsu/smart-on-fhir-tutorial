(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart) {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
        var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                      code: {
                        $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                              'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                              'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                      }
                    }
                  });

        var care = smart.patient.api.fetchAll({
                    type:'CarePlan',
                    query: {
                      status: {
                        $not: ["http://hl7.org/fhir/care-plan-status|completed"]
                      }
                    }
        });

        $.when(pt, obv, care).fail(onError);

        $.when(pt, obv, care).done(function(patient, obv, care) {
          console.log(care);
          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;
          var dob = new Date(patient.birthDate);
          var day = dob.getDate();
          var contact = patient.contact;
          var monthIndex = dob.getMonth() + 1;
          var year = dob.getFullYear();
          var dobStr = monthIndex + '/' + day + '/' + year;
          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== undefined) {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          var height = byCodes('8302-2');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');

          var p = defaultPatient();
          p.birthdate = dobStr;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.age = parseInt(calculateAge(dob));
          p.height = getQuantityValueAndUnit(height[0]);
          var kinstance;
          if (contact && typeof contact !== 'undefined') {
            kinstance = contact.keys()
            kin = kinstance.next(); //INIT it;
            obj = contact[kin.value]
            do {
              kintribute = {};
              kintribute.address = obj.address !== undefined ? obj.address.text : '';
              if (obj.name !== undefined) {
                kintribute.name = obj.name.given[0].concat('  ');
                kintribute.name = kintribute.name + " " +obj.name.family[0];
              }
              kintribute.telecom = {};
              console.log(kintribute); 
              console.log(obj);
              if(obj.telecom !== undefined){
                obj.telecom.forEach(function(_system){
                  _sys = _system.system;
                  kintribute.telecom[_sys] !== undefined ? kintribute.telecom[_sys].push([_system.use, _system.value]) : kintribute.telecom[_sys] = [];
                });
              }
              if(obj.relationship !== undefined){
                 kintribute.relationship = '';
                 obj.relationship.forEach(function(relation){
                   kintribute.relationship=kintribute.relationship + relation.text;
                 });
              }
              p.contacts.value.push(kintribute); //finished assignements for 1 contact
              kin = kinstance.next();
            } while(kin.done !== false);
         }

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      age: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
      contacts: {value: []}
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function isLeapYear(year) {
    return new Date(year, 1, 29).getMonth() === 1;
  }

  function calculateAge(date) {
    if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())) {
      var d = new Date(date), now = new Date();
      var years = now.getFullYear() - d.getFullYear();
      d.setFullYear(d.getFullYear() + years);
      if (d > now) {
        years--;
        d.setFullYear(d.getFullYear() - 1);
      }
      var days = (now.getTime() - d.getTime()) / (3600 * 24 * 1000);
      return years + days / (isLeapYear(now.getFullYear()) ? 366 : 365);
    }
    else {
      return undefined;
    }
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#age').html(p.age);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
    p.contacts.value.forEach(function(person){
      person.name ? $('#names').append('<td>'+person.name+'</td>') : console.log('no names');
      if (person.telecom['phone']!==undefined){
        person.telecom['phone'].forEach(function(port){
          port[0] == 'home' ? $('#phones').append('<td>'+port[1]+'</td>') : port[0] == 'mobile' ? $('#cells').append('<td>'+port[1]+'</td>') : console.log('no phone systems...');
        });
      }
      else if (person.telecom['email']!==undefined){
        $('#emails').append('<td>'+person.telecom['email'][1]+'</td>');
      }
      else {
        console.log('no telecom from patient...');
      };

      person.relationship !== undefined ? $('#relationships').append('<td>'+person.relationship+'</td>') : console.log('no relationships...');
      person.address !== undefined ? $('#addresses').append('<td>'+person.address+'</td>') : console.log('nothing');
    });
  }

})(window);
