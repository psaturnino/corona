const express = require('express');
const router = express.Router();
const fs = require('fs');
const https = require('https');


function download(url, dest, callback) {
  var file = fs.createWriteStream(dest);
  https.get(url, function (response) {
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

class CSVData {
  remoteFiles = new Array("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv", "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv", "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv");

  localFiles = new Array('public/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv', 'public/csse_covid_19_time_series/time_series_covid19_deaths_global.csv', 'public/csse_covid_19_time_series/time_series_covid19_recovered_global.csv');

  country = "";
  startAt = 0;

  constructor (country) {
    this.country = country
    this.startAt = 10
  }

  getFile(num) {
    return {
      remote: this.remoteFiles[num],
      local: this.localFiles[num]
    }
  }

  getCountries(stack) {

    let i = 0;
    let element_ = [], countries = []
    let countryName = ""
  
    stack.forEach(element => {
      
      element = element.replace("\"", "")
      element_ = element.split(",")
  
      if (i && element_[1]) {
        
        countryName = element_[1]/*+(element_[0]?" - "+element_[0]:"")*/
        if (countries.indexOf(countryName) == -1) countries.push(countryName)
        
        /*countryName = element_[1]+(element_[0]?" - "+element_[0]:"")
        country.push(countryName)*/
      }
      i++;
  
    })
  
    return countries
  }

  getDays(stack) {

    let element_ = stack[0].split(",")
    
    element_.shift()
    element_.shift()
    element_.shift()
    element_.shift()
  
    let days = []
    
    let j=0, i=0
    element_.forEach(elem => {
      if (j >= this.startAt) { 
        elem = elem.split("/")
        days[i] = elem[1]+"."+elem[0]
        i++;
      }
      j++
    });
  
    return days
  }

  getDailyAmount(stack) {
    let element_ = [], results = []
    let j = 0, current = 0, totals = 0, i=0;
    let countryName = ""
  
    stack.forEach(element => {
        element = element.replace("\"", "")
        element_ = element.split(",")
  
        //countryName = element_[1]+(element_[0]?" - "+element_[0]:"")
        
        countryName = element_[1]
        
        if ((this.country && countryName == this.country) || !this.country) {
          element_.shift()
          element_.shift()
          element_.shift()
          element_.shift()
          
          j=0
          i=0
          
          element_.forEach(elem => {
            if (j >= this.startAt) { 
              if (!results[i]) results[i] = 0
              current = (typeof parseInt(elem) !== 'undefined' && parseInt(elem) != null)?parseInt(elem):0;
              results[i] += current
              
              if (j == (element_.length-1)) totals += current
              i++;
            }
            j++;
          });
          
        }
    });
  
    return [results, totals]
  }

  updateData(callback) {
    download(this.remoteFiles[0], this.localFiles[0],
      download(this.remoteFiles[1], this.localFiles[1],
        download(this.remoteFiles[2], this.localFiles[2], callback)
      )
    )
  }

  getCsvData() {
    let data = new Array()
    data[0] = new Array();
    data[1] = new Array();
    data[2] = new Array();
    
    
    if (!fs.existsSync(this.getFile(0).local) || !fs.existsSync(this.getFile(1).local) || !fs.existsSync(this.getFile(2).local))  return [];
    
    let dataArrayTotalCases = fs.readFileSync(this.getFile(0).local, 'utf8');
    dataArrayTotalCases = dataArrayTotalCases.split(/\r?\n/);
    //dataArrayTotalCases.shift() //because of get Days, the first row hve the days
  
    let dataArrayTotalDeaths = fs.readFileSync(this.getFile(1).local, 'utf8');
    dataArrayTotalDeaths = dataArrayTotalDeaths.split(/\r?\n/);
    dataArrayTotalDeaths.shift()
  
    let dataArrayTotalRecovered = fs.readFileSync(this.getFile(2).local, 'utf8');
    
    dataArrayTotalRecovered = dataArrayTotalRecovered.split(/\r?\n/);
    dataArrayTotalRecovered.shift()
  
    
  
    data[0] = this.getCountries(dataArrayTotalCases)
    data[1] = this.getDays(dataArrayTotalCases)
  
    data[2] = this.getDailyAmount(dataArrayTotalCases)
    data[3] = this.getDailyAmount(dataArrayTotalDeaths)
    data[4] = this.getDailyAmount(dataArrayTotalRecovered)
    
    return data
  }

}







router.get('/:id', function(req, res, next) {
  
  CSVData_ = new CSVData(req.params.id);

  let result = CSVData_.getCsvData()
  res.send(JSON.stringify(result))
  return;
})

router.get('/', function(req, res, next) {

  CSVData_ = new CSVData();

  if (req.query && req.query.updatedata != null) {
    CSVData_.updateData(() => {
      let result = (CSVData_.getCsvData())
      res.send(JSON.stringify(result))
    })
  }else {
    let result = (CSVData_.getCsvData())
    res.send(JSON.stringify(result))
  }

  return;
  
});

module.exports = router;
 