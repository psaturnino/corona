import React, { Component } from 'react';
import './App.css';
import Chart from './Chart';
import Loader from './Loader';

const colors = [
  {"color": "#b0b3fc"},
  {"color": "#f77373"},
  {"color": "#337e50"}
]

class App extends Component {
  
  state = {
    countries: [],
    chart: [
      {type: "bar", dataSetName: [], dataSet: []},
      {type: "bar", dataSetName: [], dataSet: []},
      {type: "bar", dataSetName: [], dataSet: []}
    ],
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
    ]
  }

  countryStack = []

  resetbtCountries() {
    this.state.btCountries.forEach(element => {
      element.status = false
    });
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
          res[0] = [];
          res[1] = [];
          res[2] = [];
          res[3] = [];
          res[4] = [];
        }


        const temp = res

        temp[2][0] = res[2][0][0]
        temp[2][1] = res[2][1][0]
        temp[2][2] = res[2][2][0]

        temp[3][0] = res[3][0][0]
        temp[3][1] = res[3][1][0]
        temp[3][2] = res[3][2][0]

        temp[4][0] = res[4][0][0]
        temp[4][1] = res[4][1][0]
        temp[4][2] = res[4][2][0]


        const title = [
          ["Accumulated"],
          ["Daily increase"],
          ["Total"]
        ]

        const labels = [
          temp[1],
          temp[1],
          [""]
        ]

        const dataSetName = [
          ["Cases", "Deaths", "Recovered"],
          ["Cases", "Deaths", "Recovered"],
          ["Cases", "Deaths", "Recovered"]
        ]

        const dataSet = [
          [temp[2][0], temp[3][0], temp[4][0]],
          [temp[2][1], temp[3][1], temp[4][1]],
          [[temp[2][2]], [temp[3][2]], [temp[4][2]]]

        ]

        const chart = []
        for (let index = 0; index < 3; index++) {
          chart[index] = {
            title: title[index], 
            labels: labels[index], 
            dataSetName: dataSetName[index], 
            dataSet: dataSet[index]
          }
          
        }

        this.changeState (temp[0], chart);
        this.setState({loaderActive: false})
      
    })
  }

  handleClickUpdate = (e) => {
    this.getData(true)
  }

  handleChange = (function(e){
    if (document.getElementById("country").value) {
      this.resetbtCountries()
      this.countryStack = []
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

  changeState (countries, chart) {
    
    

    this.setState({ countries: countries }); 
    this.setState({ chart: chart }); 

  }

  render() {
    return (
      <div className="App">
        <div className="header">
          <select id="country" onChange={this.handleChange}>
            <option value="">Countries</option>
            {this.state.countries.map((country, key) =>
              <option key={"country"+key} value={country}>{country}</option>
            )}
          </select> 
          
          <div className="linkupdate" onClick={this.handleClickUpdate}>Get New Data from Server<br />(John Hopkins)</div>

          <div className="clear"></div>

          {this.state.btCountries.map((country, key) => 
            <ButtonCountry name={country.name} handleClick={() => this.handleClick(key, country.name)} status={country.status} key={key} />
          )}

          <Loader active={this.state.loaderActive} />

          <div className="clear"></div>

          <div id="totals" className="clear">
            
            {this.state.chart[2].dataSetName.map((name, key) => 
              <span key={key} style={colors[key]}>&bull; {name}: {this.state.chart[2].dataSet[key]}&nbsp;</span>
            )}
            
          </div>
        </div>

        <div className="chart-section">

          {this.state.chart.map((elem, key) => 
            <div key={key}>
              <div className="left clear chart-title">{elem.title}:</div>
              <Chart labels={elem.labels} dataSets={[elem.dataSet[0], elem.dataSet[1], elem.dataSet[2]]} dataSetsNames={[elem.dataSetName[0], elem.dataSetName[1], elem.dataSetName[2]]} type={elem.type} colors={colors} />
            </div>
          )}
          
          
        </div>

      </div>

    );
  }
}

const ButtonCountry = ({status, name, handleClick}) => (
 <div className={status?"shortcut-countries sel":"shortcut-countries"} onClick={handleClick}>{name}</div>
);
  
export default App;