
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { WorkCenter } from '../types';

const WorkCenters: React.FC = () => {
  const { workCenters, lang, addWorkCenter, updateWorkCenter, addLog, productionOrders } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newWC, setNewWC] = useState({ name: '', efficiency: '' });
  const [selectedCenter, setSelectedCenter] = useState<WorkCenter | null>(null);

  const handleAdd = () => {
    if(!newWC.name) return;
    const wc: WorkCenter = {
        id: `WC-${Date.now()}`,
        name: newWC.name,
        status: 'operational',
        efficiency: parseInt(newWC.efficiency) || 100,
        lastMaintenance: new Date().toISOString().split('T')[0]
    };
    addWorkCenter(wc);
    setShowModal(false);
    setNewWC({ name: '', efficiency: '' });
  };

  const toggleStatus = (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'operational' ? 'maintenance' : 'operational';
      updateWorkCenter(id, { status: newStatus as any });
      addLog(`Work Center ${id} status changed to ${newStatus}`, 'warning', 'Manufacturing');
  };

  // Mock filtering production orders by work center if we had that linkage, 
  // for now showing all recent orders as a demo log
  const getCenterHistory = (wcId: string) => {
      return productionOrders.slice(0, 5); 
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">مراكز العمل الصناعية</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Real-time Machine Status & Floor Efficiency Monitoring</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all"
        >
            إضافة وحدة إنتاج +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workCenters.map(wc => (
          <div key={wc.id} className="glass p-10 rounded-[50px] border border-white shadow-xl bg-white/40 group hover:bg-white transition-all relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-2 h-full ${wc.status === 'operational' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
             
             <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${wc.status === 'operational' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                   {wc.status === 'operational' ? '⚙️' : '🔧'}
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase">كفاءة الأداء</p>
                   <h4 className={`text-2xl font-black ${wc.efficiency > 90 ? 'text-emerald-600' : 'text-orange-600'}`}>{wc.efficiency}%</h4>
                </div>
             </div>

             <h3 className="text-xl font-black text-slate-800 mb-2">{wc.name}</h3>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">ID: {wc.id} • آخر صيانة: {wc.lastMaintenance}</p>

             <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
                <div className={`h-full transition-all duration-1000 ${wc.status === 'operational' ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${wc.efficiency}%` }}></div>
             </div>

             <div className="flex gap-3">
                <button 
                    onClick={() => setSelectedCenter(wc)}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-all"
                >
                    سجل الإنتاج
                </button>
                <button 
                    onClick={() => toggleStatus(wc.id, wc.status)}
                    className={`px-6 py-3 glass border border-gray-100 rounded-xl text-slate-400 hover:text-white transition-colors ${wc.status === 'operational' ? 'hover:bg-orange-500' : 'hover:bg-emerald-500'}`}
                    title={wc.status === 'operational' ? 'Set to Maintenance' : 'Set to Operational'}
                >
                    {wc.status === 'operational' ? '🛑' : '▶️'}
                </button>
             </div>
          </div>
        ))}
      </div>

      {selectedCenter && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
              <div className="glass w-full max-w-2xl p-12 rounded-[60px] shadow-3xl border-white relative max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tighter">سجل عمليات: {selectedCenter.name}</h3>
                      <button onClick={() => setSelectedCenter(null)} className="p-3 bg-gray-100 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-500">✕</button>
                  </div>
                  <div className="space-y-4">
                      {getCenterHistory(selectedCenter.id).map(order => (
                          <div key={order.id} className="p-6 bg-white rounded-[2rem] border border-gray-100 flex justify-between items-center">
                              <div>
                                  <p className="font-black text-slate-800">أمر إنتاج: {order.id}</p>
                                  <p className="text-[10px] text-gray-400 mt-1 uppercase">Date: {new Date(order.startDate).toLocaleDateString()}</p>
                              </div>
                              <span className={`text-[9px] px-3 py-1 rounded-full uppercase font-bold ${order.status==='completed'?'bg-emerald-50 text-emerald-600':'bg-blue-50 text-blue-600'}`}>
                                  {order.status} ({order.quantity} units)
                              </span>
                          </div>
                      ))}
                      {productionOrders.length === 0 && (
                          <p className="text-center py-10 opacity-30 font-black uppercase text-sm">لا توجد سجلات إنتاج متاحة</p>
                      )}
                  </div>
              </div>
          </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">وحدة إنتاج جديدة</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">اسم الوحدة / الماكينة</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newWC.name} onChange={e=>setNewWC({...newWC, name: e.target.value})} placeholder="خط تجميع أ، ماكينة تعبئة..." />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الكفاءة الأولية المتوقعة (%)</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-emerald-600" value={newWC.efficiency} onChange={e=>setNewWC({...newWC, efficiency: e.target.value})} placeholder="100" />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">تشغيل الوحدة</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default WorkCenters;
