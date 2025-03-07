import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "../../utils/utils"

// Define the chart configuration type
export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

// Define the data item type for the pie chart
export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  config?: ChartConfig;
  className?: string;
  width?: number | string;
  height?: number | string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
}

/**
 * A customizable pie chart component following Shadcn design principles
 */
export function ShadcnPieChart({
  data,
  config,
  className,
  width = "100%",
  height = 300,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
}: PieChartProps) {
  // Generate colors from data or config
  const getColor = (entry: PieChartData, index: number) => {
    if (entry.color) return entry.color;
    if (config && config[entry.name.toLowerCase()]) {
      return config[entry.name.toLowerCase()].color;
    }
    // Default colors if none specified
    const defaultColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
    return defaultColors[index % defaultColors.length];
  };

  // Custom label renderer
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return showLabels ? (
      <text 
        x={x} 
        y={y} 
        fill="#888888" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  // Custom tooltip formatter
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-sm p-2 text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-muted-foreground">
            Value: {payload[0].value}
          </p>
          <p className="text-muted-foreground">
            Percentage: {((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColor(entry, index)}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={customTooltip} />}
          {showLegend && (
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 