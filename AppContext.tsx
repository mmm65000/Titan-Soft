
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Product, Sale, Tenant, AuditLog, Notification, 
  SafeBalance, SafeTransaction, LedgerEntry, TaxRecord, 
  Shift, Customer, Supplier, Expense, Category, 
  WholesaleOrder, Project, Vehicle, FixedAsset, BOM,
  QCRecord, ImportRecord, TraceRecord, LegalCase, 
  TrainingCourse, Budget, Ticket, Contract, AutomationRule,
  Campaign, Coupon, Message, Contact, SocialMessage, Staff,
  StaffPerformance, DamagedItem, MaintenanceTask, PurchaseInvoice, AdvancedInvoice,
  Voucher, Shipment, StaffDocument, InstallmentPlan, Branch, WorkCenter, Quote, ReturnRecord
} from './types';
import { DatabaseService, STORAGE_KEYS } from './db';
import { GoogleGenAI } from "@google/genai";
import { TRANSLATIONS } from './constants';

interface AppContextType {
  tenant: Tenant | null;
  user: User | null;
  setUser: (u: User | null) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  sales: Sale[];
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  processSale: (s: Sale) => Promise<void>;
  addSale: (s: Sale) => Promise<void>;
  updateSaleStatus: (id: string, status: string, fulfillmentStatus?: string) => void;
  
  askOracle: (query: string) => Promise<string>;
  generateAIContent: (prompt: string, type: string) => Promise<string>;
  logout: () => void;
  
  // Enterprise States
  lang: 'ar' | 'en';
  setLang: (l: 'ar' | 'en') => void;
  t: (key: string) => string;
  isOnline: boolean;
  setIsOnline: (o: boolean) => void;
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (s: boolean) => void;
  addToast: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  
  // CRM & Supply
  customers: Customer[];
  addCustomer: (c: Customer) => Promise<void>;
  suppliers: Supplier[];
  addSupplier: (s: Supplier) => Promise<void>;
  purchases: PurchaseInvoice[];
  addPurchase: (p: PurchaseInvoice) => Promise<void>;
  categories: Category[];
  setCategories: (c: Category[]) => void;
  wholesaleOrders: WholesaleOrder[];
  approveWholesale: (id: string) => void;
  addWholesaleOrder: (o: WholesaleOrder) => void;
  quotes: Quote[];
  convertQuoteToSale: (id: string) => void;
  
  // Finance
  safeBalance: SafeBalance;
  safeTransactions: SafeTransaction[];
  ledger: LedgerEntry[];
  taxRecords: TaxRecord[];
  expenses: Expense[];
  addExpense: (e: Omit<Expense, 'id' | 'date'>) => void;
  vouchers: Voucher[];
  addVoucher: (v: Voucher) => void;
  shifts: Shift[];
  openShift: (amount: number) => void;
  closeShift: (id: string, amount: number, notes: string) => void;
  calculateProjectedPnL: () => any;
  financialForecasts: any[];
  budgets: Budget[];
  addBudget: (b: Budget) => void;
  advancedInvoices: AdvancedInvoice[];
  addAdvancedInvoice: (i: AdvancedInvoice) => void;
  creditNotes: any[];
  issueCreditNote: (invoiceId: string, amount: number, reason: string) => void;
  bankAccounts: any[];
  addStockAdjustment: (adj: any) => void;
  returns: ReturnRecord[];
  addReturn: (r: ReturnRecord) => void;
  
  // Operations
  fleet: Vehicle[];
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  addVehicle: (v: Vehicle) => void;
  shipments: Shipment[];
  addShipment: (s: Shipment) => void;
  updateShipmentStatus: (id: string, status: string) => void;
  productionOrders: any[];
  startProduction: (bomId: string, qty: number) => void;
  completeProduction: (id: string) => void;
  boms: BOM[];
  addBOM: (b: BOM) => void;
  fixedAssets: FixedAsset[];
  addAsset: (a: FixedAsset) => void;
  updateAsset: (id: string, updates: Partial<FixedAsset>) => void;
  maintenanceTasks: MaintenanceTask[];
  addMaintenanceTask: (t: MaintenanceTask) => void;
  workCenters: WorkCenter[];
  addWorkCenter: (w: WorkCenter) => void;
  updateWorkCenter: (id: string, updates: Partial<WorkCenter>) => void;
  qcRecords: QCRecord[];
  addQCRecord: (r: QCRecord) => void;
  
  // HR & Legal
  staff: Staff[];
  addStaff: (s: Staff) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  staffPerformance: StaffPerformance[];
  updateStaffPerformance: (p: StaffPerformance) => void;
  staffDocuments: StaffDocument[];
  addStaffDocument: (d: StaffDocument) => void;
  trainingCourses: TrainingCourse[];
  addTrainingCourse: (c: TrainingCourse) => void;
  updateTrainingCourse: (id: string, updates: Partial<TrainingCourse>) => void;
  legalCases: LegalCase[];
  addLegalCase: (l: LegalCase) => void;
  updateLegalCase: (id: string, updates: Partial<LegalCase>) => void;
  audits: any[];
  
  // Projects & Contracts
  projects: Project[];
  addProject: (p: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  contracts: Contract[];
  addContract: (c: Contract) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  
  // System & Branches
  branches: Branch[];
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  addBranch: (b: Branch) => void;
  transferStock: (productId: string, fromBranch: string, toBranch: string, quantity: number) => void;
  roleConfigs: any[];
  updateRoleConfig: (config: any) => void;
  
  // Logs & Data
  activityLogs: any[];
  addLog: (action: string, type: string, module?: string) => void;
  offlineSales: Sale[];
  setOfflineSales: (s: Sale[]) => void;
  syncOfflineData: () => Promise<void>;
  resetSystem: () => void;
  
  // Misc
  installmentPlans: InstallmentPlan[];
  payInstallment: (planId: string, instId: string) => void;
  damages: DamagedItem[];
  addDamage: (d: DamagedItem) => void;
  traces: TraceRecord[];
  addTraceRecord: (t: TraceRecord) => void;
  onlineOrders: any[];
  updateOnlineOrderStatus: (id: string, status: string) => void;
  coupons: Coupon[];
  addCoupon: (c: Coupon) => void;
  messages: Message[];
  addMessage: (text: string, to: string) => void;
  contacts: Contact[];
  socialInbox: SocialMessage[];
  addSocialMessage: (m: Omit<SocialMessage, 'id' | 'timestamp'>) => void;
  campaigns: Campaign[];
  addCampaign: (c: Campaign) => void;
  automationRules: AutomationRule[];
  setAutomationRules: (r: AutomationRule[]) => void;
  automationLogs: any[];
  
  // Support & Vendor
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  fieldAgents: any[];
  vendorPerformance: any[];
  updateVendorPerformance: (p: any) => void;
  buyRequests: any[];
  setBuyRequests: (r: any[]) => void;
  bids: any[];
  setBids: (b: any[]) => void;
  acceptBid: (bidId: string) => void;
  imports: ImportRecord[];
  addImportRecord: (r: ImportRecord) => void;
  updateImportRecord: (id: string, updates: Partial<ImportRecord>) => void;
  promotions: any[];
  addPromotion: (p: any) => void;
  suspendedSales: Sale[];
  setSuspendedSales: (s: Sale[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant] = useState<Tenant | null>({ id: 't1', name: 'Titan Global', taxNumber: '300012345600003', logo: '', settings: {} });
  const [user, setUser] = useState<User | null>(() => {
      // Check local storage for persistent session
      const savedUser = localStorage.getItem('titan_user_session');
      return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Enterprise State Initialization
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const t = (key: string) => {
    return TRANSLATIONS[key] ? TRANSLATIONS[key][lang] : key;
  };

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'مرحباً بك', message: 'تم إعداد نظام تايتان بنجاح.', type: 'success', timestamp: new Date().toISOString(), read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'c1', name: 'Electronics', name_ar: 'إلكترونيات', subCategories: [{ id: 'sc1', name: 'Smartphones', name_ar: 'جوالات' }] },
    { id: 'c2', name: 'Fashion', name_ar: 'أزياء', subCategories: [] }
  ]);
  const [wholesaleOrders, setWholesaleOrders] = useState<WholesaleOrder[]>([]);
  const [safeBalance, setSafeBalance] = useState<SafeBalance>({ cash: 12500, card: 8400 });
  const [safeTransactions, setSafeTransactions] = useState<SafeTransaction[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [fleet, setFleet] = useState<Vehicle[]>([
    { id: 'v1', type: 'truck', model: 'Volvo FH16', plateNumber: 'LKH-221', fuelLevel: 85, status: 'available', lastService: '2024-05-10' }
  ]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [staffDocuments, setStaffDocuments] = useState<StaffDocument[]>([]);
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>([]);
  const [legalCases, setLegalCases] = useState<LegalCase[]>([]);
  const [audits, setAudits] = useState<any[]>([
    { id: 'a1', title: 'Internal Quality Audit', score: 92, date: '2024-12-01', auditor: 'System' }
  ]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [financialForecasts] = useState([
    { month: 'يناير', predictedRevenue: 125000, trend: 'up', confidenceScore: 88 },
    { month: 'فبراير', predictedRevenue: 132000, trend: 'up', confidenceScore: 84 }
  ]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
  const [damages, setDamages] = useState<DamagedItem[]>([]);
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts] = useState<Contact[]>([
    { id: 'c1', name: 'سارة - المحاسبة', role: 'Accountant' },
    { id: 'c2', name: 'خالد - المستودع', role: 'Warehouse Manager' }
  ]);
  const [socialInbox, setSocialInbox] = useState<SocialMessage[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [automationLogs] = useState<any[]>([]);
  const [offlineSales, setOfflineSales] = useState<Sale[]>([]);
  const [suspendedSales, setSuspendedSales] = useState<Sale[]>([]);
  
  // New States for Projects and Branches and others
  const [projects, setProjects] = useState<Project[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState('b1');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [qcRecords, setQcRecords] = useState<QCRecord[]>([]);
  const [advancedInvoices, setAdvancedInvoices] = useState<AdvancedInvoice[]>([]);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [fieldAgents, setFieldAgents] = useState<any[]>([
      { id: 'fa1', name: 'Ali Agent', phone: '0555555555', status: 'online', currentVault: 1500, deliveriesCompleted: 5 }
  ]);
  const [vendorPerformance, setVendorPerformance] = useState<any[]>([]);
  const [buyRequests, setBuyRequests] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [roleConfigs, setRoleConfigs] = useState<any[]>([
      { role: 'cashier', permissions: [{ module: 'pos', read: true, write: true, delete: false }] },
      { role: 'manager', permissions: [{ module: 'pos', read: true, write: true, delete: true }] }
  ]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [bankAccounts] = useState([
      { id: 'bnk1', bankName: 'Al Rajhi Bank', accountNumber: 'SA20800...', balance: 154200, currency: 'SAR' },
      { id: 'bnk2', bankName: 'SNB', accountNumber: 'SA40100...', balance: 42000, currency: 'SAR' }
  ]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);

  useEffect(() => {
    // Session Persistence
    if (user) {
        localStorage.setItem('titan_user_session', JSON.stringify(user));
    } else {
        localStorage.removeItem('titan_user_session');
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      await DatabaseService.seedDemoData();
      
      const p = await DatabaseService.findMany<Product>(STORAGE_KEYS.PRODUCTS);
      const s = await DatabaseService.findMany<Sale>(STORAGE_KEYS.SALES);
      const c = await DatabaseService.findMany<Customer>(STORAGE_KEYS.CUSTOMERS);
      const prj = await DatabaseService.findMany<Project>(STORAGE_KEYS.PROJECTS);
      const br = await DatabaseService.findMany<Branch>(STORAGE_KEYS.BRANCHES);
      
      const mappedProducts = p.map(prod => ({
          ...prod,
          name: prod.nameAr, 
          price: prod.salePrice,
          cost: prod.costPrice,
          name_ar: prod.nameAr,
          branchStocks: prod.branchStocks || {}
      }));

      setProducts(mappedProducts);
      setSales(s);
      setCustomers(c);
      setProjects(prj);
      setBranches(br);
      setIsLoading(false);
      
      checkInventoryHealth(mappedProducts);
    };
    init();

    // Online/Offline Listeners
    const handleOnline = () => {
        setIsOnline(true);
        addToast('تم استعادة الاتصال بالإنترنت 🌐', 'success');
        if (offlineSales.length > 0) {
            addToast(`لديك ${offlineSales.length} عملية أوفلاين جاهزة للمزامنة`, 'info');
        }
    };
    const handleOffline = () => {
        setIsOnline(false);
        addToast('انقطع الاتصال - وضع الأوفلاين نشط 🔌', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [offlineSales.length]);

  const addToast = (msg: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [{ id, title: type.toUpperCase(), message: msg, type, timestamp: new Date().toISOString(), read: false }, ...prev]);
  };

  const checkInventoryHealth = (currentProducts: Product[]) => {
      let lowStockCount = 0;
      let stagnantCount = 0;
      
      currentProducts.forEach(p => {
          if (p.stock <= p.minStock) {
              lowStockCount++;
          }
          if (p.lastUpdated) {
              const daysInactive = (new Date().getTime() - new Date(p.lastUpdated).getTime()) / (1000 * 3600 * 24);
              const limit = p.stagnantLevel || 30; 
              if (daysInactive > limit && p.stock > 0) {
                  stagnantCount++;
              }
          }
      });

      if (lowStockCount > 0) {
          addToast(`تنبيه: يوجد ${lowStockCount} صنف وصل للحد الأدنى للمخزون`, 'warning');
      }
      if (stagnantCount > 0) {
          addToast(`تنبيه: يوجد ${stagnantCount} صنف راكد (Stagnant Stock)`, 'info');
      }
  };

  const addLog = (action: string, type: string, module: string = 'System') => {
    setActivityLogs(prev => [{ id: Date.now().toString(), action, type, timestamp: new Date().toISOString(), user: user?.name || 'System', module }, ...prev]);
  };

  const addProduct = async (p: Product) => {
    await DatabaseService.insert(STORAGE_KEYS.PRODUCTS, p);
    setProducts(prev => [...prev, p]);
    addLog(`Added product: ${p.nameAr}`, 'success', 'Inventory');
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await DatabaseService.update<Product>(STORAGE_KEYS.PRODUCTS, id, updates);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    addLog(`Deleted product: ${id}`, 'warning', 'Inventory');
  };

  const processSale = async (sale: Sale) => {
    await DatabaseService.insert(STORAGE_KEYS.SALES, sale);
    setSales(prev => [sale, ...prev]);
    
    // Update Stock for each item
    for (const item of sale.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const qtyToDeduct = item.unit === prod.majorUnit ? item.quantity * (prod.unitContent || 1) : item.quantity;
        const currentBranchStock = prod.branchStocks?.[activeBranchId] || 0;
        const newBranchStock = Math.max(0, currentBranchStock - qtyToDeduct);
        const branchStocks = { ...prod.branchStocks, [activeBranchId]: newBranchStock };
        const totalStock = prod.stock - qtyToDeduct;

        await DatabaseService.update<Product>(STORAGE_KEYS.PRODUCTS, prod.id, { 
            stock: totalStock,
            branchStocks: branchStocks
        });
      }
    }
    
    const updatedProducts = await DatabaseService.findMany<Product>(STORAGE_KEYS.PRODUCTS);
    setProducts(updatedProducts.map(prod => ({
          ...prod,
          name: prod.nameAr,
          price: prod.salePrice,
          cost: prod.costPrice,
          name_ar: prod.nameAr
    })));
    
    addLog(`Processed sale: ${sale.id} at ${activeBranchId}`, 'success', 'POS');
  };

  const updateSaleStatus = (id: string, status: string, fulfillmentStatus?: string) => {
      setSales(prev => prev.map(s => s.id === id ? { ...s, status: status as any, fulfillmentStatus: fulfillmentStatus as any || s.fulfillmentStatus } : s));
      setOnlineOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any, fulfillmentStatus: fulfillmentStatus as any || o.fulfillmentStatus } : o));
  };

  const addSale = async (sale: Sale) => processSale(sale);

  const askOracle = async (query: string): Promise<string> => {
    if (!process.env.API_KEY) return "AI Key Missing. Please configure environment.";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = `System Data: Products(${products.length}), Total Sales(${sales.length}). QUESTION: ${query}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: context }] }],
      });
      return response.text || "No response";
    } catch (e) {
      return "Oracle Service Unavailable.";
    }
  };

  const generateAIContent = async (prompt: string, type: string) => askOracle(prompt);

  const logout = () => {
      setUser(null);
      localStorage.removeItem('titan_user_session');
  };

  const addCustomer = async (c: Customer) => {
      await DatabaseService.insert(STORAGE_KEYS.CUSTOMERS, c);
      setCustomers(prev => [c, ...prev]);
  };
  const addSupplier = async (s: Supplier) => setSuppliers(prev => [s, ...prev]);
  
  const addPurchase = async (p: PurchaseInvoice) => {
      setPurchases(prev => [p, ...prev]);
      for (const item of p.items) {
          const product = products.find(prod => prod.id === item.productId);
          if (product) {
              const qtyToAdd = item.unit === product.majorUnit ? item.quantity * (product.unitContent || 1) : item.quantity;
              
              const currentBranchStock = product.branchStocks?.[activeBranchId] || 0;
              const newBranchStock = currentBranchStock + qtyToAdd;
              
              await updateProduct(product.id, { 
                  stock: product.stock + qtyToAdd,
                  branchStocks: { ...product.branchStocks, [activeBranchId]: newBranchStock }
              });
          }
      }
  };

  const approveWholesale = (id: string) => {
      setWholesaleOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'approved' } : o));
  };
  
  const addWholesaleOrder = (o: WholesaleOrder) => setWholesaleOrders(prev => [o, ...prev]);

  const addExpense = (e: Omit<Expense, 'id' | 'date'>) => {
      const expense: Expense = { ...e, id: `EXP-${Date.now()}`, date: new Date().toISOString() };
      setExpenses(prev => [expense, ...prev]);
      setSafeBalance(prev => ({ ...prev, cash: prev.cash - expense.amount }));
  };

  const addVoucher = (v: Voucher) => setVouchers(prev => [v, ...prev]);
  
  const openShift = (amount: number) => {
      const shift: Shift = { id: `SHFT-${Date.now()}`, user: user?.name || 'Ahmed', openedAt: new Date().toISOString(), openingBalance: amount, status: 'open' };
      setShifts(prev => [shift, ...prev]);
  };

  const closeShift = (id: string, amount: number, notes: string) => {
      setShifts(prev => prev.map(s => s.id === id ? { ...s, closedAt: new Date().toISOString(), closingBalance: amount, status: 'closed' } : s));
  };

  const calculateProjectedPnL = () => {
      const revenue = sales.reduce((a,b)=>a+b.totalAmount, 0);
      const cogs = revenue * 0.6;
      const opex = expenses.reduce((a,b)=>a+b.amount, 0);
      const tax = revenue * 0.15;
      const netProfit = revenue - cogs - opex - tax;
      const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
      return { revenue, cogs, opex, tax, netProfit, margin, ar_balance: 1500, ap_balance: 2000 };
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => setFleet(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  const addVehicle = (v: Vehicle) => setFleet(prev => [v, ...prev]);
  const addShipment = (s: Shipment) => setShipments(prev => [s, ...prev]);
  const updateShipmentStatus = (id: string, status: string) => setShipments(prev => prev.map(s => s.id === id ? { ...s, status: status as any } : s));
  
  const startProduction = (bomId: string, qty: number) => {
      const order = { id: `PROD-${Date.now()}`, bomId, quantity: qty, status: 'in_progress', startDate: new Date().toISOString() };
      setProductionOrders(prev => [order, ...prev]);
  };

  const completeProduction = (id: string) => {
      setProductionOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'completed' } : o));
  };

  const addBOM = (b: BOM) => setBoms(prev => [b, ...prev]);
  const addAsset = (a: FixedAsset) => setFixedAssets(prev => [a, ...prev]);
  const updateAsset = (id: string, updates: Partial<FixedAsset>) => setFixedAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  const addMaintenanceTask = (t: MaintenanceTask) => setMaintenanceTasks(prev => [t, ...prev]);

  const addStaff = (s: Staff) => setStaff(prev => [s, ...prev]);
  const updateStaff = (id: string, updates: Partial<Staff>) => setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  const deleteStaff = (id: string) => setStaff(prev => prev.filter(s => s.id !== id));
  const updateStaffPerformance = (p: StaffPerformance) => setStaffPerformance(prev => {
      const existing = prev.findIndex(item => item.staffId === p.staffId);
      if (existing > -1) {
          const newPerf = [...prev];
          newPerf[existing] = p;
          return newPerf;
      }
      return [p, ...prev];
  });
  const addStaffDocument = (d: StaffDocument) => setStaffDocuments(prev => [d, ...prev]);
  const addTrainingCourse = (c: TrainingCourse) => setTrainingCourses(prev => [c, ...prev]);
  const updateTrainingCourse = (id: string, updates: Partial<TrainingCourse>) => setTrainingCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const addLegalCase = (l: LegalCase) => setLegalCases(prev => [l, ...prev]);
  const updateLegalCase = (id: string, updates: Partial<LegalCase>) => setLegalCases(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

  const addBudget = (b: Budget) => setBudgets(prev => [b, ...prev]);

  const payInstallment = (planId: string, instId: string) => {
      setInstallmentPlans(prev => prev.map(plan => {
          if (plan.id === planId) {
              const updatedInsts = plan.installments.map(i => i.id === instId ? { ...i, status: 'paid' as const } : i);
              const remaining = plan.totalAmount - updatedInsts.filter(i => i.status === 'paid').reduce((a,b)=>a+b.amount, 0);
              return { ...plan, installments: updatedInsts, remainingAmount: remaining };
          }
          return plan;
      }));
  };
  
  const addDamage = (d: DamagedItem) => {
      setDamages(prev => [d, ...prev]);
      const p = products.find(p=>p.id===d.productId);
      if(p) updateProduct(d.productId, { stock: p.stock - d.quantity });
  };
  
  const addTraceRecord = (t: TraceRecord) => setTraces(prev => [t, ...prev]);
  const updateOnlineOrderStatus = (id: string, status: string) => setOnlineOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  const addCoupon = (c: Coupon) => setCoupons(prev => [c, ...prev]);
  
  const addMessage = (text: string, to: string) => {
      const msg: Message = { id: Date.now().toString(), senderId: user?.id || 'u1', receiverId: to, text, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, msg]);
  };
  
  const addSocialMessage = (m: Omit<SocialMessage, 'id' | 'timestamp'>) => {
      const msg: SocialMessage = { ...m, id: Date.now().toString(), timestamp: new Date().toISOString() };
      setSocialInbox(prev => [msg, ...prev]);
  };
  
  const addCampaign = (c: Campaign) => setCampaigns(prev => [c, ...prev]);

  const syncOfflineData = async () => {
      setIsOnline(false); 
      // Simulate sync process
      await new Promise(r => setTimeout(r, 2000));
      for (const sale of offlineSales) {
          // Process sales that were offline
          // Ideally this would post to a backend
          await processSale({ ...sale, status: 'completed' });
      }
      setOfflineSales([]);
      setIsOnline(true);
      addToast('تمت مزامنة البيانات المحلية بنجاح.', 'success');
  };

  const resetSystem = () => {
      localStorage.clear();
      window.location.reload();
  };

  const addProject = async (p: Project) => {
      await DatabaseService.insert(STORAGE_KEYS.PROJECTS, p);
      setProjects(prev => [p, ...prev]);
  };
  const updateProject = (id: string, updates: Partial<Project>) => setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const addBranch = (b: Branch) => setBranches(prev => [...prev, { ...b, id: `BR-${Date.now()}` }]);
  
  const transferStock = (productId: string, fromBranch: string, toBranch: string, quantity: number) => { 
      setProducts(prev => prev.map(p => {
          if (p.id === productId) {
              const currentSource = p.branchStocks?.[fromBranch] || 0;
              const currentDest = p.branchStocks?.[toBranch] || 0;
              
              const newSource = Math.max(0, currentSource - quantity);
              const newDest = currentDest + quantity;
              
              return {
                  ...p,
                  branchStocks: {
                      ...p.branchStocks,
                      [fromBranch]: newSource,
                      [toBranch]: newDest
                  }
              };
          }
          return p;
      }));
      addLog(`Stock Transferred: ${quantity} units from ${fromBranch} to ${toBranch}`, 'info', 'Inventory');
  };

  const addTicket = (t: Ticket) => setTickets(prev => [t, ...prev]);
  const addContract = (c: Contract) => setContracts(prev => [c, ...prev]);
  const updateContract = (id: string, updates: Partial<Contract>) => setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const updateVendorPerformance = (p: any) => setVendorPerformance(prev => { const idx = prev.findIndex(x => x.vendorId === p.vendorId); if (idx >= 0) { const newArr = [...prev]; newArr[idx] = p; return newArr; } return [...prev, p]; });
  const addWorkCenter = (w: WorkCenter) => setWorkCenters(prev => [w, ...prev]);
  const updateWorkCenter = (id: string, updates: Partial<WorkCenter>) => setWorkCenters(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  const addAdvancedInvoice = (i: AdvancedInvoice) => setAdvancedInvoices(prev => [i, ...prev]);
  const issueCreditNote = (invoiceId: string, amount: number, reason: string) => setCreditNotes(prev => [...prev, { id: `CN-${Date.now()}`, originalInvoiceId: invoiceId, amount, reason, status: 'issued' }]);
  const acceptBid = (bidId: string) => { setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'accepted' } : b)); addLog(`Bid ${bidId} accepted`, 'success', 'Marketplace'); };
  const addImportRecord = (r: ImportRecord) => setImports(prev => [r, ...prev]);
  const updateImportRecord = (id: string, updates: Partial<ImportRecord>) => setImports(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const addPromotion = (p: any) => setPromotions(prev => [p, ...prev]);
  const updateRoleConfig = (config: any) => setRoleConfigs(prev => prev.map(c => c.role === config.role ? config : c));
  const addQCRecord = (r: QCRecord) => setQcRecords(prev => [r, ...prev]);
  const convertQuoteToSale = (id: string) => {
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'converted' } : q));
      addToast('تم تحويل عرض الأسعار إلى فاتورة بيع', 'success');
  };
  const addStockAdjustment = (adj: any) => addLog(`Stock Adjusted: ${adj.productId}`, 'warning');

  const addReturn = (r: ReturnRecord) => {
      setReturns(prev => [r, ...prev]);
      if (r.originalSaleId) {
          const sale = sales.find(s => s.id === r.originalSaleId);
          if (sale) {
              updateSaleStatus(r.originalSaleId, 'returned');
          }
      }
      setSafeBalance(prev => ({ ...prev, cash: prev.cash - r.totalRefund }));
      
      r.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
              const qtyToAdd = item.unit === product.majorUnit ? item.quantity * (product.unitContent || 1) : item.quantity;
              
              const currentBranchStock = product.branchStocks?.[activeBranchId] || 0;
              const newBranchStock = currentBranchStock + qtyToAdd;
              
              updateProduct(product.id, { 
                  stock: product.stock + qtyToAdd,
                  branchStocks: { ...product.branchStocks, [activeBranchId]: newBranchStock }
              });
          }
      });
      
      addLog(`Processed Return for Sale #${r.originalSaleId}`, 'warning', 'Sales');
      addToast('تمت معالجة المرتجع، تحديث المخزون، وخصم المبلغ من الصندوق.', 'success');
  };

  return (
    <AppContext.Provider value={{ 
      tenant, user, setUser, products, setProducts, sales, isLoading, activeTab, setActiveTab, addProduct, updateProduct, deleteProduct, processSale, addSale, updateSaleStatus, askOracle, generateAIContent, logout,
      lang, setLang, t, isOnline, setIsOnline, notifications, showNotifications, setShowNotifications, addToast,
      customers, addCustomer, suppliers, addSupplier, purchases, addPurchase, categories, setCategories, wholesaleOrders, approveWholesale, addWholesaleOrder, quotes, convertQuoteToSale,
      safeBalance, safeTransactions, ledger, taxRecords, expenses, addExpense, vouchers, addVoucher, shifts, openShift, closeShift, calculateProjectedPnL, financialForecasts, budgets, addBudget,
      fleet, updateVehicle, addVehicle, shipments, addShipment, updateShipmentStatus, productionOrders, startProduction, completeProduction, boms, addBOM, fixedAssets, addAsset, updateAsset, maintenanceTasks, addMaintenanceTask,
      staff, addStaff, updateStaff, deleteStaff, staffPerformance, updateStaffPerformance, staffDocuments, addStaffDocument, trainingCourses, addTrainingCourse, updateTrainingCourse, legalCases, addLegalCase, updateLegalCase, audits,
      activityLogs, addLog, offlineSales, setOfflineSales, syncOfflineData, resetSystem,
      installmentPlans, payInstallment, damages, addDamage, traces, addTraceRecord, onlineOrders, updateOnlineOrderStatus, coupons, addCoupon, messages, addMessage, contacts, socialInbox, addSocialMessage, campaigns, addCampaign, automationRules, setAutomationRules, automationLogs,
      projects, addProject, updateProject, branches, activeBranchId, setActiveBranchId, addBranch, transferStock,
      tickets, addTicket, contracts, addContract, updateContract,
      fieldAgents, vendorPerformance, updateVendorPerformance,
      workCenters, addWorkCenter, updateWorkCenter,
      advancedInvoices, addAdvancedInvoice, creditNotes, issueCreditNote,
      buyRequests, setBuyRequests, bids, setBids, acceptBid,
      imports, addImportRecord, updateImportRecord,
      promotions, addPromotion,
      suspendedSales, setSuspendedSales, roleConfigs, updateRoleConfig,
      qcRecords, addQCRecord, bankAccounts, addStockAdjustment,
      returns, addReturn
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
