import React, { Component } from 'react'
import Chart from "chart.js";

const colors = [
    {"color": "rgb(31, 180, 180)"},
    {"color": "rgb(243, 13, 13)"},
    {"color": "rgb(5, 128, 53)"}
  ]

export default class Graph extends Component {
    
    chartRef = React.createRef();
    myChart = null;

    componentDidUpdate() {
        this.myChart.data.labels = this.props.dates
        this.myChart.data.datasets[0].data = this.props.cases
        this.myChart.data.datasets[1].data = this.props.deaths
        this.myChart.data.datasets[2].data = this.props.recovered
        this.myChart.update()
    }

    componentDidMount() {
        //const myChartRef = this.chartRef.current.getContext("2d");
        const myChartRef = this.chartRef.current;

        this.myChart = new Chart(myChartRef,
        {
            "type":this.props.type,
            "data": {
            "labels":[],
            "datasets":[
                {
                "label":"Cases",
                "data":[],
                "fill":false,
                "borderColor":colors[0].color,
                "backgroundColor":colors[0].color,
                "lineTension":0.1
                },
                {
                "label":"Deaths",
                "data":[],
                "fill":false,
                "borderColor":colors[1].color,
                "backgroundColor":colors[1].color,
                "lineTension":0.1
                },
                {
                    "label":"Recovered",
                    "data":[],
                    "fill":false,
                    "borderColor":colors[2].color,
                    "backgroundColor":colors[2].color,
                    "lineTension":0.1
                    }
            ]
            },
            "options":{}
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