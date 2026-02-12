
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Icons } from '../constants';
import ShortcutsHelp from './ShortcutsHelp';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { lang, setLang, setUser, activeTab, setActiveTab, setShowNotifications, notifications, isOnline, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['sales_center', 'inventory_supply', 'finance_hub']);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const toggleMenu = (menu: string) => {
    // If collapsed, expand sidebar first
    if (isCollapsed) {
        setIsCollapsed(false);
        setTimeout(() => {
            setExpandedMenus([menu]);
        }, 300);
        return;
    }

    if (expandedMenus.includes(menu)) {
      setExpandedMenus(expandedMenus.filter(m => m !== menu));
    } else {
      setExpandedMenus([...expandedMenus, menu]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuStructure = [
    { 
      id: 'dashboard', 
      label: 'لوحة القيادة', 
      icon: Icons.Dashboard,
      children: null
    },
    { 
      id: 'calendar', 
      label: 'التقويم المركزي', 
      icon: (props:any) => <span {...props}>📅</span>,
      children: null
    },
    {
      id: 'sales_center',
      label: 'المبيعات والعملاء (CRM)',
      icon: Icons.Sales,
      children: [
        { id: 'pos', label: 'نقطة البيع (POS)' },
        { id: 'invoices', label: 'الفواتير وعروض الأسعار' }, 
        { id: 'installments', label: 'إدارة الأقساط والديون' }, 
        { id: 'crm', label: 'ملفات العملاء (CRM)' },
        { id: 'debt_center', label: 'مركز التحصيل والائتمان' }, 
        { id: 'promotions', label: 'العروض الترويجية' }, 
        { id: 'marketing', label: 'التسويق الذكي' },
        { id: 'messaging', label: 'الرسائل الموحدة' },
      ]
    },
    {
      id: 'inventory_supply',
      label: 'سلسلة الإمداد والمخزون',
      icon: Icons.Inventory,
      children: [
        { id: 'products', label: 'المنتجات والأصناف' },
        { id: 'categories', label: 'التصنيفات الشجرية' }, 
        { id: 'bundling', label: 'التجميع والباقات' }, 
        { id: 'inventory-balances', label: 'الأرصدة والجرد' },
        { id: 'stock_analysis', label: 'تحليل حركة المخزون' }, 
        { id: 'purchases', label: 'المشتريات والتوريد' },
        { id: 'marketplace', label: 'سوق الموردين' }, 
        { id: 'vendor_intel', label: 'ذكاء الموردين' }, 
        { id: 'traceability', label: 'تتبع المنشأ (Traceability)' },
        { id: 'wholesale_hub', label: 'مبيعات الجملة B2B' },
        { id: 'branches', label: 'إدارة الفروع' },
      ]
    },
    {
      id: 'manufacturing_hub',
      label: 'التصنيع والإنتاج',
      icon: (props: any) => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
      children: [
        { id: 'manufacturing', label: 'أوامر الإنتاج' },
        { id: 'work_centers', label: 'مراكز العمل' }, 
        { id: 'quality_control', label: 'رقابة الجودة (QC)' }, 
      ]
    },
    {
      id: 'logistics_hub',
      label: 'اللوجستيات والأسطول',
      icon: (props: any) => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
      children: [
        { id: 'logistics', label: 'تتبع الشحنات' }, 
        { id: 'fleet', label: 'إدارة الأسطول' }, 
        { id: 'field_agents', label: 'المناديب الميدانيين' },
        { id: 'global_import', label: 'الاستيراد والتخليص' }, 
      ]
    },
    {
      id: 'finance_hub',
      label: 'الإدارة المالية',
      icon: Icons.Financial,
      children: [
        { id: 'accounting', label: 'المحاسبة العامة' },
        { id: 'vouchers', label: 'سندات القبض والصرف' }, 
        { id: 'revenue_intel', label: 'تحليل الإيرادات' }, 
        { id: 'profit_matrix', label: 'مصفوفة الربحية' },
        { id: 'fiscal_planning', label: 'الميزانيات والتخطيط' }, 
        { id: 'settlement', label: 'التسويات والعهد' }, 
        { id: 'vault', label: 'الخزينة (Z-Report)' },
        { id: 'shifts', label: 'الورديات' }, 
        { id: 'expenses', label: 'المصروفات' },
        { id: 'tax', label: 'الضرائب (VAT)' },
      ]
    },
    {
      id: 'ecommerce_hub',
      label: 'المتجر الإلكتروني',
      icon: Icons.Store,
      children: [
        { id: 'ecommerce', label: 'لوحة المتجر' },
        { id: 'online_orders', label: 'إدارة الطلبات' },
      ]
    },
    {
      id: 'projects_assets',
      label: 'المشاريع والأصول',
      icon: (props: any) => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      children: [
        { id: 'projects', label: 'إدارة المشاريع' }, 
        { id: 'contracts', label: 'العقود والاشتراكات' }, 
        { id: 'assets', label: 'الأصول الثابتة' }, 
        { id: 'maintenance', label: 'الصيانة والتشغيل' }, 
      ]
    },
    {
      id: 'hr_hub',
      label: 'رأس المال البشري',
      icon: Icons.People,
      children: [
        { id: 'employees', label: 'الموظفين' },
        { id: 'hr_performance', label: 'تقييم الأداء (KPIs)' }, 
        { id: 'hr_docs', label: 'الأرشيف والوثائق' }, 
        { id: 'training', label: 'التدريب والتطوير' }, 
      ]
    },
    {
      id: 'governance_analytics',
      label: 'الحوكمة والبيانات',
      icon: Icons.Reports,
      children: [
        { id: 'big_data', label: 'تحليل البيانات الضخمة' }, 
        { id: 'governance', label: 'المخاطر والحوكمة' }, 
        { id: 'legal', label: 'الشؤون القانونية' }, 
        { id: 'reports', label: 'التقارير الشاملة' },
        { id: 'security', label: 'الأمان والصلاحيات' }, 
      ]
    },
    {
      id: 'system_settings',
      label: 'إعدادات النظام',
      icon: Icons.Settings,
      children: [
        { id: 'settings', label: 'الإعدادات العامة' },
        { id: 'automation', label: 'الأتمتة (Automation)' },
        { id: 'support_center', label: 'الدعم الفني' },
      ]
    },
  ];

  const filteredMenu = menuStructure.filter(item => {
    if (item.label.includes(searchTerm)) return true;
    if (item.children) return item.children.some(child => child.label.includes(searchTerm));
    return false;
  });

  return (
    <>
      <ShortcutsHelp isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-50 bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-2xl transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ease-in-out
        ${isOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} 
        lg:translate-x-0 lg:static flex flex-col
        ${isCollapsed ? 'w-24' : 'w-72'}`}
      >
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className={`lg:hidden absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} p-2 text-slate-400 hover:text-red-500 transition-colors z-50`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Desktop Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:flex absolute top-10 -left-3 w-8 h-8 bg-white border border-gray-100 rounded-full items-center justify-center shadow-lg text-slate-400 hover:text-blue-600 transition-all z-50 hover:scale-110 ${lang === 'ar' ? 'rotate-180 -right-3 left-auto' : ''}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? '➜' : '←'}
        </button>

        {/* Brand & Search */}
        <div className={`p-6 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-gray-50 transition-all duration-300 ${isCollapsed ? 'px-4' : 'px-6'}`}>
          <div 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 mb-6 transition-all cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <img src={user?.avatar || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-xl object-cover shadow-lg border-2 border-white group-hover:border-orange-200 transition-all shrink-0" />
            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <h1 className="text-sm font-black text-slate-800 tracking-tight whitespace-nowrap">{user?.name}</h1>
              <p className="text-[10px] text-orange-500 font-bold whitespace-nowrap uppercase">{user?.role}</p>
            </div>
          </div>
          
          <div className={`relative transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            <input 
              type="text" 
              placeholder="بحث سريع..." 
              className="w-full bg-slate-50 border border-gray-100 text-sm rounded-xl py-3 px-10 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute top-3.5 right-3 text-gray-400">🔍</span>
          </div>
          {isCollapsed && (
              <div className="flex justify-center py-2 text-xl cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsCollapsed(false)} title="Search">🔍</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {filteredMenu.map(item => (
            <div key={item.id} className="group">
              {!item.children ? (
                <button
                  onClick={() => { setActiveTab(item.id); if(window.innerWidth < 1024) onClose(); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                      activeTab === item.id 
                      ? 'bg-orange-50 text-orange-600 font-bold shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  {activeTab === item.id && isCollapsed && (
                      <div className="absolute left-0 top-1/4 h-1/2 w-1 bg-orange-500 rounded-r-full"></div>
                  )}
                  {typeof item.icon === 'function' ? <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isCollapsed && activeTab === item.id ? 'scale-125' : ''}`} /> : <span className="text-xl">{item.icon}</span>}
                  <span className={`text-sm whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>{item.label}</span>
                </button>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className="flex items-center gap-4">
                      {typeof item.icon === 'function' ? <item.icon className={`w-5 h-5 text-slate-400 shrink-0 ${expandedMenus.includes(item.id) ? 'text-blue-500' : ''}`} /> : <span className="text-xl">{item.icon}</span>}
                      <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>{item.label}</span>
                    </div>
                    {!isCollapsed && (
                        <span className={`text-[10px] transition-transform duration-300 ${expandedMenus.includes(item.id) ? 'rotate-180' : ''}`}>▼</span>
                    )}
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedMenus.includes(item.id) && !isCollapsed ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="mr-8 pr-4 border-r-2 border-slate-100 space-y-1 mt-1">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => { setActiveTab(child.id); if(window.innerWidth < 1024) onClose(); }}
                          className={`w-full text-right px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group/child ${activeTab === child.id ? 'text-orange-600 bg-orange-50/50 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          <span className="group-hover/child:translate-x-[-2px] transition-transform">{child.label}</span>
                          {activeTab === child.id && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* System Status & Footer */}
        <div className={`p-4 border-t border-gray-50 bg-gray-50/30 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center justify-between px-2 mb-4 bg-white p-3 rounded-xl border border-gray-100 transition-all ${isCollapsed ? 'justify-center p-2' : ''}`}>
             <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                {!isCollapsed && <span className="text-[10px] font-black uppercase text-slate-600">{isOnline ? 'System Online' : 'Offline Mode'}</span>}
             </div>
             {!isCollapsed && <span className="text-[9px] font-bold text-gray-400">98ms</span>}
          </div>

          <div className={`flex gap-2 mb-3 ${isCollapsed ? 'flex-col' : ''}`}>
             <button 
               onClick={() => setShowShortcuts(true)}
               className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-900 hover:text-white transition-all flex justify-center items-center gap-2"
               title="Shortcuts"
             >
               ⌨️ {!isCollapsed && 'اختصارات'}
             </button>
             <button 
               onClick={() => setShowNotifications(true)}
               className={`bg-white border border-gray-200 rounded-xl flex items-center justify-center relative hover:bg-slate-50 transition-all ${isCollapsed ? 'py-2.5 w-full' : 'w-12 h-10'}`}
               title="Notifications"
             >
               🔔
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
             </button>
          </div>
          <button 
            onClick={() => setUser(null)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-xs ${isCollapsed ? 'px-0' : ''}`}
            title="Logout"
          >
            <span>🚪</span>
            {!isCollapsed && 'تسجيل الخروج'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
