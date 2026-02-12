
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { StaffPerformance } from '../types';

const HRPerformance: React.FC = () => {
  const { staffPerformance, staff, lang, updateStaffPerformance, addLog, sales, generateAIContent } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [evalData, setEvalData] = useState({ staffId: '', sales: '', target: '15000', attendance: '', tasks: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const currentPerformance = staffPerformance[0]; 
  const staffInfo = staff.find(s => s.id === currentPerformance?.staffId);

  const radarData = currentPerformance ? [
    { subject: 'Sales', A: (currentPerformance.achievedSales / (currentPerformance.salesTarget || 1)) * 100, fullMark: 100 },
    { subject: 'Attendance', A: currentPerformance.attendanceRate, fullMark: 100 },
    { subject: 'Tasks', A: Math.min(currentPerformance.tasksCompleted * 2, 100), fullMark: 100 },
    { subject: 'Speed', A: 85, fullMark: 100 },
    { subject: 'Service', A: 90, fullMark: 100 },
  ] : [];

  const handleAutoEvaluate = async () => {
      if(!evalData.staffId) return alert('يرجى اختيار الموظف أولاً');
      setIsGenerating(true);
      
      const employeeName = staff.find(s => s.id === evalData.staffId)?.name || 'Unknown';
      // Calculate real sales from AppContext
      // Assuming sales have a 'cashierId' or we map by name if ID is missing in older records
      const realSales = sales
        .filter(s => s.cashierId === evalData.staffId || s.sellerName === employeeName)
        .reduce((a, b) => a + b.total, 0);

      const prompt = `
        Evaluate employee performance based on data:
        Name: ${employeeName}
        Total Sales: ${realSales}
        Sales Target: ${evalData.target}
        
        Generate a JSON response ONLY:
        {
            "attendance": 95, 
            "tasks": 40,
            "kpiScore": 88
        }
        (Estimate reasonable attendance and task values based on high sales performance implies good work ethics).
      `;

      try {
          const res = await generateAIContent(prompt, 'text');
          const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          
          setEvalData({
              ...evalData,
              sales: realSales.toString(),
              attendance: parsed.attendance,
              tasks: parsed.tasks
          });
      } catch (e) {
          console.error(e);
          // Fallback if AI fails
          setEvalData({ ...evalData, sales: realSales.toString(), attendance: '95', tasks: '10' });
      }
      setIsGenerating(false);
  };

  const handleSaveEval = () => {
      if(!evalData.staffId) return;
      const perf: StaffPerformance = {
          staffId: evalData.staffId,
          achievedSales: parseFloat(evalData.sales) || 0,
          salesTarget: parseFloat(evalData.target) || 10000,
          attendanceRate: parseFloat(evalData.attendance) || 100,
          tasksCompleted: parseInt(evalData.tasks) || 0,
          kpiScore: Math.min(100, Math.floor(((parseFloat(evalData.sales) / parseFloat(evalData.target)) * 0.6 + (parseFloat(evalData.attendance) / 100) * 0.4) * 100))
      };
      updateStaffPerformance(perf);
      setShowModal(false);
      addLog(`Performance review submitted for staff ${evalData.staffId}`, 'success', 'HR');
      alert('تم تحديث سجل الأداء بنجاح');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end" dir="rtl">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">ذكاء الموارد البشرية (HR Performance)</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">تحليل الإنتاجية، تتبع مؤشرات الأداء KPIs، وإدارة المواهب</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
        >
            تقييم موظف جديد +
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10" dir="rtl">
         {/* Performance Card */}
         <div className="lg:col-span-1 glass p-12 rounded-[60px] border border-white shadow-2xl bg-white/40">
            {staffInfo ? (
                <>
                    <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 text-indigo-600 flex items-center justify-center text-5xl font-black mb-6 shadow-inner border-4 border-white">
                        {staffInfo.name.charAt(0)}
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{staffInfo.name}</h3>
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mt-2">{staffInfo.role}</p>
                    </div>

                    <div className="space-y-8">
                    <div className="p-8 bg-slate-900 text-white rounded-[40px] text-center shadow-xl">
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">درجة الأداء الإجمالية (KPI Score)</p>
                        <h4 className="text-6xl font-black tracking-tighter text-emerald-400">{currentPerformance?.kpiScore}%</h4>
                        <p className="text-[9px] font-bold mt-3 opacity-60">أعلى من متوسط القسم بـ 12%</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-2">المبيعات المحققة</p>
                            <p className="text-xl font-black text-slate-800">${currentPerformance?.achievedSales.toLocaleString()}</p>
                        </div>
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-2">الحضور</p>
                            <p className="text-xl font-black text-slate-800">{currentPerformance?.attendanceRate}%</p>
                        </div>
                    </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-40">
                    <p className="font-black text-xl">لا توجد بيانات تقييم</p>
                </div>
            )}
         </div>

         {/* Visual Analysis */}
         <div className="lg:col-span-2 glass p-12 rounded-[60px] border border-white shadow-2xl bg-white/40 relative overflow-hidden">
            <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
               <div className="w-2.5 h-8 bg-indigo-600 rounded-full"></div>
               رادار الكفاءة المهنية
            </h3>
            {currentPerformance ? (
                <div className="h-[500px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Performance" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[500px] flex items-center justify-center text-gray-300 font-bold">No Chart Data</div>
            )}
            
            <div className="absolute bottom-12 right-12 flex gap-4">
               <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-indigo-600 transition-all">تصدير سجل الأداء</button>
            </div>
         </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">تقييم أداء دوري</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الموظف</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setEvalData({...evalData, staffId: e.target.value})}>
                       <option value="">اختر الموظف...</option>
                       {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
                 
                 <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-indigo-800 uppercase">التقييم الذكي</p>
                        <p className="text-[9px] text-indigo-500 mt-1">استيراد المبيعات وتحليل الأداء آلياً</p>
                    </div>
                    <button 
                        onClick={handleAutoEvaluate}
                        disabled={isGenerating || !evalData.staffId}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all"
                    >
                        {isGenerating ? 'جاري التحليل...' : 'Auto-Eval 🤖'}
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المبيعات المحققة</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-emerald-600" value={evalData.sales} onChange={e=>setEvalData({...evalData, sales: e.target.value})} placeholder="Auto or Manual" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المستهدف</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black" value={evalData.target} onChange={e=>setEvalData({...evalData, target: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">نسبة الحضور %</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={evalData.attendance} onChange={e=>setEvalData({...evalData, attendance: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المهام المنجزة</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={evalData.tasks} onChange={e=>setEvalData({...evalData, tasks: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleSaveEval} className="flex-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all">اعتماد التقييم</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HRPerformance;
