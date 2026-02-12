
import React from 'react';
import { useApp } from '../AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const RevenueIntelligence: React.FC = () => {
  const { lang, sales, products } = useApp();

  const channelData = [
    { name: 'POS / Direct', value: 65, color: '#2563eb' },
    { name: 'E-Commerce', value: 25, color: '#8b5cf6' },
    { name: 'Wholesale B2B', value: 10, color: '#f59e0b' }
  ];

  const productMarginData = products.slice(0, 5).map(p => ({
    name: p.name_ar,
    margin: ((p.price - p.cost) / p.price * 100).toFixed(1)
  }));

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20" dir="rtl">
      <div className="bg-white p-12 rounded-[70px] shadow-3xl border border-gray-100 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
         <h2 className="text-5xl font-black text-slate-800 tracking-tighter">تحليلات الإيرادات والربحية</h2>
         <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs mt-4">Multi-Channel Profit Streams & Dynamic Product Performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 glass p-12 rounded-[60px] shadow-2xl border border-white bg-white/40">
            <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
               <div className="w-2.5 h-8 bg-blue-600 rounded-full"></div>
               هوامش ربح المنتجات (Top Performers)
            </h3>
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productMarginData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={150} tick={{fontSize: 12, fontWeight: 'bold'}} />
                     <Tooltip />
                     <Bar dataKey="margin" radius={[0, 15, 15, 0]} barSize={40} fill="#2563eb">
                        {productMarginData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={parseInt(entry.margin) > 30 ? '#10b981' : '#2563eb'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="lg:col-span-1 glass p-10 rounded-[60px] shadow-xl border-white bg-white/40 flex flex-col items-center">
            <h3 className="text-xl font-black text-slate-800 mb-10 self-start">توزيع الإيرادات حسب القناة</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={channelData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={10} dataKey="value">
                        {channelData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-full mt-10">
               {channelData.map(d => (
                  <div key={d.name} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-white">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase">{d.name}</span>
                     </div>
                     <span className="font-black text-slate-800">{d.value}%</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="p-12 bg-slate-900 rounded-[60px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 p-10 opacity-10 text-8xl font-black">ROI</div>
            <h4 className="text-xl font-black mb-8">العائد على الاستثمار الإعلاني (ROAS)</h4>
            <div className="flex items-end gap-6">
               <h3 className="text-7xl font-black text-emerald-400 tracking-tighter">4.8x</h3>
               <p className="text-[10px] font-bold opacity-60 mb-3 uppercase tracking-widest">معدل تحويل مباشر من الحملات</p>
            </div>
            <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 italic text-sm font-bold text-gray-300">
               "الحملة الأخيرة على واتساب حققت 12 ألف دولار إيرادات من تكلفة إعلانية لا تتجاوز 250 دولار."
            </div>
         </div>

         <div className="p-12 bg-blue-600 rounded-[60px] text-white shadow-2xl relative overflow-hidden">
            <h4 className="text-xl font-black mb-8">متوسط قيمة السلة (AOV)</h4>
            <div className="flex items-end gap-6">
               <h3 className="text-7xl font-black tracking-tighter">$145</h3>
               <p className="text-[10px] font-bold opacity-60 mb-3 uppercase tracking-widest">تحسن بنسبة 18% بفضل ميزة التجميع الذكي</p>
            </div>
            <button className="mt-10 px-10 py-5 bg-white text-blue-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-900 hover:text-white transition-all">تفعيل عروض الـ Cross-sell</button>
         </div>
      </div>
    </div>
  );
};

export default RevenueIntelligence;
