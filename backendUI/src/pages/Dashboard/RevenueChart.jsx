import React, { useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ completedOrders, parseOrderDate, formatPrice }) => {
  const [timeFrame, setTimeFrame] = useState('7days'); // '7days', 'month', 'quarter', 'year'

  // Generate chart data based on timeFrame
  const getChartData = () => {
    if (timeFrame === '7days') {
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const list = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const weekday = weekdays[d.getDay()];
        list.push({
          name: `${weekday} (${day}/${month})`,
          dateKey: d.toDateString(),
          sales: 0,
          orders: 0
        });
      }

      completedOrders.forEach(order => {
        const orderDateObj = parseOrderDate(order.orderDate);
        if (orderDateObj) {
          const orderDateKey = orderDateObj.toDateString();
          const dayBucket = list.find(d => d.dateKey === orderDateKey);
          if (dayBucket) {
            dayBucket.sales += order.totalAmount;
            dayBucket.orders += 1;
          }
        }
      });
      return list;
    }

    if (timeFrame === 'month') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      const list = months.map((m, idx) => ({
        name: m,
        year: currentYear,
        monthIndex: idx,
        sales: 0,
        orders: 0
      }));

      completedOrders.forEach(order => {
        const orderDateObj = parseOrderDate(order.orderDate);
        if (orderDateObj && orderDateObj.getFullYear() === currentYear) {
          const mIdx = orderDateObj.getMonth();
          const monthBucket = list.find(d => d.monthIndex === mIdx);
          if (monthBucket) {
            monthBucket.sales += order.totalAmount;
            monthBucket.orders += 1;
          }
        }
      });
      return list;
    }

    if (timeFrame === 'quarter') {
      const list = [
        { name: 'Quarter 1', quarterIndex: 0, sales: 0, orders: 0 },
        { name: 'Quarter 2', quarterIndex: 1, sales: 0, orders: 0 },
        { name: 'Quarter 3', quarterIndex: 2, sales: 0, orders: 0 },
        { name: 'Quarter 4', quarterIndex: 3, sales: 0, orders: 0 },
      ];
      const currentYear = new Date().getFullYear();

      completedOrders.forEach(order => {
        const orderDateObj = parseOrderDate(order.orderDate);
        if (orderDateObj && orderDateObj.getFullYear() === currentYear) {
          const qIdx = Math.floor(orderDateObj.getMonth() / 3);
          const quarterBucket = list.find(d => d.quarterIndex === qIdx);
          if (quarterBucket) {
            quarterBucket.sales += order.totalAmount;
            quarterBucket.orders += 1;
          }
        }
      });
      return list;
    }

    if (timeFrame === 'year') {
      const list = [];
      const currentYear = new Date().getFullYear();
      for (let i = 4; i >= 0; i--) {
        list.push({
          name: String(currentYear - i),
          year: currentYear - i,
          sales: 0,
          orders: 0
        });
      }

      completedOrders.forEach(order => {
        const orderDateObj = parseOrderDate(order.orderDate);
        if (orderDateObj) {
          const y = orderDateObj.getFullYear();
          const yearBucket = list.find(d => d.year === y);
          if (yearBucket) {
            yearBucket.sales += order.totalAmount;
            yearBucket.orders += 1;
          }
        }
      });
      return list;
    }

    return [];
  };

  const chartData = getChartData();

  return (
    <GlassCard hoverEffect={false} className="lg:col-span-2 relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Revenue Analytics</h3>
          <p className="text-[10px] text-slate-400">Commerce revenue statistics and growth analysis</p>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-[10px] font-semibold text-slate-400">
          <button
            onClick={() => setTimeFrame('7days')}
            className={`px-2.5 py-1 rounded-lg transition-all ${timeFrame === '7days' ? 'bg-purple-600 text-white shadow' : 'hover:text-white'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeFrame('month')}
            className={`px-2.5 py-1 rounded-lg transition-all ${timeFrame === 'month' ? 'bg-purple-600 text-white shadow' : 'hover:text-white'}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeFrame('quarter')}
            className={`px-2.5 py-1 rounded-lg transition-all ${timeFrame === 'quarter' ? 'bg-purple-600 text-white shadow' : 'hover:text-white'}`}
          >
            Quarter
          </button>
          <button
            onClick={() => setTimeFrame('year')}
            className={`px-2.5 py-1 rounded-lg transition-all ${timeFrame === 'year' ? 'bg-purple-600 text-white shadow' : 'hover:text-white'}`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              width={80}
              tickFormatter={(val) => new Intl.NumberFormat('vi-VN').format(val)}
            />
            <Tooltip
              formatter={(value) => [formatPrice(value), 'Revenue']}
              contentStyle={{
                backgroundColor: '#0F1224',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Area type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default RevenueChart;
