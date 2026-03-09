import React from 'react';
import { useApp } from '../AppContext';
import { motion } from 'framer-motion';
import { TrendingUp, Package, CreditCard, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', sales: 4000, costs: 2400 },
  { name: 'Feb', sales: 3000, costs: 1398 },
  { name: 'Mar', sales: 2000, costs: 9800 },
  { name: 'Apr', sales: 2780, costs: 3908 },
  { name: 'May', sales: 1890, costs: 4800 },
];

const StatCard = ({ title, value, sub, icon: Icon, trend, color }: any) => (
  <div className="glass-card p-8 rounded-[2rem] flex flex-col justify-between h-full relative overflow-hidden group">
     <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-${color}-500/20 transition-all`}></div>
     <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-400`}>
           <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
             {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
             {Math.abs(trend)}%
          </div>
        )}
     </div>
     <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
        <p className="text-xs text-slate-400 font-medium mt-2">{sub}</p>
     </div>
  </div>
);

const Dashboard = () => {
  const { sales, products } = useApp();
  const totalRev = sales.reduce((a, b) => a + b.totalAmount, 0);

  return (
    <div className="space-y-10 pb-20">
       <div className="flex items-end justify-between">
          <div>
             <h1 className="text-5xl font-black text-white tracking-tighter">مرحباً بك، تايتان</h1>
             <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs px-1">نظرة عامة على أداء مؤسستك اليوم</p>
          </div>
          <div className="flex gap-4">
             <button className="px-8 py-3 glass-card rounded-2xl text-xs font-black text-white hover:bg-blue-600/20 transition-all border border-blue-500/20">تصدير التقرير</button>
             <button className="px-8 py-3 bg-blue-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-blue-500/20 hover:scale-105 transition-all">تحديث البيانات</button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="إجمالي المبيعات" value={`$${totalRev.toLocaleString()}`} sub="إيرادات الفترة الحالية" icon={TrendingUp} trend={12.5} color="blue" />
          <StatCard title="الأصناف النشطة" value={products.length} sub="متوفرة في المخزون" icon={Package} color="amber" />
          <StatCard title="العملاء الجدد" value="482" sub="نمو بنسبة 4% هذا الشهر" icon={Users} trend={-2.1} color="purple" />
          <StatCard title="متوسط السلة" value="$245" sub="تحسن في معدل الشراء" icon={CreditCard} trend={8.4} color="emerald" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card p-10 rounded-[3rem]">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                   <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                   تحليل التدفق النقدي
                </h3>
             </div>
             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data}>
                      <defs>
                         <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis hide />
                      <Tooltip contentStyle={{background: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}} />
                      <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="glass-card p-10 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-900 border-none text-white relative overflow-hidden flex flex-col justify-between">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32"></div>
             <div>
                <h3 className="text-2xl font-black tracking-tighter mb-4">ذكاء التنبؤ (Oracle AI)</h3>
                <p className="text-sm font-medium leading-relaxed opacity-80">بناءً على مبيعات الشهر الماضي، نتوقع زيادة بنسبة 15% في الطلب على "الإلكترونيات" الأسبوع القادم. ننصح برفع المخزون لمنتج آيفون.</p>
             </div>
             <button className="w-full py-4 bg-white/10 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-xl">تحليل كامل بالتفكير العميق</button>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;