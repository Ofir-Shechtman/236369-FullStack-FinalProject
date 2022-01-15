import React from "react";
import Chart from "react-apexcharts";


export interface BarChartProps {
    categories: Array<string>
    data: Array<number>;
}

export const PieChart: React.FC<BarChartProps> = ({
                                                      categories, data
                                                  }) => {

    const options = {
        labels: categories,
        theme: {
            monochrome: {
                enabled: false
            }
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: "100%"
                    },
                    legend: {
                        show: false
                    }
                }
            }],
    }
    return (
        <div className="mixed-chart">
            <Chart
                options={options}
                series={data}
                type="pie"
                width="500"
            />
        </div>
    );
}