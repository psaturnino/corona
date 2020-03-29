const express = require('express');
const router = express.Router();
const fs = require('fs');
const https = require('https');



function getCountries(stack) {

  let i = 0;
  let element_ = [], country = []
  let countryName = ""

  stack.forEach(element => {
    
    element = element.replace("\"", "")
    element_ = element.split(",")

    if (i && element_[1]) {
      
      countryName = element_[1]/*+(element_[0]?" - "+element_[0]:"")*/
      if (country.indexOf(countryName) == -1) country.push(countryName)
      
      /*countryName = element_[1]+(element_[0]?" - "+element_[0]:"")
      country.push(countryName)*/
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
  let j = 0, current = 0, totals = 0;
  let countryName = ""

  stack.forEach(element => {
      element = element.replace("\"", "")
      element_ = element.split(",")

      //countryName = element_[1]+(element_[0]?" - "+element_[0]:"")
      
      countryName = element_[1]
      
      if ((country && countryName == country) || !country) {
        element_.shift()
        element_.shift()
        element_.shift()
        element_.shift()
        
        j=0
        
        element_.forEach(elem => {
          if (!results[j]) results[j] = 0
          current = (typeof parseInt(elem) !== 'undefined' && parseInt(elem) != null)?parseInt(elem):0;
          results[j] += current
          
          if (j == (element_.length-1)) totals += current
          j++;
        });
        
      }
  });

  return [results, totals]
}

function getCsvData(country="") {
  let data = new Array()
  data[0] = new Array();
  data[1] = new Array();
  data[2] = new Array();

  if (!fs.existsSync('public/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv') || !fs.existsSync('public/csse_covid_19_time_series/time_series_covid19_deaths_global.csv') || !fs.existsSync('public/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'))  return [];


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

function download(url, dest, callback) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function (response) {
      response.pipe(file);
      file.on('finish', function () {
          file.close(callback); // close() is async, call callback after close completes.
      });
      file.on('error', function (err) {
          fs.unlink(dest); // Delete the file async. (But we don't check the result)
          if (callback)
              callback(err.message);
      });
  });
}


function updateCsvData(callback) {
  let files = [
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv",
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv",
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"
  ]

  let dirs = [
    'public/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv',
    'public/csse_covid_19_time_series/time_series_covid19_deaths_global.csv',
    'public/csse_covid_19_time_series/time_series_covid19_recovered_global.csv'
  ]

  download(files[0], dirs[0],
    download(files[1], dirs[1],
      download(files[2], dirs[2], callback)
    )
  )

  
}

router.get('/:id', function(req, res, next) {
  let result = getCsvData(req.params.id)
  res.send(JSON.stringify(result))
  return;
})

router.get('/', function(req, res, next) {

  if (req.query && req.query.updatedata != null) {
    updateCsvData(() => {
      let result = (getCsvData())
      res.send(JSON.stringify(result))
    })
  }else {
    let result = (getCsvData())
    res.send(JSON.stringify(result))
  }

  return;
  
});

module.exports = router;
 