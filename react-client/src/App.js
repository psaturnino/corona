import React, { Component } from 'react';
import './App.css';
import Chart from './Components/Chart';
import Loader from './Components/Loader';
import cookies from 'cookie-handler';
import Country from './Components/Country'

class App extends Component {
  
  headerRef = React.createRef();
  chartRef = React.createRef();

  state = {
    country: "",
    countryList: [],
    editCountries: false,
    loaderActive: true,
    countries: [
      {name: "Tunisia", status: false},
      {name: "Germany", status: false},
      {name: "Portugal", status: false},
      {name: "China", status: false},
      {name: "Italy", status: false},
      {name: "US", status: false},
      {name: "France", status: false},
      {name: "Korea", status: false},
      {name: "Spain", status: false},
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

  totals_ = []

  constructor() {
    super()
    const cookie_countries = cookies.get("countries")
    if (cookie_countries) {
      if (cookie_countries.length) {
        let valid = true 

        cookie_countries.forEach(element => {
          if (typeof element.status == "undefined" || !element.name) {
            valid = false
          }
        });

        if (valid) this.state.countries = cookie_countries

      }
      
    }
    
  }

  

  getData(update=false) {
    
    const selectedCountries = this.getNamesSelectedCountries();
    
    this.setState({loaderActive: true})
    
    let url = "/csvdata"
    if (selectedCountries.length) url = "/csvdata/"+selectedCountries
    if (update) url += "?updatedata"
    
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
          type: (selectedCountries.length > 1)?"line":"bar",
          title: chartTitle[index], 
          labels: labels[index], 
          dataSetName: dataSetName[index], 
          dataSet: dataSet[index]
        }
  
      }

      
      for (let index = this.colors.length; index < dataSet[0].length; index++) {
        this.colors.push({"color" : "#"+((1<<24)*Math.random()|0).toString(16)})
      }
      
      
      this.setState({countryList: temp[0], chart: chart, loaderActive: false}); 
    })
  }


  handleChangeCountryListSelection = (e) => {
    const country = e.target.value
    this.setState({country: country})
    this.addCountry({name: country})
    e.target.value = ""
    this.getData(false)
  }

  
  handleCountryClick (country) {

    if (this.state.editCountries) {
      this.removeCountry(country)
      return;
    }
    
    let temp = [...this.state.countries]
    const index = temp.findIndex(elem => elem.name === country.name)
    if (!isNaN(index)) {
      const status = !country.status
      temp[index] = {...country}
      temp[index].status = status
      this.setState({countries: temp}, () => {this.getData(false)})
    }
  }
  
  removeCountry(country) {
    //this.resetSelectedCountries()
    let temp = (this.state.countries.filter(elem => elem.name !== country.name))
    this.setState({countries: temp})
  }

  addCountry(country) {
    if (!this.state.countries.filter(elem => elem.name === country.name).length) {
      let temp = [...this.state.countries];
      country.status = true
      temp.push(country)
      this.setState({countries: temp})
    }
  }

  getNamesSelectedCountries() {
    let countries = []

    const temp = this.state.countries.filter(elem => elem.status)

    temp.forEach(element => {
      countries.push(element.name)
    });

    return countries;
  }

  /*resetSelectedCountries() {
    const temp = []

    this.state.countries.forEach((element, key) => {
      temp[key] = ({...element})
      temp[key].status = false
    });

    this.setState({countries: temp})
  }*/

  customizeCountries() {
    
    if (!this.state.editCountries) 
      this.setState({editCountries: true})
    else this.setState({editCountries: false})
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

  componentDidMount() {
    this.getData(false)
  }

  componentDidUpdate(prevProps, prevState) {
    
    if (this.state.countries !== prevState.countries)
      cookies.set('countries', this.state.countries);

    this.adjustContentSize()  
  }

    
  render() {

    let totals = [];

    if (this.getNamesSelectedCountries().length <= 1) {
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
                <select id="country" onChange={(e) => this.handleChangeCountryListSelection(e)} className="form-control mt-2">
                  <option value="">Countries</option>
                  {this.state.countryList.map((country, key) =>
                    <option key={"country"+key} value={country}>{country}</option>
                  )}
                </select>
              </div>
              
              <div className="col">
                <button type="button" className="btn btn-primary btn-sm float-right mt-2 ml-3" onClick={() => this.getData(true)}>update CSV</button>
                <button type="button" className={`btnCustom red float-right ${this.state.editCountries?"sel":""} mt-2`} onClick={(e)=>{this.customizeCountries()}}>Customize</button>
              </div>
            </div>

            <div className="row">
              <div className="col">
              {this.state.countries.map((country, key) => 
                <Country country={country} onClick={() => this.handleCountryClick(country)} key={key} editCountries={this.state.editCountries} />
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
              <Chart chart={elem} colors={this.colors} />
            </div>
          )}
        </div>

      </div>
    );
  }
}

export default App;