
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, AppProvider } from './AppContext';
import { 
  Command,
  Lock,
  Menu,
  WifiOff,
  CloudUpload
} from 'lucide-react';

// Modules
import Auth from './modules/Auth';
import Dashboard from './modules/Dashboard';
import POS from './modules/POS';
import Inventory from './modules/Inventory';
import Purchases from './modules/Purchases';
import Accounting from './modules/Accounting';
import CRM from './modules/CRM';
import Invoicing from './modules/Invoicing';
import MarketingHub from './modules/MarketingHub';
import LogisticsHub from './modules/LogisticsHub';
import HumanResources from './modules/HumanResources';
import Settings from './modules/Settings';
import BigDataAnalytics from './modules/BigDataAnalytics';
import Marketplace from './modules/Marketplace';
import Bundling from './modules/Bundling';
import Manufacturing from './modules/Manufacturing';
import Traceability from './modules/Traceability';
import LegalHub from './modules/LegalHub';
import SupportCenter from './modules/SupportCenter';
import CalendarHub from './modules/CalendarHub';
import Profile from './modules/Profile';
import Categories from './modules/Categories';
import Branches from './modules/Branches';
import StockAnalysis from './modules/StockAnalysis';
import VendorIntel from './modules/VendorIntel';
import WorkCenters from './modules/WorkCenters';
import QualityControl from './modules/QualityControl';
import FleetManagement from './modules/FleetManagement';
import FieldAgents from './modules/FieldAgents';
import GlobalImport from './modules/GlobalImport';
import Vouchers from './modules/Vouchers';
import RevenueIntelligence from './modules/RevenueIntelligence';
import ProfitMatrix from './modules/ProfitMatrix';
import FiscalPlanning from './modules/FiscalPlanning';
import VaultManagement from './modules/VaultManagement';
import Shifts from './modules/Shifts';
import TaxCompliance from './modules/TaxCompliance';
import Installments from './modules/Installments';
import DebtCenter from './modules/DebtCenter';
import Promotions from './modules/Promotions';
import Messaging from './modules/Messaging';
import Contracts from './modules/Contracts';
import Assets from './modules/Assets';
import MaintenanceOps from './modules/MaintenanceOps';
import HRPerformance from './modules/HRPerformance';
import HRDocs from './modules/HRDocs';
import TrainingCenter from './modules/TrainingCenter';
import Governance from './modules/Governance';
import Automation from './modules/Automation';
import Security from './modules/Security';
import Ecommerce from './modules/Ecommerce';
import OrdersHub from './modules/OrdersHub';
import WholesaleHub from './modules/WholesaleHub';
import SettlementHub from './modules/SettlementHub';
import AdvancedInvoicing from './modules/AdvancedInvoicing';
import ProjectMatrix from './modules/ProjectMatrix';
import Returns from './modules/Returns';
import Fulfillment from './modules/Fulfillment';

// Components
import Sidebar from './components/Sidebar';
import AIAssistant from './components/AIAssistant';
import NotificationsPanel from './components/NotificationsPanel';
import CommandPalette from './components/CommandPalette';
import WelcomeWizard from './components/WelcomeWizard';
import ErrorBoundary from './components/ErrorBoundary';
import LockScreen from './components/LockScreen';
import MobileNav from './components/MobileNav';
import SubscriptionLock from './components/SubscriptionLock';

const AppShell = () => {
  const { user, activeTab, setActiveTab, isOnline, offlineSales, syncOfflineData } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);

  // Check Subscription Status
  useEffect(() => {
    if (user && user.subscriptionStatus === 'trial' && user.trialStartDate) {
        const startDate = new Date(user.trialStartDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 3) {
            setIsSubscriptionExpired(true);
        }
    }
  }, [user]);

  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setIsLocked(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user) {
    return <Auth />;
  }

  if (isSubscriptionExpired) {
      return <SubscriptionLock />;
  }

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  const renderPage = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'calendar': return <CalendarHub />;
      case 'pos': return <POS />;
      case 'invoices': return <Invoicing />;
      case 'installments': return <Installments />;
      case 'crm': return <CRM activeCategory="customers" />;
      case 'debt_center': return <DebtCenter />;
      case 'promotions': return <Promotions />;
      case 'marketing': return <MarketingHub />;
      case 'messaging': return <Messaging />;
      case 'returns': return <Returns />;
      case 'settlement': return <SettlementHub />;
      
      // Inventory & Supply
      case 'products': return <Inventory activeSubTab="items" />;
      case 'inventory-balances': return <Inventory activeSubTab="balances" />;
      case 'categories': return <Categories />;
      case 'bundling': return <Bundling />;
      case 'stock_analysis': return <StockAnalysis />;
      case 'purchases': return <Purchases />;
      case 'marketplace': return <Marketplace />;
      case 'vendor_intel': return <VendorIntel />;
      case 'traceability': return <Traceability />;
      case 'wholesale_hub': return <WholesaleHub />;
      case 'branches': return <Branches />;

      // Manufacturing
      case 'manufacturing': return <Manufacturing />;
      case 'work_centers': return <WorkCenters />;
      case 'quality_control': return <QualityControl />;

      // Logistics
      case 'logistics': return <LogisticsHub />;
      case 'fleet': return <FleetManagement />;
      case 'field_agents': return <FieldAgents />;
      case 'global_import': return <GlobalImport />;
      case 'fulfillment': return <Fulfillment />;

      // Finance
      case 'accounting': return <Accounting />;
      case 'vouchers': return <Vouchers />;
      case 'revenue_intel': return <RevenueIntelligence />;
      case 'profit_matrix': return <ProfitMatrix />;
      case 'fiscal_planning': return <FiscalPlanning />;
      case 'vault': return <VaultManagement />;
      case 'shifts': return <Shifts />;
      case 'tax': return <TaxCompliance />;
      case 'expenses': return <Accounting activeSubTab="ledger" />;

      // Ecommerce
      case 'ecommerce': return <Ecommerce />;
      case 'online_orders': return <OrdersHub />;

      // Projects
      case 'projects': return <ProjectMatrix />; 
      case 'contracts': return <Contracts />;
      case 'assets': return <Assets />;
      case 'maintenance': return <MaintenanceOps />;

      // HR
      case 'employees': return <HumanResources />;
      case 'hr_performance': return <HRPerformance />;
      case 'hr_docs': return <HRDocs />;
      case 'training': return <TrainingCenter />;

      // Governance
      case 'big_data': return <BigDataAnalytics />;
      case 'governance': return <Governance />;
      case 'legal': return <LegalHub />;
      case 'reports': return <BigDataAnalytics />; 
      case 'security': return <Security />;

      // Settings
      case 'settings': return <Settings />;
      case 'automation': return <Automation />;
      case 'support_center': return <SupportCenter />;
      case 'profile': return <Profile />;
      
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-tajawal relative text-right">
      {/* Sidebar for Desktop/Tablet */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950 overflow-hidden transition-all duration-300 w-full">
         {/* Top Header */}
         <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 no-print bg-slate-950/80 backdrop-blur-md z-30 shrink-0 w-full">
            <div className="flex items-center gap-3 lg:gap-4">
               {/* Mobile Sidebar Toggle */}
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5">
                  <Menu size={20} />
               </button>
               
               <div 
                 onClick={() => setIsCommandPaletteOpen(true)}
                 className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 cursor-pointer border border-white/5 transition-all group"
               >
                  <Command size={16} className="group-hover:text-blue-400" />
                  <span className="text-xs font-bold">البحث السريع (Ctrl + K)</span>
               </div>
               
               {/* Mobile Search Icon */}
               <button onClick={() => setIsCommandPaletteOpen(true)} className="md:hidden p-2 text-slate-400 bg-white/5 rounded-xl border border-white/5">
                  <Command size={18} />
               </button>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-6">
               <button 
                 onClick={() => setIsLocked(true)}
                 className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5"
                 title="Lock System"
               >
                  <Lock size={18} />
               </button>
               <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Titan.Core</span>
               </div>
               <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-black overflow-hidden shadow-lg cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setActiveTab('profile')}>
                  <img src={user.avatar} className="w-full h-full object-cover" />
               </div>
            </div>
         </header>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 lg:p-8 custom-scrollbar relative pb-28 md:pb-6 w-full">
            <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                 animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                 exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                 transition={{ duration: 0.25, ease: "circOut" }}
                 className="h-full w-full max-w-[1920px] mx-auto"
               >
                  <ErrorBoundary>
                    {renderPage()}
                  </ErrorBoundary>
               </motion.div>
            </AnimatePresence>
         </div>

         {/* Offline / Sync Banner */}
         {(!isOnline || offlineSales.length > 0) && (
            <div className={`fixed bottom-24 lg:bottom-10 left-4 right-4 lg:left-10 lg:right-auto lg:w-96 z-[200] p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md ${!isOnline ? 'bg-red-600/90 text-white' : 'bg-orange-500/90 text-white'} animate-in slide-in-from-bottom-5`}>
                <div className="flex items-center gap-3">
                    <div className="text-2xl">{!isOnline ? <WifiOff size={24} /> : <CloudUpload size={24} />}</div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider">{!isOnline ? 'وضع غير متصل (Offline)' : 'مزامنة البيانات'}</p>
                        <p className="text-[10px] opacity-80">{!isOnline ? 'يتم حفظ العمليات محلياً' : `${offlineSales.length} عملية بانتظار الرفع`}</p>
                    </div>
                </div>
                {isOnline && offlineSales.length > 0 && (
                    <button 
                        onClick={syncOfflineData} 
                        className="px-4 py-2 bg-white text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-sm"
                    >
                        مزامنة الآن
                    </button>
                )}
            </div>
         )}

         {/* Mobile Bottom Navigation */}
         <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>

      {/* Global Overlays */}
      <AIAssistant />
      <NotificationsPanel />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <WelcomeWizard />
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppShell />
  </AppProvider>
);

export default App;
