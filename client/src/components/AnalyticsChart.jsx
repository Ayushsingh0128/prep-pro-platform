import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AnalyticsChart = ({ data }) => {
    // Convert unified data to chart format
    const chartData = data.map(item => ({
        date: new Date(item.date || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: item.score || item.overallScore || 0,
        type: item.type || 'quiz'
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={tooltipStyle}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8' }} />
                    <span style={{ fontWeight: '700' }}>Score: {payload[0].value}%</span>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px 0' }}>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#475569" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        fontWeight={600}
                    />
                    <YAxis 
                        stroke="#475569" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        domain={[0, 100]}
                        fontWeight={600}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#818cf8" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorScore)"
                        dot={{ fill: '#818cf8', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const tooltipStyle = {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#f8fafc',
    boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
};

export default AnalyticsChart;