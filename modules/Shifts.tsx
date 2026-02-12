
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const Shifts: React.FC = () => {
  const { lang, shifts, openShift, closeShift, user } = useApp();
  const [openingAmount, setOpeningAmount] = useState<number>(0);
  const activeShift = shifts.find(s => s.status === 'open');

  const handleOpen = () => {
    if (activeShift) return alert('هناك وردية مفتوحة بالفعل');
    if (openingAmount <= 0) return alert('يرجى إدخال مبلغ الافتتاح');
    openShift(openingAmount);
    setOpeningAmount(0);
  };

  const handleClose = (id: string) => {
    const amount = prompt('أدخل مبلغ الإغلاق الفعلي:');
    if (amount !== null) {
      closeShift(id, parseFloat(amount), 'تم الإغلاق يدوياً');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-center mb-6">
        <h2 className="text-4xl font-black text-blue-600 border-b-4 border-blue-600 pb-3 px-10">إدارة ورديات الصندوق</h2>
      </div>

      <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-gray-100" dir="rtl">
         <div className="flex justify-between items-center gap-6 mb-10">
            <div className="flex-1 bg-blue-50/50 p-6 rounded-[30px] border border-blue-100 flex items-center justify-between">
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">حالة الوردية الحالية</p>
                  <h3 className={`text-2xl font-black ${activeShift ? 'text-emerald-600' : 'text-red-500'}`}>
                    {activeShift ? 'الوردية مفتوحة ونشطة' : 'لا توجد وردية نشطة حالياً'}
                  </h3>
               </div>
               {activeShift && (
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400">مبلغ الافتتاح</p>
                    <p className="text-xl font-black text-blue-600">${activeShift.openingBalance}</p>
                 </div>
               )}
            </div>
            
            {!activeShift && (
              <div className="flex gap-4">
                 <input 
                  type="number" 
                  placeholder="مبلغ الافتتاح" 
                  value={openingAmount || ''} 
                  onChange={e => setOpeningAmount(parseFloat(e.target.value))}
                  className="border border-gray-200 p-4 rounded-2xl font-black w-48 outline-none text-center focus:ring-4 ring-blue-500/5 transition-all" 
                 />
                 <button 
                  onClick={handleOpen}
                  className="bg-[#f37021] text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-xs"
                 >
                    فتح وردية جديدة +
                 </button>
              </div>
            )}
         </div>

         <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/10">
            <table className="w-full text-right text-xs">
               <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-8 py-6">رقم الوردية</th>
                     <th className="px-8 py-6">تاريخ الافتتاح</th>
                     <th className="px-8 py-6">المستخدم</th>
                     <th className="px-8 py-6">الافتتاح ($)</th>
                     <th className="px-8 py-6">تاريخ الإغلاق</th>
                     <th className="px-8 py-6">الإغلاق ($)</th>
                     <th className="px-8 py-6 text-center">الحالة</th>
                     <th className="px-8 py-6 text-center">الإجراء</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                  {shifts.map(shift => (
                    <tr key={shift.id} className="hover:bg-white transition-all group">
                       <td className="px-8 py-5 text-blue-600">#{shift.id.slice(-6)}</td>
                       <td className="px-8 py-5">{new Date(shift.openedAt).toLocaleString()}</td>
                       <td className="px-8 py-5">{shift.user}</td>
                       <td className="px-8 py-5 font-black">${shift.openingBalance}</td>
                       <td className="px-8 py-5 text-gray-400">{shift.closedAt ? new Date(shift.closedAt).toLocaleString() : '---'}</td>
                       <td className="px-8 py-5 font-black text-red-500">{shift.closingBalance ? `$${shift.closingBalance}` : '---'}</td>
                       <td className="px-8 py-5 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${shift.status === 'open' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                             {shift.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-center">
                          {shift.status === 'open' ? (
                            <button onClick={()=>handleClose(shift.id)} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-red-600 transition-colors shadow-md">إغلاق الآن</button>
                          ) : (
                            <button className="text-gray-300 hover:text-blue-600 transition-colors">📑 التقرير</button>
                          )}
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

export default Shifts;
