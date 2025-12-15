import React from 'react';
import { CheckCircle, AlertOctagon, Info, AlertTriangle, FileCheck, ShieldCheck, Printer, Server } from 'lucide-react';
import { AuditResponse, Issue } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ReportViewProps {
  data: AuditResponse;
}

const ReportView: React.FC<ReportViewProps> = ({ data }) => {
  const getIcon = (type: Issue['type']) => {
    switch (type) {
      case 'error': return <AlertOctagon className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: Issue['type']) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  const scoreColor = data.complianceScore >= 90 ? 'text-green-600' : data.complianceScore >= 70 ? 'text-amber-600' : 'text-red-600';

  const chartData = [
    { name: 'Errors', value: data.issues.filter(i => i.type === 'error').length, color: '#ef4444' },
    { name: 'Warnings', value: data.issues.filter(i => i.type === 'warning').length, color: '#f59e0b' },
    { name: 'Infos', value: data.issues.filter(i => i.type === 'info').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // If no issues, show full green
  if (chartData.length === 0) {
      chartData.push({ name: 'Passed', value: 1, color: '#22c55e' });
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Action Bar - Hidden on Print */}
      <div className="flex justify-end no-print">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          打印 / 导出 PDF
        </button>
      </div>

      {/* Header Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center break-inside-avoid">
        <div className="h-32 w-32 relative flex-shrink-0">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={35}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-2xl font-bold ${scoreColor}`}>{data.complianceScore}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Score</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
             <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-teal-600" />
                工艺审核总结
             </h2>
             {data.detectedEquipment && (
                 <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                    <Server className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">识别设备: {data.detectedEquipment}</span>
                 </div>
             )}
          </div>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">{data.summary}</p>
          <div className="mt-4 text-xs text-slate-400 font-mono">
            审核时间: {new Date().toLocaleString()} | 系统版本: v1.1.0
          </div>
        </div>
      </div>

      {/* GMPC Notice */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-4 break-inside-avoid">
        <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
        <div>
            <h3 className="font-semibold text-emerald-800 mb-1">GMPC 合规专家建议</h3>
            <p className="text-emerald-700 text-sm leading-relaxed">{data.gmpcNotes}</p>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-700 ml-1 border-b border-slate-200 pb-2">详细审核项 ({data.issues.length})</h3>
        {data.issues.map((issue, idx) => (
          <div key={idx} className={`p-4 rounded-lg border flex gap-4 ${getBgColor(issue.type)} break-inside-avoid`}>
            <div className="mt-1 flex-shrink-0">
              {getIcon(issue.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-slate-800 text-sm md:text-base">{issue.title}</h4>
                <div className="flex gap-2">
                    {issue.location && (
                        <span className="text-xs bg-white/60 px-2 py-0.5 rounded text-slate-500 border border-slate-200/50">
                            {issue.location}
                        </span>
                    )}
                     <span className="text-xs font-mono uppercase bg-white/60 px-2 py-0.5 rounded text-slate-500 border border-slate-200/50">
                        {issue.category}
                    </span>
                </div>
              </div>
              <p className="text-slate-700 mt-1 text-sm">{issue.description}</p>
            </div>
          </div>
        ))}
        {data.issues.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">未发现明显异常问题，文件符合性良好。</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReportView;