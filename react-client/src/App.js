import React, { Component } from 'react';
import './App.css';
import Chart from 'chart.js';

let chart; 

function buildChart(res) {
  var ctx = document.getElementById('myChart');

  if (chart) chart.destroy()

  chart = new Chart(ctx,
    {
      "type":"line",
      "data": {
        "labels":res[1],
        "datasets":[
          {
          "label":"Cases",
          "data":res[2],
          "fill":false,
          "borderColor":"rgb(75, 192, 192)",
          "lineTension":0.1
          },
          {
            "label":"Deaths",
            "data":res[3],
            "fill":false,
            "borderColor":"rgb(243, 13, 13)",
            "lineTension":0.1
            },
            {
              "label":"Recovered",
              "data":res[4],
              "fill":false,
              "borderColor":"rgb(13, 243, 103)",
              "lineTension":0.1
              }
        ]
      },
      "options":{}
    });

}
function handleChange(e) {
  fetch("/csvdata/"+e.target.value)
    .then(res => {return res.json()})
    .then((res) => {
      buildChart(res)
    })

    
    
    /*fetch('/users', {method: 'GET'})
      .then(res => res.json())
      .then(users => this.setState({ users }));*/
      
}

class App extends Component {
  state = {
    countries: [],
    dates: [],
    cases: [],
    deaths: [],
    recovered: [],
  }

  componentDidMount() {

    fetch("/csvdata")
    .then(res => {
      return res.json()
    })
    .then((res) => {

      console.log(res[2])
      this.setState({ countries: res[0] }); 
      this.setState({ dates: res[1] }); 
      this.setState({ cases: res[2] }); 
      this.setState({ deaths: res[3] }); 
      this.setState({ recovered: res[4] }); 

      buildChart(res)

    })  

    
    /*fetch('/users', {method: 'GET'})
      .then(res => res.json())
      .then(users => this.setState({ users }));*/

      



  }

  

  render() {
    return (
      <div className="App">
        <select onChange={handleChange}>
          <option value="">Countries</option>
        {this.state.countries.map((country, key) =>
          <option key={"country"+key} value={country}>{country}</option>
        )}
        </select>
        <div><canvas id="myChart"></canvas></div>
      </div>
    );
  }
}

export default App;
