
import React from 'react';
import { useApp } from '../AppContext';

const TaxCompliance: React.FC = () => {
  const { taxRecords, lang, addLog } = useApp();

  const totalOutputTax = taxRecords.filter(r=>r.type==='output').reduce((a,b)=>a+b.taxAmount, 0);
  const totalInputTax = taxRecords.filter(r=>r.type==='input').reduce((a,b)=>a+b.taxAmount, 0);

  const handleGenerateReport = () => {
      addLog('Tax Report Generated (PDF)', 'info', 'Compliance');
      alert('تم إنشاء ملف الإقرار الضريبي (PDF) وجاهز للتحميل ✅');
  };

  const handleConfirmReturn = () => {
      if(confirm('هل أنت متأكد من اعتماد الإقرار النهائي؟ سيتم ترحيل المبالغ للاستحقاق.')) {
          addLog('Tax Return Finalized', 'success', 'Compliance');
          alert('تم اعتماد الإقرار وترحيله بنجاح');
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">الامتثال الضريبي (VAT)</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Regulatory Reporting, Tax Audits & Compliance Pipeline</p>
        </div>
        <button onClick={handleGenerateReport} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">توليد ملف الإقرار الضريبي</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-blue-50/50 flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">ضريبة المخرجات (المبيعات)</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">${totalOutputTax.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-blue-500">VAT 15% Standard</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-orange-50/50 flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">ضريبة المدخلات (المشتريات)</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">${totalInputTax.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-orange-500">Recoverable Amount</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-slate-900 text-white flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">المبلغ الصافي للتحويل</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">${(totalOutputTax - totalInputTax).toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-emerald-400 animate-pulse">Ready for Settlement</span>
         </div>
      </div>

      <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100 overflow-hidden">
         <h3 className="text-2xl font-black text-slate-800 mb-8">سجل المعاملات الضريبية</h3>
         <div className="rounded-[40px] border border-gray-50 overflow-hidden">
            <table className="w-full text-right text-xs">
               <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-8 py-6">كود المعاملة</th>
                     <th className="px-8 py-6">التصنيف</th>
                     <th className="px-8 py-6 text-center">القيمة الخاضعة</th>
                     <th className="px-8 py-6 text-center">الضريبة</th>
                     <th className="px-8 py-6 text-center">الحالة</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 font-bold text-slate-700">
                  {taxRecords.map(r => (
                    <tr key={r.id}>
                       <td className="px-8 py-6 text-blue-600 font-black">#{r.invoiceId}</td>
                       <td className="px-8 py-6 capitalize">{r.type === 'output' ? 'مخرجات (بيع)' : 'مدخلات (شراء)'}</td>
                       <td className="px-8 py-6 text-center">${r.taxableAmount.toLocaleString()}</td>
                       <td className="px-8 py-6 text-center font-black">${r.taxAmount.toLocaleString()}</td>
                       <td className="px-8 py-6 text-center">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase">موثق ✓</span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         {/* Footer Action */}
         <div className="mt-12 p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex justify-between items-center">
            <div>
               <h4 className="text-lg font-black text-slate-800">إغلاق الفترة الضريبية</h4>
               <p className="text-xs text-gray-400 mt-1">تأكد من مراجعة كافة الفواتير قبل الاعتماد النهائي.</p>
            </div>
            <button onClick={handleConfirmReturn} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">اعتماد وإغلاق الفترة</button>
         </div>
      </div>
    </div>
  );
};

export default TaxCompliance;
