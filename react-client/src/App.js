import React, { Component } from 'react';
import './App.css';
import Chart from './Components/Chart';
import Loader from './Components/Loader';
import cookies from 'cookie-handler';
import Country from './Components/Country'
//import Sort from './Components/Countries'



class App extends Component {
  
  headerRef = React.createRef();
  chartRef = React.createRef();

  state = {
    noData: false,
    daysInterval: "",
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
      {name: "Korea, South", status: false},
      {name: "Spain", status: false},
    ],
    chart: [
      {type: "", title:"", labels: [], dataSetName: [], dataSet: [], summary: []},
      {type: "", title:"", labels: [], dataSetName: [], dataSet: [], summary: []},
      {type: "", title:"", labels: [], dataSetName: [], dataSet: [], summary: []},
    ],
  }

  colors = [
    {"color": "#b0b3fc"},
    {"color": "#f77373"},
    {"color": "#337e50"},
    {"color": "#ffc107"}
  ]
  

  constructor() {
    super()
    const cookie_countries = cookies.get("countries")
    this.state.daysInterval = cookies.get("daysInterval")

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
    
    const selectedCountries = this.getSelectedCountries();
    
    this.setState({loaderActive: true})
    
    let url = "/csvdata"
    //if (selectedCountries.length) url = "/csvdata/"+selectedCountries
    url += "?interval="+(this.state.daysInterval?this.state.daysInterval:"")
    if (update) url += "&updatedata"
    
    if (process.env.NODE_ENV !== "development") url = process.env.REACT_APP_SERVER + url
    
    fetch(url, {
      method: 'POST', 
      body: JSON.stringify(selectedCountries),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then((res) => {
      if (res.status === 200) return res.json()
      else return [];
    })
    .then((res) => {

      let noData = false
      if (!res.length) noData = true
      
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
      let summary = []

      if (temp[5].length > 1 || temp[5].length === 0) {
        
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

        dataSetName[0] = []; dataSetName[1] = []; dataSetName[2] = [];
        dataSet[0] = []; dataSet[1] = []; dataSet[2] = []
        summary[0] = []; summary[1] = []; summary[2] = []
        
        
        temp[5].forEach((country_, key) => {
          
          dataSetName[0].push(country_)
          dataSetName[1].push(country_)
          dataSetName[2].push(country_)

          //0 accumulted, 1 daily, 2 total
          dataSet[0].push(temp[2][0][key])
          dataSet[1].push(temp[3][0][key])
          dataSet[2].push(temp[4][0][key])

          summary[0] = temp[2][2]
          summary[1] = temp[3][2] 
          summary[2] = temp[4][2] 
          
        });
      
      
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
          ["Cases", "Deaths", "Recovered", "Sick"]
        ]

        let sick = [temp[2][2] - temp[3][2] - temp[4][2]]
        
        dataSet = [
          [temp[2][0], temp[3][0], temp[4][0]],
          [temp[2][1], temp[3][1], temp[4][1]],
          [temp[2][2], temp[3][2], temp[4][2], sick],
        ]
        
        //dataSet[2][0] total cases
        //dataSet[2][1] total daily
        //dataSet[2][2] total deaths

        summary[0] = [temp[2][2], temp[3][2], temp[4][2]]
        summary[1] = [temp[2][3], temp[3][3], temp[4][3]]
        summary[2] = [temp[2][2], temp[3][2], temp[4][2], sick]
      }

      let chart = []

      for (let index = 0; index < dataSet.length; index++) {

        chart[index] = {
          type: (selectedCountries.length > 1)?"line":"bar",
          title: chartTitle[index], 
          labels: labels[index], 
          dataSetName: dataSetName[index], 
          dataSet: dataSet[index],
          summary: summary[index],
        }
  
      }

      
      for (let index = this.colors.length; index < dataSet[2].length; index++) {
        this.colors.push({"color" : "#"+((1<<24)*Math.random()|0).toString(16)})
      }
      
      this.setState({countryList: temp[0], chart: chart, loaderActive: false, noData: noData}); 
      
      
    })
  }

  handleChangeDaysList = (e) => {
    const days = e.target.value
    this.setState({daysInterval: days}, () => this.getData())
  }

  handleChangeCountryList = (e) => {
    const country = e.target.value
    this.setState({country: country})
    e.target.value = ""
    this.addCountry({name: country}, () => this.getData())
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
      this.setState({countries: temp}, () => {this.getData()})
    }
  }
  
  removeCountry(country) {
    //this.resetSelectedCountries()
    let temp = (this.state.countries.filter(elem => elem.name !== country.name))
    this.setState({countries: temp})
  }

  addCountry(country, callback) {
    if (!this.state.countries.filter(elem => elem.name === country.name).length) {
      let temp = [...this.state.countries];
      country.status = true
      temp.push(country)
      this.setState({countries: temp}, callback)
    }
  }

  getSelectedCountries() {
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

  editCountries() {
    
    if (!this.state.editCountries) 
      this.setState({editCountries: true})
    else this.setState({editCountries: false})
  }

  adjustContentSize(addListen=false) {
    const fnChangeSize = () => {
      const h_elem = this.headerRef.current
      const c_elem = this.chartRef.current
      c_elem.style.paddingTop=getComputedStyle(h_elem).height
    }

    if (addListen) {
      window.addEventListener("resize", (h_elem, c_elem) => {
        fnChangeSize()
      })
    }

    fnChangeSize()
  }

  componentDidMount() {
    this.getData()
    this.adjustContentSize(true)
  }

  componentDidUpdate(prevProps, prevState) {
    
    if (this.state.countries !== prevState.countries)
      cookies.set('countries', this.state.countries);

    if (this.state.daysInterval !== prevState.daysInterval)
      cookies.set('daysInterval', this.state.daysInterval);
  
    this.adjustContentSize()
  }

  render() {
    
    return (
      <div className="w-100">
        <div className="header" ref={this.headerRef}>
          <div className="container">
            <div className="row mb-2">
              <div className="col-sm-6">
                <select onChange={(e) => this.handleChangeCountryList(e)} className="form-control mt-2">
                  <option value="">Add Country</option>
                  {this.state.countryList.map((country, key) =>
                    <option key={key} value={country}>{country}</option>
                  )}
                </select>
              </div>

              <div className="col-sm-2">
                <select defaultValue = {this.state.daysInterval} onChange={(e) => this.handleChangeDaysList(e)} className="form-control mt-2">
                  <option value="">All Days</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                </select>
              </div>
              
              <div className="col">
                <button type="button" className="btn btn-primary btn-sm float-right mt-2 ml-3" onClick={() => this.getData(true)}>update Data</button>
                <button type="button" className={`btnCustom red float-right ${this.state.editCountries?"sel":""} mt-2`} onClick={(e)=>{this.editCountries()}}>Edit</button>
              </div>
            </div>

            <div className="row">
              <div className="col">
              {/*<Sort countries={this.state.countries} handleClick={this.handleCountryClick.bind(this)} editCountries={this.state.editCountries}/>*/}
              <div className="clearfix"></div>
              {this.state.countries.map((country, key) => 
                <Country country={country} onClick={() => this.handleCountryClick(country)} key={key} editCountries={this.state.editCountries} />
              )}
              </div>
            </div>
          </div>
        </div>

        <Loader active={this.state.loaderActive} />

        <div className="w-100 pl-xs-3 pr-xs-3 pl-sm-5 pr-sm-5" ref={this.chartRef}>
          {(this.state.noData===true?<p className="text-center">No Data</p>:"")}
          {this.state.chart.map((elem, key) => 
            <div key={key} className="container-fluid">
              <div className="row mt-4">
                <div className="col-sm-3 text-left">{elem.title}</div>
                <div className="col-sm-6 text-center">{elem.summary.map((total, key_) => 
                  <span key={key_} style={this.colors[key_]}>&bull; {total}&nbsp;</span>
                  
                )}</div>
              </div>
              <div className="row">
                <Chart chart={elem} colors={this.colors} />
              </div>
            </div>
          )}
          <div className="float-right pb-3"><a href="mailto:info@sars-cov-2-chart.com">info@sars-cov-2-chart.com</a></div>

        </div>
      </div>
    );
  }
}

export default App;