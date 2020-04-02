import React, { Component } from 'react'
import Chart from "chart.js";

export default class Graph extends Component {
    
    chartRef = React.createRef();
    myChart = null;
    totals = false

    componentDidUpdate() {
        
        this.myChart.data.labels = this.props.labels
        this.totals = this.props.totals

        if (this.totals) {
            this.myChart.data.datasets[0].data = this.props.cases
        }else {
            
            this.myChart.data.datasets[0].data = this.props.cases
            this.myChart.data.datasets[1].data = this.props.deaths
            this.myChart.data.datasets[2].data = this.props.recovered
        }
        this.myChart.update()
    }

    componentDidMount() {
        //const myChartRef = this.chartRef.current.getContext("2d");
        const myChartRef = this.chartRef.current;

        let datasets = []
        let options = {}

        if (this.totals) {
            datasets = [
                {
                "label":"Cases",
                "data":[],
                "fill":false,
                "borderColor":this.props.colors[0].color,
                "backgroundColor":[this.props.colors[0].color],
                "lineTension":0.1
                }
            ]
            
        }else {
            datasets = [
                {
                "label":"Cases",
                "data":[],
                "fill":false,
                "borderColor":this.props.colors[0].color,
                "backgroundColor":this.props.colors[0].color,
                "lineTension":0.1
                },
                {
                "label":"Deaths",
                "data":[],
                "fill":false,
                "borderColor":this.props.colors[1].color,
                "backgroundColor":this.props.colors[1].color,
                "lineTension":0.1
                },
                {
                    "label":"Recovered",
                    "data":[],
                    "fill":false,
                    "borderColor":this.props.colors[2].color,
                    "backgroundColor":this.props.colors[2].color,
                    "lineTension":0.1
                    }
            ]
            
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
}