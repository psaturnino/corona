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
      {type: "line", dataSetName: [], dataSet: []},
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

  
  getData() {
    this.setState({loaderActive: true})
    fetch("/csvdata")
    .then((res) => {return res.json()})
    .then((res) => {
      this.changeState (res);
      this.setState({loaderActive: false})
    })
  }

  handleClickUpdate = (e) =>{
    this.setState({loaderActive: true})
    fetch("/csvdata/?updatedata")
    .then((res) => {return res.json()})
    .then(() => {document.getElementById("country").value=""; this.getData()})
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
    
    console.log(this.countryStack)
    
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

    const chart = [
      {title: "Progressive", labels: csvdata[1], dataSetName: ["Cases", "Deaths", "Recovered"], dataSet: [csvdata[2][0], csvdata[3][0], csvdata[4][0]]},
      {title: "Daily", labels: csvdata[1], dataSetName: ["Cases", "Deaths", "Recovered"], dataSet: [csvdata[2][2], csvdata[3][2], csvdata[4][2]]},
      {title: "Accumulated", labels: [""], dataSetName: ["Cases", "Deaths", "Recovered"], dataSet: [[csvdata[2][1]], [csvdata[3][1]], [csvdata[4][1]]]}
    ]

    this.setState({ countries: csvdata[0] }); 
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