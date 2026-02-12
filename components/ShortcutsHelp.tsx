
import React from 'react';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', action: 'فتح قائمة الأوامر السريعة (Command Palette)' },
    { key: 'F9', action: 'نافذة الدفع السريع في الكاشير' },
    { key: 'F4', action: 'التركيز على حقل البحث في الكاشير' },
    { key: 'ESC', action: 'إغلاق النوافذ المنبثقة' },
    { key: 'Ctrl + P', action: 'طباعة التقرير الحالي' },
  ];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="glass w-full max-w-lg p-10 rounded-[50px] shadow-3xl border-white relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
              <span className="bg-slate-100 p-2 rounded-xl text-xl">⌨️</span>
              اختصارات النظام
           </h3>
           <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all font-black">✕</button>
        </div>
        
        <div className="space-y-4">
           {shortcuts.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/60 rounded-2xl border border-gray-100">
                 <span className="text-sm font-bold text-slate-700">{s.action}</span>
                 <kbd className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-mono font-black shadow-lg">{s.key}</kbd>
              </div>
           ))}
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Titan OS Productivity Tools</p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsHelp;
