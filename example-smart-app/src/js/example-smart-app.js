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
                        $or: 'http://hl7.org/fhir/care-plan-status|active'
                      }
                    }
        });

        $.when(pt, obv, care).fail(onError);

        $.when(pt, obv, care).done(function(patient, obv, care){
          var actives_draft = [];
          if (care && typeof care !== 'undefined'){
            care.reduce(function(prev,cv,ci, array){
              cv.status == 'completed' ? prev : cv.status == 'cancelled' ? prev : prev.push(cv);
              return prev
            }, actives_draft);
          }
          
          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;
          var dob = new Date(patient.birthDate);
          var day = dob.getDate();
          var contacts = patient.contact;
          var monthIndex = dob.getMonth() + 1;
          var year = dob.getFullYear();
          var dobStr = monthIndex + '/' + day + '/' + year;
          var fname = '';
          var lname = '';
          var kins = [];
          var care = care;

          if (typeof patient.name[0] !== undefined) {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          var height = byCodes('8302-2');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');
          var person;

          var p = defaultPatient();
          p.birthdate = dobStr;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.age = parseInt(calculateAge(dob));
          p.height = getQuantityValueAndUnit(height[0]);
          if (contacts && typeof contacts !== 'undefined') {
            contacts.forEach(function(contact){
             person = new Kin();
             console.log(person);
             person = _email_house_mobile(contact.telecom, person);
             if (contact.name !== undefined){
              person.name = contact.name.given[0].concat(' ');
              person.name = person.name + " " + contact.name.family[0];
             }
             if (contact.address !== undefined){
               person.address = contact.address.text;
             }
             person.relationship = '';
             if (contact.relationship !== undefined){
               contact.relationship.forEach(function(relation){
                 person.relationship = person.relationship + ' ' + relation.text;
               });
             }
             kins.push[person];
            });
          }

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p, kins, actives_draft);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    $.when(ret).then(function(ret){
        return ret.promise();
        //See if this works?
      });
  };

  function defaultPatient(){
    return {
      isPatient: true,
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      age: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''}
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

  function Kin(){
    return {
      isKin: true,
      fname: {value: ''},
      lname: {value: ''},
      address: {value: ''},
      cell: {value: ''},
      home: {value: ''},
      email: {value: ''},
      other: {value: ''},
      relationship: {value: ''}
    }
  }

  function _email_house_mobile(_system, instance){
    for (var _sys in _system) {
      if (_sys.system == "phone"){
        if (_sys.use == "mobile"){
          instance.cell = _sys.value;
        }
        else if (_sys.use == "home"){
          instance.home = _sys.value;
        }
        else{
          instance.other = _sys.value;
        }
      }
      else if (_sys.system == "email"){
        instance.email = _sys.value;
      }
      else {
        //Nothing
      };
    }
    return instance;
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

  window.drawVisualization = function(arr) {
    var elm;
    $('#holder').show();
    $('#loading').hide();
    do{
         elm = arr. pop();
         if (Object.prototype.toString.call(elm) === '[object Object]' && elm.isPatient){
            $('#fname').html(elm.fname);
            $('#lname').html(elm.lname);
            $('#gender').html(elm.gender);
            $('#birthdate').html(elm.birthdate);
            $('#age').html(elm.age);
            $('#height').html(elm.height);
            $('#systolicbp').html(elm.systolicbp);
            $('#diastolicbp').html(elm.diastolicbp);
            $('#ldl').html(elm.ldl);
            $('#hdl').html(elm.hdl);
         } else if (Object.prototype.toString.call(elm) === '[object Array]'&& elm[0].isKin){
           elm.forEach(function(a){
             a. kin.name !== '' ? $('#names').append('<td>'+a.name+'</td>') : console.log('John Doe over here');
             a.cell !== '' ? $('#cells').append('<td>'+a.cell+'</td>') : console.log('No cell for kin');
             a.home !== '' ? $('#phones').append('<td>'+a.home+'</td>') : kin.other !== '' ? $('#phones').append('<td>'+a.other+'</td>') : console.log('Living in the dark ages');
             a.address !== '' ? $('#addresses').append('<td>'+a.address+'</td>') : console.log('nowheresville');
             a.relationship !== '' ? $('#relationships').append('<td>'+a.relationship+'</td>') : console.log('no relationships...');
           }); } else if (Object.prototype.toString.call(elm) === '[object Array]' && elm.length !== 0){
             console.log(elm);
           } else{
             console.debug('no information for patient');
           };
         } while (elm !== undefined);  
    };

})(window);
