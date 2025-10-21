/**
 * 数据趋势图组件
 */
'use client';

import { Card } from '@/components/ui/card';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChartIcon } from 'lucide-react';

interface TrendData {
  dailyStats: Array<{
    date: string;
    songs: number;
    users: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    count: number;
  }>;
}

interface TrendChartsProps {
  trendData: TrendData;
}

// 饼图颜色
const COLORS = ['#6366f1', '#14b8a6', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#f97316'];

export function TrendCharts({ trendData }: TrendChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 30天趋势图 */}
      <Card className="p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
          30天数据趋势
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={trendData.dailyStats}>
            <defs>
              <linearGradient id="colorSongs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="songs"
              name="新增歌曲"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSongs)"
            />
            <Area
              type="monotone"
              dataKey="users"
              name="新增用户"
              stroke="#ec4899"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* 分类分布饼图 */}
      <Card className="p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-sky-500" />
          歌曲分类分布
        </h3>
        {trendData.categoryDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={trendData.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {trendData.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-slate-400">
            <p>暂无分类数据</p>
          </div>
        )}
      </Card>
    </div>
  );
}
