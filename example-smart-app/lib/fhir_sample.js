//SAMPLE FHIR Conformance stadards using dstu2

//similar to the curl route, we are going to try modifying a patient contact information via request module using method PUT

var request = require('request');
/*
request.put({url: "https://fhir-ehr.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/Patient/1316024",
	     headers: {
			Accept: "application/json+fhir",
			Method: "PUT",
			Authorization: process.env.FHIR_ACCESS_TOKEN,
			},
	     body: JSON.stringify({age: 81}),
	    }, (err, response, body)=>{
		      if (!err){
			      if (response.statusCode == 500 ||
				  response.statusCode == 502 ||
				  response.statusCode == 404 ||
				  response.statusCode == 401 ||
				  response.statusCode == 403){
				      console.log(response.statusCode);
				      console.warn("Query pattern is incorrect");
				      console.warn(body);
				      console.log(new Date().toISOString());
			      } else if (response.statusCode == 200 ||
					 response.statusCode == 201){
				      console.log(body);
				      console.log(response.responseContent);
				      console.log("successfully changed the age of Peter");
			      } else {
				      console.error("Unrecognizable return data\n\n\n");
				      console.log(body);
				      console.log(response);
			      }
		      } else {
			      console.error(err.stack);
			      console.error(err);
		      };
	      }
);

request.post({url: "https://fhir-ehr.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca"Patient/1316024",
	    
	     headers: {
			Accept: "application/json+fhir",
			Method: "GET",
			Authorization: "Bearer "+process.env.FHIR_ACCESS_TOKEN,
		      },
	    }, (err, response, body)=>{
		      if (!err){
			      if (response.statusCode == 500 ||
				  response.statusCode == 502 ||
				  response.statusCode == 404 ||
				  response.statusCode == 401 ||
				  response.statusCode == 403){
				      console.log(response.statusCode);
				      console.warn("Query pattern is incorrect");
				      console.warn(response.headers);
				      console.log(new Date().toISOString());
			      } else if (response.statusCode == 200 ||
					 response.statusCode == 201){
				      console.log(body);
				      console.log(response.responseContent);
				      console.log("successfully changed the age of Peter");
			      } else {
				      console.error("Unrecognizable return data\n\n\n");
				      console.log(body);
				      console.log(response);
			      }
		      } else {
			      console.error(err.stack);
			      console.error(err);
		      };
	      }
);
*/


var request = require('request');
var bluebird = require('bluebird');
bluebird.promisifyAll(request);

request.postAsync({url: 'https://authorization.sandboxcerner.com/',
                       headers:{
			       Accept: "application/x-www-form-urlencoded",
                        },
			form: {
				scopes: "patient/Condition.read, patient/Condition.write profile openid online_access launch",
				audience: "https://fhir-ehr.sandbox.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca"
			 }
 }).then((response)=>{
	console.log(response);
}).catch(err=>console.error(err)); 

