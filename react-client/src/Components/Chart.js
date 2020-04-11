import React, { Component } from 'react'
import Chart from "chart.js";

export default class Graph extends Component {
    
    chartRef = React.createRef();
    myChart = null;

    initChart() {
        const myChartRef = this.chartRef.current
        const {labels, dataSet, dataSetName, type} = this.props.chart
        
        if (this.myChart) this.myChart.destroy()

        let datasets = []
        
        dataSet.forEach((elem, key) => {
            datasets[key] = {
                "label":dataSetName[key],
                "data":dataSet[key],
                "fill":false,
                "borderColor":this.props.colors[key].color,
                "backgroundColor":this.props.colors[key].color
            }
        });

        this.myChart = new Chart(myChartRef,
        {
            "type":type,
            "data": {
                "labels":labels,
                "datasets": datasets
            }
        });
    }
    
    componentDidUpdate(prevProps) {
        
        if (prevProps.chart.labels !== this.props.chart.labels) 
        {
            this.initChart()
        }
    }

    render() {
        return <canvas ref={this.chartRef} />
    }
}