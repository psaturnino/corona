var express = require('express');
var router = express.Router();
const fs = require('fs');
/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

function getCountries(stack) {

  let i = 0;
  let element_ = [], country = []
  let countryName = ""

  stack.forEach(element => {
    
    element_ = element.split(",")

    if (i && element_[1]) {
      countryName = element_[1]+(element_[0]?" - "+element_[0]:"")
      country.push(countryName)
    }
    i++;

  })

  return country
}

function getDays(stack) {

  let element_ = stack[0].split(",")
  
  element_.shift()
  element_.shift()
  element_.shift()
  element_.shift()

  let days = []
  
  j=0
  element_.forEach(elem => {
    elem = elem.split("/")
    days[j] = elem[1]+"."+elem[0]
    j++
  });

  return days
}

function getDailyAmount(stack, country="") {
  let element_ = [], results = []
  let j = 0;
  let countryName = ""

  stack.forEach(element => {
      element_ = element.split(",")

      countryName = element_[1]+(element_[0]?" - "+element_[0]:"")
      
      if ((country && countryName == country) || !country) {
        element_.shift()
        element_.shift()
        element_.shift()
        element_.shift()
        
        j=0
        element_.forEach(elem => {
          if (!results[j]) results[j] = 0
          results[j] += (typeof parseInt(elem) !== 'undefined' && parseInt(elem) !== null)?parseInt(elem):0;
          
          j++;
        });
        
      }
  });

  return results
}

function getCsvData(country="") {
  let data = new Array()
  data[0] = new Array();
  data[1] = new Array();
  data[2] = new Array();

  let dataArrayTotalCases = fs.readFileSync('public/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv', 'utf8');
  dataArrayTotalCases = dataArrayTotalCases.split(/\r?\n/);

  let dataArrayTotalDeaths = fs.readFileSync('public/csse_covid_19_time_series/time_series_covid19_deaths_global.csv', 'utf8');
  dataArrayTotalDeaths = dataArrayTotalDeaths.split(/\r?\n/);
  dataArrayTotalDeaths.shift()

  let dataArrayTotalRecovered = fs.readFileSync('public/csse_covid_19_time_series/time_series_covid19_recovered_global.csv', 'utf8');
  dataArrayTotalRecovered = dataArrayTotalRecovered.split(/\r?\n/);
  dataArrayTotalRecovered.shift()

  data[0] = getCountries(dataArrayTotalCases)
  data[1] = getDays(dataArrayTotalCases)
  data[2] = getDailyAmount(dataArrayTotalCases, country)
  data[3] = getDailyAmount(dataArrayTotalDeaths, country)
  data[4] = getDailyAmount(dataArrayTotalRecovered, country)
  
  return data
}



router.get('/:id', function(req, res, next) {
  let result = getCsvData(req.params.id)
  res.send(JSON.stringify(result))
  return;
})

router.get('/', function(req, res, next) {
  let result = (getCsvData())
  res.send(JSON.stringify(result))
  
  return;

  /*res.json([{
    id: 1,
    username: "samsepi0l"
  }, {
    id: 2,
    username: "D0loresH4ze"
  }]);*/
});

module.exports = router;
 