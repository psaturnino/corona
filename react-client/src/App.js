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
    chartData: [
      {
        labels: [],
        dataSet1: [],
        dataSet2: [],
        dataSet3: []
      },
      {
        labels: [],
        dataSet1: [],
        dataSet2: [],
        dataSet3: []
      },
      {
        labels: [],
        dataSet1: [],
        dataSet2: [],
        dataSet3: []
      },
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

  
  getData() {
    this.setState({loaderActive: true})
    fetch("/csvdata")
    .then((res) => {return res.json()})
    .then((res) => {
      this.changeState (res);
      this.setState({loaderActive: false})
    })
  }

  
  handleChange = (function(e){
    this.setState({loaderActive: true})
    
    if (document.getElementById("country").value) {
      this.resetbtCountries()
      this.countryStack = []
      this.countryStack.push(document.getElementById("country").value)
    }

    fetch("/csvdata/"+this.countryStack)
      .then((res) => {return res.json()})
      .then((res) => {
        this.changeState (res)
        this.setState({loaderActive: false})
      })
  }.bind(this))

  handleClickUpdate = (e) =>{
    this.setState({loaderActive: true})
    fetch("/csvdata/?updatedata")
    .then((res) => {return res.json()})
    .then(() => {document.getElementById("country").value=""; this.getData()})
  }

  handleClick (key, country) {

    if (document.getElementById("country").value) this.countryStack = []

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
    
    console.log(this.countryStack)

    document.getElementById("country").value = ""
    
    this.handleChange()
  }
  

  componentDidMount() {
    this.getData()
  }

  changeState (csvdata) {
    if (!csvdata.length) {
      csvdata = [];
      csvdata[0] = [];
      csvdata[1] = [];
      csvdata[2] = [];
      csvdata[3] = [];
      csvdata[4] = [];
    }

    
    this.setState({ countries: csvdata[0] }); 

    const chartData = [
      {labels: csvdata[1], dataSet1: csvdata[2][0], dataSet2: csvdata[3][0], dataSet3: csvdata[4][0]},
      {labels: csvdata[1], dataSet1: csvdata[2][2], dataSet2: csvdata[3][2], dataSet3: csvdata[4][2]},
      {labels: [""], dataSet1: [csvdata[2][1]], dataSet2: [csvdata[3][1]], dataSet3: [csvdata[4][1]]}
    ]

    this.setState({ chartData: chartData }); 

    
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
            <b>
            <span style={colors[0]}>Cases: {this.state.chartData[2].dataSet1[0]}</span>&nbsp;&nbsp;-&nbsp;&nbsp; 
            <span style={colors[1]}>Deaths: {this.state.chartData[2].dataSet2[0]}</span>&nbsp;&nbsp;-&nbsp;&nbsp;
            <span style={colors[2]}>Recovered: {this.state.chartData[2].dataSet3[0]}</span>
            </b>
          </div>
        </div>

        <div className="chart-section">
          <div className="left clear chart-title">Progressive:</div>
          <Chart labels={this.state.chartData[0].labels} dataSet1={this.state.chartData[0].dataSet1} dataSet2={this.state.chartData[0].dataSet2} dataSet3={this.state.chartData[0].dataSet3} type={"line"} colors={colors} />

          <div className="left clear chart-title">Daily:</div>
          <Chart labels={this.state.chartData[1].labels} dataSet1={this.state.chartData[1].dataSet1} dataSet2={this.state.chartData[1].dataSet2} dataSet3={this.state.chartData[1].dataSet3} type={"bar"} colors={colors} />
          
          <div className="left clear chart-title">Accumulated:</div>
          <Chart labels={this.state.chartData[2].labels} dataSet1={this.state.chartData[2].dataSet1} dataSet2={this.state.chartData[2].dataSet2} dataSet3={this.state.chartData[2].dataSet3} type={"bar"} colors={colors} />
        </div>

      </div>

    );
  }
}

const ButtonCountry = ({status, name, handleClick}) => (
 <div className={status?"shortcut-countries sel":"shortcut-countries"} onClick={handleClick}>{name}</div>
);
  
export default App;