import React, { Component } from 'react';
import './App.css';
import Chart from './Chart';
import Loader from './Loader';

const colors = [
  {"color": "rgb(31, 180, 180)"},
  {"color": "rgb(243, 13, 13)"},
  {"color": "rgb(5, 128, 53)"}
]

class App extends Component {
  state = {
    countries: [],
    dates: [],
    cases: [],
    deaths: [],
    recovered: [],
    totals: {},
    casesDaily: [],
    deathsDaily: [],
    recoveredDaily: [],
    loaderActive: true
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
    fetch("/csvdata/"+document.getElementById("country").value)
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

  handleClick (country) {
    if (document.getElementById("country").value === country) document.getElementById("country").value = ""
    else document.getElementById("country").value = country
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
    this.setState({ totals: {"cases":csvdata[2][1], "deaths":csvdata[3][1], "recovered":csvdata[4][1]} }); 

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
          <div className="shortcut-coutries" onClick={() => this.handleClick("Tunisia")}>&bull; Tunisia</div>
          <div className="shortcut-coutries" onClick={() => this.handleClick("Germany")}>&bull; Germany</div>
          <div className="shortcut-coutries" onClick={() => this.handleClick("Portugal")}>&bull; Portugal</div>
          <div className="shortcut-coutries" onClick={() => this.handleClick("China")}>&bull; China</div>
          <div className="shortcut-coutries" onClick={() => this.handleClick("Italy")}>&bull; Italy</div>
          <div className="shortcut-coutries" onClick={() => this.handleClick("US")}>&bull; US</div>
          <div className="shortcut-coutries" onClick={() => this.handleClick("France")}>&bull; France</div>
          <div className="shortcut-coutries" onClick={() => this.handleClick("Spain")}>&bull; Spain</div>
          <div className="shortcut-coutries" onClick={() => this.handleClick("Korea")}>&bull; Korea, South</div>

          <Loader active={this.state.loaderActive} />

          <div id="totals">
            <b>
            <span style={colors[0]}>Cases: {this.state.totals.cases}</span>&nbsp;&nbsp;-&nbsp;&nbsp; 
            <span style={colors[1]}>Deaths: {this.state.totals.deaths}</span>&nbsp;&nbsp;-&nbsp;&nbsp;
            <span style={colors[2]}>Recovered: {this.state.totals.recovered}</span>
            </b>
          </div>
        </div>

        
        <div className="chart-section">
          <div className="left clear chart-title">Accumulated:</div>
          <Chart dates={this.state.dates} cases={this.state.cases} deaths={this.state.deaths} recovered={this.state.recovered} type={"line"} colors={colors} />
          <div className="left clear chart-title">Daily:</div>
          <Chart dates={this.state.dates} cases={this.state.casesDaily} deaths={this.state.deathsDaily} recovered={this.state.recoveredDaily} type={"bar"} colors={colors} />
        </div>

        
      </div>

    );
  }
}

export default App;
