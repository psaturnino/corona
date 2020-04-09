import React, { Component } from 'react'
import Chart from "chart.js";

export default class Graph extends Component {
    
    chartRef = React.createRef();
    myChart = null;
    
    initChart() {
        //const myChartRef = this.chartRef.current.getContext("2d");
        
        const myChartRef = this.chartRef.current
        
        if (this.myChart) this.myChart.destroy()

        
        let datasets = []
        
        this.props.dataSets.forEach((elem, key) => {
            datasets[key] = {
                "label":"",
                "data":[],
                "fill":false,
                "borderColor":this.props.colors[key].color,
                "backgroundColor":this.props.colors[key].color
            }
        });

        

        this.myChart = new Chart(myChartRef,
        {
            "type":this.props.type,
            "data": {
                "labels":[],
                "datasets": datasets
            },
            "options": {
                animation: {
                    onComplete: () => {}
                }
            }
        });

        
    }

    fillChart() {
        this.myChart.type = this.props.type

        this.myChart.data.labels = this.props.labels
        
        //this.myChart.data.datasets = []
        
        for (let index = 0; index < this.props.dataSets.length; index++) {
            
            this.myChart.data.datasets[index].data = this.props.dataSets[index]
            this.myChart.data.datasets[index].label = this.props.dataSetsNames[index]
            this.myChart.data.datasets[index].borderColor = this.props.colors[index].color
            this.myChart.data.datasets[index].backgroundColor = this.props.colors[index].color
        
        }

        this.myChart.update()
    }
    

    componentDidUpdate(prevProps) {
        
        if (prevProps.labels !== this.props.labels) 
        {
            //console.log(this.props)
            //console.log(this.myChart)
            this.initChart()
            this.fillChart()
            
            
        }
        
    }

    componentDidMount() {
        //this.initChart()
        //this.fillChart()
    }

    render() {
        return (
            <div>
                <canvas ref={this.chartRef} />
            </div>
        )
    }
}

/*
import React, { Component } from 'react'
import Chart from "chart.js";

export default class Graph extends Component {
    
    chartRef = React.createRef();
    myChart = null;
    

    fillChart() {
        this.myChart.type = this.props.type
console.log(this.myChart.data)
        this.myChart.data.labels = this.props.labels


        for (let index = 0; index < this.props.dataSets.length; index++) {
            this.myChart.data.datasets[index].data = this.props.dataSets[index]
            this.myChart.data.datasets[index].label = this.props.dataSetsNames[index]
            this.myChart.data.datasets[index].borderColor = this.props.colors[index].color
            this.myChart.data.datasets[index].backgroundColor = this.props.colors[index].color
            
        }
    }
    

    componentDidUpdate() {
        
        this.fillChart()
        this.myChart.update()
        
    }

    componentDidMount() {
        //const myChartRef = this.chartRef.current.getContext("2d");
        const myChartRef = this.chartRef.current;

        let options = {}
        let datasets = []
        
        for (let index = 0; index < 3; index++) {
            datasets[index] = {
                "label":"",
                "data":[],
                "fill":false,
                "borderColor":"",
                "backgroundColor":"",
                "lineTension":0.1
            }
        }
            

        this.myChart = new Chart(myChartRef,
        {
            "type":this.props.type,
            "data": {
                "labels":[],
                "datasets": datasets
            },
            "options": options
        });
    }
    render() {
        return (
            <div>
                <canvas ref={this.chartRef} />
            </div>
        )
    }
}*/