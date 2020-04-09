import React, { Component } from 'react';
import './App.css';
import Chart from './Chart';
import Loader from './Loader';


class App extends Component {
  
  state = {
    countries: [],
    loaderActive: true,
    btCountries: [
      {"name": "Tunisia"},
      {"name": "Germany"},
      {"name": "Portugal"},
      {"name": "China"},
      {"name": "Italy"},
      {"name": "US"},
      {"name": "France"},
      {"name": "Korea"},
      {"name": "Spain"},
    ],
    chart: [
      {type: "", title:"", labels: [], dataSetName: [], dataSet: []},
      {type: "", title:"", labels: [], dataSetName: [], dataSet: []},
      {type: "", title:"", labels: [], dataSetName: [], dataSet: []},
    ]
  }

  
  colors = [
    {"color": "#b0b3fc"},
    {"color": "#f77373"},
    {"color": "#337e50"} 
  ]
  countryStack = []
  totals_ = []

  resetbtCountries() {
    this.state.btCountries.forEach(element => {
      element.status = false
    });
    this.countryStack = []
  }

  
  getData(update=false, countries=[]) {
    this.setState({loaderActive: true})
    
    let url = "/csvdata"
    if (update) url = "/csvdata/?updatedata"
    if (countries.length) url = "/csvdata/"+countries
    
    fetch(url)
    .then((res) => {return res.json()})
    .then((res) => {
      if (update) document.getElementById("country").value="";

      if (!res.length) {
        res = [];
        res[0] = []; //all countries
        res[1] = []; //days
        res[2] = []; //cases
        res[3] = []; //deaths
        res[4] = []; //recovered
        res[5] = []; //selected countries
      }

      const temp = res
      let chartTitle = []
      let labels = []
      let dataSetName = []
      let dataSet = []

      if (temp[5].length > 1) {

        chartTitle = [
          "Cases Accumulated",
          "Deaths Accumulated",
          "Recovered Accumulated"
        ]
        
        labels = [
          temp[1],
          temp[1],
          temp[1],
        ]
        dataSetName[0] = []; dataSetName[1] = []; dataSetName[2] = []
        dataSet[0] = []; dataSet[1] = []; dataSet[2] = []
        
        temp[5].forEach((country_, key) => {
          
          dataSetName[0].push(country_)
          dataSetName[1].push(country_)
          dataSetName[2].push(country_)

          //0 accumulted, 1 daily, 2 total
          dataSet[0].push(temp[2][0][key])
          dataSet[1].push(temp[3][0][key])
          dataSet[2].push(temp[4][0][key])
        });

        /*dataSet = [
          [temp[2][0], temp[3][0], temp[4][0]],
          [temp[2][1], temp[3][1], temp[4][1]],
          [[temp[2][2]], [temp[3][2]], [temp[4][2]]]
  
        ]*/

        
        this.totals_ = temp[2][2]

      }else {

        temp[2][0] = res[2][0][0]
        temp[2][1] = res[2][1][0]
        temp[2][2] = res[2][2][0]

        temp[3][0] = res[3][0][0]
        temp[3][1] = res[3][1][0]
        temp[3][2] = res[3][2][0]

        temp[4][0] = res[4][0][0]
        temp[4][1] = res[4][1][0]
        temp[4][2] = res[4][2][0]

        chartTitle = [
          "Accumulated",
          "Daily increase",
          "Total"
        ]

        labels = [
          temp[1],
          temp[1],
          [""]
        ]

        dataSetName = [
          ["Cases", "Deaths", "Recovered"],
          ["Cases", "Deaths", "Recovered"],
          ["Cases", "Deaths", "Recovered"]
        ]
        

        dataSet = [
          [temp[2][0], temp[3][0], temp[4][0]],
          [temp[2][1], temp[3][1], temp[4][1]],
          [[temp[2][2]], [temp[3][2]], [temp[4][2]]]
  
        ]

        this.totals_ = dataSet[2]

        
      }

      
      const chart = []
      
      for (let index = 0; index < dataSet.length; index++) {

        chart[index] = {
          type: (this.countryStack.length > 1)?"line":"bar",
          title: chartTitle[index], 
          labels: labels[index], 
          dataSetName: dataSetName[index], 
          dataSet: dataSet[index]
        }

        if (dataSet.length > 2) this.colors.push({"color" : "#"+((1<<24)*Math.random()|0).toString(16)})
        
      }
      
      this.setState({ countries: temp[0], chart: chart }); 
      this.setState({loaderActive: false})

      
      
    })
  }

  handleClickUpdate = (e) => {
    this.resetbtCountries()
    this.getData(true)
  }

  handleChange = (function(e){
    if (document.getElementById("country").value) {
      this.resetbtCountries()
      this.countryStack.push(document.getElementById("country").value)
    }

    this.getData(false, this.countryStack)

  }.bind(this))

  handleClick (key, country) {

    if (document.getElementById("country").value) this.countryStack = []
    document.getElementById("country").value = ""

    let temp_ = this.state.btCountries
    temp_[key] = this.state.btCountries[key]
    
    let indexElem = this.countryStack.indexOf(country);
    if (indexElem > -1) {
      this.countryStack.splice(indexElem, 1);
      temp_[key].status = false
      this.setState({btCountries: temp_})
    }else {
      this.countryStack.push(country)
      temp_[key].status = true
      this.setState({btCountries: temp_})
    }
    
    this.handleChange()
  }
  

  componentDidMount() {
    this.getData()
    
  }

    
  render() {

    let totals = [];
    
    if (this.countryStack.length <= 1) {
      this.state.chart[2].dataSetName.map((name, key) => 
        totals.push(<span key={key} style={this.colors[key]}>&bull; {name}: {this.totals_[key]}&nbsp;</span>)
      )
    }else {
      
      this.state.chart[0].dataSetName.map((name, key) => 
        totals.push(<span key={key} style={this.colors[key]}>&bull; {name}: {this.totals_[key]}&nbsp;</span>)
      )
    }

    
    
    return (
      
      <div className="App">
        <div className="header">
          <div className="form-group row">
            <div className="col-sm-4">
              <select id="country" onChange={this.handleChange} className="form-control">
                <option value="">Countries</option>
                {this.state.countries.map((country, key) =>
                  <option key={"country"+key} value={country}>{country}</option>
                )}
              </select>
            </div>
            <div className="col-sm-8">
              <div className="linkupdate" onClick={this.handleClickUpdate}>Get New Data from Server<br />(John Hopkins)</div>
            </div>
          </div>
          
          

          <div className="clear"></div>

          {this.state.btCountries.map((country, key) => 
            <ButtonCountry name={country.name} handleClick={() => this.handleClick(key, country.name)} status={country.status} key={key} />
          )}

          <Loader active={this.state.loaderActive} />

          <div className="clear"></div>

          <div id="totals" className="clear">
          
            {totals.map((total) => 
              total
            )}
            
          </div>
        </div>

        <div className="chart-section">

          {this.state.chart.map((elem, key) => 
            <div key={key}>
              <div className="left clear chart-title">{elem.title}:</div>
              <Chart labels={elem.labels} dataSets={elem.dataSet} dataSetsNames={elem.dataSetName} type={elem.type} colors={this.colors} />
            </div>
          )}
          
          
        </div>

      </div>

    );
  }
}

const ButtonCountry = ({status, name, handleClick}) => (
 <div className={`btn btn-sm mr-1 ${status?"btn-info":"btn-outline-info"}`} onClick={handleClick}>{name}</div>
);
  
export default App;