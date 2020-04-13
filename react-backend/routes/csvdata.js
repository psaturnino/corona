const express = require('express');
const router = express.Router();
const fs = require('fs');
const https = require('https');


function download(url, dest, callback) {
  const file = fs.createWriteStream(dest);
  https.get(url, function (response) {
      response.pipe(file);
      file.on('finish', function () {
          file.close(callback); // close() is async, call callback after close completes.
      });
      file.on('error', function (err) {
          fs.unlink(dest); // Delete the file async. (But we don't check the result)
          
      });
  });
}

class CSVData {
  remoteFiles = new Array("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv", "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv", "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv");
  
  localFiles = new Array('public/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv', 'public/csse_covid_19_time_series/time_series_covid19_deaths_global.csv', 'public/csse_covid_19_time_series/time_series_covid19_recovered_global.csv');

  countries = [];
  startAt = 0;

  constructor (countries) {
    if (!countries) countries = ["all"]
    this.countries = countries
  }

  setInterval (interval) {
    this.startAt = interval?interval:0
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
    
    stack.forEach(element => {

      element = element.replace("Korea, South", "Korea South")
      element = element.replace("Bonaire, Sint Eustatius and Saba", "Bonaire Sint Eustatius and Saba")
      element = element.split('"').join('');
      element_ = element.split(",")
      
      if (i && element_[1]) {
        if (countries.indexOf(element_[1]) == -1) countries.push(element_[1])
      }
      i++;
  
    })
  
    return countries
  }

  getDays(stack) {

    let days = [], j=0, i=0
    
    let element_ = stack[0].split(",")
    
    element_.shift()
    element_.shift()
    element_.shift()
    element_.shift()
  
    element_.forEach(elem => {
      if (j >= (element_.length - (this.startAt?this.startAt:element_.length))) { 
        elem = elem.split("/")
        days[i] = elem[1]+"."+elem[0]
        i++;
      }
      j++
    });
  
    return days
  }

  getDailyAmount(stack, total_days) {
    let element_ = []
    let j = 0, current = 0, i=0, c=0, lastcurrent=0;
    
    let stackResults = [], stackTotals = [], stackDailyIncrease = []
    
    this.countries.forEach(country => {

      stackResults[c] = []
      stackTotals[c] = []
      
      stack.forEach(element => {

        element = element.replace("Korea, South", "Korea South")
        element = element.replace("Bonaire, Sint Eustatius and Saba", "Bonaire Sint Eustatius and Saba")
        
        element = element.split('"').join('');
        
        element_ = element.split(",")
        
        if ((element_[1] == country) || country == "all") {

          element_.shift()
          element_.shift()
          element_.shift()
          element_.shift()
          
          j=0
          i=0
          
          element_.forEach(elem => {
            if (j >= (element_.length - (this.startAt?this.startAt:element_.length))) { 
              if (!stackResults[c][i]) stackResults[c][i] = 0
              
              current = (typeof parseInt(elem) !== 'undefined' && parseInt(elem) != null)?parseInt(elem):0;

              stackResults[c][i] += current
              
              if (j == (element_.length-1)) {
                stackTotals[c] = [stackResults[c][i]]
              }
              i++;
            }
            j++;
          });
        }
      });
      c++
    });

    let lastDayValue = []
    stackResults.forEach((element, key) => {
      stackDailyIncrease[key] = [];
      lastDayValue[key] = [];
      i=0
      element.forEach(elem => {
        
          current = elem
          stackDailyIncrease[key][i] = (current - lastcurrent)>0?(current - lastcurrent):0
          lastcurrent = current

          if (total_days-1 == i) lastDayValue[key] = stackDailyIncrease[key][i]
          i++
      
      });
    });

    
    return [stackResults, stackDailyIncrease, stackTotals, lastDayValue]
  }

  updateData(callback) {
    download(this.remoteFiles[0], this.localFiles[0],
     () => {download(this.remoteFiles[1], this.localFiles[1],
        () => {download(this.remoteFiles[2], this.localFiles[2], () => {callback()})}
      )
    })
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
    
    data[2] = this.getDailyAmount(dataArrayTotalCases, data[1].length)
    data[3] = this.getDailyAmount(dataArrayTotalDeaths, data[1].length)
    data[4] = this.getDailyAmount(dataArrayTotalRecovered, data[1].length)

    data[5] = this.countries
    
    return data
  }

}



router.get('/:id', function(req, res, next) {
  
  const params = req.params.id.split(",")
  CSVData_ = new CSVData(params);
  if (req.query && req.query.interval != null) CSVData_.setInterval (req.query.interval)

  if (req.query && req.query.updatedata != null) {
    CSVData_.updateData(() => {
      
        let result = (CSVData_.getCsvData())
        res.send(JSON.stringify(result))
      
    })
    return;
  }

  const result = CSVData_.getCsvData()
  res.send(JSON.stringify(result))
  return;
  
})

router.get('/', function(req, res, next) {

  CSVData_ = new CSVData();
  if (req.query && req.query.interval) CSVData_.setInterval (req.query.interval)
  
  if (req.query && req.query.updatedata != null) {
    CSVData_.updateData(() => {
      
        let result = (CSVData_.getCsvData())
        res.send(JSON.stringify(result))
      
    })
    return;
  }
  
  const result = (CSVData_.getCsvData())
  res.send(JSON.stringify(result))
  return;
  
});

module.exports = router;