const express = require('express');
const router = express.Router();
const fs = require('fs');
const https = require('https');
const csv = require('csv-parser')

class CSVData {
  remoteFiles = new Array(
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv", 
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv", 
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv"
  );
  
  localFiles = new Array(
    'public/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv', 
    'public/csse_covid_19_time_series/time_series_covid19_deaths_global.csv', 
    'public/csse_covid_19_time_series/time_series_covid19_recovered_global.csv'
  );

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
      
      if (element[1]) {
        if (countries.indexOf(element[1]) == -1) countries.push(element[1])
      }
      i++;
  
    })
    
    return countries
  }

  getDays(stack) {

    let days = [], j=0
    
    stack.shift()
    stack.shift()
    stack.shift()
    stack.shift()

    const size = stack.length
  
    stack.forEach(elem => {
      if (j >= (size - (this.startAt?this.startAt:size))) { 
        elem = elem.split("/")
        days.push(elem[1]+"."+elem[0])
      }
      j++
    });
    
    return days
  }

  calculate(stack, total_days) {
    let j = 0, current = 0, i=0, c=0, lastcurrent=0, size = 0;
    
    let stackResults = [], stackTotals = [], stackDailyIncrease = []
    
    this.selectedCountries.forEach(country => {

      stackResults[c] = []
      stackTotals[c] = []
      
      stack.forEach(element => {

        if ((element[1] == country) || country == "all") {

          element.shift()
          element.shift()
          element.shift()
          element.shift()
          
          j=0
          i=0

          size = element.length
          
          element.forEach(elem => {
            if (j >= (size - (this.startAt?this.startAt:size))) { 
              if (!stackResults[c][i]) stackResults[c][i] = 0
              
              current = (typeof parseInt(elem) !== 'undefined' && parseInt(elem) != null)?parseInt(elem):0;

              stackResults[c][i] += current
              
              if (j == (size-1)) stackTotals[c] = [stackResults[c][i]]

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


  
  download(url, local) {
    
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

  read(csvFile) {

    return new Promise((resolve, reject) => {
      let results = [];
 
      try {
        fs.createReadStream(csvFile)
        .pipe(csv({ separator: ',', headers: false}))
        .on('data', (data) => results.push(data))
        .on('end', () => {
          resolve(results);
        });
      } catch (error) {
        reject(false);
      }
    })
  }
  
  handle(total, deaths, recovered) {

    let files = [total, deaths, recovered], data = [];

    let files_ = []
    files.forEach((file, key_file)=> {
      files_[key_file] = []
      file.forEach((obj, key_line)=> {
        files_[key_file][key_line] = []
        for (const key_ in obj) {
          if (obj.hasOwnProperty(key_)) {
            const element = obj[key_];
            files_[key_file][key_line].push(element)
          }
        }
      });
    });

    total = files_[0]
    deaths = files_[1]
    recovered = files_[2]
    const days = total[0];

    total.shift()
    deaths.shift()
    recovered.shift()
    
    data[0] = this.getCountries(total)
    data[1] = this.getDays(days)

    data[2] = this.calculate(total, data[1].length)
    data[3] = this.calculate(deaths, data[1].length)
    data[4] = this.calculate(recovered, data[1].length)

    data[5] = this.selectedCountries
    
    return data
  }

}


/*router.post('/:id', function(req, res) {
  console.log(req.body)
  handleRequest(req, res)
  return;
})*/

router.post('/', function(req, res) {
  let interval = "", selectedCountries = ""
  
  if (req.query && req.query.interval != null) interval = req.query.interval
  if (req.body && req.body.length) selectedCountries = req.body
  //if (req.params && req.params.id != null) selectedCountries = req.params.id.split(",")

  CSVData_ = new CSVData(selectedCountries, interval);

  if (req.query && req.query.updatedata != null) {
    
    let p1 = CSVData_.download(CSVData_.getFile(0).remote, CSVData_.getFile(0).local);
    let p2 = CSVData_.download(CSVData_.getFile(1).remote, CSVData_.getFile(1).local);
    let p3 = CSVData_.download(CSVData_.getFile(2).remote, CSVData_.getFile(2).local);

    Promise.all([p1, p2, p3])
    .then((r) => {
      
      const file1 = CSVData_.read(CSVData_.getFile(0).local)
      const file2 = CSVData_.read(CSVData_.getFile(1).local)
      const file3 = CSVData_.read(CSVData_.getFile(2).local)
      
      Promise.all([file1, file2, file3])
      .then((r) => {
        const result = CSVData_.handle(r[0], r[1], r[2])
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
  

  const file1 = CSVData_.read(CSVData_.getFile(0).local)
  const file2 = CSVData_.read(CSVData_.getFile(1).local)
  const file3 = CSVData_.read(CSVData_.getFile(2).local)
  
  Promise.all([file1, file2, file3])
  .then((r) => {
    const result = CSVData_.handle(r[0], r[1], r[2])
    if (result.length) res.send(JSON.stringify(result))
    else res.sendStatus(500)
  }).catch((r) => {
    res.sendStatus(500)
  })

  return;
});

module.exports = router;