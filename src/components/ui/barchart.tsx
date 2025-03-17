import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "../../utils/utils";

interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  className?: string;
  width?: number | string;
  height?: number | string;
  showGrid?: boolean;
  showTooltip?: boolean;
  barSize?: number;
}

/**
 * A customizable bar chart component following Shadcn design principles
 */
export function ShadcnBarChart({
  data,
  className,
  width = "100%",
  height = 300,
  showGrid = true,
  showTooltip = true,
  barSize = 20,
}: BarChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-sm p-2 text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-muted-foreground">
            Value: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width={width} height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#333' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fill: '#333' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Bar 
            dataKey="value" 
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
            barSize={barSize}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.color || '#8884d8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 