
import React from 'react';
import { useApp } from '../AppContext';

const NotificationsPanel: React.FC = () => {
  const { notifications, showNotifications, setShowNotifications, lang } = useApp();

  if (!showNotifications) return null;

  return (
    <div className="fixed inset-0 z-[100] flex" style={{ justifyContent: lang === 'ar' ? 'flex-start' : 'flex-end' }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={() => setShowNotifications(false)}
      ></div>

      {/* Panel */}
      <div 
        className="relative w-96 h-full bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white p-6 animate-in slide-in-from-right duration-300 flex flex-col"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <span>🔔</span>
             {lang === 'ar' ? 'التنبيهات' : 'Notifications'}
           </h3>
           <button onClick={() => setShowNotifications(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all font-bold">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-20">
           {notifications.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
                <div className="text-4xl mb-4">🔕</div>
                <p className="font-black text-xs uppercase tracking-widest">{lang === 'ar' ? 'لا توجد تنبيهات جديدة' : 'No new notifications'}</p>
             </div>
           ) : (
             notifications.map(n => (
               <div key={n.id} className={`p-5 rounded-[20px] border shadow-sm transition-all hover:scale-[1.02] ${
                  n.type === 'warning' ? 'bg-orange-50/50 border-orange-100' : 
                  n.type === 'success' ? 'bg-emerald-50/50 border-emerald-100' : 
                  n.type === 'error' ? 'bg-red-50/50 border-red-100' :
                  'bg-white border-gray-100'
               }`}>
                  <div className="flex justify-between items-start mb-2">
                     <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg tracking-widest ${
                        n.type === 'warning' ? 'bg-orange-100 text-orange-600' : 
                        n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                        n.type === 'error' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                     }`}>{n.type}</span>
                     <span className="text-[9px] font-bold text-gray-400">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <h4 className="font-black text-sm text-slate-800 mb-1">{n.title}</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">{n.message}</p>
               </div>
             ))
           )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
           <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
              {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
