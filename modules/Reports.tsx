
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie, ComposedChart, Line, Legend } from 'recharts';

const Reports: React.FC<{ activeReportTab?: string }> = ({ activeReportTab }) => {
  const { sales, taxRecords, calculateProjectedPnL, products, onlineOrders, wholesaleOrders, expenses, askOracle } = useApp();
  const [reportSubTab, setReportSubTab] = useState(activeReportTab?.replace('reports-', '') || 'sales');
  
  // AI Analyst State
  const [aiQuery, setAiQuery] = useState('');
  const [aiHistory, setAiHistory] = useState<{q: string, a: string}[]>([]);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pnl = calculateProjectedPnL();
  const totalVAT_In = taxRecords.filter(r=>r.type==='input').reduce((a,b)=>a+b.taxAmount, 0);
  const totalVAT_Out = taxRecords.filter(r=>r.type==='output').reduce((a,b)=>a+b.taxAmount, 0);

  // --- Dynamic Data Calculations ---

  // 1. Sales by Channel
  const posSales = sales.filter(s => !s.source || s.source === 'pos').reduce((a, b) => a + b.total, 0);
  const onlineSales = onlineOrders.filter(o => o.status === 'delivered').reduce((a, b) => a + b.total, 0);
  const wholesaleSales = wholesaleOrders.filter(o => o.status === 'approved').reduce((a, b) => a + b.total, 0);

  const salesByChannel = [
    { name: 'نقاط البيع (POS)', value: posSales, color: '#2563eb' },
    { name: 'المتجر الإلكتروني', value: onlineSales, color: '#8b5cf6' },
    { name: 'مبيعات الجملة', value: wholesaleSales, color: '#f59e0b' }
  ];

  const totalRevenue = posSales + onlineSales + wholesaleSales;
  const totalOrdersCount = sales.length + onlineOrders.length + wholesaleOrders.length;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // 2. Inventory Valuation
  const inventoryCost = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
  const inventoryRetail = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const potentialProfit = inventoryRetail - inventoryCost;

  // 3. Last 7 Days Trend
  const getLast7DaysData = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          
          const dailySales = sales.filter(s => s.date.startsWith(dateStr)).reduce((a, b) => a + b.total, 0)
                           + onlineOrders.filter(o => o.date.startsWith(dateStr) && o.status==='delivered').reduce((a, b) => a + b.total, 0);
          
          const dailyExpense = expenses.filter(e => e.date.startsWith(dateStr)).reduce((a, b) => a + b.amount, 0);

          days.push({ 
              name: d.toLocaleDateString('en-US', {weekday: 'short'}), 
              revenue: dailySales,
              expense: dailyExpense,
              profit: dailySales - dailyExpense 
          });
      }
      return days;
  };
  const trendData = getLast7DaysData();
  
  // 4. Top Selling Products (Mock calculation from Sales items)
  const topProducts = products.map(p => {
      const soldQty = sales.reduce((acc, sale) => {
          const item = sale.items.find(i => i.productId === p.id);
          return acc + (item ? item.quantity : 0);
      }, 0);
      return { name: p.name_ar, sold: soldQty };
  }).sort((a,b) => b.sold - a.sold).slice(0, 5);

  // AI Handler
  const handleAiAsk = async () => {
      if(!aiQuery.trim()) return;
      const q = aiQuery;
      setAiQuery('');
      setAiHistory(prev => [...prev, { q, a: 'جاري تحليل البيانات...' }]);
      setIsAnalysing(true);

      const context = `
      Data Summary:
      Total Revenue: ${totalRevenue}
      POS Sales: ${posSales}
      Online Sales: ${onlineSales}
      Wholesale Sales: ${wholesaleSales}
      Inventory Value (Cost): ${inventoryCost}
      Inventory Value (Retail): ${inventoryRetail}
      Net Profit Margin: ${pnl.margin}%
      Top Selling Product: ${topProducts[0]?.name || 'N/A'} (${topProducts[0]?.sold || 0} units)
      `;

      const prompt = `Act as a senior data analyst.
      User Question: "${q}"
      Context: ${context}
      
      Provide a concise, insightful answer in Arabic. Use numbers to back up your claims.`;

      const response = await askOracle(prompt);
      
      setAiHistory(prev => prev.map(item => item.q === q ? { q, a: response } : item));
      setIsAnalysing(false);
  };

  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [aiHistory]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-center mb-12">
        <div className="flex glass rounded-[3rem] p-2 shadow-2xl border-white/50 bg-white/40 overflow-x-auto">
          {[
            { id: 'sales', label: 'تحليل المبيعات 📈' },
            { id: 'inventory', label: 'أداء المخزون 📦' },
            { id: 'tax', label: 'الضريبة والامتثال 🧾' },
            { id: 'ai', label: 'المحلل الذكي 🤖' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setReportSubTab(tab.id)}
              className={`px-12 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${reportSubTab === tab.id ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {reportSubTab === 'sales' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-8">
           {/* KPI Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'إجمالي الإيرادات', value: `$${totalRevenue.toLocaleString()}`, color: 'blue', icon: '💰' },
                { label: 'متوسط قيمة السلة', value: `$${averageOrderValue.toFixed(1)}`, color: 'emerald', icon: '🛍️' },
                { label: 'عدد الطلبات', value: totalOrdersCount, color: 'indigo', icon: '🔢' },
                { label: 'هامش الربح الصافي', value: `${pnl.margin.toFixed(1)}%`, color: 'orange', icon: '📊' }
              ].map(s => (
                <div key={s.label} className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 group hover:-translate-y-2 transition-all relative overflow-hidden">
                   <div className={`absolute top-0 left-0 w-1.5 h-full bg-${s.color}-500`}></div>
                   <div className="flex justify-between items-start">
                       <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
                           <h3 className={`text-3xl font-black text-${s.color}-600 tracking-tighter`}>{s.value}</h3>
                       </div>
                       <span className="text-2xl opacity-20 grayscale group-hover:grayscale-0 transition-all">{s.icon}</span>
                   </div>
                </div>
              ))}
           </div>
           
           {/* Main Trend Chart */}
           <div className="bg-white p-12 rounded-[60px] shadow-3xl border border-gray-100 min-h-[500px] relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-4">
                    <div className="w-2.5 h-8 bg-blue-600 rounded-full"></div>
                    الأداء المالي (إيرادات vs مصروفات)
                  </h3>
                  <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><span className="w-3 h-3 rounded-full bg-blue-600"></span>إيرادات</div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><span className="w-3 h-3 rounded-full bg-red-400"></span>مصروفات</div>
                  </div>
              </div>
              <div className="h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#94a3b8'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#94a3b8'}} />
                       <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                       <Area type="monotone" dataKey="revenue" fill="#eff6ff" stroke="#3b82f6" strokeWidth={3} />
                       <Bar dataKey="expense" barSize={20} fill="#f87171" radius={[10, 10, 0, 0]} />
                       <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{r:4, fill:'#10b981'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Channel Distribution */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass p-10 rounded-[50px] shadow-xl border border-white bg-white/40">
                    <h4 className="text-lg font-black text-slate-800 mb-8">قنوات البيع الأكثر دخلاً</h4>
                    <div className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={salesByChannel} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {salesByChannel.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass p-10 rounded-[50px] shadow-xl border border-white bg-slate-900 text-white">
                    <h4 className="text-lg font-black mb-8">المنتجات الأكثر مبيعاً (Top 5)</h4>
                    <div className="space-y-6">
                        {topProducts.map((p, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-xl font-black opacity-30 w-6">0{i+1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold">{p.name}</span>
                                        <span className="text-xs font-black text-emerald-400">{p.sold} وحدة</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{width: `${(p.sold / (topProducts[0]?.sold || 1)) * 100}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
           </div>
        </div>
      )}

      {reportSubTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-left-8">
              <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100">
                  <h3 className="text-xl font-black text-slate-800 mb-8">تقييم المخزون المالي</h3>
                  <div className="flex gap-8 mb-10">
                      <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">التكلفة الإجمالية</p>
                          <h4 className="text-3xl font-black text-slate-800">${inventoryCost.toLocaleString()}</h4>
                      </div>
                      <div className="border-r border-gray-100 pr-8">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">القيمة السوقية (بيع)</p>
                          <h4 className="text-3xl font-black text-blue-600">${inventoryRetail.toLocaleString()}</h4>
                      </div>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex justify-between items-center">
                      <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase">الأرباح الكامنة المتوقعة</p>
                          <h4 className="text-2xl font-black text-emerald-800">+${potentialProfit.toLocaleString()}</h4>
                      </div>
                      <span className="text-3xl">💹</span>
                  </div>
              </div>

              <div className="glass p-12 rounded-[60px] shadow-2xl border border-white bg-white/40">
                  <h3 className="text-xl font-black text-slate-800 mb-8">حالة المخزون</h3>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-red-50 rounded-3xl border border-red-100 text-center">
                          <p className="text-[10px] font-black text-red-500 uppercase mb-2">منخفض جداً</p>
                          <h4 className="text-4xl font-black text-red-600">{products.filter(p=>p.stock <= p.minStock).length}</h4>
                          <p className="text-[9px] font-bold text-red-400 mt-2">منتج</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">متوفر بكثرة</p>
                          <h4 className="text-4xl font-black text-slate-800">{products.filter(p=>p.stock > 50).length}</h4>
                          <p className="text-[9px] font-bold text-slate-400 mt-2">منتج</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {reportSubTab === 'tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-left-8">
           <div className="lg:col-span-2 bg-white p-14 rounded-[60px] shadow-3xl border border-gray-100">
              <h3 className="text-2xl font-black text-slate-800 mb-12 flex items-center gap-4"><div className="w-2.5 h-8 bg-orange-500 rounded-full"></div> ملخص ضريبة القيمة المضافة (VAT)</h3>
              <div className="space-y-8">
                 <div className="flex justify-between items-center p-10 bg-blue-50/50 rounded-[45px] border border-blue-100">
                    <div>
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">إجمالي ضريبة المخرجات (مستحقة)</p>
                       <h4 className="text-5xl font-black text-slate-900 mt-3 tracking-tighter">${totalVAT_Out.toLocaleString()}</h4>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-2xl shadow-sm">📤</div>
                 </div>
                 <div className="flex justify-between items-center p-10 bg-orange-50/50 rounded-[45px] border border-orange-100">
                    <div>
                       <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">إجمالي ضريبة المدخلات (مستردة)</p>
                       <h4 className="text-5xl font-black text-slate-900 mt-3 tracking-tighter">${totalVAT_In.toLocaleString()}</h4>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-2xl shadow-sm">📥</div>
                 </div>
                 <div className="p-12 bg-slate-900 text-white rounded-[60px] shadow-3xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
                    <p className="text-[11px] font-black opacity-40 uppercase tracking-[0.4em]">صافي الضريبة واجبة السداد</p>
                    <h4 className="text-7xl font-black text-emerald-400 mt-6 tracking-tighter">${(totalVAT_Out - totalVAT_In).toLocaleString()}</h4>
                 </div>
              </div>
           </div>
        </div>
      )}

      {reportSubTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-[600px] animate-in slide-in-from-right-8">
              <div className="glass p-12 rounded-[60px] border border-white shadow-3xl bg-white/40 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                      <span className="text-3xl">🤖</span> المحلل الذكي (Oracle Analyst)
                  </h3>
                  
                  <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar mb-6">
                      {aiHistory.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                              <p className="text-4xl mb-4">💬</p>
                              <p className="font-black text-sm uppercase">اسأل عن بياناتك، مبيعاتك، أو توقعاتك...</p>
                          </div>
                      )}
                      {aiHistory.map((item, i) => (
                          <div key={i} className="space-y-4">
                              <div className="flex justify-end">
                                  <div className="bg-indigo-600 text-white px-6 py-3 rounded-[20px] rounded-tl-none text-xs font-bold max-w-[80%] shadow-lg">
                                      {item.q}
                                  </div>
                              </div>
                              <div className="flex justify-start">
                                  <div className="bg-white px-6 py-3 rounded-[20px] rounded-tr-none text-xs font-medium text-slate-700 max-w-[90%] shadow-sm border border-white leading-relaxed whitespace-pre-line">
                                      {item.a}
                                  </div>
                              </div>
                          </div>
                      ))}
                      {isAnalysing && (
                          <div className="flex justify-start">
                              <div className="bg-white px-6 py-4 rounded-[20px] rounded-tr-none shadow-sm flex gap-1">
                                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="relative">
                      <input 
                        type="text" 
                        placeholder="اكتب سؤالك هنا... (مثلاً: ما هو المنتج الأكثر ربحية؟)" 
                        className="w-full bg-white p-5 rounded-full pl-16 pr-6 outline-none font-bold shadow-xl border border-white focus:ring-4 ring-indigo-100 transition-all"
                        value={aiQuery}
                        onChange={e => setAiQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAiAsk()}
                        disabled={isAnalysing}
                      />
                      <button 
                        onClick={handleAiAsk}
                        className="absolute left-2 top-2 bottom-2 w-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                          ➜
                      </button>
                  </div>
              </div>

              <div className="glass p-12 rounded-[60px] border border-white shadow-2xl bg-indigo-900 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="relative z-10">
                      <h4 className="text-3xl font-black mb-4 tracking-tighter">رؤى استراتيجية</h4>
                      <p className="text-sm font-medium opacity-80 leading-relaxed max-w-md mx-auto">
                          يعتمد المحلل الذكي على بياناتك الحية من نقاط البيع، المخزون، والمصاريف لتقديم إجابات دقيقة وتوصيات لاتخاذ القرار.
                      </p>
                      <div className="mt-10 grid grid-cols-2 gap-4">
                          {['أفضل وقت للنشر؟', 'توقعات مبيعات الشهر القادم؟', 'تحليل ركود المخزون', 'توزيع العملاء جغرافياً'].map(s => (
                              <button key={s} onClick={() => { setAiQuery(s); handleAiAsk(); }} className="p-3 bg-white/10 rounded-xl text-[10px] font-bold hover:bg-white/20 transition-all border border-white/5">
                                  {s}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Reports;
