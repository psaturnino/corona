const express = require('express');
const router = express.Router();
const fs = require('fs');
const https = require('https');
const csv = require('csv-parser')
const currentWeekNumber = require('current-week-number');

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
  group = ""

  constructor (selectedCountries, interval, group) {
    
    this.selectedCountries = !selectedCountries?["all"]:selectedCountries
    this.startAt = interval?parseInt(interval):0
    this.group = group?group:""

  }

  getFile(num) {
    return {
      remote: this.remoteFiles[num],
      local: this.localFiles[num]
    }
  }

  getCountries(stack) {

    let countries = []
    
    stack.forEach(element => {
      if (element['Country/Region']) {
        if (countries.indexOf(element['Country/Region']) == -1) countries.push(element['Country/Region'])
      }
    })
    
    return countries
  }

  filterDate(date) {
    
    if (this.group == "month") {
      date = date.split("/")
      date = date[2]+"."+date[0]
    }else if (this.group == "week") {
      let date_ = date.split("/")
      date = date_[2]+".w"+currentWeekNumber(date)
    }else if (date) {
      date = date.split("/")
      date = date[1]+"."+date[0]
    }
    return date
  }


  getDays(stack) {

    let days = [], j=0, date = "";
    
    stack.shift()
    stack.shift()
    stack.shift()
    stack.shift()

    const size = stack.length
  
    stack.forEach(elem => {
      if (j >= (size - (this.startAt?this.startAt:size))) 
      { 
        
        date = this.filterDate(elem)
        if (days.indexOf(date) == -1) days.push(date)
        
        //elem = elem.split("/")
        //days.push(elem[1]+"."+elem[0])
        
      }
      j++
    });

    return days
  }

  calculate(stack) {
    let j = 0, i=0, c=0, last_elem = {value: 0}, size = 0;
    
    let stackResults = [], stackTotals = [], stackDailyIncrease = []
    
    this.selectedCountries.forEach(country => {

      stackResults[c] = []
      stackTotals[c] = []
      
      stack.forEach(element => {

        if ((element[1].value == country) || country == "all") {

          //first 4 columns from csv
          element.shift()
          element.shift()
          element.shift()
          element.shift()
          
          j=0
          i=0

          size = element.length
          
          element.forEach(elem => {
            //if (j >= (size - (this.startAt?(this.startAt):size))) 
            { 

              //if (this.group) i = days.indexOf(this.filterDate(elem.date))
              
              if (!stackResults[c][i]) stackResults[c][i] = {value: 0}
              //if (typeof parseInt(elem.value) === 'undefined')console.log("alert alert alert")
              //current = (typeof parseInt(elem.value) !== 'undefined' && parseInt(elem.value) != null)?parseInt(elem.value):0;

              stackResults[c][i].value += parseInt(elem.value)
              stackResults[c][i].date = elem.date
              
              if (j == (size-1)) stackTotals[c] = [{value: stackResults[c][i].value}]

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
        
          if (!stackDailyIncrease[key][i]) stackDailyIncrease[key][i] = {value: 0}

          stackDailyIncrease[key][i].value = (elem.value - last_elem.value)>0?(elem.value - last_elem.value):0
          stackDailyIncrease[key][i].date = elem.date

          last_elem = elem

          if (element.length-1 == i) lastDayValue[key][0] = {value: stackDailyIncrease[key][i].value}

          i++
      
      });

      /*if (this.startAt) {
        stackResults[key].shift();
        stackDailyIncrease[key].shift();
      }*/
    });
    
    return [stackResults, stackDailyIncrease, stackTotals, lastDayValue]
  }


  handle(days, total, deaths, recovered) {

    let files = [total, deaths, recovered], data = [], temp = [];

    let files_ = []
    files.forEach((file, key_file)=> {
      files_[key_file] = []
      
      file.forEach((obj, key_line)=> {
        files_[key_file][key_line] = []

        for (const key_ in obj) {
          if (obj.hasOwnProperty(key_)) {
            const element = obj[key_];
            files_[key_file][key_line].push({date: key_, value: element})
          }
        }
      });
    });
    
    total = files_[0]
    deaths = files_[1]
    recovered = files_[2]
    
    data[0] = this.getCountries(days)
    data[1] = this.getDays(Object.keys(days[0])) //first row of csv
    days = data[1]
    
    temp[2] = this.calculate(total)
    temp[3] = this.calculate(deaths)
    temp[4] = this.calculate(recovered)
    //if (this.startAt) data[1].shift();
    
    //calculate sick people
    data[5] = [], data[2] = [], data[3] = [], data[4] = []
    
    let i
    if (temp[2][0].length) {
      //accumulated
      
      temp[2].forEach((element, key) => {
        data[5][key] = [], data[2][key] = [], data[3][key] = [], data[4][key] = []
        element.forEach((element2, key2) => {
          data[5][key][key2] = [], data[2][key][key2] = [], data[3][key][key2] = [], data[4][key][key2] = []
          element2.forEach((element3, key3) => {

            i = key3
            if (element3.date) i = days.indexOf(this.filterDate(element3.date))

            //only if this date is in the days array
            if (i !== -1) 
            {
              if (!data[2][key][key2][i]) data[2][key][key2][i] = 0
              if (!data[3][key][key2][i]) data[3][key][key2][i] = 0
              if (!data[4][key][key2][i]) data[4][key][key2][i] = 0
              if (!data[5][key][key2][i]) data[5][key][key2][i] = 0

              data[5][key][key2][i] += Math.max(0, element3.value - temp[3][key][key2][key3].value - temp[4][key][key2][key3].value)

              data[2][key][key2][i] += temp[2][key][key2][key3].value
              data[3][key][key2][i] += temp[3][key][key2][key3].value
              data[4][key][key2][i] += temp[4][key][key2][key3].value
            }
              
          });  
        });
      });
    }
    
    data[6] = this.selectedCountries

    return data
  }

  download(url, local) {

    let today = new Date().toISOString().slice(0, 10)
    
    return new Promise((resolve, reject) => {
      let file = fs.createWriteStream(local+"_"+today);
      https.get(url, function (response) {
          response.pipe(file);
          file.on('finish', function () {
            file.close(); // close() is async, call callback after close completes.
            file.on("close", () => {
              if (file.bytesWritten < 1000) reject(false)
              else {
                fs.copyFile(local+"_"+today, local, (err) => {
                  if (err) reject(false)
                  else resolve(true)
                })
              }
            })
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

        fs.access(csvFile, (err) => {
            if (err) {
              reject(false);
            } else {
              fs.createReadStream(csvFile)
              .pipe(csv({ separator: ','}))
              .on('data', (data) => results.push(data))
              .on('end', () => {
                resolve(results);
              });
            }
        });
      } catch (error) {
        reject(false);
      }
    })
  }

}


/*router.post('/:id', function(req, res) {
  console.log(req.body)
  handleRequest(req, res)
  return;
})*/

router.post('/', function(req, res) {
  let interval = "", selectedCountries = "", group = ""
  
  if (req.query && req.query.interval != null) {
    interval = req.query.interval
    if (interval == "week" || interval == "month") {
      group = interval
      interval = 0
    }
  }
  if (req.body && req.body.length) selectedCountries = req.body
  
  //if (req.params && req.params.id != null) selectedCountries = req.params.id.split(",")

  CSVData_ = new CSVData(selectedCountries, interval, group);

  if (req.query && req.query.updatedata != null) {
    
    let p1 = CSVData_.download(CSVData_.getFile(0).remote, CSVData_.getFile(0).local);
    let p2 = CSVData_.download(CSVData_.getFile(1).remote, CSVData_.getFile(1).local);
    let p3 = CSVData_.download(CSVData_.getFile(2).remote, CSVData_.getFile(2).local);

    Promise.all([p1, p2, p3])
    .then((r) => {
      
      const file0 = CSVData_.read(CSVData_.getFile(0).local)
      const file1 = CSVData_.read(CSVData_.getFile(0).local)
      const file2 = CSVData_.read(CSVData_.getFile(1).local)
      const file3 = CSVData_.read(CSVData_.getFile(2).local)
      
      Promise.all([file0, file1, file2, file3])
      .then((r) => {
        
        const result = CSVData_.handle(r[0], r[1], r[2], r[3])
        
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
  
  const file0 = CSVData_.read(CSVData_.getFile(0).local)
  const file1 = CSVData_.read(CSVData_.getFile(0).local)
  const file2 = CSVData_.read(CSVData_.getFile(1).local)
  const file3 = CSVData_.read(CSVData_.getFile(2).local)
  
  Promise.all([file0, file1, file2, file3])
  .then((r) => {
    
    const result = CSVData_.handle(r[0], r[1], r[2], r[3])
    
    if (result.length) res.send(JSON.stringify(result))
    else res.sendStatus(500)
  }).catch((r) => {
    res.sendStatus(500)
  })

  return;
});

module.exports = router;