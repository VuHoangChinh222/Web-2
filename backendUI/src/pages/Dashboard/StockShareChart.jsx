import React from 'react';
import GlassCard from '../../components/GlassCard';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StockShareChart = ({ categoriesProduct, mappedProducts }) => {
  const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];
  const categoryData = categoriesProduct.map((cat, idx) => {
    const productCount = mappedProducts.filter(p => p.categoryId === cat.id).length;
    return {
      name: cat.name,
      count: productCount,
      color: COLORS[idx % COLORS.length]
    };
  });

  return (
    <GlassCard hoverEffect={false} title="Product Stock Share" subtitle="Item distribution by category">
      <div className="h-72 flex flex-col justify-between">
        <div className="flex-1 min-h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis type="number" stroke="#64748B" fontSize={10} hide />
              <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1224',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px'
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={10}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 border-t border-white/5 pt-4">
          {categoryData.slice(0, 4).map((entry, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="truncate">{entry.name} ({entry.count})</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default StockShareChart;
