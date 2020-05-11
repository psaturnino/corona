import React, { Component } from 'react';
import './App.css';
import Chart from './Components/Chart';
import Loader from './Components/Loader';
import cookies from 'cookie-handler';
import Country from './Components/Country'
//import Sort from './Components/Countries'
import LongMenu from './Components/Menu'



class App extends Component {
  
  headerRef = React.createRef();
  chartRef = React.createRef();
  btEditCountriesRef = React.createRef();

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
      {type: "", title:"", labels: [], dataSetName: [], dataSet: [], summary: []},
    ],
    scenes: [

    ],
    selectedScene: "",
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
    this.state.daysInterval = cookies.get("daysInterval")?cookies.get("daysInterval"):""
    this.state.scenes = cookies.get("scenes")
    

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
        res[5] = []; //sick
        res[6] = []; //selected countries
      }

      const temp = res
      let chartTitle = []
      let labels = []
      let dataSetName = []
      let dataSet = []
      let summary = []

      if (temp[6].length > 1 || temp[6].length === 0) {
        
        chartTitle = [
          "Cases accumulation",
          "Deaths accumulation",
          "Recovered accumulation",
          "Sick accumulation"
        ]
        
        labels = [
          temp[1],
          temp[1],
          temp[1],
          temp[1],
        ]

        dataSetName[0] = []; dataSetName[1] = []; dataSetName[2] = []; dataSetName[3] = [];
        dataSet[0] = []; dataSet[1] = []; dataSet[2] = []; dataSet[3] = []
        summary[0] = []; summary[1] = []; summary[2] = []; summary[3] = []
        
        
        temp[6].forEach((country_, key) => {
          
          dataSetName[0].push(country_)
          dataSetName[1].push(country_)
          dataSetName[2].push(country_)
          dataSetName[3].push(country_)

          //0 accumulted, 1 daily, 2 total
          dataSet[0].push(temp[2][0][key])
          dataSet[1].push(temp[3][0][key])
          dataSet[2].push(temp[4][0][key])
          dataSet[3].push(temp[5][0][key])

          summary[0] = temp[2][2]
          summary[1] = temp[3][2] 
          summary[2] = temp[4][2] 
          summary[3] = temp[5][2] 
          
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

        temp[5][0] = res[5][0][0]
        temp[5][1] = res[5][1][0]
        temp[5][2] = res[5][2][0]
        
        chartTitle = [
          "Accumulation",
          "Increase",
          "Total",
          ""
        ]

        labels = [
          temp[1],
          temp[1],
          [""],
          [""],
        ]

        dataSetName = [
          ["Cases", "Deaths", "Recovered", "Sick"],
          ["Cases", "Deaths", "Recovered", "Sick"],
          ["Cases", "Deaths", "Recovered", "Sick"],
          ["Cases", "Deaths", "Recovered", "Sick"],
        ]

        dataSet = [
          [temp[2][0], temp[3][0], temp[4][0], temp[5][0]],
          [temp[2][1], temp[3][1], temp[4][1], temp[5][1]],
          [temp[2][2], temp[3][2], temp[4][2], temp[5][2]],
          []
        ]
        
        //dataSet[2][0] total cases
        //dataSet[2][1] total daily
        //dataSet[2][2] total deaths

        summary[0] = [temp[2][2], temp[3][2], temp[4][2], temp[5][2]]
        summary[1] = [temp[2][3], temp[3][3], temp[4][3], temp[5][3]]
        summary[2] = [temp[2][2], temp[3][2], temp[4][2], temp[5][2]]
        summary[3] = ["", "", "", ""]
        
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
          display: (dataSet[index].length>1?"block":"none")
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

  handleClickScene(scene) {
    
    if (scene === 0 && this.state.selectedScene !== "") {
      //delete scene
      let scenes = this.state.scenes
      scenes.splice(this.state.selectedScene, 1);
      cookies.set('scenes', scenes);

      this.setState({selectedScene: "", scenes: scenes})
      
    }else if (scene === -1) {
      //new scene
      let newScene = []
      newScene.push(
        {
          daysInterval: this.state.daysInterval,
          countries: this.state.countries
        }
      )

      let scenes = cookies.get('scenes');
      
      if (!scenes || !scenes.length) {
        scenes = []
        scenes.push(newScene)
      }else scenes.push(newScene)

      cookies.set('scenes', scenes);
      this.setState({scenes: scenes, selectedScene: scenes.length})

    }else {
      //load scene
      let selectedScene, sceneToLoad;
      
      this.state.scenes.forEach((element, key) => {
        if ((scene-1) === key) {
          selectedScene = key
          sceneToLoad = element
        }
      });

      if (sceneToLoad[0] && sceneToLoad[0].countries) {
        this.setState({selectedScene: selectedScene, countries: sceneToLoad[0].countries, daysInterval: sceneToLoad[0].daysInterval}, () => {this.getData()})
      }

    }
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

  onMouseOver() {
    if (this.current.className.indexOf("selected") === -1) {
      this.current.className += " sel"
    } 
  }

  onMouseOut() {
    if (this.current.className.indexOf("selected") === -1) {
      this.current.className = this.current.className.replace("sel", "")
    } 
  }

  

  render() {
    
    return (
      <div className="w-100">
        <div className="header" ref={this.headerRef}>
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-8 col-sm-5">
                <select onChange={(e) => this.handleChangeCountryList(e)} className="form-control mt-2">
                  <option value="">Add Country</option>
                  {this.state.countryList.map((country, key) =>
                    <option key={key} value={country}>{country}</option>
                  )}
                </select>
              </div>

              <div className="col-4 col-sm-2">
                <select onChange={(e) => this.handleChangeDaysList(e)} className="form-control mt-2" value={this.state.daysInterval}>
                  <option value="">All Days</option>
                  <option value="5" >5 Days</option>
                  <option value="10" >10 Days</option>
                  <option value="15" >15 Days</option>
                  <option value="30" >30 Days</option>
                  <option value="60" >60 Days</option>
                </select>
              </div>

              

              <div className="col-12 col-sm-5">
                
                <button type="button" className="btn btn-primary btn-sm float-right mt-2 ml-3 shadow-none" onClick={() => this.getData(true)}>update Data</button>
                <button type="button" className={`btnCustom red float-right ${this.state.editCountries?"sel selected":""} mt-2`} onClick={(e)=>{this.editCountries()}} ref={this.btEditCountriesRef} onMouseOver={this.onMouseOver.bind(this.btEditCountriesRef)} onMouseOut={this.onMouseOut.bind(this.btEditCountriesRef)}>Edit</button>
                
                {/*<svg className="bi bi-view-list mt-2 float-right mr-3" width="2em" height="2em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M3 4.5h10a2 2 0 012 2v3a2 2 0 01-2 2H3a2 2 0 01-2-2v-3a2 2 0 012-2zm0 1a1 1 0 00-1 1v3a1 1 0 001 1h10a1 1 0 001-1v-3a1 1 0 00-1-1H3zM1 2a.5.5 0 01.5-.5h13a.5.5 0 010 1h-13A.5.5 0 011 2zm0 12a.5.5 0 01.5-.5h13a.5.5 0 010 1h-13A.5.5 0 011 14z" clip-rule="evenodd"/>
                  </svg>*/}
                <LongMenu class={`float-right`} scenes={this.state.scenes} handleClick={this.handleClickScene.bind(this)} />
                {/**/}
              </div>
            </div>

            <div className="row">
              <div className="col">
              {/*<Sort countries={this.state.countries} handleClick={this.handleCountryClick.bind(this)} editCountries={this.state.editCountries}/>*/}
              <div className="clearfix"></div>
              {this.state.countries.map((country, key) => 
                <Country country={country} onClick={() => this.handleCountryClick(country)} key={key} editCountries={this.state.editCountries} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} />
              )}
              </div>
            </div>
          </div>
        </div>

        <Loader active={this.state.loaderActive} />

        <div className="container-fluid pl-xs-3 pr-xs-3 pl-sm-5 pr-sm-5" ref={this.chartRef}>
          {(this.state.noData===true?<p className="text-center">No Data</p>:"")}
          {this.state.chart.map((elem, key) => 
            <div key={key} className="container-fluid" style={{display: elem.display}}>
              <div className="row mt-4">
                <div className="col-sm-3 text-left">{elem.title}</div>
                <div className="col-sm-9 text-right">{elem.summary.map((total, key_) => 
                  <span key={key_} style={this.colors[key_]}>&bull; {total}&nbsp;</span>
                  
                )}</div>
              </div>
              <div className="row">
                <Chart chart={elem} colors={this.colors} key={key} />
              </div>
            </div>
          )}
          <div className="float-right pb-3">
            <a href="mailto:info@sars-cov-2-chart.com">info@sars-cov-2-chart.com</a>
          </div>

          
          <div style={{fontSize:"15px",width:"350px"}} className="float-left blockchain-btn" data-address="1Q3r3o8XWPakuZtC74FNVwwDzdnGSj1LQM" data-shared="false">
            <div className="blockchain stage-begin">
                <img src="https://blockchain.info/Resources/buttons/donate_64.png" alt="" />
            </div>
            <div className="blockchain stage-loading" style={{textAlign:"center"}}>
                <img src="https://blockchain.info/Resources/loading-large.gif" alt="" />
            </div>
            <div className="blockchain stage-ready">
                <p align="center">Please Donate To Bitcoin Address: <b>[[address]]</b></p>
                <p align="center" className="qr-code"></p>
            </div>
            <div className="blockchain stage-paid">
                Donation of <b>[[value]] BTC</b> Received. Thank You.
            </div>
            <div className="blockchain stage-error">
                <font color="red">[[error]]</font>
            </div>
          </div>
        
        </div>
      </div>
    );
  }
}

export default App;