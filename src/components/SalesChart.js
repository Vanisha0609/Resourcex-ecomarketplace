import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { salesData } from "./salesData";

const SalesChart = () => {
  return (
<div className="flex-1 bg-yellow-300 text-white p-2 rounded-lg hover:bg-yellow-200 transition-colors duration-300 flex items-center justify-center gap-2">
  <h2 className="text-lg font-semibold mb-2">📈 Sales Performance</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={salesData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
