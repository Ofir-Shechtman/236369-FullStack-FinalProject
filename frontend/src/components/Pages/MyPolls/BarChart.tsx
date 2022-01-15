import React from "react";
import Chart from "react-apexcharts";


export interface BarChartProps {
    categories: Array<string>
    data: Array<number>;
}

export const BarChart: React.FC<BarChartProps> = ({
                                                      categories, data
                                                  }) => {
    const options = {
        chart: {
            id: "basic-bar"
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
            }
        },
        xaxis: {
            categories: categories
        }
    }
    const series = [{
        name: "answers",
        data: data
    }]
    return (
        <div className="mixed-chart">
            <Chart
                options={options}
                series={series}
                type="bar"
                width="500"
            />
        </div>
    );
}