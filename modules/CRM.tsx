
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Customer, Sale } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CRM: React.FC<{ activeCategory?: 'customers' | 'suppliers' }> = ({ activeCategory = 'customers' }) => {
  const { customers, suppliers, lang, t, sales, addCustomer, generateAIContent, addLog } = useApp();
  const [activeTab, setActiveTab] = useState<'directory' | 'funnel' | 'ai_insights'>('directory');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Customer | null>(null);
  const [newCust, setNewCust] = useState({ name: '', phone: '', email: '', limit: '' });
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const mode = activeCategory;
  const data = mode === 'customers' ? customers : suppliers;

  // Funnel Data (Mocked based on customer segments)
  const funnelData = [
      { stage: 'العملاء المحتملون (Leads)', count: 120, color: 'bg-indigo-400' },
      { stage: 'نشطون (Active)', count: 85, color: 'bg-indigo-500' },
      { stage: 'متكررون (Repeat)', count: 42, color: 'bg-indigo-600' },
      { stage: 'ولاء عالي (VIP)', count: 12, color: 'bg-indigo-700' },
  ];

  const handleAdd = () => {
    if(!newCust.name || !newCust.phone) return;
    const c: Customer = {
        id: `cust-${Date.now()}`,
        name: newCust.name,
        phone: newCust.phone,
        email: newCust.email,
        points: 0,
        segment: 'New',
        balance: 0,
        creditLimit: parseFloat(newCust.limit) || 0,
        creditScore: 100
    };
    addCustomer(c);
    setShowAdd(false);
    setNewCust({ name: '', phone: '', email: '', limit: '' });
    addLog(`تمت إضافة عميل جديد: ${c.name}`, 'success', 'CRM');
  };

  const generateCustomerInsight = async (customer: Customer) => {
      setIsAnalyzing(true);
      const customerSales = sales.filter(s => s.customerId === customer.id);
      const totalSpent = customerSales.reduce((a, b) => a + b.total, 0);
      const purchaseCount = customerSales.length;
      
      const prompt = `
        Analyze this customer profile for a retailer:
        Name: ${customer.name}
        Total Spent: ${totalSpent}
        Orders Count: ${purchaseCount}
        Current Debt: ${customer.balance}
        Credit Limit: ${customer.creditLimit}
        
        Provide a short strategic insight (2 sentences) in Arabic. 
        Focus on: Upselling potential, Churn risk, or Credit risk.
      `;

      try {
        const result = await generateAIContent(prompt, 'text');
        setAiInsight(result);
      } catch (e) {
        setAiInsight("تعذر إجراء التحليل الذكي حالياً.");
      }
      setIsAnalyzing(false);
  };

  const getCustomerHistoryChart = (customerId: string) => {
      const history = sales
        .filter(s => s.customerId === customerId)
        .map(s => ({ date: new Date(s.date).toLocaleDateString(), amount: s.total }))
        .slice(-10); // Last 10 purchases
      return history;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            {mode === 'customers' ? 'مركز ولاء العملاء (CRM)' : 'سجل الموردين المعتمدين'}
            </h2>
            <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Customer 360° View & Relationship Intelligence</p>
        </div>
        <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50">
            <button onClick={() => setActiveTab('directory')} className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'directory' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>الدليل</button>
            <button onClick={() => setActiveTab('funnel')} className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'funnel' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>قمع البيع 🎯</button>
        </div>
      </div>

      {activeTab === 'directory' && (
          <div className="bg-white p-8 rounded-[50px] shadow-2xl border border-gray-100" dir="rtl">
            <div className="flex justify-between items-center mb-10 gap-6">
                <div className="flex-1 relative">
                <input type="text" placeholder={`بحث سريع (الاسم، الجوال)...`} className="w-full bg-gray-50 border border-gray-100 px-8 py-4 rounded-2xl outline-none font-bold shadow-inner focus:bg-white transition-all" />
                <div className="absolute left-6 top-4 opacity-20">🔍</div>
                </div>
                <button onClick={() => setShowAdd(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2"><span>+</span> إضافة عميل</button>
            </div>

            <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/30">
                <table className="w-full text-right text-xs">
                <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                    <tr>
                        <th className="px-10 py-7">الاسم</th>
                        <th className="px-10 py-7">التصنيف</th>
                        <th className="px-10 py-7 text-center">الرصيد / النقاط</th>
                        <th className="px-10 py-7 text-center">إجمالي التعاملات</th>
                        <th className="px-10 py-7 text-center">الخطر (Churn)</th>
                        <th className="px-10 py-7 text-center">الملف</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                    {data.map((item: any, i) => (
                        <tr key={item.id} className="hover:bg-white transition-all group cursor-pointer" onClick={() => { setSelectedProfile(item); setAiInsight(''); }}>
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-md ${item.balance > 0 ? 'bg-orange-500' : 'bg-blue-600'}`}>
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-slate-800">{item.name}</p>
                                    <p className="text-[9px] font-mono text-gray-400">{item.phone}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.segment === 'VIP' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                {item.segment || 'Regular'}
                            </span>
                        </td>
                        <td className={`px-10 py-6 text-center font-black ${item.balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                            {mode === 'customers' ? (
                                <div className="flex flex-col">
                                    <span>{item.points} pts</span>
                                    {item.balance > 0 && <span className="text-[8px] text-red-500">مدين: ${item.balance}</span>}
                                </div>
                            ) : `$${item.balance.toLocaleString()}`}
                        </td>
                        <td className="px-10 py-6 text-center font-black text-blue-600">
                            ${(item.totalSpent || sales.filter((s: Sale) => s.customerId === item.id).reduce((a:number,b:Sale)=>a+b.total,0)).toLocaleString()}
                        </td>
                        <td className="px-10 py-6 text-center">
                            <div className="flex items-center justify-center">
                                <div className={`w-3 h-3 rounded-full ${Math.random() > 0.8 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                            <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center">➜</button>
                        </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
      )}

      {activeTab === 'funnel' && (
          <div className="bg-white p-16 rounded-[70px] shadow-3xl border border-gray-100 animate-in zoom-in-95 duration-500 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
              <h3 className="text-3xl font-black text-slate-800 mb-14 text-center tracking-tighter">قمع تحويل العملاء (Smart Funnel)</h3>
              
              <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto relative z-10">
                  {funnelData.map((stage, i) => (
                      <div key={i} className="flex items-center w-full gap-8">
                          <div className="w-32 text-left font-black text-[10px] text-gray-400 uppercase tracking-widest">{stage.stage}</div>
                          <div className={`flex-1 ${stage.color} h-20 rounded-[2.5rem] shadow-xl flex items-center justify-center text-white font-black text-2xl relative group transition-all hover:scale-[1.02]`}
                               style={{ width: `${100 - (i * 15)}%`, margin: '0 auto' }}>
                              {stage.count}
                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"></div>
                              <span className="absolute -left-12 text-[10px] font-black text-indigo-300">{(stage.count / 120 * 100).toFixed(0)}%</span>
                          </div>
                      </div>
                  ))}
              </div>
              
              <div className="mt-20 p-10 bg-indigo-50 rounded-[40px] border border-indigo-100 flex justify-between items-center">
                  <div>
                      <h4 className="text-xl font-black text-indigo-900">تحليل ذكاء الأعمال (Oracle Insight)</h4>
                      <p className="text-sm font-medium text-indigo-700 mt-2 max-w-lg leading-relaxed">
                          "نلاحظ انخفاضاً بنسبة 12% في التحول من 'نشط' إلى 'متكرر'. ننصح بإطلاق حملة إعادة استهداف مخصصة لمنتجات الأطراف خلال الـ 48 ساعة القادمة."
                      </p>
                  </div>
                  <button className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">بدء حملة Re-Targeting</button>
              </div>
          </div>
      )}

      {selectedProfile && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-6xl p-10 rounded-[60px] shadow-3xl border-white relative max-h-[95vh] overflow-y-auto custom-scrollbar" dir="rtl">
              
              {/* Profile Header */}
              <div className="flex justify-between items-start mb-10 pb-8 border-b border-white/20">
                 <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-5xl font-black text-white shadow-2xl">
                        {selectedProfile.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{selectedProfile.name}</h3>
                       <div className="flex gap-3 mt-3">
                           <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">{selectedProfile.segment}</span>
                           <span className="bg-white border border-gray-200 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">{selectedProfile.email}</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedProfile(null)} className="p-4 bg-slate-100 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all font-bold">✕</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 
                 {/* Left Column: Stats & AI */}
                 <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -ml-10 -mt-10"></div>
                        <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-2">رصيد المحفظة / المديونية</p>
                        <h4 className="text-4xl font-black mb-4">${selectedProfile.balance.toLocaleString()}</h4>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-red-500" style={{width: `${Math.min((selectedProfile.balance / selectedProfile.creditLimit)*100, 100)}%`}}></div>
                        </div>
                        <p className="text-[9px] text-right font-bold opacity-60">الحد الائتماني: ${selectedProfile.creditLimit.toLocaleString()}</p>
                    </div>

                    <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-black text-indigo-900">تحليل الذكاء الاصطناعي</h4>
                            <button 
                                onClick={() => generateCustomerInsight(selectedProfile)}
                                disabled={isAnalyzing}
                                className="bg-white text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-sm hover:scale-105 transition-transform"
                            >
                                {isAnalyzing ? 'جاري التحليل...' : '✨ تحليل'}
                            </button>
                        </div>
                        <p className="text-xs font-bold text-indigo-700 leading-relaxed min-h-[60px]">
                            {aiInsight || "اضغط على زر التحليل للحصول على رؤى استراتيجية حول سلوك العميل وفرص البيع المقترحة."}
                        </p>
                    </div>
                 </div>

                 {/* Right Column: History & Charts */}
                 <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[40px] shadow-lg border border-gray-50 h-[300px]">
                        <h4 className="text-sm font-black text-slate-800 mb-4">نشاط الشراء (آخر 10 عمليات)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getCustomerHistoryChart(selectedProfile.id)}>
                                <defs>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showAdd && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
            <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
               <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">إضافة عميل</h3>
               <div className="space-y-6">
                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الاسم الكامل</label>
                     <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newCust.name} onChange={e=>setNewCust({...newCust, name: e.target.value})} />
                  </div>
                  <div className="flex gap-4 pt-6">
                     <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                     <button onClick={handleAdd} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">حفظ الملف</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default CRM;
