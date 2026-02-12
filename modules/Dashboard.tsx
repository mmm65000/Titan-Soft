
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { 
    user, setActiveTab, sales, notifications, products, 
    fleet, productionOrders, projects, calculateProjectedPnL,
    wholesaleOrders, activeBranchId, t, isOnline, offlineSales, syncOfflineData,
    askOracle, expenses, activityLogs
  } = useApp();

  const [aiBriefing, setAiBriefing] = useState<string>('جاري تحليل بيانات المؤسسة لإعداد الموجز اليومي...');
  const [marketPulse, setMarketPulse] = useState<string>('جاري جلب أخبار السوق الحية...');
  const [loadingBrief, setLoadingBrief] = useState(false);

  const pnl = calculateProjectedPnL();
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const activeFleet = fleet.filter(v => v.status !== 'maintenance').length;
  const activeProduction = productionOrders.filter(o => o.status === 'in_progress').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pendingWholesale = wholesaleOrders.filter(o => o.status === 'pending_approval').length;

  // Chart Data: Last 7 Days Revenue vs Cost
  const chartData = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
          name: d.toLocaleDateString('en-US', {weekday: 'short'}),
          revenue: sales.filter(s => s.date.startsWith(dateStr)).reduce((a,b)=>a+b.total, 0),
          cost: expenses.filter(e => e.date.startsWith(dateStr)).reduce((a,b)=>a+b.amount, 0)
      };
  });

  useEffect(() => {
      const generateBrief = async () => {
          setLoadingBrief(true);
          
          // Internal Ops Briefing
          const internalPrompt = `
            Act as a COO (Chief Operating Officer). 
            Generate a concise "Morning Briefing" (3 bullet points max) in Arabic based on:
            - Net Profit today: ${pnl.netProfit}
            - Critical Stock: ${lowStockCount} items
            - Active Production Orders: ${activeProduction}
            - Fleet Active: ${activeFleet} vehicles
            - Pending Wholesale Orders: ${pendingWholesale}
            
            Focus on actionable priorities for the day.
          `;
          
          // External Market Pulse (using Google Search Grounding implicitly via askOracle)
          const externalPrompt = `
            Using Google Search, find the latest 3 key trends or news affecting the Retail & Supply Chain sector in Saudi Arabia or GCC for today/this week.
            Summarize them in Arabic as short bullet points (max 20 words each).
          `;

          try {
            // Run sequentially to avoid Rate Limiting (429) errors on free tier
            const internalResult = await askOracle(internalPrompt);
            setAiBriefing(internalResult);
            
            // Add a small delay to be gentle on the rate limiter
            await new Promise(r => setTimeout(r, 2000));

            const externalResult = await askOracle(externalPrompt);
            setMarketPulse(externalResult);
          } catch (e) {
            setAiBriefing("النظام يعمل بكفاءة. لا توجد تنبيهات حرجة.");
            setMarketPulse("تعذر الاتصال بخدمة أخبار السوق.");
          }
          setLoadingBrief(false);
      };
      
      const timer = setTimeout(generateBrief, 1000);
      return () => clearTimeout(timer);
  }, []);

  const quickActions = [
    { label: 'فاتورة جديدة', icon: '🛒', action: 'pos', color: 'blue' },
    { label: 'أمر شراء', icon: '📦', action: 'purchases', color: 'emerald' },
    { label: 'مشروع جديد', icon: '🚀', action: 'projects', color: 'purple' },
    { label: 'شحنة سريعة', icon: '🚚', action: 'logistics', color: 'orange' },
  ];

  return (
    <div className="flex flex-col min-h-full font-tajawal max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700" dir="rtl">
      
      {/* Offline Alert Bar */}
      {!isOnline && (
          <div className="bg-red-500 text-white p-4 rounded-xl mb-6 text-center font-bold shadow-lg animate-pulse">
              ⚠️ أنت تعمل في وضع عدم الاتصال (Offline). سيتم حفظ العمليات محلياً.
          </div>
      )}
      {isOnline && offlineSales.length > 0 && (
          <div className="bg-orange-500 text-white p-4 rounded-xl mb-6 flex justify-between items-center shadow-lg">
              <span className="font-bold">لديك {offlineSales.length} عمليات غير متزامنة.</span>
              <button onClick={syncOfflineData} className="bg-white text-orange-600 px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-orange-50">مزامنة الآن ⚡</button>
          </div>
      )}

      {/* AI Executive Briefing */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden mb-10 border border-white/10">
         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full -ml-20 -mt-20 blur-3xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
             <div className="flex-1">
                 <div className="flex items-center gap-3 mb-4">
                     <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <span>🤖</span> Oracle AI Brief
                     </span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date().toLocaleDateString('ar-SA', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</span>
                 </div>
                 <div className="min-h-[80px]">
                    {loadingBrief ? (
                        <div className="flex gap-2 items-center text-blue-200 text-xs font-bold animate-pulse">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span> جاري تحليل البيانات...
                        </div>
                    ) : (
                        <p className="text-sm font-medium leading-relaxed text-blue-50 whitespace-pre-line">
                            {aiBriefing}
                        </p>
                    )}
                 </div>
             </div>
             
             {/* Market Pulse Section */}
             <div className="flex-1 border-r border-white/10 pr-8 hidden md:block">
                 <div className="flex items-center gap-2 mb-4">
                     <span className="text-emerald-400 text-lg">⚡</span>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نبض السوق (Live Market)</span>
                 </div>
                 <div className="text-xs font-medium text-emerald-50 leading-relaxed whitespace-pre-line">
                    {loadingBrief ? <span className="opacity-50">جاري الاتصال بمحركات البحث...</span> : marketPulse}
                 </div>
             </div>

             <div className="flex flex-col justify-end items-end min-w-[200px]">
                 <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">صافي الربح المتوقع (اليوم)</p>
                 <h3 className="text-4xl font-black text-emerald-400 tracking-tighter">${pnl.netProfit.toLocaleString()}</h3>
                 <span className="text-[9px] font-bold text-white/40 mt-1">هامش ربح {pnl.margin.toFixed(1)}%</span>
             </div>
         </div>
      </div>

      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tighter">مركز العمليات الموحد</h1>
           <p className="text-gray-400 font-bold mt-1 text-sm">{user?.businessName} • {user?.role.toUpperCase()} ACCESS</p>
        </div>
        
        <div className="flex gap-3">
           <div className="glass px-6 py-3 rounded-2xl border border-white flex flex-col items-end">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">المستخدمين النشطين</span>
              <span className="text-lg font-black text-slate-800">4 / 12</span>
           </div>
           <button onClick={() => setActiveTab('settings')} className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 font-black text-xs hover:bg-gray-50 transition-all">
              الإعدادات ⚙️
           </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-10">
         
         {/* Main Revenue Chart (Large) */}
         <div className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                  <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                  التدفق المالي (إيرادات vs مصروفات)
               </h3>
               <div className="flex gap-2">
                   <span className="w-3 h-3 rounded-full bg-blue-600"></span> <span className="text-[10px] font-bold">دخل</span>
                   <span className="w-3 h-3 rounded-full bg-red-400 ml-2"></span> <span className="text-[10px] font-bold">صرف</span>
               </div>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f87171" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                     <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                     <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fill="url(#colorRev)" />
                     <Area type="monotone" dataKey="cost" stroke="#f87171" strokeWidth={3} fill="url(#colorCost)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Quick Stats (Vertical Stack) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-indigo-600 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div>
                <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">طلبات الجملة B2B</p>
                    <span className="bg-white/20 px-2 py-1 rounded text-[9px] font-bold">{pendingWholesale} معلق</span>
                </div>
                <h3 className="text-4xl font-black">{wholesaleOrders.length} طلب</h3>
            </div>
            <button onClick={() => setActiveTab('wholesale_hub')} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-opacity-90 transition-all">إدارة العقود</button>
         </div>

         <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المخزون الحرج</p>
                <span className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-lg">📉</span>
             </div>
             <h3 className="text-4xl font-black text-slate-800 mb-2">{lowStockCount}</h3>
             <p className="text-[10px] font-bold text-red-500">أصناف تحت حد الطلب</p>
             <button onClick={() => setActiveTab('stock_analysis')} className="mt-6 text-[10px] font-black text-blue-600 uppercase hover:underline">عرض النواقص ←</button>
         </div>

         {/* Quick Actions Row */}
         <div className="col-span-1 md:col-span-4 lg:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(action => (
               <button 
                  key={action.label}
                  onClick={() => setActiveTab(action.action)}
                  className="bg-white p-4 rounded-[25px] border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4 group"
               >
                  <div className={`w-10 h-10 rounded-xl bg-${action.color}-50 flex items-center justify-center text-xl group-hover:bg-${action.color}-100 transition-colors`}>
                     {action.icon}
                  </div>
                  <span className="font-black text-sm text-slate-700">{action.label}</span>
               </button>
            ))}
         </div>

         {/* Live Operations Feed */}
         <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-[40px] p-8 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-lg text-slate-800">نشاط النظام (Live)</h3>
               <button onClick={()=>setActiveTab('settings')} className="text-[10px] font-black text-blue-600 uppercase">السجل الكامل</button>
            </div>
            <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
               {activityLogs.slice(0, 6).map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-right-2">
                     <div className={`w-2 h-8 rounded-full ${
                        log.type === 'success' ? 'bg-emerald-500' : log.type === 'warning' ? 'bg-orange-500' : log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                     }`}></div>
                     <div className="flex-1">
                        <h4 className="text-xs font-black text-slate-800 truncate">{log.action}</h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{log.user} • {new Date(log.timestamp).toLocaleTimeString()}</p>
                     </div>
                  </div>
               ))}
               {activityLogs.length === 0 && <p className="text-center opacity-30 font-black text-xs py-10">No recent activity</p>}
            </div>
         </div>

         <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-slate-50/50 rounded-[40px] p-8 shadow-lg border border-slate-100">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-lg text-slate-700 flex items-center gap-2">
                  <span>🏭</span> الإنتاج واللوجستيات
               </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <p className="text-2xl font-black text-slate-800">{activeProduction}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">أوامر تصنيع</p>
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <p className="text-2xl font-black text-slate-800">{activeFleet}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">مركبات نشطة</p>
                </div>
            </div>
            <button onClick={() => setActiveTab('manufacturing')} className="w-full mt-4 py-3 bg-white border border-gray-200 text-slate-600 rounded-2xl font-black text-[10px] hover:bg-slate-800 hover:text-white transition-all uppercase">
                مراقبة خطوط الإنتاج
            </button>
         </div>

      </div>
    </div>
  );
};

export default Dashboard;
