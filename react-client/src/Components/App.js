import React, { Component } from 'react';
import './App.css';
import Chart from './Chart';
import Loader from './Loader';


class App extends Component {
  
  headerRef = React.createRef();
  chartRef = React.createRef();

  state = {
    countries: [],
    remCountries: false,
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
      this.countryStack.push(document.getElementById("country").value)
    }

    this.addCountry(document.getElementById("country").value)

    document.getElementById("country").value = ""

    this.getData(false, this.countryStack)

    

  }.bind(this))

  handleClick (key, country) {

    if (this.state.remCountries) {
      this.removeCountry(key)
      return;
    }

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
    
    this.getData(false, this.countryStack)

  }
  

  adjustContentSize() {
    const h_elem = this.headerRef.current
    const c_elem = this.chartRef.current
    const fnChangeSize = () => {c_elem.style.paddingTop=getComputedStyle(h_elem).height}

    window.addEventListener("resize", () => {
      fnChangeSize()
    })

    fnChangeSize()
  }

  removeCountry(key) {

    this.resetbtCountries()

    let temp_ = this.state.btCountries
    
    temp_.splice(key, 1);
    this.setState({btCountries: temp_})
    this.countryStack = []
    
    //save in cookies
  }

  addCountry(c) {
    if (c) {
      
      let exists = false
      this.state.btCountries.forEach(element => {
        if (element.name === c) {exists = true; return;}
      });
      
      if (!exists) {
        const new_c = {name: c, status: true}
        const temp_ = this.state.btCountries;
        temp_.push(new_c)
        this.setState({btCountries: temp_})
      }
      //save in cookies
    }
  }

  customizeCountries() {
    if (!this.state.remCountries) 
      this.setState({remCountries: true})
    else this.setState({remCountries: false})
  }

  componentDidMount() {
    this.getData()
    
  }

  componentDidUpdate() {
    this.adjustContentSize()  
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
        <div className="header" ref={this.headerRef}>
          <div className="container">
            <div className="row mb-2">
              <div className="col-sm-6">
                <select id="country" onChange={this.handleChange} className="form-control mt-2">
                  <option value="">Countries</option>
                  {this.state.countries.map((country, key) =>
                    <option key={"country"+key} value={country}>{country}</option>
                  )}
                </select>
              </div>
              
              <div className="col">
                <button type="button" className="btn btn-primary float-right mt-2 ml-3" onClick={this.handleClickUpdate}>update CSV</button>
                <button type="button" className={`btnCustom red float-right ${this.state.remCountries?"sel":""} mt-2`} onClick={(e)=>{this.customizeCountries()}}>Customize</button>
                {/*<div className="btn btn-sm float-right btn-outline-success mt-2" onClick={()=>{this.addCountry()}}>Add</div>*/}
                <button type="button" className="btnCustom green float-right mt-2" onClick={()=>{}}>Save</button>
                
                
              </div>
            </div>

            <div className="row">
              <div className="col">
              {this.state.btCountries.map((country, key) => 
                <ButtonCountry country={country} handleClick={() => this.handleClick(key, country.name)} key={key} remC={this.state.remCountries} />
              )}
              </div>
            </div>

            <div className="row">
              <div id="totals" className="col mt-2 mb-2">
            
                {totals.map((total) => 
                  total
                )}
                
              </div>
            </div>
          </div>
        </div>

        <Loader active={this.state.loaderActive} />

        <div className="chart-section" ref={this.chartRef}>
          {this.state.chart.map((elem, key) => 
            <div key={key}>
              <div className="chart-title">{elem.title}:</div>
              <Chart labels={elem.labels} dataSets={elem.dataSet} dataSetsNames={elem.dataSetName} type={elem.type} colors={this.colors} />
            </div>
          )}
        </div>

      </div>
    );
  }
}


const ButtonCountry = ({country, remC, handleClick}) => (
<button type="button" className={`float-left btnCustom blue btn-sm mt-1 ${country.status?"sel":""} ${remC?"remove":""}`} onClick={handleClick}>{country.name}</button>
);
  
export default App;