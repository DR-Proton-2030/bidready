"use client"
import React from 'react'
// @ts-ignore: dev dependency may not be installed in environment yet
import ReactApexChart from 'react-apexcharts'

const Piechart: React.FC = () => {
  const series = [46, 27, 15, 5, 4]
  const options: any = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    labels: ['Red', 'Purple', 'Blue', 'Lilac', 'Green'],
    colors: ['#ef4444', '#9f7aea', '#93c5fd', '#c4b5fd', '#10b981'],
    stroke: { colors: ['#ffffff'], width: 8 },
    plotOptions: {
      pie: {
        donut: { size: '62%' },
        expandOnClick: false,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        return String(series[opts.seriesIndex])
      },
      style: { colors: ['#ffffff'], fontSize: '18px', fontWeight: '700' },
      dropShadow: { enabled: false },
    },
    legend: { show: false },
    tooltip: { enabled: false },
  }

  return (
    <div className="w-1/3">
      {/* height chosen to match screenshot proportions */}
      <ReactApexChart options={options} series={series} type="donut" height={320} />
    </div>
  )
}

export default Piechart
