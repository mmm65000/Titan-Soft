
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { Icons } from '../constants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { setActiveTab, products, customers, t, lang } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), group: 'Navigation', icon: '🏠' },
    { id: 'pos', label: 'نقطة البيع (POS)', group: 'Sales', icon: '🛒' },
    { id: 'inventory-balances', label: t('inventory'), group: 'Inventory', icon: '📦' },
    { id: 'purchases', label: t('purchases'), group: 'Supply', icon: '🚚' },
    { id: 'finance', label: t('financials'), group: 'Finance', icon: '💰' },
    { id: 'reports', label: t('reports'), group: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'الإعدادات', group: 'System', icon: '⚙️' },
    { id: 'manufacturing', label: 'التصنيع', group: 'Production', icon: '🏭' },
    { id: 'hr_hub', label: 'الموارد البشرية', group: 'HR', icon: '👥' },
  ];

  // Actions
  const actions = [
    { id: 'action_new_sale', label: 'عملية بيع جديدة', group: 'Actions', icon: '⚡', action: () => setActiveTab('pos') },
    { id: 'action_new_product', label: 'إضافة منتج', group: 'Actions', icon: '➕', action: () => setActiveTab('products') },
  ];

  const filteredItems = [
    ...navItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
    ...actions.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
    ...products.filter(p => p.name_ar.includes(query)).slice(0, 3).map(p => ({
        id: `prod_${p.id}`, label: p.name_ar, group: 'Products', icon: '📦', action: () => setActiveTab('products')
    })),
    ...customers.filter(c => c.name.includes(query)).slice(0, 3).map(c => ({
        id: `cust_${c.id}`, label: c.name, group: 'Customers', icon: '👤', action: () => setActiveTab('crm')
    }))
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (item: any) => {
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white rounded-[30px] shadow-2xl overflow-hidden border border-gray-100 transform transition-all scale-100" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
           <span className="text-xl">🔍</span>
           <input 
             ref={inputRef}
             type="text" 
             className="flex-1 text-lg font-bold outline-none text-slate-800 placeholder-gray-300 bg-transparent"
             placeholder={lang === 'ar' ? 'ابحث عن وحدة، عميل، أو إجراء...' : 'Type a command or search...'}
             value={query}
             onChange={e => setQuery(e.target.value)}
             onKeyDown={handleKeyDown}
           />
           <div className="flex gap-2">
              <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-1 rounded">ESC</span>
           </div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
           {filteredItems.length === 0 ? (
              <div className="py-12 text-center opacity-40">
                 <p className="font-black text-sm uppercase tracking-widest">No results found</p>
              </div>
           ) : (
              filteredItems.map((item, idx) => (
                 <div 
                   key={item.id}
                   onClick={() => handleSelect(item)}
                   onMouseEnter={() => setSelectedIndex(idx)}
                   className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                      idx === selectedIndex ? 'bg-blue-600 text-white shadow-lg scale-[1.01]' : 'text-slate-600 hover:bg-gray-50'
                   }`}
                 >
                    <div className="flex items-center gap-4">
                       <span className="text-xl">{item.icon}</span>
                       <span className="font-bold text-sm">{item.label}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                       idx === selectedIndex ? 'text-white/60 bg-white/10' : 'text-gray-300 bg-gray-50'
                    }`}>
                       {item.group}
                    </span>
                 </div>
              ))
           )}
        </div>
        
        <div className="p-3 bg-gray-50 text-[10px] font-bold text-gray-400 text-center border-t border-gray-100">
           Titan Platform OS • v3.0 Production
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
