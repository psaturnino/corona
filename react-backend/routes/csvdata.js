const express = require('express');
const router = express.Router();
const fs = require('fs');
const https = require('https');
const csv = require('csv-parser')

class CSVData {
  remoteFiles = new Array("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv", "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv", "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv");
  
  localFiles = new Array('public/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv', 'public/csse_covid_19_time_series/time_series_covid19_deaths_global.csv', 'public/csse_covid_19_time_series/time_series_covid19_recovered_global.csv');

  selectedCountries = [];
  startAt = 0;

  constructor (selectedCountries, interval) {
    if (!selectedCountries) selectedCountries = ["all"]
    this.selectedCountries = selectedCountries

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
      
      if (element_[1]) {
        if (countries.indexOf(element_[1]) == -1) countries.push(element_[1])
      }
      i++;
  
    })
  
    return countries
  }

  getDays(stack) {

    let days = [], j=0, i=0
    
    let element_ = stack.split(",")
    
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
    
    this.selectedCountries.forEach(country => {

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


  
  downloadCSV(url, local) {
    
    return new Promise((resolve, reject) => {
      let file = fs.createWriteStream(local);
      https.get(url, function (response) {
          response.pipe(file);
          file.on('finish', function () {
            file.close(); // close() is async, call callback after close completes.
            if (file.bytesWritten < 1000) reject(false)
            else resolve(true)
          });
          file.on('error', function (err) {
            fs.unlink(local); // Delete the file async. (But we don't check the result)
            reject(false)
          });
      });
    })
  }
  
  readCSV(csv) {

    return new Promise((resolve, reject) => {
      let csvRes;
      try {

        if (!fs.existsSync(csv)) reject(false);

        fs.readFile(csv, 'utf8', (err, data) => {
          if (err) reject(false)
          else {
            csvRes = data.split(/\r?\n/);
            resolve(csvRes);
          }
        });
        
      } catch (error) {
        reject(false);
      }
    })
  }

  calculateCSV(total, deaths, recovered) {

    let days = total[0];
    total.shift() //because of get Days, the first row hve the days
    deaths.shift()
    recovered.shift()
    
    
    let data = new Array()

    data[0] = this.getCountries(total)
    data[1] = this.getDays(days)

    data[2] = this.getDailyAmount(total, data[1].length)
    data[3] = this.getDailyAmount(deaths, data[1].length)
    data[4] = this.getDailyAmount(recovered, data[1].length)

    data[5] = this.selectedCountries
    
    return data
  }

}


function handleRequest(req, res) {
  let interval = "", selectedCountries = ""
  
  if (req.query && req.query.interval != null) interval = req.query.interval
  if (req.params && req.params.id != null) selectedCountries = req.params.id.split(",")

  CSVData_ = new CSVData(selectedCountries, interval);

  if (req.query && req.query.updatedata != null) {

    
    let p1 = CSVData_.downloadCSV(CSVData_.getFile(0).remote, CSVData_.getFile(0).local);
    let p2 = CSVData_.downloadCSV(CSVData_.getFile(1).remote, CSVData_.getFile(1).local);
    let p3 = CSVData_.downloadCSV(CSVData_.getFile(2).remote, CSVData_.getFile(2).local);

    Promise.all([p1, p2, p3])
    .then((r) => {
      
      const file1 = CSVData_.readCSV(CSVData_.getFile(0).local)
      const file2 = CSVData_.readCSV(CSVData_.getFile(1).local)
      const file3 = CSVData_.readCSV(CSVData_.getFile(2).local)
      
      Promise.all([file1, file2, file3])
      .then((r) => {
        const result = CSVData_.calculateCSV(r[0], r[1], r[2])
        if (result.length) res.send(JSON.stringify(result))
        else res.sendStatus(500)
      }).catch((r) => {
        res.sendStatus(500)
      })

    }).catch((r) => {
      res.sendStatus(500)
    })
      
    return
  }
  

  const file1 = CSVData_.readCSV(CSVData_.getFile(0).local)
  const file2 = CSVData_.readCSV(CSVData_.getFile(1).local)
  const file3 = CSVData_.readCSV(CSVData_.getFile(2).local)
  
  Promise.all([file1, file2, file3])
  .then((r) => {
    const result = CSVData_.calculateCSV(r[0], r[1], r[2])
    if (result.length) res.send(JSON.stringify(result))
    else res.sendStatus(500)
  }).catch((r) => {
    res.sendStatus(500)
  })

  return;

}

router.get('/:id', function(req, res, next) {
  handleRequest(req, res)
  return;
})

router.get('/', function(req, res, next) {
  handleRequest(req, res)
  return;
});

module.exports = router;