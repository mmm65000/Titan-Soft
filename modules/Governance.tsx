
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Governance: React.FC = () => {
  const { legalCases, audits, projects, budgets, lang, generateAIContent } = useApp();
  const [generating, setGenerating] = useState(false);

  const auditScoreAvg = audits.length > 0 ? audits.reduce((a,b)=>a+b.score, 0) / audits.length : 0;

  const projectStatusData = [
    { name: 'Active', value: projects.filter(p=>p.status==='active').length, color: '#4f46e5' },
    { name: 'Planning', value: projects.filter(p=>p.status==='planning').length, color: '#f59e0b' },
    { name: 'Completed', value: projects.filter(p=>p.status==='completed').length, color: '#10b981' }
  ];

  const handleGenerateReport = async () => {
      setGenerating(true);
      
      const context = `
      Current Governance Status:
      - Average Audit Compliance Score: ${auditScoreAvg.toFixed(1)}%
      - Open Legal Cases: ${legalCases.length}
      - Active Strategic Projects: ${projects.filter(p=>p.status==='active').length}
      - Budget Variance Status: ${budgets.filter(b=>b.status==='exceeded').length} budgets exceeded.
      `;

      const prompt = `Act as a Chief Strategy Officer. Generate a short, high-level executive summary report based on the following data points for the "Titan Platform". Focus on risks, compliance, and strategic recommendations.\n\n${context}`;

      const reportText = await generateAIContent(prompt, 'analysis');

      const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Executive_Governance_Report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('تم توليد تقرير الحوكمة الاستراتيجي بنجاح باستخدام AI ✅');
      setGenerating(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20" dir="rtl">
      <div className="bg-slate-900 p-16 rounded-[70px] shadow-3xl text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div>
               <h1 className="text-6xl font-black tracking-tighter mb-4">Strategic HQ</h1>
               <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Governance & Executive Sovereignty Console</p>
            </div>
            <div className="flex gap-8">
               <div className="text-center">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Compliance Rating</p>
                  <h4 className="text-4xl font-black">{auditScoreAvg.toFixed(1)}%</h4>
               </div>
               <div className="text-center border-r border-white/10 pr-8">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Legal Risks</p>
                  <h4 className="text-4xl font-black">{legalCases.length}</h4>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Strategic Projects Analysis */}
         <div className="lg:col-span-2 glass p-12 rounded-[60px] border border-white shadow-2xl bg-white/40">
            <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
               <div className="w-2.5 h-8 bg-indigo-600 rounded-full"></div>
               توزيع الموارد عبر المشاريع الاستراتيجية
            </h3>
            <div className="h-[350px] w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={10} dataKey="value">
                        {projectStatusData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-12 mt-6">
               {projectStatusData.map(d => (
                  <div key={d.name} className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase">{d.name} ({d.value})</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Executive Insights AI */}
         <div className="lg:col-span-1 glass p-10 rounded-[60px] shadow-2xl border-white bg-slate-50 flex flex-col justify-between">
            <div>
               <h3 className="text-xl font-black text-slate-800 mb-8">Oracle SWOT Analysis</h3>
               <div className="space-y-6">
                  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                     <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Strengths</p>
                     <p className="text-xs font-bold text-slate-600 leading-relaxed">كفاءة تشغيلية عالية في خطوط الإنتاج (94%) واستدامة في سلاسل التوريد الدولية.</p>
                  </div>
                  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                     <p className="text-[10px] font-black text-red-600 uppercase mb-2">Risks</p>
                     <p className="text-xs font-bold text-slate-600 leading-relaxed">نزاع قانوني نشط مع مورد رئيسي؛ قد يؤثر على مخزون الربع القادم بنسبة 8%.</p>
                  </div>
               </div>
            </div>
            <button 
                onClick={handleGenerateReport}
                disabled={generating}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl mt-10 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
                {generating ? 'جاري التحليل والتوليد...' : 'توليد تقرير الحوكمة (AI)'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default Governance;
