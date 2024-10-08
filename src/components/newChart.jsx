import React, { PureComponent } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { curveCardinal } from "d3-shape";

const data = [
  {
    name: "May",
    uv: 40,
    pv: 24,
    amt: 2,
  },
  {
    name: "June",
    uv: 30,
    pv: 13,
    amt: 22,
  },
  {
    name: "July",
    uv: 20,
    pv: 98,
    amt: 22,
  },
  {
    name: "Aug",
    uv: 27,
    pv: 39,
    amt: 20,
  },
  {
    name: "Sept",
    uv: 18,
    pv: 48,
    amt: 21,
  },
  {
    name: "Oct",
    uv: 23,
    pv: 38,
    amt: 25,
  },
  {
    name: "Nov  ",
    uv: 34,
    pv: 43,
    amt: 21,
  },
];

const cardinal = curveCardinal.tension(0.2);

export default class Example extends PureComponent {
  static demoUrl =
    "https://codesandbox.io/p/sandbox/area-chart-different-shapes-6lwnhy";

  render() {
    return (
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart
          width={200}
          height={100}
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="uv"
            stroke="#006AFF"
            fill="#006AFF"
            fillOpacity={0.2}
          />
          {/* <Area
            type={cardinal}
            dataKey="uv"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.3}
          /> */}
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}
