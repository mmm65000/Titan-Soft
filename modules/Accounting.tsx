
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const Accounting: React.FC<{ activeSubTab?: string }> = ({ activeSubTab }) => {
  const { safeBalance, ledger, lang, customers, suppliers, expenses, sales } = useApp();
  const [currentView, setCurrentView] = useState<'ledger' | 'statements' | 'chart'>('ledger');

  // Logic for Balance Sheet
  const totalRevenue = sales.reduce((a, b) => a + b.total, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const accountsReceivable = customers.reduce((a, b) => a + b.balance, 0);
  const accountsPayable = Math.abs(suppliers.reduce((a, b) => a + b.balance, 0));
  const netIncome = totalRevenue - totalExpenses;

  const assets = [
      { name: 'النقدية بالصندوق (Cash)', amount: safeBalance.cash },
      { name: 'رصيد البنك (Card/Bank)', amount: safeBalance.card },
      { name: 'ذمم مدينة (Accounts Receivable)', amount: accountsReceivable },
  ];

  const liabilities = [
      { name: 'ذمم دائنة (Accounts Payable)', amount: accountsPayable },
      { name: 'ضريبة مستحقة (VAT Payable)', amount: totalRevenue * 0.15 },
  ];

  const equity = [
      { name: 'رأس المال (Capital)', amount: 100000 },
      { name: 'الأرباح المحتجزة (Retained Earnings)', amount: netIncome },
  ];

  const totalAssets = assets.reduce((a, b) => a + b.amount, 0);
  const totalLiabEquity = liabilities.reduce((a, b) => a + b.amount, 0) + equity.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">الإدارة المالية والمحاسبية</h2>
            <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Double-Entry Ledger, Balance Sheets & Fiscal Integrity</p>
        </div>
        <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50 overflow-x-auto custom-scrollbar no-scrollbar">
          {[
            { id: 'ledger', label: 'دفتر الأستاذ' },
            { id: 'statements', label: 'التقارير الختامية 🧾' },
            { id: 'chart', label: 'شجرة الحسابات' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setCurrentView(tab.id as any)}
              className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${currentView === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {currentView === 'ledger' && (
          <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">إجمالي النقدية</p>
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter">${safeBalance.cash.toLocaleString()}</h3>
                <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{width: '75%'}}></div>
                </div>
                </div>
                <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">إجمالي الشبكة</p>
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter">${safeBalance.card.toLocaleString()}</h3>
                <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600" style={{width: '40%'}}></div>
                </div>
                </div>
                <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-emerald-500 text-white flex flex-col justify-between h-56">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">صافي الأرباح (تقديري)</p>
                <h3 className="text-4xl font-black tracking-tighter">${netIncome.toLocaleString()}</h3>
                <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-4 py-1 rounded-full w-fit">نمو +12%</span>
                </div>
                <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-slate-900 text-white flex flex-col justify-between h-56">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">مدفوعات الموردين القادمة</p>
                <h3 className="text-4xl font-black tracking-tighter">${accountsPayable.toLocaleString()}</h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400">تحتاج تسوية</span>
                </div>
            </div>

            <div className="bg-white rounded-[60px] shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                    <h3 className="text-2xl font-black text-slate-800">سجل العمليات المحاسبية التفصيلي</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">عرض كافة العمليات المدينة والدائنة للفترة الحالية</p>
                    </div>
                </div>
                <table className="w-full text-right">
                    <thead className="bg-white text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                    <tr>
                        <th className="px-10 py-7">التاريخ والوقت</th>
                        <th className="px-10 py-7">البيان / الوصف</th>
                        <th className="px-10 py-7 text-center">التصنيف</th>
                        <th className="px-10 py-7 text-center">مدين (+)</th>
                        <th className="px-10 py-7 text-center">دائن (-)</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-bold text-slate-700">
                    {ledger.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50/20 transition-all group">
                            <td className="px-10 py-6 text-[11px] text-gray-400">{new Date(row.date).toLocaleString()}</td>
                            <td className="px-10 py-6">{row.description}</td>
                            <td className="px-10 py-6 text-center"><span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase">{row.category}</span></td>
                            <td className="px-10 py-6 text-center text-emerald-600 font-black">{row.type === 'credit' ? `+${row.amount}` : '-'}</td>
                            <td className="px-10 py-6 text-center text-red-500 font-black">{row.type === 'debit' ? `-${row.amount}` : '-'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {currentView === 'statements' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in zoom-in-95 duration-500">
              <div className="bg-white p-16 rounded-[70px] shadow-3xl border border-gray-100">
                  <div className="flex justify-between items-center mb-12">
                      <h3 className="text-3xl font-black text-slate-800 tracking-tighter">قائمة المركز المالي (Balance Sheet)</h3>
                      <button className="p-4 glass rounded-3xl text-slate-400 hover:text-blue-600">📥 PDF</button>
                  </div>
                  
                  <div className="space-y-10">
                      {/* Assets Section */}
                      <div>
                          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6 border-b-2 border-blue-600 pb-2 inline-block">الأصول (Assets)</h4>
                          <div className="space-y-4">
                              {assets.map(a => (
                                  <div key={a.name} className="flex justify-between items-center text-sm font-bold text-slate-600 border-b border-gray-50 pb-3">
                                      <span>{a.name}</span>
                                      <span className="font-black text-slate-900">${a.amount.toLocaleString()}</span>
                                  </div>
                              ))}
                              <div className="flex justify-between items-center pt-4 font-black text-lg text-blue-600">
                                  <span>إجمالي الأصول</span>
                                  <span className="underline underline-offset-8 decoration-blue-100">${totalAssets.toLocaleString()}</span>
                              </div>
                          </div>
                      </div>

                      {/* Liabilities Section */}
                      <div>
                          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-6 border-b-2 border-red-500 pb-2 inline-block">الخصوم وحقوق الملكية</h4>
                          <div className="space-y-4">
                              {liabilities.map(l => (
                                  <div key={l.name} className="flex justify-between items-center text-sm font-bold text-slate-600 border-b border-gray-50 pb-3">
                                      <span>{l.name}</span>
                                      <span className="font-black text-slate-900">${l.amount.toLocaleString()}</span>
                                  </div>
                              ))}
                              {equity.map(e => (
                                  <div key={e.name} className="flex justify-between items-center text-sm font-bold text-slate-600 border-b border-gray-50 pb-3 italic">
                                      <span>{e.name}</span>
                                      <span className="font-black text-slate-900">${e.amount.toLocaleString()}</span>
                                  </div>
                              ))}
                              <div className="flex justify-between items-center pt-4 font-black text-lg text-slate-900">
                                  <span>الإجمالي</span>
                                  <span className="underline underline-offset-8 decoration-gray-100">${totalLiabEquity.toLocaleString()}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-slate-900 p-16 rounded-[70px] shadow-3xl text-white relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div>
                      <h3 className="text-3xl font-black tracking-tighter mb-4">الأرباح والخسائر (P&L)</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-14">Fiscal Performance Matrix</p>
                      
                      <div className="space-y-8">
                          <div className="flex justify-between items-end border-b border-white/10 pb-6">
                              <div>
                                  <p className="text-[10px] font-black opacity-40 uppercase mb-1">إجمالي الإيرادات</p>
                                  <h4 className="text-4xl font-black">${totalRevenue.toLocaleString()}</h4>
                              </div>
                              <span className="text-emerald-400 text-xs font-bold">+15.2%</span>
                          </div>
                          <div className="flex justify-between items-end border-b border-white/10 pb-6">
                              <div>
                                  <p className="text-[10px] font-black opacity-40 uppercase mb-1">المصروفات التشغيلية</p>
                                  <h4 className="text-4xl font-black">${totalExpenses.toLocaleString()}</h4>
                              </div>
                              <span className="text-red-400 text-xs font-bold">-4.1%</span>
                          </div>
                          <div className="pt-10">
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">صافي الربح الصافي</p>
                              <h4 className="text-7xl font-black tracking-tighter text-emerald-400">${netIncome.toLocaleString()}</h4>
                          </div>
                      </div>
                  </div>
                  <button className="w-full py-6 bg-white/10 border border-white/10 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/20 transition-all mt-20">إغلاق السنة المالية (Year-End Close)</button>
              </div>
          </div>
      )}

      {currentView === 'chart' && (
          <div className="bg-white p-12 rounded-[60px] shadow-3xl border border-gray-100 animate-in slide-in-from-right-5">
              <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
                  <div className="w-3 h-8 bg-indigo-600 rounded-full"></div>
                  شجرة الحسابات (Chart of Accounts)
              </h3>
              
              <div className="space-y-6">
                  {[
                      { code: '1000', name: 'الأصول (Assets)', sub: ['1100 - الصندوق', '1200 - البنك', '1300 - المدينون'] },
                      { code: '2000', name: 'الخصوم (Liabilities)', sub: ['2100 - الدائنون', '2200 - ضرائب مستحقة'] },
                      { code: '3000', name: 'حقوق الملكية (Equity)', sub: ['3100 - رأس المال', '3200 - أرباح محتجزة'] },
                      { code: '4000', name: 'الإيرادات (Revenue)', sub: ['4100 - مبيعات نقاط البيع', '4200 - مبيعات المتجر'] },
                      { code: '5000', name: 'المصروفات (Expenses)', sub: ['5100 - رواتب', '5200 - إيجارات', '5300 - تسويق'] }
                  ].map(group => (
                      <div key={group.code} className="p-6 bg-slate-50/50 rounded-[35px] border border-slate-100 hover:bg-white transition-all shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-4">
                                  <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black">{group.code}</span>
                                  <h4 className="text-lg font-black text-slate-800">{group.name}</h4>
                              </div>
                              <button onClick={() => setCurrentView('ledger')} className="text-[10px] font-black text-blue-600 uppercase">عرض الدفتر ←</button>
                          </div>
                          <div className="mr-14 space-y-2">
                              {group.sub.map(s => (
                                  <p key={s} className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></span>
                                      {s}
                                  </p>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default Accounting;
