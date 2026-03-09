
import React, { useState } from 'react';
import { useApp } from '../AppContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { notifications, showNotifications, setShowNotifications } = useApp();

  const mainTabs = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
    { id: 'pos', label: 'الكاشير', icon: '🛒' },
  ];

  const allModules = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠', color: 'bg-blue-500' },
    { id: 'pos', label: 'نقاط البيع', icon: '🛒', color: 'bg-emerald-500' },
    { id: 'inventory-balances', label: 'المخزون', icon: '📦', color: 'bg-orange-500' },
    { id: 'purchases', label: 'المشتريات', icon: '🚚', color: 'bg-indigo-500' },
    { id: 'finance', label: 'المالية', icon: '💰', color: 'bg-red-500' },
    { id: 'hr_hub', label: 'الموارد البشرية', icon: '👥', color: 'bg-purple-500' },
    { id: 'manufacturing', label: 'التصنيع', icon: '🏭', color: 'bg-slate-600' },
    { id: 'crm', label: 'العملاء', icon: '🤝', color: 'bg-pink-500' },
    { id: 'reports', label: 'التقارير', icon: '📊', color: 'bg-cyan-600' },
    { id: 'logistics', label: 'اللوجستيات', icon: '🗺️', color: 'bg-teal-500' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️', color: 'bg-gray-500' },
    { id: 'support_center', label: 'الدعم', icon: '🎧', color: 'bg-blue-400' },
  ];

  const handleNav = (tabId: string) => {
      setActiveTab(tabId);
      setIsMenuOpen(false);
  };

  return (
    <>
      {/* Expanded Menu Backdrop */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white/95 z-[160] backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-300 flex flex-col p-6 pb-24">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800">تطبيقات النظام</h3>
              <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors">✕</button>
           </div>
           
           <div className="grid grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pb-10">
              {allModules.map(mod => (
                 <button 
                   key={mod.id} 
                   onClick={() => handleNav(mod.id)}
                   className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-slate-50 border border-slate-100 active:scale-95 transition-all hover:bg-white hover:shadow-md"
                 >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg ${mod.color}`}>
                       {mod.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-700">{mod.label}</span>
                 </button>
              ))}
           </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 z-[150] flex justify-around items-center px-2 pb-2 safe-area-bottom">
        
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleNav(tab.id)}
            className={`flex flex-col items-center gap-1 w-16 transition-all duration-300 ${activeTab === tab.id ? 'text-blue-600 -translate-y-2' : 'text-gray-400 opacity-60'}`}
          >
            <div className={`text-2xl ${activeTab === tab.id ? 'drop-shadow-md' : ''}`}>{tab.icon}</div>
            <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
            {activeTab === tab.id && <span className="w-1 h-1 bg-blue-600 rounded-full mt-1"></span>}
          </button>
        ))}

        {/* Central Action Button (Menu Trigger) */}
        <div className="relative -top-6">
           <button 
             onClick={() => setIsMenuOpen(!isMenuOpen)}
             className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl transition-all duration-300 ${isMenuOpen ? 'bg-slate-800 text-white rotate-45' : 'bg-blue-600 text-white hover:scale-110'}`}
           >
             {isMenuOpen ? '+' : '▦'}
           </button>
        </div>

        <button
          onClick={() => setShowNotifications(true)}
          className="flex flex-col items-center gap-1 w-16 text-gray-400 opacity-60 relative"
        >
          <span className="text-2xl">🔔</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">تنبيهات</span>
          {notifications.some(n => !n.read) && <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
        </button>

        <button
          onClick={() => handleNav('settings')}
          className={`flex flex-col items-center gap-1 w-16 transition-all duration-300 ${activeTab === 'settings' ? 'text-blue-600 -translate-y-2' : 'text-gray-400 opacity-60'}`}
        >
          <span className="text-2xl">⚙️</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">إعدادات</span>
          {activeTab === 'settings' && <span className="w-1 h-1 bg-blue-600 rounded-full mt-1"></span>}
        </button>

      </div>
    </>
  );
};

export default MobileNav;
