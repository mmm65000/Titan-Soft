
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const DebtCenter: React.FC = () => {
  const { customers, lang, installmentPlans } = useApp();

  const totalOutstanding = customers.reduce((a, b) => a + b.balance, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end" dir="rtl">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">مركز التحكم بالديون والائتمان</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">مراقبة التدفقات المدينة، التقييم الائتماني، وجدولة المديونيات</p>
        </div>
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-2xl font-black">💳</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56" dir="rtl">
           <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">إجمالي المديونيات المستحقة</p>
           <h3 className="text-4xl font-black text-slate-800 tracking-tighter">${totalOutstanding.toLocaleString()}</h3>
           <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-red-600 uppercase">تحتاج تحصيل عاجل</span>
           </div>
        </div>
        <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56" dir="rtl">
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">خطة التحصيل المتوقعة (30 يوم)</p>
           <h3 className="text-4xl font-black text-slate-800 tracking-tighter">$4,200.00</h3>
           <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-4 py-1 rounded-full w-fit">معدل التزام 92%</span>
        </div>
        <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-slate-900 text-white flex flex-col justify-between h-56" dir="rtl">
           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">أفضل المسددين التزاماً</p>
           <h3 className="text-4xl font-black tracking-tighter">15 عميل</h3>
           <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Titan Platinum Score</span>
        </div>
        <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56" dir="rtl">
           <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">طلبات رفع الحد الائتماني</p>
           <h3 className="text-4xl font-black text-slate-800 tracking-tighter">3 طلبات</h3>
           <button className="text-[9px] font-black text-blue-600 uppercase hover:underline text-right">مراجعة الآن ←</button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100" dir="rtl">
         <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
            <div className="w-2.5 h-8 bg-red-600 rounded-full"></div>
            سجل المديونيات والتقييم الائتماني
         </h3>
         <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/30">
            <table className="w-full text-right text-xs">
               <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-10 py-7">العميل</th>
                     <th className="px-10 py-7">إجمالي الدين</th>
                     <th className="px-10 py-7">الحد الائتماني</th>
                     <th className="px-10 py-7 text-center">تقييم الائتمان</th>
                     <th className="px-10 py-7 text-center">الإجراء</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                  {customers.filter(c => c.balance > 0 || (c.creditScore || 0) < 50).map((customer) => (
                    <tr key={customer.id} className="hover:bg-white transition-all group">
                       <td className="px-10 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black">{customer.name.charAt(0)}</div>
                             <div>
                                <p>{customer.name}</p>
                                <p className="text-[9px] text-gray-400 uppercase">{customer.tier} Member</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-5 font-black text-red-600">${customer.balance.toLocaleString()}</td>
                       <td className="px-10 py-5 text-gray-400">${customer.creditLimit.toLocaleString()}</td>
                       <td className="px-10 py-5 text-center">
                          <div className="flex flex-col items-center gap-2">
                             <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${ (customer.creditScore || 0) > 70 ? 'bg-emerald-500' : (customer.creditScore || 0) > 40 ? 'bg-orange-500' : 'bg-red-500'}`} 
                                    style={{ width: `${customer.creditScore || 0}%` }}
                                ></div>
                             </div>
                             <span className="text-[9px] font-black">{customer.creditScore || 0}/100</span>
                          </div>
                       </td>
                       <td className="px-10 py-5 text-center">
                          <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-red-600 shadow-md">إشعار بالسداد</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default DebtCenter;
