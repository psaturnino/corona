import React, { Component } from 'react';
import './App.css';
import Chart from 'chart.js';

let chart; 
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
    totals: {}
  }

  
  /*constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }*/ 

  /*handleChange = (e) => {
    fetch("/csvdata/"+e.target.value)
      .then((res) => {return res.json()})
      .then((res) => {this.changeState (res)})
  }*/

  getData() {
    fetch("/csvdata")
    .then((res) => {return res.json()})
    .then((res) => {this.changeState (res)
    })
  }

  
  handleChange = (function(e){
    fetch("/csvdata/"+e.target.value)
    .then((res) => {return res.json()})
    .then((res) => {this.changeState (res)})
  }.bind(this))

  handleClickUpdate = (e) =>{
    
    fetch("/csvdata/?updatedata")
    .then(res => {return res.json()})
    .then((res) => {document.getElementById("country").value=""; this.getData()})
  }
  

  componentDidMount() {
    this.getData()
  }

  componentDidUpdate() {
    this.buildChart()
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

    console.log(csvdata[0])
    this.setState({ countries: csvdata[0] }); 
    this.setState({ dates: csvdata[1] }); 
    this.setState({ cases: csvdata[2][0] }); 
    this.setState({ deaths: csvdata[3][0] }); 
    this.setState({ recovered: csvdata[4][0] }); 
    this.setState({ totals: {"cases":csvdata[2][1], "deaths":csvdata[3][1], "recovered":csvdata[4][1]} }); 
  }

  buildChart() {
    var ctx = document.getElementById('myChart');
  
    if (chart) chart.destroy()
  
    chart = new Chart(ctx,
      {
        "type":"line",
        "data": {
          "labels":this.state.dates,
          "datasets":[
            {
            "label":"Cases",
            "data":this.state.cases,
            "fill":false,
            "borderColor":colors[0].color,
            "lineTension":0.1
            },
            {
              "label":"Deaths",
              "data":this.state.deaths,
              "fill":false,
              "borderColor":colors[1].color,
              "lineTension":0.1
              },
              {
                "label":"Recovered",
                "data":this.state.recovered,
                "fill":false,
                "borderColor":colors[2].color,
                "lineTension":0.1
                }
          ]
        },
        "options":{}
      });
  
  }

  

  render() {
    return (
    
      <div className="App">
        <select id="country" onChange={this.handleChange}>
          <option value="">Countries</option>
        {this.state.countries.map((country, key) =>
          <option key={"country"+key} value={country}>{country}</option>
        )}
        </select> <div className="linkupdate" onClick={this.handleClickUpdate}>Update Data from Server</div>
        <div><canvas id="myChart"></canvas></div>
        <div id="totals">
          <b>
          <span style={colors[0]}>Cases: {this.state.totals.cases}</span>&nbsp;&nbsp;-&nbsp;&nbsp; 
          <span style={colors[1]}>Deaths: {this.state.totals.deaths}</span>&nbsp;&nbsp;-&nbsp;&nbsp;
          <span style={colors[2]}>Recovered: {this.state.totals.recovered}</span>
          </b>
        </div>
      </div>
    );
  }
}

export default App;
