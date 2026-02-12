
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Vehicle } from '../types';

const FleetManagement: React.FC = () => {
  const { fleet, updateVehicle, lang, addVehicle, addLog } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newV, setNewV] = useState({ model: '', plate: '', type: 'van' });

  const handleAdd = () => {
    if(!newV.model || !newV.plate) return;
    const v: Vehicle = {
        id: `V-${Date.now()}`,
        type: newV.type as any,
        model: newV.model,
        plateNumber: newV.plate,
        fuelLevel: 100,
        status: 'available',
        lastService: 'New'
    };
    addVehicle(v);
    setShowModal(false);
    setNewV({ model: '', plate: '', type: 'van' });
  };

  const assignRoute = (v: Vehicle) => {
      if (v.status !== 'available') return alert('المركبة غير متاحة حالياً.');
      const route = prompt('أدخل اسم المسار أو المنطقة (مثلاً: شمال الرياض - حي النخيل):');
      if (route) {
          updateVehicle(v.id, { status: 'busy' });
          addLog(`Vehicle ${v.plateNumber} assigned to route: ${route}`, 'info', 'Logistics');
          alert('تم تعيين المسار وتحديث حالة المركبة بنجاح 🚚');
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة أسطول النقل</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Real-time GPS Tracking, Maintenance & Fuel Monitoring</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-700 transition-all"
        >
            تسجيل مركبة جديدة +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {fleet.map(v => (
          <div key={v.id} className="glass p-10 rounded-[50px] border border-white shadow-xl bg-white/40 group hover:bg-white transition-all relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-2 h-full ${v.status === 'available' ? 'bg-emerald-500' : v.status === 'busy' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
             
             <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${v.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                   {v.type === 'truck' ? '🚛' : '🚐'}
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase">مستوى الوقود</p>
                   <h4 className={`text-2xl font-black ${v.fuelLevel < 20 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>{v.fuelLevel}%</h4>
                </div>
             </div>

             <h3 className="text-xl font-black text-slate-800 mb-1">{v.model}</h3>
             <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mb-8">{v.plateNumber}</p>

             <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-8">
                <div className={`h-full transition-all duration-1000 ${v.fuelLevel < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${v.fuelLevel}%` }}></div>
             </div>

             <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-gray-400">الحالة:</span>
                   <span className="capitalize text-slate-700">{v.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-gray-400">آخر صيانة:</span>
                   <span className="text-slate-700">{v.lastService}</span>
                </div>
             </div>

             <div className="flex gap-3">
                <button onClick={() => assignRoute(v)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all">تعيين مسار</button>
                <button className="px-6 py-3 glass border border-gray-100 rounded-xl text-slate-400 hover:bg-slate-50">⚙️</button>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-12 rounded-[60px] shadow-3xl text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <h3 className="text-2xl font-black mb-10 flex items-center gap-4 relative z-10">
            <div className="w-2.5 h-8 bg-blue-500 rounded-full"></div>
            سجل تحركات الأسطول اللحظي
         </h3>
         <div className="space-y-6 relative z-10">
            {[
               { time: '12:45 PM', event: 'المركبة TRK-221 وصلت لمستودع جدة الرئيسي', status: 'normal' },
               { time: '11:20 AM', event: 'تنبيه: مستوى الوقود منخفض في الشاحنة LKH-992', status: 'warning' },
               { time: '09:00 AM', event: 'بدء وردية التوصيل الصباحية لـ 12 مركبة', status: 'info' }
            ].map((log, i) => (
               <div key={i} className="flex gap-6 items-start p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                  <span className="text-[10px] font-black text-blue-400 shrink-0">{log.time}</span>
                  <p className="text-sm font-bold text-gray-300">{log.event}</p>
               </div>
            ))}
         </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">مركبة جديدة</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الموديل</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newV.model} onChange={e=>setNewV({...newV, model: e.target.value})} placeholder="Toyota Hilux 2024" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">رقم اللوحة</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600 uppercase" value={newV.plate} onChange={e=>setNewV({...newV, plate: e.target.value})} placeholder="ABC-1234" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">النوع</label>
                    <div className="flex gap-4">
                        <button onClick={()=>setNewV({...newV, type: 'van'})} className={`flex-1 py-4 rounded-2xl font-bold ${newV.type==='van' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Van 🚐</button>
                        <button onClick={()=>setNewV({...newV, type: 'truck'})} className={`flex-1 py-4 rounded-2xl font-bold ${newV.type==='truck' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Truck 🚛</button>
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">حفظ المركبة</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;
