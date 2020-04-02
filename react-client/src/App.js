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
    dates: [],
    cases: [],
    deaths: [],
    recovered: [],
    totals: [],
    casesDaily: [],
    deathsDaily: [],
    recoveredDaily: [],
    loaderActive: true,
    shortcutCountries: [
      {"name": "Tunisia"},
      {"name": "Germany"},
      {"name": "Portugal"},
      {"name": "China"},
      {"name": "Italy"},
      {"name": "US"},
      {"name": "France"},
      {"name": "Korea"},
    ]
  }

  countryStack = []

  
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
    //fetch("/csvdata/"+document.getElementById("country").value)
    if (document.getElementById("country").value) {
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
    .then(res => {return res.json()})
    .then((res) => {document.getElementById("country").value=""; this.getData()})
  }

  handleClick (key, country) {

    let temp_ = this.state.shortcutCountries
    temp_[key] = this.state.shortcutCountries[key]
    
    let indexElem = this.countryStack.indexOf(country);
    if (indexElem > -1) {
      this.countryStack.splice(indexElem, 1);
      temp_[key].status = false
      this.setState({shortcutCountries: temp_})
    }else {
      this.countryStack.push(country)
      temp_[key].status = true
      this.setState({shortcutCountries: temp_})
    }
    
    console.log(this.countryStack)

    document.getElementById("country").value = ""
    /*console.log(this.countryStack)
    if (document.getElementById("country").value === country) document.getElementById("country").value = ""
    else document.getElementById("country").value = country*/
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
    this.setState({ dates: csvdata[1] }); 
    this.setState({ cases: csvdata[2][0] }); 
    this.setState({ deaths: csvdata[3][0] }); 
    this.setState({ recovered: csvdata[4][0] }); 
    this.setState({ totals: [csvdata[2][1], csvdata[3][1], csvdata[4][1] ] }); 

    this.setState({ casesDaily: csvdata[2][2] }); 
    this.setState({ deathsDaily: csvdata[3][2] }); 
    this.setState({ recoveredDaily: csvdata[4][2] }); 
    
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

          {this.state.shortcutCountries.map((country, key) => 
            <ButtonCountry name={country.name} handleClick={() => this.handleClick(key, country.name)} status={country.status} key={key} />
          )}

          <Loader active={this.state.loaderActive} />

          <div className="clear"></div>

          <div id="totals" className="clear">
            <b>
            <span style={colors[0]}>Cases: {this.state.totals[0]}</span>&nbsp;&nbsp;-&nbsp;&nbsp; 
            <span style={colors[1]}>Deaths: {this.state.totals[1]}</span>&nbsp;&nbsp;-&nbsp;&nbsp;
            <span style={colors[2]}>Recovered: {this.state.totals[2]}</span>
            </b>
          </div>
        </div>

        <div className="chart-section">
          <div className="left clear chart-title">Accumulated:</div>
          <Chart labels={this.state.dates} cases={this.state.cases} deaths={this.state.deaths} recovered={this.state.recovered} type={"line"} colors={colors} />
          <div className="left clear chart-title">Daily:</div>
          <Chart labels={this.state.dates} cases={this.state.casesDaily} deaths={this.state.deathsDaily} recovered={this.state.recoveredDaily} type={"bar"} colors={colors} />

          <Chart labels={[""]} cases={[this.state.totals[0]]} deaths={[this.state.totals[1]]} recovered={[this.state.totals[2]]} type={"bar"} colors={colors} />
          
        </div>

        
      </div>

    );
  }
}

const ButtonCountry = ({status, name, handleClick}) => (
 <div className={status?"shortcut-countries sel":"shortcut-countries"} onClick={handleClick}>{name}</div>
);
  
export default App;