
import React from 'react';
import { useApp } from '../AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const ProfitMatrix: React.FC = () => {
  const { calculateProjectedPnL, lang } = useApp();
  const pnl = calculateProjectedPnL();

  const chartData = [
    { name: 'Revenue', val: pnl.revenue, fill: '#2563eb' },
    { name: 'COGS', val: pnl.cogs, fill: '#f59e0b' },
    { name: 'OPEX', val: pnl.opex, fill: '#ef4444' },
    { name: 'VAT', val: pnl.tax, fill: '#8b5cf6' },
    { name: 'Net', val: pnl.netProfit, fill: '#10b981' }
  ];

  const cashCycleData = [
    { name: 'Receivables (AR)', value: pnl.ar_balance, color: '#3b82f6' },
    { name: 'Payables (AP)', value: pnl.ap_balance, color: '#f43f5e' },
    { name: 'Burn Rate', value: pnl.opex / 4, color: '#64748b' } // Weekly burn estimation
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20" dir="rtl">
      {/* Strategic Header */}
      <div className="bg-slate-900 p-16 rounded-[70px] shadow-3xl text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div>
               <h1 className="text-6xl font-black tracking-tighter mb-4">Sovereign P&L</h1>
               <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Fiscal Sovereignty & Dynamic Margin Control</p>
            </div>
            <div className="flex gap-8">
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[40px] text-center min-w-[180px]">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Profit Margin</p>
                  <h4 className="text-5xl font-black text-emerald-400">{pnl.margin.toFixed(1)}%</h4>
               </div>
               <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-[40px] text-center min-w-[180px]">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Net Revenue</p>
                  <h4 className="text-5xl font-black text-blue-400">${pnl.revenue.toLocaleString()}</h4>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Main P&L Chart */}
         <div className="lg:col-span-2 glass p-12 rounded-[60px] border border-white shadow-2xl bg-white/40">
            <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
               <div className="w-2.5 h-8 bg-blue-600 rounded-full"></div>
               هيكل الأرباح والخسائر الشامل (P&L Structure)
            </h3>
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                     <YAxis axisLine={false} tickLine={false} />
                     <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                     <Bar dataKey="val" radius={[15, 15, 0, 0]} barSize={60}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Cash Cycle & burn */}
         <div className="lg:col-span-1 space-y-8">
            <div className="glass p-10 rounded-[60px] shadow-xl border-white bg-white/40">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10">Cash Cycle Analytics</h4>
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={cashCycleData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={10}
                           dataKey="value"
                        >
                           {cashCycleData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-4 mt-6">
                  {cashCycleData.map(d => (
                     <div key={d.name} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-white">
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                           <span className="text-[10px] font-black text-slate-500 uppercase">{d.name}</span>
                        </div>
                        <span className="font-black text-slate-800">${d.value.toLocaleString()}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="glass p-10 rounded-[60px] shadow-2xl border-white bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
                <p className="text-[10px] font-black text-orange-400 uppercase mb-4">Oracle Fiscal Warning</p>
                <p className="text-sm font-bold leading-relaxed opacity-80">
                   ارتفاع نسبة الحسابات المدينة (AR) تمثل 27% من الدخل؛ يوصى بتفعيل "بروتوكول التحصيل العاجل" لتحسين التدفق النقدي الصافي قبل نهاية الربع.
                </p>
            </div>
         </div>
      </div>

      {/* Detailed Financial Breakdown */}
      <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100 overflow-hidden">
         <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-slate-800">تقرير الأداء المالي التفصيلي</h3>
            <div className="flex gap-3">
               <button className="px-6 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase">Q1 2025</button>
               <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">تنزيل الميزانية</button>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b pb-2">الإيرادات والأصول الجارية</h4>
               <div className="space-y-4">
                  <div className="flex justify-between font-bold text-sm"><span>إجمالي المبيعات الموثقة</span><span className="font-black text-slate-800">${pnl.revenue.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-sm"><span>عقود صيانة جارية</span><span className="font-black text-slate-800">$12,400</span></div>
                  <div className="flex justify-between font-bold text-sm text-blue-600 border-t pt-4"><span>إجمالي الدخل التشغيلي</span><span className="font-black">${(pnl.revenue + 12400).toLocaleString()}</span></div>
               </div>
            </div>
            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest border-b pb-2">التكاليف والخصوم</h4>
               <div className="space-y-4">
                  <div className="flex justify-between font-bold text-sm"><span>تكلفة البضاعة المباعة (COGS)</span><span className="font-black text-slate-800">${pnl.cogs.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-sm"><span>مصاريف إدارية وعمومية</span><span className="font-black text-slate-800">${pnl.opex.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-sm"><span>التزامات ضريبية (VAT 15%)</span><span className="font-black text-slate-800">${pnl.tax.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-sm text-red-600 border-t pt-4"><span>إجمالي المصروفات والضرائب</span><span className="font-black">${(pnl.opex + pnl.cogs + pnl.tax).toLocaleString()}</span></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProfitMatrix;
