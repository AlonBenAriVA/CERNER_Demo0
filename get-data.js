// var plotly = require('plotly')

function getPatientName (pt) {
  if (pt.name) {
    var names = pt.name.map(function(name) {
      return name.given.join(" ") + " " + name.family.join(" ");
    });
    return names.join(" / ")
  } else {
    return "anonymous";
  }
}

function getMedicationName (medCodings) {
  var coding = medCodings.find(function(c){
    return c.system == "http://www.nlm.nih.gov/research/umls/rxnorm";
  });

  return coding && coding.display || "Unnamed Medication(TM)"
}

function displayPatient (pt) {
  document.getElementById('patient_name').innerHTML = getPatientName(pt);
}

var med_list = document.getElementById('med_list');

function displayMedication (medCodings) {
  med_list.innerHTML += "<li> " + getMedicationName(medCodings) + "</li>";
}

// Create a FHIR client (server URL, patient id in `demo`)
var smart = FHIR.client(demo),
    pt = smart.patient;


// Create a patient banner by fetching + rendering demographics
smart.patient.read().then(function(pt) {
  displayPatient (pt);
});

// A more advanced query: search for active Prescriptions, including med details
smart.patient.api.fetchAllWithReferences({type: "MedicationOrder"},["MedicationOrder.medicationReference"]).then(function(results, refs) {
   results.forEach(function(prescription){
        if (prescription.medicationCodeableConcept) {
            displayMedication(prescription.medicationCodeableConcept.coding);
        } else if (prescription.medicationReference) {
            var med = refs(prescription, prescription.medicationReference);
            displayMedication(med && med.code.coding || []);
        }
   });
});

var MedOrder = smart.api.search({type:'MedicationOrder',query:{datewritten:{$gt:'2009-11-26'}}
})
MedOrder.done(function(prescriptions){
  console.log('Hello')
  // (prescriptions.data.entry).forEach(function(x){
  // console.log(x)
  // })

})

var vs = smart.api.search({type:'Observation'
// ,query:{'_id':"smart-Observation-81-systolic"}})
,query:{'code':"55284-4"}})
sys = [];
dia = []
vs.done(function(res){
  res.data.entry.forEach(function(v){
    bp = v.resource.component
    sys.push(bp[0].valueQuantity.value)
    dia.push(bp[1].valueQuantity.value)
  })
 var data2d = [
   {
     x:dia,
     y:sys,
     type:'histogram2d',
     colorscale : [['0' , 'rgb(0,225,100)'],['200', 'rgb(100,0,200)']],
     autobinx:false,
     xbins:{
       start:50,
       end:150,
       size:1
     },
     autobiny:false,
     ybins:{
       start:80,
       end:200,
       size:1
     }
    }
  ];
  var layout2d = {
    title:{
      text:'Systolic diatolic 2D histogram of 50 patients cohort'
    },

    xaxis:{
      title:{
        text:'diastolic(mmHg)'
      }
    },

    yaxis:{
      title:{
        text:'Systolic(mmHg)'
      }
    }
  }
 
 Plotly.newPlot('2Dhist',data2d,layout2d)
})


function displayObservation (observation) {
  var table = document.getElementById("obs_table");
  var row = table.insertRow(1);
 
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  // cell1.innerHTML = observation.code.coding[0].code;
  cell1.innerHTML = observation.effectiveDateTime
  cell2.innerHTML = observation.valueQuantity.value;
  cell3.innerHTML = observation.code.text
}


// look for patient vitals , query:{'code':['2571-8','2093-3']}})
var aPatient = smart.patient.api.fetchAll({type:'Observation',
    query:{'code': {$or:['13457-7']}} //'2085-9,'2093-3',,'2571-8','']}}
    }).then(function(results,refs){
      console.log("results: ",results)
      dates = [];
      vals = [];
    results.forEach(function(obs){
      dates.push(obs.effectiveDateTime)
      vals.push(obs.valueQuantity.value)
      try{
        displayObservation(obs)
       
      }
      catch(err) {
        console.log(err)
      }
      
      
    })
    console.log(dates,vals)
    var lineDiv = document.getElementById('plot');
    var data = {
      x:dates,
      y:vals,
      type:'scatter',
      mode:'markers',
      width:200,
      height:500
    }
    var layout = {
      title:{
        text:'LDL cholesterol',
        shapes : [
          {
            type:'line',
            x0:'2005',
            y0:90,
            x1:'2009',
            y1:90,
            line:{
              color:'rgb(255,0,0)',
              width:4,
              dash:'dashdot'
            }
          }
        ]

      }
    }
    var trace = [data]
    Plotly.newPlot('plot',trace,layout)
  })



