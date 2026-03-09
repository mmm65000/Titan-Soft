
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

  // ... (Keep existing menuStructure logic intact, assumed imported or defined here same as previous) ...
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
        { id: 'returns', label: 'إدارة المرتجعات (RMA)' },
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
      icon: (props: any) => <span {...props}>🏭</span>,
      children: [
        { id: 'manufacturing', label: 'أوامر الإنتاج' },
        { id: 'work_centers', label: 'مراكز العمل' }, 
        { id: 'quality_control', label: 'رقابة الجودة (QC)' }, 
      ]
    },
    {
      id: 'logistics_hub',
      label: 'اللوجستيات والأسطول',
      icon: (props: any) => <span {...props}>🚚</span>,
      children: [
        { id: 'fulfillment', label: 'شاشة التجهيز (KDS/WMS)' },
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
      icon: (props: any) => <span {...props}>🏗️</span>,
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[140] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-[150] bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-2xl transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ease-in-out
        ${isOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} 
        lg:translate-x-0 lg:static flex flex-col h-full
        ${isCollapsed ? 'w-24' : 'w-72'}`}
      >
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className={`lg:hidden absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} p-2 text-slate-400 hover:text-red-500 transition-colors z-50 bg-slate-50 rounded-full`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Desktop Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:flex absolute top-8 -left-3 w-8 h-8 bg-white border border-gray-100 rounded-full items-center justify-center shadow-lg text-slate-400 hover:text-blue-600 transition-all z-50 hover:scale-110 ${lang === 'ar' ? 'rotate-180 -right-3 left-auto' : ''}`}
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
            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              <h1 className="text-sm font-black text-slate-800 tracking-tight whitespace-nowrap">{user?.name}</h1>
              <p className="text-[10px] text-orange-500 font-bold whitespace-nowrap uppercase">{user?.role}</p>
            </div>
          </div>
          
          <div className={`relative transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            <input 
              type="text" 
              placeholder="بحث..." 
              className="w-full bg-slate-50 border border-gray-100 text-xs rounded-xl py-3 px-10 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all font-bold text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute top-3.5 right-3 text-gray-400 text-xs">🔍</span>
          </div>
          {isCollapsed && (
              <div className="flex justify-center py-2 text-xl cursor-pointer hover:scale-110 transition-transform text-slate-400" onClick={() => setIsCollapsed(false)} title="Search">🔍</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden pb-10">
          {filteredMenu.map(item => (
            <div key={item.id} className="group">
              {!item.children ? (
                <button
                  onClick={() => { setActiveTab(item.id); if(window.innerWidth < 1024) onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                      activeTab === item.id 
                      ? 'bg-orange-50 text-orange-600 font-bold shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  {activeTab === item.id && !isCollapsed && (
                      <div className="absolute right-0 top-1/4 h-1/2 w-1 bg-orange-500 rounded-l-full"></div>
                  )}
                  {typeof item.icon === 'function' ? <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isCollapsed && activeTab === item.id ? 'scale-110 text-orange-600' : ''}`} /> : <span className="text-xl">{item.icon}</span>}
                  <span className={`text-xs font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>{item.label}</span>
                </button>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className="flex items-center gap-3">
                      {typeof item.icon === 'function' ? <item.icon className={`w-5 h-5 text-slate-400 shrink-0 ${expandedMenus.includes(item.id) ? 'text-blue-600' : ''}`} /> : <span className="text-xl">{item.icon}</span>}
                      <span className={`text-xs font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>{item.label}</span>
                    </div>
                    {!isCollapsed && (
                        <span className={`text-[9px] transition-transform duration-300 text-slate-400 ${expandedMenus.includes(item.id) ? 'rotate-180' : ''}`}>▼</span>
                    )}
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedMenus.includes(item.id) && !isCollapsed ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="mr-5 pr-3 border-r-2 border-slate-100 space-y-1 mt-1">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => { setActiveTab(child.id); if(window.innerWidth < 1024) onClose(); }}
                          className={`w-full text-right px-4 py-2.5 rounded-xl text-[11px] transition-all flex items-center justify-between group/child ${activeTab === child.id ? 'text-orange-600 bg-orange-50/50 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
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

        {/* Footer */}
        <div className={`p-4 border-t border-gray-50 bg-gray-50/30 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
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
