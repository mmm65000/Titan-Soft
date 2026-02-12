
import React, { useState, useEffect, Suspense } from 'react';
import { AppProvider, useApp } from './AppContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import NotificationsPanel from './components/NotificationsPanel';
import CommandPalette from './components/CommandPalette';
import AIAssistant from './components/AIAssistant';
import Auth from './modules/Auth';
import ErrorBoundary from './components/ErrorBoundary';
import WelcomeWizard from './components/WelcomeWizard';
import LockScreen from './components/LockScreen';

// Lazy Load Modules for Performance Optimization
const Dashboard = React.lazy(() => import('./modules/Dashboard'));
const POS = React.lazy(() => import('./modules/POS'));
const MarketingHub = React.lazy(() => import('./modules/MarketingHub'));
const HumanResources = React.lazy(() => import('./modules/HumanResources'));
const Inventory = React.lazy(() => import('./modules/Inventory'));
const Reports = React.lazy(() => import('./modules/Reports'));
const Settings = React.lazy(() => import('./modules/Settings'));
const Finance = React.lazy(() => import('./modules/Finance'));
const Accounting = React.lazy(() => import('./modules/Accounting'));
const VaultManagement = React.lazy(() => import('./modules/VaultManagement'));
const TaxCompliance = React.lazy(() => import('./modules/TaxCompliance'));
const ProfitMatrix = React.lazy(() => import('./modules/ProfitMatrix'));
const Messaging = React.lazy(() => import('./modules/Messaging'));
const Ecommerce = React.lazy(() => import('./modules/Ecommerce'));
const OrdersHub = React.lazy(() => import('./modules/OrdersHub'));
const Purchases = React.lazy(() => import('./modules/Purchases'));
const Branches = React.lazy(() => import('./modules/Branches'));
const FieldAgents = React.lazy(() => import('./modules/FieldAgents'));
const CRM = React.lazy(() => import('./modules/CRM'));
const Manufacturing = React.lazy(() => import('./modules/Manufacturing'));
const Automation = React.lazy(() => import('./modules/Automation'));
const SupportCenter = React.lazy(() => import('./modules/SupportCenter'));
const AdvancedInvoicing = React.lazy(() => import('./modules/AdvancedInvoicing'));
const Installments = React.lazy(() => import('./modules/Installments'));
const DebtCenter = React.lazy(() => import('./modules/DebtCenter'));
const Promotions = React.lazy(() => import('./modules/Promotions'));
const Categories = React.lazy(() => import('./modules/Categories'));
const Bundling = React.lazy(() => import('./modules/Bundling'));
const StockAnalysis = React.lazy(() => import('./modules/StockAnalysis'));
const Marketplace = React.lazy(() => import('./modules/Marketplace'));
const VendorIntel = React.lazy(() => import('./modules/VendorIntel'));
const Traceability = React.lazy(() => import('./modules/Traceability'));
const WorkCenters = React.lazy(() => import('./modules/WorkCenters'));
const QualityControl = React.lazy(() => import('./modules/QualityControl'));
const LogisticsHub = React.lazy(() => import('./modules/LogisticsHub'));
const FleetManagement = React.lazy(() => import('./modules/FleetManagement'));
const GlobalImport = React.lazy(() => import('./modules/GlobalImport'));
const Vouchers = React.lazy(() => import('./modules/Vouchers'));
const RevenueIntelligence = React.lazy(() => import('./modules/RevenueIntelligence'));
const FiscalPlanning = React.lazy(() => import('./modules/FiscalPlanning'));
const SettlementHub = React.lazy(() => import('./modules/SettlementHub'));
const Shifts = React.lazy(() => import('./modules/Shifts'));
const ProjectMatrix = React.lazy(() => import('./modules/ProjectMatrix'));
const Contracts = React.lazy(() => import('./modules/Contracts'));
const Assets = React.lazy(() => import('./modules/Assets'));
const MaintenanceOps = React.lazy(() => import('./modules/MaintenanceOps'));
const HRPerformance = React.lazy(() => import('./modules/HRPerformance'));
const HRDocs = React.lazy(() => import('./modules/HRDocs'));
const TrainingCenter = React.lazy(() => import('./modules/TrainingCenter'));
const BigDataAnalytics = React.lazy(() => import('./modules/BigDataAnalytics'));
const Governance = React.lazy(() => import('./modules/Governance'));
const LegalHub = React.lazy(() => import('./modules/LegalHub'));
const Security = React.lazy(() => import('./modules/Security'));
const WholesaleHub = React.lazy(() => import('./modules/WholesaleHub'));
const CalendarHub = React.lazy(() => import('./modules/CalendarHub'));
const Profile = React.lazy(() => import('./modules/Profile'));

// Simple Toast Component
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[250] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          onClick={() => removeToast(toast.id)}
          className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 cursor-pointer animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600/90 text-white' : 
            toast.type === 'error' ? 'bg-red-600/90 text-white' : 
            toast.type === 'warning' ? 'bg-orange-500/90 text-white' : 'bg-slate-900/90 text-white'
          }`}
        >
          <span className="text-xl">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          <p className="text-xs font-bold">{toast.message}</p>
        </div>
      ))}
    </div>
  );
};

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 bg-slate-900 z-[999] flex flex-col items-center justify-center text-white">
    <div className="relative">
      <div className="w-24 h-24 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-2xl animate-bounce">
        T
      </div>
      <div className="absolute -inset-4 bg-orange-500/20 rounded-[3rem] blur-xl animate-pulse"></div>
    </div>
    <h1 className="mt-8 text-3xl font-black tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700">Titan Platform</h1>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mt-2 animate-in fade-in slide-in-from-bottom-4 delay-100 duration-700">Enterprise OS v4.0</p>
    <div className="mt-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-orange-500 animate-[loading_2s_ease-in-out_infinite]" style={{width: '50%'}}></div>
    </div>
    <style>{`
      @keyframes loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
    `}</style>
  </div>
);

const ModuleLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full w-full opacity-60">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Module...</p>
  </div>
);

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (Ctrl+K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
      // Lock System (Ctrl+L)
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setIsLocked(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) return <SplashScreen />;

  if (!user) {
    return <Auth />;
  }

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'calendar': return <CalendarHub />;
      case 'profile': return <Profile />;
      
      case 'pos': return <POS />;
      case 'invoices': return <AdvancedInvoicing />;
      case 'installments': return <Installments />;
      case 'crm': return <CRM activeCategory="customers" />;
      case 'debt_center': return <DebtCenter />;
      case 'promotions': return <Promotions />;
      case 'marketing': return <MarketingHub />;
      case 'messaging': return <Messaging />;
      
      case 'products': case 'inventory-balances': case 'inventory': return <Inventory activeSubTab={activeTab} />;
      case 'categories': return <Categories />;
      case 'bundling': return <Bundling />;
      case 'stock_analysis': return <StockAnalysis />;
      case 'purchases': return <Purchases />;
      case 'marketplace': return <Marketplace />;
      case 'vendor_intel': return <VendorIntel />;
      case 'traceability': return <Traceability />;
      case 'branches': return <Branches />;
      
      case 'manufacturing': return <Manufacturing />;
      case 'work_centers': return <WorkCenters />;
      case 'quality_control': return <QualityControl />;
      
      case 'logistics': return <LogisticsHub />;
      case 'fleet': return <FleetManagement />;
      case 'field_agents': return <FieldAgents />;
      case 'global_import': return <GlobalImport />;
      
      case 'accounting': return <Accounting />;
      case 'vouchers': return <Vouchers />;
      case 'revenue_intel': return <RevenueIntelligence />;
      case 'profit_matrix': return <ProfitMatrix />;
      case 'fiscal_planning': return <FiscalPlanning />;
      case 'settlement': return <SettlementHub />;
      case 'vault': return <VaultManagement />;
      case 'shifts': return <Shifts />;
      case 'finance': case 'expenses': return <Finance />;
      case 'tax': return <TaxCompliance />;
      
      case 'ecommerce': case 'store_settings': return <Ecommerce />;
      case 'online_orders': return <OrdersHub activeSubTab="orders-store" />;
      
      case 'projects': return <ProjectMatrix />;
      case 'contracts': return <Contracts />;
      case 'assets': return <Assets />;
      case 'maintenance': return <MaintenanceOps />;
      
      case 'employees': case 'payroll': return <HumanResources />;
      case 'hr_performance': return <HRPerformance />;
      case 'hr_docs': return <HRDocs />;
      case 'training': return <TrainingCenter />;
      
      case 'big_data': return <BigDataAnalytics />;
      case 'governance': return <Governance />;
      case 'legal': return <LegalHub />;
      case 'reports': case 'reports-sales': case 'reports-financial': return <Reports activeReportTab={activeTab} />;
      case 'security': return <Security />;
      case 'wholesale_hub': return <WholesaleHub />;
      
      case 'settings': case 'settings_general': case 'settings_users': case 'settings_backup': return <Settings />;
      case 'automation': return <Automation />;
      case 'support_center': case 'tickets': case 'tutorials': return <SupportCenter />;

      default: return (
        <div className="flex flex-col items-center justify-center h-full text-center p-10 animate-in fade-in">
           <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">🚧</div>
           <h3 className="text-2xl font-black text-slate-800">وحدة {activeTab} قيد الإنشاء</h3>
           <p className="text-gray-500 mt-2 max-w-md mx-auto">نعمل حالياً على تطوير هذه الوحدة لتكون جاهزة في التحديث القادم من منصة تايتان.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 bg-white border-b border-gray-100 flex justify-between items-center z-40">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-lg">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
           </button>
           <span className="font-black text-slate-800 text-lg">aTitan</span>
           <button onClick={() => setIsPaletteOpen(true)} className="p-2 bg-gray-50 rounded-lg">🔍</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 custom-scrollbar relative">
           <ErrorBoundary>
             <Suspense fallback={<ModuleLoader />}>
                {renderContent()}
             </Suspense>
           </ErrorBoundary>
        </div>
        
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <AIAssistant />
        <NotificationsPanel />
        <WelcomeWizard />
        <ToastContainer />
        <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
