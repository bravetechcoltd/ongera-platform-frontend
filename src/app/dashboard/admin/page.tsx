// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAdminDashboardSummary,
  type AdminDashboardSummary,
  type SystemAlert,
} from "@/lib/features/auth/adminDashboardSlice";
import {
  Users, FileText, Calendar, TrendingUp, TrendingDown,
  AlertCircle, Eye, Download, Heart, MessageSquare,
  RefreshCw, BarChart3, Activity, UserCheck, UserX, CheckCircle,
  Building2, BookOpen, Globe, Award, Zap, Clock,
  ArrowUpRight, ArrowDownRight, Target, Briefcase,
  PieChart, LineChart, ChevronRight, ChevronLeft,
  Layers, Users2, GitFork, Star, ThumbsUp, Share2, 
  TrendingUpIcon, TrendingDownIcon, Minus,
  Sparkles, Rocket, ZapIcon, Flame,
  Crown,
  Archive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ==================== PROFESSIONAL CHART COMPONENTS ====================

// Performance Donut Chart with Growth Indicators
const PerformanceDonutChart = ({ 
  data, 
  title,
  size = 200,
  showPercentage = true
}: { 
  data: Array<{ label: string; value: number; color: string; growth?: number }>;
  title: string;
  size?: number;
  showPercentage?: boolean;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 3;
  const center = size / 2;
  let currentAngle = 0;

  const slices = data.map((item, index) => {
    const slicePercent = item.value / total;
    const startAngle = currentAngle;
    const endAngle = currentAngle + slicePercent * 2 * Math.PI;
    currentAngle = endAngle;

    const startX = center + radius * Math.cos(startAngle - Math.PI / 2);
    const startY = center + radius * Math.sin(startAngle - Math.PI / 2);
    const endX = center + radius * Math.cos(endAngle - Math.PI / 2);
    const endY = center + radius * Math.sin(endAngle - Math.PI / 2);

    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L ${center} ${center}`,
      'Z',
    ].join(' ');

    return { ...item, pathData, slicePercent };
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-[#0158B7]" />
          {title}
        </h3>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Total: {total}
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((slice, index) => (
              <motion.path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="3"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer transition-transform"
              />
            ))}
            <circle cx={center} cy={center} r={radius / 2.2} fill="white" className="drop-shadow-md" />
            <text
              x={center}
              y={center - 8}
              textAnchor="middle"
              className="text-xl font-bold fill-gray-800"
            >
              {total}
            </text>
            <text
              x={center}
              y={center + 15}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              Total
            </text>
          </svg>

          {/* Decorative rings */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
        </div>

        {/* Legend with Growth Indicators */}
        <div className="flex-1 grid grid-cols-1 gap-3 w-full">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const GrowthIcon = item.growth && item.growth > 0 ? TrendingUpIcon : 
                              item.growth && item.growth < 0 ? TrendingDownIcon : Minus;
            const growthColor = item.growth && item.growth > 0 ? 'text-green-600' : 
                               item.growth && item.growth < 0 ? 'text-red-600' : 'text-gray-400';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  <span className="text-xs text-gray-500 min-w-[45px]">{percentage}%</span>
                  {item.growth !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${growthColor}`}>
                      <GrowthIcon className="w-3 h-3" />
                      <span>{Math.abs(item.growth)}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Professional Horizontal Bar Chart with Dominance Indicators
const ProfessionalHorizontalBarChart = ({ 
  data, 
  title,
  valueLabel = "Count",
  showDominance = true
}: { 
  data: Array<{ name: string; value: number; previous?: number; change?: number; color?: string }>;
  title: string;
  valueLabel?: string;
  showDominance?: boolean;
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Calculate dominance (which ones are leading)
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const topValue = sortedData[0]?.value || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#0158B7]" />
          {title}
        </h3>
        {showDominance && (
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
              <Flame className="w-3 h-3" />
              Leader: {sortedData[0]?.name}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const widthPercent = (item.value / maxValue) * 100;
          const isLeader = index === 0 && item.value === topValue;
          const isSecond = index === 1 && item.value === sortedData[1]?.value;
          
          // Determine dominance indicator
          let DominanceIcon = Minus;
          let dominanceColor = "text-gray-400";
          if (isLeader) {
            DominanceIcon = TrendingUpIcon;
            dominanceColor = "text-green-600";
          } else if (isSecond) {
            DominanceIcon = TrendingUpIcon;
            dominanceColor = "text-blue-600";
          } else if (item.change) {
            DominanceIcon = item.change > 0 ? TrendingUpIcon : item.change < 0 ? TrendingDownIcon : Minus;
            dominanceColor = item.change > 0 ? "text-green-600" : item.change < 0 ? "text-red-600" : "text-gray-400";
          }

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  {isLeader && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Dominant
                    </span>
                  )}
                  {isSecond && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">
                      Rising
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{item.value.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 min-w-[40px]">{valueLabel}</span>
                  {showDominance && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${dominanceColor}`}>
                      <DominanceIcon className="w-3 h-3" />
                      {item.change && <span>{Math.abs(item.change)}%</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden group">
                {/* Main bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ delay: index * 0.15, duration: 1, ease: "easeOut" }}
                  className={`absolute top-0 left-0 h-full rounded-lg ${
                    isLeader 
                      ? 'bg-gradient-to-r from-green-500 to-green-400' 
                      : isSecond
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                        : 'bg-gradient-to-r from-[#0158B7] to-[#5E96D2]'
                  }`}
                />
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {/* Value label inside bar */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white drop-shadow-md">
                  {item.value.toLocaleString()}
                </div>
              </div>

              {/* Previous period comparison */}
              {item.previous !== undefined && (
                <div className="flex justify-end text-[10px] text-gray-500">
                  Previous: {item.previous.toLocaleString()} ({item.change ? (item.change > 0 ? '+' : '') + item.change + '%' : ''})
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Donut Chart
const DonutChart = ({ 
  data, 
  title,
  size = 180
}: { 
  data: Array<{ label: string; value: number; color: string }>;
  title: string;
  size?: number;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 3;
  const center = size / 2;
  let currentAngle = 0;

  const slices = data.map((item, index) => {
    const slicePercent = item.value / total;
    const startAngle = currentAngle;
    const endAngle = currentAngle + slicePercent * 2 * Math.PI;
    currentAngle = endAngle;

    const startX = center + radius * Math.cos(startAngle - Math.PI / 2);
    const startY = center + radius * Math.sin(startAngle - Math.PI / 2);
    const endX = center + radius * Math.cos(endAngle - Math.PI / 2);
    const endY = center + radius * Math.sin(endAngle - Math.PI / 2);

    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L ${center} ${center}`,
      'Z',
    ].join(' ');

    return { ...item, pathData, slicePercent, startAngle, endAngle };
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="flex flex-col items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, index) => (
            <motion.path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            />
          ))}
          <circle cx={center} cy={center} r={radius / 2.5} fill="white" />
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            className="text-sm font-bold fill-gray-800"
          >
            {total}
          </text>
          <text
            x={center}
            y={center + 10}
            textAnchor="middle"
            className="text-[8px] fill-gray-500"
          >
            Total
          </text>
        </svg>

        <div className="grid grid-cols-2 gap-2 mt-4 w-full">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-700 truncate">{item.label}</span>
              <span className="text-xs font-semibold ml-auto">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// Professional Line Chart with Trend Analysis
const ProfessionalLineChart = ({ 
  data, 
  title,
  lines = [
    { key: 'value1', color: '#0158B7', label: 'Series 1' },
    { key: 'value2', color: '#10B981', label: 'Series 2' }
  ],
  showTrend = true
}: { 
  data: Array<{ label: string; [key: string]: any }>;
  title: string;
  lines: Array<{ key: string; color: string; label: string }>;
  showTrend?: boolean;
}) => {
  const maxValue = Math.max(...data.flatMap(d => lines.map(l => d[l.key] || 0)));
  const minValue = Math.min(...data.flatMap(d => lines.map(l => d[l.key] || 0)));
  const range = maxValue - minValue || 1;

  // Calculate trend for each line
  const trends = lines.map(line => {
    const values = data.map(d => d[line.key] || 0);
    const firstValue = values[0] || 0;
    const lastValue = values[values.length - 1] || 0;
    const change = firstValue ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    return { ...line, change };
  });

  const points = lines.map(line => 
    data.map((d, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 100 - ((d[line.key] - minValue) / range) * 100,
      value: d[line.key],
      label: d.label
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#0158B7]" />
          {title}
        </h3>
        {showTrend && (
          <div className="flex items-center gap-3">
            {trends.map((trend, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trend.color }} />
                <span className="text-gray-600">{trend.label}:</span>
                <span className={trend.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative h-64">
        {/* Grid lines with labels */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 20, 40, 60, 80, 100].map((percent) => (
            <div key={percent} className="border-t border-gray-100 h-0 relative group">
              <span className="absolute -top-3 left-0 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.round(minValue + (range * (100 - percent) / 100))}
              </span>
            </div>
          ))}
        </div>

        {/* Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {points.map((pointSet, lineIndex) => (
            <motion.polyline
              key={lineIndex}
              points={pointSet.map(p => `${p.x}% ${p.y}%`).join(' ')}
              fill="none"
              stroke={lines[lineIndex].color}
              strokeWidth="3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: lineIndex * 0.3 }}
              className="drop-shadow-md"
            />
          ))}
        </svg>

        {/* Data points with tooltips */}
        {points.map((pointSet, lineIndex) => 
          pointSet.map((point, index) => (
            <motion.div
              key={`${lineIndex}-${index}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5 + (lineIndex * 0.1) }}
              className="absolute w-3 h-3 bg-white border-2 rounded-full transform -translate-x-1.5 -translate-y-1.5 group cursor-pointer"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                borderColor: lines[lineIndex].color
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                  <div className="font-semibold">{point.value}</div>
                  <div className="text-gray-300 text-[10px]">{point.label}</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4 px-2">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            <div className="text-xs font-medium text-gray-700">{d.label}</div>
          </div>
        ))}
      </div>

      {/* Legend with trends */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
        {trends.map((trend, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: trend.color }} />
            <span className="text-sm text-gray-600">{trend.label}</span>
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {trend.change >= 0 ? <TrendingUpIcon className="w-3 h-3" /> : <TrendingDownIcon className="w-3 h-3" />}
              <span>{Math.abs(trend.change).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Professional Metric Card with Sparkline
const ProfessionalMetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  format = 'number',
  color = 'blue',
  sparklineData = []
}: { 
  title: string; 
  value: number; 
  icon: any; 
  change?: number; 
  format?: 'number' | 'currency';
  color?: string;
  sparklineData?: number[];
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    pink: 'from-pink-500 to-pink-600'
  };

  const formattedValue = format === 'currency' 
    ? `RWF ${(value / 1000000).toFixed(1)}M`
    : value.toLocaleString();

  // Generate sparkline path
  const maxSpark = Math.max(...sparklineData, 1);
  const sparkPath = sparklineData.length > 1 
    ? sparklineData.map((val, i) => {
        const x = (i / (sparklineData.length - 1)) * 100;
        const y = 100 - (val / maxSpark) * 100;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all relative overflow-hidden group"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {change >= 0 ? <TrendingUpIcon className="w-3 h-3" /> : <TrendingDownIcon className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
      </div>

      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="mt-4 h-8">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={sparkPath}
              fill="none"
              stroke={change && change >= 0 ? '#10B981' : '#EF4444'}
              strokeWidth="2"
              className="opacity-50"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

// ==================== MAIN DASHBOARD PAGE ====================
export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { summary, isLoadingSummary, error, lastFetched } =
    useAppSelector((state) => state.adminDashboard);

  const [activeTab, setActiveTab] = useState<'overview' | 'communities' | 'projects'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchAdminDashboardSummary());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAdminDashboardSummary());
    setRefreshing(false);
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error": return "bg-red-50 border-red-200 text-red-800";
      case "warning": return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info": return "bg-blue-50 border-blue-200 text-blue-800";
      default: return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  if (isLoadingSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#0158B7]/20 border-t-[#0158B7] rounded-full animate-spin mx-auto mb-4" />
            <Sparkles className="w-6 h-6 text-[#0158B7] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-sm text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-xl border border-red-200 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-sm text-gray-600 mb-6">{error || "Failed to load dashboard"}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#0158B7]/80 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Prepare project data for performance donut
  const projectPerformanceData = [
    { 
      label: 'Published', 
      value: summary.projects?.published || 0, 
      color: '#10B981',
      growth: summary.projects?.publishRate ? summary.projects.publishRate - 50 : 0
    },
    { 
      label: 'Draft', 
      value: summary.projects?.draft || 0, 
      color: '#F59E0B',
      growth: -5 
    },
    { 
      label: 'Archived', 
      value: summary.projects?.archived || 0, 
      color: '#6B7280',
      growth: -2 
    },
    { 
      label: 'Seeking Collaborators', 
      value: summary.projects?.collaborationStats?.seekingCollaborators || 0, 
      color: '#8B5CF6',
      growth: 15 
    },
    { 
      label: 'Collaborative', 
      value: summary.projects?.collaborationStats?.collaborative || 0, 
      color: '#EC4899',
      growth: 8 
    }
  ];

  // Prepare community performance data with dominance indicators
  const communityPerformanceData = (summary.communities?.topByProjects || []).map((c: any, idx: number) => ({
    name: c.name,
    value: c.projectCount || 0,
    previous: Math.round((c.projectCount || 0) * 0.8), // Simulated previous period
    change: 20 + (idx * 5), // Simulated growth
    color: idx === 0 ? '#10B981' : idx === 1 ? '#3B82F6' : '#0158B7'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header with animated gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#0158B7] via-[#0158B7]/90 to-[#5E96D2] rounded-2xl p-6 text-white shadow-xl"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3 animate-pulse delay-1000" />
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Rocket className="w-6 h-6 animate-bounce" />
                <h1 className="text-2xl md:text-3xl font-bold">Analytics Dashboard</h1>
              </div>
              <p className="text-blue-100 text-sm">
                Platform Health: <span className="font-semibold text-white uppercase tracking-wider">
                  {summary.overview?.platformHealth?.toUpperCase() || 'HEALTHY'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastFetched && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">
                    {new Date(lastFetched).toLocaleTimeString()}
                  </span>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Professional Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProfessionalMetricCard
            title="Total Users"
            value={summary.overview?.totalUsers || 0}
            icon={Users}
            change={summary.users?.growthRate}
            color="blue"
            sparkline={[65, 59, 80, 81, 56, 55, 40]}
          />
          <ProfessionalMetricCard
            title="Total Projects"
            value={summary.overview?.totalProjects || 0}
            icon={FileText}
            change={summary.projects?.publishRate}
            color="purple"
            sparkline={[45, 52, 38, 24, 33, 26, 48]}
          />
          <ProfessionalMetricCard
            title="Total Communities"
            value={summary.overview?.totalCommunities || 0}
            icon={Building2}
            change={summary.communities?.approvalRate}
            color="green"
            sparkline={[30, 40, 35, 50, 49, 60, 70]}
          />
          <ProfessionalMetricCard
            title="Total Events"
            value={summary.overview?.totalEvents || 0}
            icon={Calendar}
            change={summary.events?.upcoming}
            color="orange"
            sparkline={[20, 25, 30, 28, 35, 40, 45]}
          />
        </div>

        {/* System Alerts */}
        {summary.systemHealth?.alerts && summary.systemHealth.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900">System Alerts</h3>
              <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {summary.systemHealth.alertCount?.total || 0} alerts
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {summary.systemHealth.alerts.map((alert: SystemAlert, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1">{alert.category}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      alert.priority === 'high' ? 'bg-red-200 text-red-800' :
                      alert.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {alert.priority}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs with icons */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'communities', label: 'Communities', icon: Building2 },
            { id: 'projects', label: 'Projects', icon: FileText }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#0158B7] to-[#0158B7]/90 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[#0158B7]/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Overview Tab - Now with Professional Performance Charts */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Professional Performance Donut Chart - Shows all project info */}
              <PerformanceDonutChart
                title="Research Project Performance Dashboard"
                data={projectPerformanceData}
                size={240}
                showPercentage={true}
              />

              {/* Professional Horizontal Bar Chart - Shows Community Dominance */}
              {communityPerformanceData.length > 0 && (
                <ProfessionalHorizontalBarChart
                  title="Community Dominance & Performance Metrics"
                  data={communityPerformanceData}
                  valueLabel="projects"
                  showDominance={true}
                />
              )}

              {/* Professional Line Chart - Growth Trends */}
              {summary.activityTimeline && (
                <ProfessionalLineChart
                  title="Platform Growth Trajectory (7-Day Trend)"
                  data={summary.activityTimeline.map(day => ({
                    label: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    users: day.newUsers,
                    projects: day.newProjects,
                    communities: day.newCommunities,
                    events: day.newEvents
                  }))}
                  lines={[
                    { key: 'users', color: '#0158B7', label: 'New Users' },
                    { key: 'projects', color: '#10B981', label: 'New Projects' },
                    { key: 'communities', color: '#8B5CF6', label: 'New Communities' }
                  ]}
                  showTrend={true}
                />
              )}

              {/* User Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#0158B7]" />
                    User Analytics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Verified</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{summary.users?.verified}</p>
                      <p className="text-xs text-blue-600 mt-1">{summary.users?.verificationRate}% of total</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Active</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{summary.users?.active}</p>
                      <p className="text-xs text-green-600 mt-1">Today: {summary.users?.newToday}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">New This Month</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">{summary.users?.newThisMonth}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium text-orange-600">Growth</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">{summary.users?.growthRate}%</p>
                    </div>
                  </div>
                </motion.div>

                {/* Account Type Distribution */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#0158B7]" />
                    User Distribution by Account Type
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(summary.users?.byAccountType || {}).map(([type, count], index) => {
                      const percentage = ((count as number) / (summary.users?.total || 1)) * 100;
                      return (
                        <motion.div
                          key={type}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-1"
                        >
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{type}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">{count as number}</span>
                              <span className="text-xs text-gray-500 min-w-[45px]">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: index * 0.15, duration: 1 }}
                              className="h-full bg-gradient-to-r from-[#0158B7] to-[#5E96D2]"
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Communities Tab - Enhanced */}
          {activeTab === 'communities' && summary.communities && (
            <motion.div
              key="communities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Communities Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
                >
                  <Building2 className="w-6 h-6 text-[#0158B7] mb-2" />
                  <p className="text-sm text-gray-600">Total Communities</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.communities.total}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">Active Communities</p>
                  <p className="text-2xl font-bold text-green-600">{summary.communities.active}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
                >
                  <Users className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.communities.engagement?.totalMembers}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
                >
                  <MessageSquare className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.communities.engagement?.totalPosts}</p>
                </motion.div>
              </div>

              {/* Communities Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Communities with Most Projects - Professional Bar Chart */}
                {summary.communities.topByProjects && summary.communities.topByProjects.length > 0 && (
                  <ProfessionalHorizontalBarChart
                    title="Communities with Most Research Projects"
                    data={summary.communities.topByProjects.slice(0, 5).map((c: any, idx: number) => ({
                      name: c.name,
                      value: c.projectCount || 0,
                      previous: Math.round((c.projectCount || 0) * 0.9),
                      change: 10 + (idx * 2),
                      color: idx === 0 ? '#10B981' : idx === 1 ? '#3B82F6' : '#0158B7'
                    }))}
                    valueLabel="projects"
                    showDominance={true}
                  />
                )}

                {/* Communities by Type - Donut Chart */}
                {summary.communities.typeDistribution && summary.communities.typeDistribution.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Type Distribution</h3>
                    <div className="flex flex-col items-center">
                      <DonutChart
                        data={summary.communities.typeDistribution.map((item: any, idx: number) => ({
                          label: item.type,
                          value: item.count,
                          color: idx === 0 ? '#0158B7' : idx === 1 ? '#5E96D2' : '#A8C8E8'
                        }))}
                        title=""
                        size={200}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Community Growth Over Time */}
              {summary.communities.growthOverTime && summary.communities.growthOverTime.length > 0 && (
                <ProfessionalLineChart
                  title="Community Growth Over Time"
                  data={summary.communities.growthOverTime}
                  lines={[
                    { key: 'count', color: '#0158B7', label: 'New Communities' }
                  ]}
                  showTrend={true}
                />
              )}

              {/* Join Requests */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Join Request Status</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-yellow-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-700">{summary.communities.joinRequests.pending}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-green-600 mb-1">Approved</p>
                      <p className="text-2xl font-bold text-green-700">{summary.communities.joinRequests.approved}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-red-600 mb-1">Rejected</p>
                      <p className="text-2xl font-bold text-red-700">{summary.communities.joinRequests.rejected}</p>
                    </div>
                  </div>
                </div>

                {/* Communities by Join Requests */}
                {summary.communities.topByJoinRequests && summary.communities.topByJoinRequests.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Requested Communities</h3>
                    <div className="space-y-3">
                      {summary.communities.topByJoinRequests.slice(0, 5).map((item: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-700 truncate max-w-[200px]">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                              {item.requestCount} total
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              {item.approvedCount} approved
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Projects Tab - Keep existing but enhance with professional charts */}
          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Project Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
                >
                  <FileText className="w-6 h-6 text-[#0158B7] mb-2" />
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.projects.total}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
                >
                  <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">{summary.projects.published}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
                >
                  <FileText className="w-6 h-6 text-yellow-600 mb-2" />
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.projects.draft}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
                >
                  <Archive className="w-6 h-6 text-gray-600 mb-2" />
                  <p className="text-sm text-gray-600">Archived</p>
                  <p className="text-2xl font-bold text-gray-500">{summary.projects.archived}</p>
                </motion.div>
              </div>

              {/* Project Engagement Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <Eye className="w-5 h-5 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-blue-700">
                        {(summary.projects.engagement?.totalViews / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Total Views</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <Download className="w-5 h-5 text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-purple-700">
                        {(summary.projects.engagement?.totalDownloads / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-purple-600 mt-1">Downloads</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                      <Heart className="w-5 h-5 text-pink-600 mb-2" />
                      <p className="text-2xl font-bold text-pink-700">
                        {(summary.projects.engagement?.totalLikes / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-pink-600 mt-1">Likes</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                      <MessageSquare className="w-5 h-5 text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-green-700">
                        {(summary.projects.engagement?.totalComments / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-green-600 mt-1">Comments</p>
                    </div>
                  </div>
                </div>

                {/* Projects by Research Type */}
                {summary.projects.byResearchType && summary.projects.byResearchType.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Research Type</h3>
                    <div className="space-y-3">
                      {summary.projects.byResearchType.slice(0, 5).map((item: any, idx: number) => {
                        const total = summary.projects.total || 1;
                        const percentage = (item.count / total) * 100;
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="space-y-1"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">{item.type}</span>
                              <span className="font-semibold text-gray-900">{item.count}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: idx * 0.1, duration: 1 }}
                                className="h-full bg-gradient-to-r from-[#0158B7] to-[#5E96D2]"
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{item.totalViews.toLocaleString()} views</span>
                              <span>{item.totalDownloads.toLocaleString()} downloads</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Growth Over Time */}
              {summary.projects.growthOverTime && summary.projects.growthOverTime.length > 0 && (
                <ProfessionalLineChart
                  title="Project Growth Over Time"
                  data={summary.projects.growthOverTime}
                  lines={[
                    { key: 'total', color: '#0158B7', label: 'Total Projects' },
                    { key: 'published', color: '#10B981', label: 'Published' }
                  ]}
                  showTrend={true}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Last Updated Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200"
        >
          Last updated: {new Date(summary.generatedAt).toLocaleString()}
        </motion.div>
      </div>
    </div>
  );
}